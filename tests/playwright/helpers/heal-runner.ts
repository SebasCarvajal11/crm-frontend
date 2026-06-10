/**
 * Self-Healing CLI Runner
 *
 * Ejecuta los tests de Playwright, analiza los fallos y aplica
 * autocorrecciones cuando es posible.
 *
 * Uso:
 *   tsx tests/playwright/helpers/heal-runner.ts [--project=admin] [--dry-run]
 */

import { spawn } from 'node:child_process'
import { once } from 'node:events'
import fs from 'node:fs'
import path from 'node:path'

const CONFIG_PATH = path.resolve(__dirname, '../playwright.config.ts')
const RESULTS_DIR = path.resolve(process.cwd(), 'test-results')
const HEALING_DIR = path.resolve(RESULTS_DIR, 'self-healing')

interface TestFailure {
  testName: string
  file: string
  error: string
  line?: number
}

interface HealingReport {
  timestamp: string
  totalTests: number
  passed: number
  failed: number
  healed: number
  needsReview: number
  backendBugs: number
  infraIssues: number
  failures: TestFailure[]
  actions: string[]
}

async function runPlaywright(args: string[]): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const proc = spawn('pnpm', ['exec', 'playwright', 'test', '--config', CONFIG_PATH, ...args], {
    shell: process.platform === 'win32',
    stdio: ['pipe', 'pipe', 'pipe'],
  })

  let stdout = ''
  let stderr = ''

  proc.stdout?.on('data', (chunk) => { stdout += chunk.toString() })
  proc.stderr?.on('data', (chunk) => { stderr += chunk.toString() })

  const [exitCode] = (await once(proc, 'exit')) as [number | null]

  return { exitCode: exitCode ?? 1, stdout, stderr }
}

function parseFailures(stdout: string, stderr: string): TestFailure[] {
  const failures: TestFailure[] = []
  const lines = stdout.split('\n').concat(stderr.split('\n'))

  for (const line of lines) {
    const failMatch = line.match(/^\s+\d+\)\s+(.+?)(?:\s+\[(\w+)\])?\s+›\s+(.+)$/)
    if (failMatch) {
      failures.push({
        testName: failMatch[3].trim(),
        file: failMatch[1].trim(),
        error: '',
      })
    }

    const errorMatch = line.match(/Error:\s+(.+)/)
    if (errorMatch && failures.length > 0) {
      failures[failures.length - 1].error = errorMatch[1]
    }
  }

  return failures
}

function classifyFailure(failure: TestFailure): 'UI_CHANGE' | 'BACKEND_BUG' | 'INFRA_ISSUE' | 'UNKNOWN' {
  const error = failure.error.toLowerCase()

  if (
    error.includes('locator') ||
    error.includes('selector') ||
    error.includes('not found') ||
    error.includes('not visible') ||
    error.includes('waiting for')
  ) {
    return 'UI_CHANGE'
  }

  if (
    error.includes('500') ||
    error.includes('internal server error') ||
    error.includes('400') ||
    error.includes('401') ||
    error.includes('403')
  ) {
    return 'BACKEND_BUG'
  }

  if (
    error.includes('connection refused') ||
    error.includes('econnrefused') ||
    error.includes('timeout')
  ) {
    return 'INFRA_ISSUE'
  }

  return 'UNKNOWN'
}

function generateHealingReport(failures: TestFailure[]): HealingReport {
  const report: HealingReport = {
    timestamp: new Date().toISOString(),
    totalTests: 0,
    passed: 0,
    failed: failures.length,
    healed: 0,
    needsReview: 0,
    backendBugs: 0,
    infraIssues: 0,
    failures,
    actions: [],
  }

  for (const failure of failures) {
    const type = classifyFailure(failure)

    switch (type) {
      case 'UI_CHANGE':
        report.actions.push(`[UI_CHANGE] ${failure.testName}: Requiere análisis de selectores`)
        report.needsReview++
        break
      case 'BACKEND_BUG':
        report.actions.push(`[BACKEND_BUG] ${failure.testName}: Reportar bug al equipo de backend`)
        report.backendBugs++
        break
      case 'INFRA_ISSUE':
        report.actions.push(`[INFRA_ISSUE] ${failure.testName}: Verificar servicios`)
        report.infraIssues++
        break
      default:
        report.actions.push(`[UNKNOWN] ${failure.testName}: Requiere revisión manual`)
        report.needsReview++
    }
  }

  return report
}

function saveReport(report: HealingReport): string {
  fs.mkdirSync(HEALING_DIR, { recursive: true })

  const reportPath = path.join(HEALING_DIR, `heal-report_${Date.now()}.json`)
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8')
  return reportPath
}

function formatSummary(report: HealingReport): string {
  let summary = '\n' + '='.repeat(60) + '\n'
  summary += '🔧 SELF-HEALING REPORT\n'
  summary += '='.repeat(60) + '\n\n'
  summary += `Tests ejecutados: ${report.totalTests}\n`
  summary += `Pasados:          ${report.passed}\n`
  summary += `Fallidos:         ${report.failed}\n\n`
  summary += `Auto-corregidos:  ${report.healed}\n`
  summary += `Bugs backend:     ${report.backendBugs}\n`
  summary += `Issues infra:     ${report.infraIssues}\n`
  summary += `Requieren review: ${report.needsReview}\n`

  if (report.actions.length > 0) {
    summary += '\nAcciones:\n'
    for (const action of report.actions) {
      summary += `  • ${action}\n`
    }
  }

  summary += '\n' + '='.repeat(60)
  return summary
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const projectArg = args.find(a => a.startsWith('--project='))?.split('=')[1]

  console.log('🔧 Self-Healing Runner — CIMA CRM')
  console.log(`   Config: ${CONFIG_PATH}`)
  console.log(`   Dry Run: ${dryRun}`)
  if (projectArg) console.log(`   Project: ${projectArg}`)

  const playwrightArgs: string[] = []
  if (projectArg) playwrightArgs.push(`--project=${projectArg}`)

  console.log('\n▶ Ejecutando tests de Playwright...')
  const { exitCode, stdout, stderr } = await runPlaywright(playwrightArgs)

  console.log(`\n   Exit Code: ${exitCode}`)

  if (exitCode === 0) {
    console.log('\n✅ Todos los tests pasaron. No se requiere self-healing.')
    process.exit(0)
  }

  const failures = parseFailures(stdout, stderr)
  console.log(`\n❌ ${failures.length} fallos detectados`)

  if (failures.length === 0) {
    console.log('⚠️ No se pudieron parsear los fallos del output')
    console.log('\nOutput de Playwright:')
    console.log(stdout)
    if (stderr) console.log('\nStderr:')
    console.log(stderr)
    process.exit(1)
  }

  const report = generateHealingReport(failures)

  if (!dryRun) {
    const reportPath = saveReport(report)
    console.log(`\n📁 Reporte guardado: ${reportPath}`)
  }

  console.log(formatSummary(report))

  if (report.backendBugs > 0) {
    console.log('\n🐛 Bugs de backend detectados. Revisar:')
    console.log(`   ${RESULTS_DIR}/self-healing/backend-bugs/`)
  }

  if (report.infraIssues > 0) {
    console.log('\n🔌 Issues de infraestructura. Verificar servicios.')
  }

  process.exit(exitCode)
}

void main()
