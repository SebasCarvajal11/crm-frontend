import fs from 'fs'
import path from 'path'
import type { SelectorMatch } from './dom-analyzer'

export interface SelectorFix {
  file: string
  line: number
  originalLine: string
  originalSelector: string
  newSelector: string
  confidence: number
  strategy: string
  reason: string
}

export interface FixResult {
  file: string
  fixes: SelectorFix[]
  applied: boolean
  backupPath?: string
}

export class SelectorFixer {
  private testsDir: string
  private backupsDir: string

  constructor(testsDir?: string) {
    this.testsDir = testsDir || path.resolve(process.cwd(), 'tests/playwright/flows')
    this.backupsDir = path.resolve(process.cwd(), 'test-results/self-healing/backups')
    fs.mkdirSync(this.backupsDir, { recursive: true })
  }

  findTestFile(testName: string): string | null {
    const parts: string[] = []

    for (const dir of fs.readdirSync(this.testsDir)) {
      const dirPath = path.join(this.testsDir, dir)
      if (!fs.statSync(dirPath).isDirectory()) continue

      for (const file of fs.readdirSync(dirPath)) {
        if (!file.endsWith('.spec.ts')) continue
        const filePath = path.join(dirPath, file)
        const content = fs.readFileSync(filePath, 'utf-8')

        if (content.includes(testName)) {
          return filePath
        }
      }
    }

    return null
  }

  extractSelectors(filePath: string): { line: number; content: string; selector: string }[] {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    const selectors: { line: number; content: string; selector: string }[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const patterns = [
        /page\.getByRole\([^)]+\)/,
        /page\.getByText\([^)]+\)/,
        /page\.getByLabel\([^)]+\)/,
        /page\.getByTestId\([^)]+\)/,
        /page\.getByPlaceholder\([^)]+\)/,
        /page\.locator\([^)]+\)/,
      ]

      for (const pattern of patterns) {
        const match = line.match(pattern)
        if (match) {
          selectors.push({
            line: i + 1,
            content: line,
            selector: match[0],
          })
          break
        }
      }
    }

    return selectors
  }

  suggestFix(
    originalSelector: string,
    match: SelectorMatch
  ): { newSelector: string; confidence: number; reason: string } | null {
    if (match.confidence < 0.5) return null

    const newSelector = this.buildNewSelector(originalSelector, match)
    if (!newSelector || newSelector === originalSelector) return null

    return {
      newSelector,
      confidence: match.confidence,
      reason: `Elemento encontrado via ${match.strategy} con confianza ${Math.round(match.confidence * 100)}%`,
    }
  }

  private buildNewSelector(original: string, match: SelectorMatch): string {
    const getCall = original.match(/page\.(getBy\w+)\(/)
    if (!getCall) return original

    const method = getCall[1]

    switch (match.strategy) {
      case 'role':
        if (match.element.role) {
          const name = match.element.text || match.element.ariaLabel
          if (name) {
            return `page.getByRole('${match.element.role}', { name: '${this.escapeString(name)}' })`
          }
          return `page.getByRole('${match.element.role}')`
        }
        break

      case 'label':
        if (match.element.ariaLabel) {
          return `page.getByLabel('${this.escapeString(match.element.ariaLabel)}')`
        }
        break

      case 'text':
        if (match.element.text) {
          return `page.getByText('${this.escapeString(match.element.text)}')`
        }
        break

      case 'testid':
        if (match.element.testId) {
          return `page.getByTestId('${this.escapeString(match.element.testId)}')`
        }
        break

      case 'placeholder':
        if (match.element.placeholder) {
          return `page.getByPlaceholder('${this.escapeString(match.element.placeholder)}')`
        }
        break

      case 'css':
        return match.selector.startsWith('page.')
          ? match.selector
          : `page.locator('${match.selector}')`
    }

    return original
  }

  private escapeString(str: string): string {
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"')
  }

  applyFix(filePath: string, fix: SelectorFix): FixResult {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    if (fix.line < 1 || fix.line > lines.length) {
      return { file: filePath, fixes: [fix], applied: false }
    }

    const backupPath = path.join(
      this.backupsDir,
      `${path.basename(filePath, '.ts')}_${Date.now()}.bak.ts`
    )
    fs.writeFileSync(backupPath, content, 'utf-8')

    const originalLine = lines[fix.line - 1]
    const newLine = originalLine.replace(fix.originalSelector, fix.newSelector)

    if (newLine === originalLine) {
      return { file: filePath, fixes: [fix], applied: false, backupPath }
    }

    lines[fix.line - 1] = newLine

    const autoFixComment = `// Auto-corrected by SelfHealer on ${new Date().toISOString().split('T')[0]}`
    const reasonComment = `// Original: ${fix.originalSelector}`
    const confidenceComment = `// Confidence: ${Math.round(fix.confidence * 100)}%`

    if (!lines[fix.line - 2]?.includes('Auto-corrected by SelfHealer')) {
      lines.splice(fix.line - 1, 0, autoFixComment, reasonComment, confidenceComment)
    }

    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8')

    return {
      file: filePath,
      fixes: [fix],
      applied: true,
      backupPath,
    }
  }

  applyFixes(filePath: string, fixes: SelectorFix[]): FixResult {
    if (fixes.length === 0) {
      return { file: filePath, fixes: [], applied: false }
    }

    let content = fs.readFileSync(filePath, 'utf-8')

    const backupPath = path.join(
      this.backupsDir,
      `${path.basename(filePath, '.ts')}_${Date.now()}.bak.ts`
    )
    fs.writeFileSync(backupPath, content, 'utf-8')

    const lines = content.split('\n')
    const appliedFixes: SelectorFix[] = []

    for (const fix of fixes.sort((a, b) => b.line - a.line)) {
      if (fix.line < 1 || fix.line > lines.length) continue

      const originalLine = lines[fix.line - 1]
      const newLine = originalLine.replace(fix.originalSelector, fix.newSelector)

      if (newLine !== originalLine) {
        lines[fix.line - 1] = newLine
        appliedFixes.push(fix)
      }
    }

    if (appliedFixes.length > 0) {
      fs.writeFileSync(filePath, lines.join('\n'), 'utf-8')
    }

    return {
      file: filePath,
      fixes: appliedFixes,
      applied: appliedFixes.length > 0,
      backupPath,
    }
  }

  generatePatch(filePath: string, fixes: SelectorFix[]): string {
    const patchesDir = path.resolve(process.cwd(), 'test-results/self-healing/patches')
    fs.mkdirSync(patchesDir, { recursive: true })

    const safeName = path.basename(filePath, '.ts')
    const patchPath = path.join(patchesDir, `${safeName}_${Date.now()}.patch`)

    const patch = {
      timestamp: new Date().toISOString(),
      file: filePath,
      fixes: fixes.map(f => ({
        line: f.line,
        original: f.originalSelector,
        replacement: f.newSelector,
        confidence: f.confidence,
        strategy: f.strategy,
        reason: f.reason,
      })),
      summary: {
        total: fixes.length,
        highConfidence: fixes.filter(f => f.confidence >= 0.9).length,
        mediumConfidence: fixes.filter(f => f.confidence >= 0.7 && f.confidence < 0.9).length,
        lowConfidence: fixes.filter(f => f.confidence < 0.7).length,
      },
    }

    fs.writeFileSync(patchPath, JSON.stringify(patch, null, 2), 'utf-8')
    return patchPath
  }
}
