import fs from 'fs'
import path from 'path'
import type { Page } from '@playwright/test'
import type { ConsoleEntry, FailureAnalysis } from './console-logger'

export interface TestReport {
  testName: string
  suite: string
  timestamp: string
  status: 'passed' | 'failed' | 'timedout' | 'skipped'
  duration: number
  error?: {
    message: string
    stack?: string
    snippet?: string
  }
  analysis?: FailureAnalysis
  screenshot?: string
  consoleLogs?: {
    total: number
    errors: ConsoleEntry[]
    warnings: ConsoleEntry[]
    networkErrors: ConsoleEntry[]
  }
  dom?: {
    title: string
    url: string
    bodyText?: string
  }
}

export class ReportGenerator {
  private reportsDir: string

  constructor() {
    this.reportsDir = path.resolve(process.cwd(), 'test-results/self-healing/reports')
    fs.mkdirSync(this.reportsDir, { recursive: true })
  }

  async generate(report: TestReport): Promise<string> {
    const safeName = report.testName.replace(/[^a-zA-Z0-9_-]/g, '_')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `fallo_${safeName}_${timestamp}.json`
    const filepath = path.join(this.reportsDir, filename)

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2), 'utf-8')
    return filepath
  }

  async captureDOM(page: Page): Promise<TestReport['dom']> {
    const title = await page.title()
    const url = page.url()
    const bodyText = await page.evaluate(() => {
      const main = document.querySelector('main') || document.body
      return main?.innerText?.substring(0, 2000) || ''
    })
    return { title, url, bodyText }
  }

  async captureScreenshot(
    page: Page,
    testName: string
  ): Promise<string | undefined> {
    try {
      const safeName = testName.replace(/[^a-zA-Z0-9_-]/g, '_')
      const screenshotDir = path.resolve(process.cwd(), 'test-results/screenshots')
      fs.mkdirSync(screenshotDir, { recursive: true })
      const filepath = path.join(screenshotDir, `${safeName}.png`)
      await page.screenshot({ path: filepath, fullPage: true })
      return filepath
    } catch {
      return undefined
    }
  }
}
