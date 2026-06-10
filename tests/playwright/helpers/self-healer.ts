import type { Page } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { DOMAnalyzer } from './dom-analyzer'
import { SelectorFixer, type SelectorFix, type FixResult } from './selector-fixer'
import { PatchGenerator, type PatchReport } from './patch-generator'
import { FailureHandler } from './failure-handler'
import type { FailureAnalysis } from './console-logger'

export interface HealingResult {
  testName: string
  originalError: string
  failureType: FailureAnalysis['type']
  action: 'AUTO_FIXED' | 'BACKEND_BUG_REPORT' | 'INFRA_REPORT' | 'NEEDS_REVIEW'
  fixes: SelectorFix[]
  reportPath?: string
  success: boolean
}

export class SelfHealer {
  private page: Page
  private testName: string
  private domAnalyzer: DOMAnalyzer
  private selectorFixer: SelectorFixer
  private patchGenerator: PatchGenerator
  private failureHandler: FailureHandler

  constructor(page: Page, testName: string) {
    this.page = page
    this.testName = testName
    this.domAnalyzer = new DOMAnalyzer(page)
    this.selectorFixer = new SelectorFixer()
    this.patchGenerator = new PatchGenerator()
    this.failureHandler = new FailureHandler(page, testName)
  }

  async heal(error: Error): Promise<HealingResult> {
    console.log(`\n🔧 Self-Healer: Analizando fallo en "${this.testName}"...`)

    const failureCapture = await this.failureHandler.captureFailure(error)
    const analysis = failureCapture.analysis

    console.log(`   Tipo de fallo: ${analysis.type}`)
    console.log(`   Mensaje: ${analysis.message}`)

    switch (analysis.type) {
      case 'UI_CHANGE':
        return await this.healUIChange(error, analysis)
      case 'API_ERROR':
      case 'BACKEND':
        return this.reportBackendBug(error, analysis)
      case 'NETWORK_ERROR':
      case 'TIMEOUT':
        return this.reportInfraIssue(error, analysis)
      default:
        return this.reportNeedsReview(error, analysis)
    }
  }

  private async healUIChange(error: Error, analysis: FailureAnalysis): Promise<HealingResult> {
    console.log('   🔍 Buscando selector alternativo...')

    const testFile = this.findTestFile()
    if (!testFile) {
      console.log('   ❌ No se encontró el archivo de test')
      return {
        testName: this.testName,
        originalError: error.message,
        failureType: 'UI_CHANGE',
        action: 'NEEDS_REVIEW',
        fixes: [],
        success: false,
      }
    }

    const selectors = this.selectorFixer.extractSelectors(testFile)
    console.log(`   📄 ${selectors.length} selectores encontrados en ${path.basename(testFile)}`)

    const fixes: SelectorFix[] = []

    for (const sel of selectors) {
      try {
        const analysis = await this.domAnalyzer.findElement(sel.selector)

        if (analysis.bestMatch && analysis.bestMatch.confidence >= 0.7) {
          const fixSuggestion = this.selectorFixer.suggestFix(sel.selector, analysis.bestMatch)

          if (fixSuggestion) {
            fixes.push({
              file: testFile,
              line: sel.line,
              originalLine: sel.content,
              originalSelector: sel.selector,
              newSelector: fixSuggestion.newSelector,
              confidence: fixSuggestion.confidence,
              strategy: analysis.bestMatch.strategy,
              reason: fixSuggestion.reason,
            })
          }
        }
      } catch {
        // Skip selectors that can't be analyzed
      }
    }

    if (fixes.length === 0) {
      console.log('   ⚠️ No se encontraron correcciones automáticas')
      return {
        testName: this.testName,
        originalError: error.message,
        failureType: 'UI_CHANGE',
        action: 'NEEDS_REVIEW',
        fixes: [],
        success: false,
      }
    }

    const highConfidenceFixes = fixes.filter(f => f.confidence >= 0.8)
    const fixResult = this.selectorFixer.applyFixes(testFile, highConfidenceFixes)

    const patchPath = this.selectorFixer.generatePatch(testFile, fixes)

    const patchReport = this.patchGenerator.generateReport({
      testName: this.testName,
      testFile,
      failureAnalysis: { type: 'UI_CHANGE', message: error.message, suggestion: '' },
      originalError: error.message,
      fixes,
      appliedFixes: fixResult.fixes,
      backupPath: fixResult.backupPath,
      patchPath,
    })

    console.log(`   ✅ ${fixResult.fixes.length}/${fixes.length} selectores corregidos`)
    console.log(`   📁 Backup: ${fixResult.backupPath}`)
    console.log(`   📁 Patch: ${patchPath}`)

    return {
      testName: this.testName,
      originalError: error.message,
      failureType: 'UI_CHANGE',
      action: 'AUTO_FIXED',
      fixes: fixResult.fixes,
      reportPath: patchReport.files.report,
      success: fixResult.applied,
    }
  }

  private reportBackendBug(error: Error, analysis: FailureAnalysis): HealingResult {
    console.log('   🐛 Reportando bug de backend...')

    const statusCode = this.extractStatusCode(error.message)
    const endpoint = this.extractEndpoint(error.message)

    const reportPath = this.patchGenerator.generateBackendBugReport({
      testName: this.testName,
      testFile: this.findTestFile() || 'unknown',
      error: error.message,
      statusCode,
      endpoint,
    })

    console.log(`   📁 Reporte: ${reportPath}`)

    return {
      testName: this.testName,
      originalError: error.message,
      failureType: analysis.type,
      action: 'BACKEND_BUG_REPORT',
      fixes: [],
      reportPath,
      success: true,
    }
  }

  private reportInfraIssue(error: Error, analysis: FailureAnalysis): HealingResult {
    console.log('   🔌 Reportando issue de infraestructura...')

    const reportPath = this.patchGenerator.generateInfraReport({
      testName: this.testName,
      testFile: this.findTestFile() || 'unknown',
      error: error.message,
    })

    console.log(`   📁 Reporte: ${reportPath}`)

    return {
      testName: this.testName,
      originalError: error.message,
      failureType: analysis.type,
      action: 'INFRA_REPORT',
      fixes: [],
      reportPath,
      success: true,
    }
  }

  private reportNeedsReview(error: Error, analysis: FailureAnalysis): HealingResult {
    console.log('   🔍 Fallo requiere revisión manual')

    return {
      testName: this.testName,
      originalError: error.message,
      failureType: analysis.type,
      action: 'NEEDS_REVIEW',
      fixes: [],
      success: false,
    }
  }

  private findTestFile(): string | null {
    const testsDir = path.resolve(process.cwd(), 'tests/playwright/flows')
    const testNameLower = this.testName.toLowerCase()

    for (const dir of fs.readdirSync(testsDir)) {
      const dirPath = path.join(testsDir, dir)
      if (!fs.statSync(dirPath).isDirectory()) continue

      for (const file of fs.readdirSync(dirPath)) {
        if (!file.endsWith('.spec.ts')) continue
        const filePath = path.join(dirPath, file)
        const content = fs.readFileSync(filePath, 'utf-8').toLowerCase()

        if (content.includes(testNameLower) || testNameLower.includes(path.basename(file, '.spec.ts'))) {
          return filePath
        }
      }
    }

    return null
  }

  private extractStatusCode(message: string): number | undefined {
    const match = message.match(/\b([45]\d{2})\b/)
    return match ? parseInt(match[1]) : undefined
  }

  private extractEndpoint(message: string): string | undefined {
    const match = message.match(/(\/api\/v\d+\/\S+)/)
    return match ? match[1] : undefined
  }

  static async healBatch(
    page: Page,
    failures: { testName: string; error: Error }[]
  ): Promise<HealingResult[]> {
    console.log(`\n🔧 Self-Healer: Procesando ${failures.length} fallos...\n`)

    const results: HealingResult[] = []

    for (const failure of failures) {
      const healer = new SelfHealer(page, failure.testName)
      const result = await healer.heal(failure.error)
      results.push(result)
    }

    const autoFixed = results.filter(r => r.action === 'AUTO_FIXED').length
    const backendBugs = results.filter(r => r.action === 'BACKEND_BUG_REPORT').length
    const infraIssues = results.filter(r => r.action === 'INFRA_REPORT').length
    const needsReview = results.filter(r => r.action === 'NEEDS_REVIEW').length

    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMEN DE SELF-HEALING')
    console.log('='.repeat(60))
    console.log(`Total: ${results.length}`)
    console.log(`Auto-corregidos: ${autoFixed}`)
    console.log(`Bugs backend: ${backendBugs}`)
    console.log(`Issues infra: ${infraIssues}`)
    console.log(`Requieren revisión: ${needsReview}`)
    console.log('='.repeat(60))

    return results
  }
}
