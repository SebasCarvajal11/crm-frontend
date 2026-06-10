import fs from 'fs'
import path from 'path'
import type { SelectorFix } from './selector-fixer'
import type { FailureAnalysis } from './console-logger'

export interface PatchReport {
  id: string
  timestamp: string
  testName: string
  testFile: string
  failureType: FailureAnalysis['type']
  originalError: string
  fixes: PatchFix[]
  status: 'AUTO_FIXED' | 'NEEDS_MANUAL_REVIEW' | 'BACKEND_BUG' | 'INFRA_ISSUE'
  summary: {
    totalSelectors: number
    autoFixed: number
    needsReview: number
    confidence: number
  }
  files: {
    backup?: string
    patch?: string
    report: string
  }
}

export interface PatchFix {
  line: number
  original: string
  replacement: string
  confidence: number
  strategy: string
  reason: string
  applied: boolean
}

export class PatchGenerator {
  private patchesDir: string
  private reportsDir: string

  constructor() {
    this.patchesDir = path.resolve(process.cwd(), 'test-results/self-healing/patches')
    this.reportsDir = path.resolve(process.cwd(), 'test-results/self-healing/reports')
    fs.mkdirSync(this.patchesDir, { recursive: true })
    fs.mkdirSync(this.reportsDir, { recursive: true })
  }

  generateReport(params: {
    testName: string
    testFile: string
    failureAnalysis: FailureAnalysis
    originalError: string
    fixes: SelectorFix[]
    appliedFixes: SelectorFix[]
    backupPath?: string
    patchPath?: string
  }): PatchReport {
    const {
      testName,
      testFile,
      failureAnalysis,
      originalError,
      fixes,
      appliedFixes,
      backupPath,
      patchPath,
    } = params

    let status: PatchReport['status']
    switch (failureAnalysis.type) {
      case 'UI_CHANGE':
        status = appliedFixes.length > 0 ? 'AUTO_FIXED' : 'NEEDS_MANUAL_REVIEW'
        break
      case 'API_ERROR':
      case 'BACKEND':
        status = 'BACKEND_BUG'
        break
      case 'NETWORK_ERROR':
      case 'TIMEOUT':
        status = 'INFRA_ISSUE'
        break
      default:
        status = 'NEEDS_MANUAL_REVIEW'
    }

    const report: PatchReport = {
      id: `patch_${Date.now()}`,
      timestamp: new Date().toISOString(),
      testName,
      testFile,
      failureType: failureAnalysis.type,
      originalError: originalError.substring(0, 500),
      fixes: fixes.map(f => ({
        line: f.line,
        original: f.originalSelector,
        replacement: f.newSelector,
        confidence: f.confidence,
        strategy: f.strategy,
        reason: f.reason,
        applied: appliedFixes.some(af => af.line === f.line),
      })),
      status,
      summary: {
        totalSelectors: fixes.length,
        autoFixed: appliedFixes.length,
        needsReview: fixes.length - appliedFixes.length,
        confidence: fixes.length > 0
          ? Math.round(fixes.reduce((sum, f) => sum + f.confidence, 0) / fixes.length * 100)
          : 0,
      },
      files: {
        backup: backupPath,
        patch: patchPath,
        report: '',
      },
    }

    const reportPath = path.join(this.reportsDir, `${report.id}.json`)
    report.files.report = reportPath
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8')

    return report
  }

  generateBackendBugReport(params: {
    testName: string
    testFile: string
    error: string
    statusCode?: number
    endpoint?: string
  }): string {
    const reportDir = path.resolve(process.cwd(), 'test-results/self-healing/backend-bugs')
    fs.mkdirSync(reportDir, { recursive: true })

    const report = {
      timestamp: new Date().toISOString(),
      testName: params.testName,
      testFile: params.testFile,
      type: 'BACKEND_BUG',
      error: params.error,
      statusCode: params.statusCode,
      endpoint: params.endpoint,
      severity: this.classifySeverity(params.statusCode),
      action: 'Revisar logs del backend y verificar el endpoint afectado',
    }

    const filePath = path.join(reportDir, `bug_${Date.now()}.json`)
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf-8')
    return filePath
  }

  generateInfraReport(params: {
    testName: string
    testFile: string
    error: string
    service?: string
  }): string {
    const reportDir = path.resolve(process.cwd(), 'test-results/self-healing/infra-issues')
    fs.mkdirSync(reportDir, { recursive: true })

    const report = {
      timestamp: new Date().toISOString(),
      testName: params.testName,
      testFile: params.testFile,
      type: 'INFRA_ISSUE',
      error: params.error,
      service: params.service,
      severity: 'HIGH',
      action: 'Verificar que todos los servicios estén corriendo correctamente',
    }

    const filePath = path.join(reportDir, `infra_${Date.now()}.json`)
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf-8')
    return filePath
  }

  private classifySeverity(statusCode?: number): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    if (!statusCode) return 'MEDIUM'
    if (statusCode >= 500) return 'CRITICAL'
    if (statusCode >= 400) return 'HIGH'
    return 'LOW'
  }

  formatSummary(reports: PatchReport[]): string {
    const total = reports.length
    const autoFixed = reports.filter(r => r.status === 'AUTO_FIXED').length
    const backendBugs = reports.filter(r => r.status === 'BACKEND_BUG').length
    const infraIssues = reports.filter(r => r.status === 'INFRA_ISSUE').length
    const needsReview = reports.filter(r => r.status === 'NEEDS_MANUAL_REVIEW').length

    let summary = '\n' + '='.repeat(60) + '\n'
    summary += '🔧 RESUMEN DE SELF-HEALING\n'
    summary += '='.repeat(60) + '\n\n'
    summary += `Total de fallos analizados: ${total}\n`
    summary += `  ✅ Auto-corregidos:       ${autoFixed}\n`
    summary += `  🐛 Bugs de backend:       ${backendBugs}\n`
    summary += `  🔌 Issues de infra:       ${infraIssues}\n`
    summary += `  🔍 Requieren revision:    ${needsReview}\n`

    if (autoFixed > 0) {
      summary += '\nArchivos corregidos:\n'
      for (const r of reports.filter(r => r.status === 'AUTO_FIXED')) {
        summary += `  - ${r.testFile} (${r.summary.autoFixed} selectores)\n`
      }
    }

    if (backendBugs > 0) {
      summary += '\nBugs de backend detectados:\n'
      for (const r of reports.filter(r => r.status === 'BACKEND_BUG')) {
        summary += `  - ${r.testName}: ${r.originalError.substring(0, 80)}\n`
      }
    }

    summary += '\n' + '='.repeat(60)
    return summary
  }
}
