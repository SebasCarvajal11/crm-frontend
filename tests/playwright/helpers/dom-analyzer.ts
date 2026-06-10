import type { Page } from '@playwright/test'
import fs from 'fs'
import path from 'path'

export interface SelectorMatch {
  selector: string
  strategy: 'role' | 'text' | 'label' | 'testid' | 'css' | 'placeholder'
  confidence: number
  element: {
    tag: string
    text?: string
    role?: string
    ariaLabel?: string
    testId?: string
    placeholder?: string
  }
}

export interface DOMAnalysis {
  timestamp: string
  url: string
  originalSelector: string
  matches: SelectorMatch[]
  bestMatch?: SelectorMatch
  recommendation: 'EXACT_MATCH' | 'PARTIAL_MATCH' | 'NO_MATCH' | 'AMBIGUOUS'
  suggestedSelector?: string
}

export class DOMAnalyzer {
  private page: Page

  constructor(page: Page) {
    this.page = page
  }

  async findElement(originalSelector: string): Promise<DOMAnalysis> {
    const analysis: DOMAnalysis = {
      timestamp: new Date().toISOString(),
      url: this.page.url(),
      originalSelector,
      matches: [],
      recommendation: 'NO_MATCH',
    }

    try {
      const locator = this.page.locator(originalSelector)
      const count = await locator.count()

      if (count === 1) {
        analysis.matches.push({
          selector: originalSelector,
          strategy: 'css',
          confidence: 1.0,
          element: await this.getElementInfo(locator),
        })
        analysis.bestMatch = analysis.matches[0]
        analysis.recommendation = 'EXACT_MATCH'
        analysis.suggestedSelector = originalSelector
        return analysis
      }
    } catch {
      // Selector no valido
    }

    const extracted = this.extractSelectorInfo(originalSelector)
    const candidates = await this.searchByAttributes(extracted)

    analysis.matches = candidates.sort((a, b) => b.confidence - a.confidence)

    if (analysis.matches.length > 0) {
      analysis.bestMatch = analysis.matches[0]

      if (analysis.bestMatch.confidence >= 0.9) {
        analysis.recommendation = 'EXACT_MATCH'
      } else if (analysis.bestMatch.confidence >= 0.5) {
        analysis.recommendation = 'PARTIAL_MATCH'
      } else {
        analysis.recommendation = 'AMBIGUOUS'
      }

      analysis.suggestedSelector = this.buildSelector(analysis.bestMatch)
    }

    return analysis
  }

  private extractSelectorInfo(selector: string): {
    text?: string
    role?: string
    ariaLabel?: string
    testId?: string
    placeholder?: string
    id?: string
    className?: string
  } {
    const info: Record<string, string | undefined> = {}

    const roleMatch = selector.match(/getByRole\(['"](\w+)['"](?:,\s*\{[^}]*name:\s*['"]([^'"]+)['"])?\)/)
    if (roleMatch) {
      info.role = roleMatch[1]
      info.text = roleMatch[2]
    }

    const textMatch = selector.match(/getByText\(['"]([^'"]+)['"]\)/)
    if (textMatch) {
      info.text = textMatch[1]
    }

    const labelMatch = selector.match(/getByLabel\(['"]([^'"]+)['"]\)/)
    if (labelMatch) {
      info.ariaLabel = labelMatch[1]
    }

    const testIdMatch = selector.match(/getByTestId\(['"]([^'"]+)['"]\)/)
    if (testIdMatch) {
      info.testId = testIdMatch[1]
    }

    const placeholderMatch = selector.match(/getByPlaceholder\(['"]([^'"]+)['"]\)/)
    if (placeholderMatch) {
      info.placeholder = placeholderMatch[1]
    }

    const idMatch = selector.match(/#([a-zA-Z][\w-]*)/)
    if (idMatch) {
      info.id = idMatch[1]
    }

    return info
  }

  private async searchByAttributes(info: {
    text?: string
    role?: string
    ariaLabel?: string
    testId?: string
    placeholder?: string
    id?: string
    className?: string
  }): Promise<SelectorMatch[]> {
    const matches: SelectorMatch[] = []

    if (info.role && info.text) {
      try {
        const locator = this.page.getByRole(info.role as any, { name: info.text })
        const count = await locator.count()
        if (count === 1) {
          matches.push({
            selector: `getByRole('${info.role}', { name: '${info.text}' })`,
            strategy: 'role',
            confidence: 0.95,
            element: await this.getElementInfo(locator),
          })
        } else if (count > 1) {
          matches.push({
            selector: `getByRole('${info.role}', { name: '${info.text}' })`,
            strategy: 'role',
            confidence: 0.5,
            element: await this.getElementInfo(locator.first()),
          })
        }
      } catch {
        // ignore
      }
    }

    if (info.text) {
      try {
        const locator = this.page.getByText(info.text)
        const count = await locator.count()
        if (count === 1) {
          matches.push({
            selector: `getByText('${info.text}')`,
            strategy: 'text',
            confidence: 0.85,
            element: await this.getElementInfo(locator),
          })
        }
      } catch {
        // ignore
      }

      try {
        const locator = this.page.getByRole('button', { name: info.text })
        const count = await locator.count()
        if (count === 1) {
          matches.push({
            selector: `getByRole('button', { name: '${info.text}' })`,
            strategy: 'role',
            confidence: 0.9,
            element: await this.getElementInfo(locator),
          })
        }
      } catch {
        // ignore
      }
    }

    if (info.ariaLabel) {
      try {
        const locator = this.page.getByLabel(info.ariaLabel)
        const count = await locator.count()
        if (count === 1) {
          matches.push({
            selector: `getByLabel('${info.ariaLabel}')`,
            strategy: 'label',
            confidence: 0.9,
            element: await this.getElementInfo(locator),
          })
        }
      } catch {
        // ignore
      }

      try {
        const locator = this.page.locator(`[aria-label="${info.ariaLabel}"]`)
        const count = await locator.count()
        if (count === 1) {
          matches.push({
            selector: `[aria-label="${info.ariaLabel}"]`,
            strategy: 'css',
            confidence: 0.85,
            element: await this.getElementInfo(locator),
          })
        }
      } catch {
        // ignore
      }
    }

    if (info.testId) {
      try {
        const locator = this.page.getByTestId(info.testId)
        const count = await locator.count()
        if (count === 1) {
          matches.push({
            selector: `getByTestId('${info.testId}')`,
            strategy: 'testid',
            confidence: 0.95,
            element: await this.getElementInfo(locator),
          })
        }
      } catch {
        // ignore
      }
    }

    if (info.placeholder) {
      try {
        const locator = this.page.getByPlaceholder(info.placeholder)
        const count = await locator.count()
        if (count === 1) {
          matches.push({
            selector: `getByPlaceholder('${info.placeholder}')`,
            strategy: 'placeholder',
            confidence: 0.85,
            element: await this.getElementInfo(locator),
          })
        }
      } catch {
        // ignore
      }
    }

    if (info.id) {
      try {
        const locator = this.page.locator(`#${info.id}`)
        const count = await locator.count()
        if (count === 1) {
          matches.push({
            selector: `#${info.id}`,
            strategy: 'css',
            confidence: 0.8,
            element: await this.getElementInfo(locator),
          })
        }
      } catch {
        // ignore
      }
    }

    return matches
  }

  private async getElementInfo(locator: any): Promise<SelectorMatch['element']> {
    try {
      const el = locator.first()
      return {
        tag: await el.evaluate((e: Element) => e.tagName.toLowerCase()),
        text: await el.textContent().catch(() => undefined)?.then(t => t?.trim().substring(0, 100)),
        role: await el.getAttribute('role').catch(() => undefined),
        ariaLabel: await el.getAttribute('aria-label').catch(() => undefined),
        testId: await el.getAttribute('data-testid').catch(() => undefined),
        placeholder: await el.getAttribute('placeholder').catch(() => undefined),
      }
    } catch {
      return { tag: 'unknown' }
    }
  }

  private buildSelector(match: SelectorMatch): string {
    switch (match.strategy) {
      case 'role':
        if (match.element.role && match.element.text) {
          return `getByRole('${match.element.role}', { name: '${match.element.text}' })`
        }
        return match.selector
      case 'text':
        return `getByText('${match.element.text}')`
      case 'label':
        return `getByLabel('${match.element.ariaLabel}')`
      case 'testid':
        return `getByTestId('${match.element.testId}')`
      case 'placeholder':
        return `getByPlaceholder('${match.element.placeholder}')`
      default:
        return match.selector
    }
  }

  async analyzePage(): Promise<{
    buttons: { text: string; selector: string }[]
    links: { text: string; selector: string }[]
    inputs: { label: string; type: string; selector: string }[]
    headings: { text: string; level: string; selector: string }[]
  }> {
    const buttons = await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(b => ({
        text: b.textContent?.trim().substring(0, 100) || '',
        ariaLabel: b.getAttribute('aria-label') || '',
        id: b.id || '',
      }))
    })

    const links = await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href]')).map(a => ({
        text: a.textContent?.trim().substring(0, 100) || '',
        ariaLabel: a.getAttribute('aria-label') || '',
        href: a.getAttribute('href') || '',
      }))
    })

    const inputs = await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll('input, select, textarea')).map(i => ({
        label: i.getAttribute('aria-label') || i.getAttribute('placeholder') || '',
        type: i.getAttribute('type') || i.tagName.toLowerCase(),
        id: i.id || '',
        name: i.getAttribute('name') || '',
      }))
    })

    const headings = await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
        text: h.textContent?.trim().substring(0, 100) || '',
        level: h.tagName.toLowerCase(),
      }))
    })

    return {
      buttons: buttons.filter(b => b.text).map(b => ({
        text: b.text,
        selector: b.ariaLabel
          ? `[aria-label="${b.ariaLabel}"]`
          : b.id
            ? `#${b.id}`
            : `button:has-text("${b.text}")`,
      })),
      links: links.filter(l => l.text).map(l => ({
        text: l.text,
        selector: l.ariaLabel
          ? `[aria-label="${l.ariaLabel}"]`
          : `a:has-text("${l.text}")`,
      })),
      inputs: inputs.filter(i => i.label).map(i => ({
        label: i.label,
        type: i.type,
        selector: i.id
          ? `#${i.id}`
          : `[aria-label="${i.label}"]`,
      })),
      headings: headings.filter(h => h.text).map(h => ({
        text: h.text,
        level: h.level,
        selector: `${h.level}:has-text("${h.text}")`,
      })),
    }
  }
}
