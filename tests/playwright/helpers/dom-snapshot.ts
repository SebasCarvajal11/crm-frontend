import type { Page } from '@playwright/test'
import fs from 'fs'
import path from 'path'

export interface DOMSnapshot {
  timestamp: string
  url: string
  title: string
  viewport: { width: number; height: number }
  bodyHTML: string
  visibleElements: VisibleElement[]
  interactiveElements: InteractiveElement[]
  forms: FormData[]
  ariaLabels: string[]
}

export interface VisibleElement {
  tag: string
  id?: string
  className?: string
  text?: string
  role?: string
  ariaLabel?: string
  bounds?: { x: number; y: number; width: number; height: number }
}

export interface InteractiveElement {
  tag: string
  type?: string
  id?: string
  name?: string
  placeholder?: string
  disabled?: boolean
  visible?: boolean
  text?: string
}

export interface FormData {
  action?: string
  method?: string
  fields: { name: string; type: string; value: string; required?: boolean }[]
}

export class DOMSnapshotter {
  private snapshotsDir: string

  constructor() {
    this.snapshotsDir = path.resolve(process.cwd(), 'test-results/dom-snapshots')
    fs.mkdirSync(this.snapshotsDir, { recursive: true })
  }

  async capture(page: Page, testName: string): Promise<DOMSnapshot> {
    const snapshot: DOMSnapshot = {
      timestamp: new Date().toISOString(),
      url: page.url(),
      title: await page.title(),
      viewport: page.viewportSize() || { width: 0, height: 0 },
      bodyHTML: await this.getBodyHTML(page),
      visibleElements: await this.getVisibleElements(page),
      interactiveElements: await this.getInteractiveElements(page),
      forms: await this.getForms(page),
      ariaLabels: await this.getAriaLabels(page),
    }

    return snapshot
  }

  async captureAndPersist(page: Page, testName: string): Promise<string> {
    const snapshot = await this.capture(page, testName)
    const safeName = testName.replace(/[^a-zA-Z0-9_-]/g, '_')
    const filepath = path.join(this.snapshotsDir, `dom_${safeName}.json`)

    fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2), 'utf-8')
    return filepath
  }

  private async getBodyHTML(page: Page): Promise<string> {
    try {
      const html = await page.evaluate(() => {
        const main = document.querySelector('main') || document.body
        return main?.outerHTML?.substring(0, 50000) || ''
      })
      return html
    } catch {
      return '<error capturing HTML>'
    }
  }

  private async getVisibleElements(page: Page): Promise<VisibleElement[]> {
    try {
      return await page.evaluate(() => {
        const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, button, a, label, td, th')
        const visible: VisibleElement[] = []

        for (const el of Array.from(elements).slice(0, 200)) {
          const rect = el.getBoundingClientRect()
          if (rect.width === 0 || rect.height === 0) continue

          const text = el.textContent?.trim().substring(0, 100) || ''
          if (!text) continue

          visible.push({
            tag: el.tagName.toLowerCase(),
            id: el.id || undefined,
            className: el.className?.toString().substring(0, 200) || undefined,
            text,
            role: el.getAttribute('role') || undefined,
            ariaLabel: el.getAttribute('aria-label') || undefined,
            bounds: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            },
          })
        }

        return visible
      })
    } catch {
      return []
    }
  }

  private async getInteractiveElements(page: Page): Promise<InteractiveElement[]> {
    try {
      return await page.evaluate(() => {
        const elements = document.querySelectorAll('input, button, select, textarea, a[href]')
        const interactive: InteractiveElement[] = []

        for (const el of Array.from(elements).slice(0, 100)) {
          const rect = el.getBoundingClientRect()
          interactive.push({
            tag: el.tagName.toLowerCase(),
            type: el.getAttribute('type') || undefined,
            id: el.id || undefined,
            name: el.getAttribute('name') || undefined,
            placeholder: el.getAttribute('placeholder') || undefined,
            disabled: (el as HTMLInputElement).disabled || undefined,
            visible: rect.width > 0 && rect.height > 0,
            text: el.textContent?.trim().substring(0, 50) || undefined,
          })
        }

        return interactive
      })
    } catch {
      return []
    }
  }

  private async getForms(page: Page): Promise<FormData[]> {
    try {
      return await page.evaluate(() => {
        const forms = document.querySelectorAll('form')
        const formData: FormData[] = []

        for (const form of Array.from(forms).slice(0, 20)) {
          const fields: FormData['fields'] = []
          const inputs = form.querySelectorAll('input, select, textarea')

          for (const input of Array.from(inputs)) {
            fields.push({
              name: input.getAttribute('name') || input.id || '',
              type: input.getAttribute('type') || input.tagName.toLowerCase(),
              value: (input as HTMLInputElement).value?.substring(0, 100) || '',
              required: (input as HTMLInputElement).required || undefined,
            })
          }

          formData.push({
            action: form.action || undefined,
            method: form.method || undefined,
            fields,
          })
        }

        return formData
      })
    } catch {
      return []
    }
  }

  private async getAriaLabels(page: Page): Promise<string[]> {
    try {
      return await page.evaluate(() => {
        const elements = document.querySelectorAll('[aria-label]')
        const labels: string[] = []

        for (const el of Array.from(elements).slice(0, 100)) {
          const label = el.getAttribute('aria-label')
          if (label) labels.push(label)
        }

        return labels
      })
    } catch {
      return []
    }
  }
}
