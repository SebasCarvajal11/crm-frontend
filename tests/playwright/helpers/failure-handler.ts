import type { Page, TestInfo } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { ConsoleLogger, type ConsoleEntry, type FailureAnalysis } from './console-logger'
import { DOMSnapshotter, type DOMSnapshot } from './dom-snapshot'
import { ReportGenerator, type TestReport } from './report-generator'

export interface FailureCapture {
  testName: string
  timestamp: string
  error: {
    message: string
    stack?: string
    snippet?: string
  }
  analysis: FailureAnalysis
  screenshot?: string
  consoleLogs: {
    total: number
    errors: ConsoleEntry[]
    warnings: ConsoleEntry[]
    networkErrors: ConsoleEntry[]
    allEntries: ConsoleEntry[]
  }
  dom: DOMSnapshot
  reportPath: string
}

export class FailureHandler {
  private consoleLogger: ConsoleLogger
  private domSnapshotter: DOMSnapshotter
  private reportGenerator: ReportGenerator
  private page: Page
  private testName: string
  private attached: boolean = false

  constructor(page: Page, testName: string) {
    this.page = page
    this.testName = testName
    this.consoleLogger = new ConsoleLogger(testName)
    this.domSnapshotter = new DOMSnapshotter()
    this.reportGenerator = new ReportGenerator()
  }

  attach(): void {
    if (this.attached) return
    this.consoleLogger.attachToPage(this.page)
    this.attached = true
  }

  async captureFailure(error?: Error): Promise<FailureCapture> {
    this.attach()

    const screenshot = await this.captureScreenshot()
    const dom = await this.domSnapshotter.capture(this.page, this.testName)
    const analysis = this.consoleLogger.analyzeFailure(error)
    const consoleSummary = this.consoleLogger.getSummary()

    const report: TestReport = {
      testName: this.testName,
      suite: 'e2e',
      timestamp: new Date().toISOString(),
      status: 'failed',
      duration: consoleSummary.duration,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
            snippet: error.message.substring(0, 500),
          }
        : undefined,
      analysis,
      screenshot,
      consoleLogs: {
        total: consoleSummary.total,
        errors: this.consoleLogger.getErrors(),
        warnings: this.consoleLogger.getWarnings(),
        networkErrors: this.consoleLogger
          .getAll()
          .filter((e) => e.type === 'request-failed'),
      },
      dom: {
        title: dom.title,
        url: dom.url,
        bodyText: dom.visibleElements
          .map((e) => e.text)
          .filter(Boolean)
          .join(' ')
          .substring(0, 2000),
      },
    }

    const reportPath = await this.reportGenerator.generate(report)

    const consoleLogPath = await this.consoleLogger.persist(true, error)

    const fullCapture: FailureCapture = {
      testName: this.testName,
      timestamp: new Date().toISOString(),
      error: {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        snippet: error?.message?.substring(0, 500),
      },
      analysis,
      screenshot,
      consoleLogs: {
        total: consoleSummary.total,
        errors: this.consoleLogger.getErrors(),
        warnings: this.consoleLogger.getWarnings(),
        networkErrors: this.consoleLogger
          .getAll()
          .filter((e) => e.type === 'request-failed'),
        allEntries: this.consoleLogger.getAll(),
      },
      dom,
      reportPath,
    }

    const capturePath = this.persistCapture(fullCapture)
    console.log(`\n📁 Failure capture saved: ${capturePath}`)

    return fullCapture
  }

  private async captureScreenshot(): Promise<string | undefined> {
    try {
      const safeName = this.testName.replace(/[^a-zA-Z0-9_-]/g, '_')
      const screenshotDir = path.resolve(process.cwd(), 'test-results/screenshots')
      fs.mkdirSync(screenshotDir, { recursive: true })
      const filepath = path.join(screenshotDir, `fail_${safeName}.png`)
      await this.page.screenshot({ path: filepath, fullPage: true })
      return filepath
    } catch {
      return undefined
    }
  }

  private persistCapture(capture: FailureCapture): string {
    const capturesDir = path.resolve(process.cwd(), 'test-results/failure-captures')
    fs.mkdirSync(capturesDir, { recursive: true })

    const safeName = this.testName.replace(/[^a-zA-Z0-9_-]/g, '_')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filepath = path.join(capturesDir, `capture_${safeName}_${timestamp}.json`)

    const serializable = {
      ...capture,
      consoleLogs: {
        ...capture.consoleLogs,
        allEntries: capture.consoleLogs.allEntries.slice(0, 500),
      },
      dom: {
        ...capture.dom,
        bodyHTML: capture.dom.bodyHTML.substring(0, 10000),
      },
    }

    fs.writeFileSync(filepath, JSON.stringify(serializable, null, 2), 'utf-8')
    return filepath
  }

  getConsoleLogger(): ConsoleLogger {
    return this.consoleLogger
  }

  getErrors(): ConsoleEntry[] {
    return this.consoleLogger.getErrors()
  }

  getWarnings(): ConsoleEntry[] {
    return this.consoleLogger.getWarnings()
  }
}
