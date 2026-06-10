import type { Page, ConsoleMessage, Request } from '@playwright/test'
import fs from 'fs'
import path from 'path'

export interface ConsoleEntry {
  timestamp: string
  type: 'log' | 'info' | 'warn' | 'error' | 'warning' | 'pageerror' | 'request-failed' | 'debug'
  text: string
  location?: string
  url?: string
  method?: string
  statusCode?: number
}

export interface FailureAnalysis {
  type: 'UI_CHANGE' | 'API_ERROR' | 'NETWORK_ERROR' | 'AUTH_ERROR' | 'DATA_ERROR' | 'TIMEOUT' | 'UNKNOWN'
  message: string
  suggestion: string
}

export class ConsoleLogger {
  private entries: ConsoleEntry[] = []
  private testName: string
  private logsDir: string
  private startTime: number

  constructor(testName: string) {
    this.testName = testName
    this.startTime = Date.now()
    this.logsDir = path.resolve(process.cwd(), 'test-results/console-logs')
    fs.mkdirSync(this.logsDir, { recursive: true })
  }

  attachToPage(page: Page): void {
    page.on('console', (msg: ConsoleMessage) => {
      this.entries.push({
        timestamp: new Date().toISOString(),
        type: msg.type() as ConsoleEntry['type'],
        text: msg.text(),
        location: msg.location()
          ? `${msg.location().url}:${msg.location().lineNumber}:${msg.location().columnNumber}`
          : undefined,
      })
    })

    page.on('pageerror', (error: Error) => {
      this.entries.push({
        timestamp: new Date().toISOString(),
        type: 'pageerror',
        text: error.message,
        location: error.stack,
      })
    })

    page.on('requestfailed', (request: Request) => {
      this.entries.push({
        timestamp: new Date().toISOString(),
        type: 'request-failed',
        text: `${request.method()} ${request.url()} — ${request.failure()?.errorText || 'unknown'}`,
        url: request.url(),
        method: request.method(),
      })
    })
  }

  getErrors(): ConsoleEntry[] {
    return this.entries.filter(
      (e) => e.type === 'error' || e.type === 'pageerror' || e.type === 'request-failed'
    )
  }

  getWarnings(): ConsoleEntry[] {
    return this.entries.filter((e) => e.type === 'warning' || e.type === 'warn')
  }

  getAll(): ConsoleEntry[] {
    return [...this.entries]
  }

  getSummary() {
    return {
      total: this.entries.length,
      errors: this.getErrors().length,
      warnings: this.getWarnings().length,
      duration: Date.now() - this.startTime,
    }
  }

  analyzeFailure(error?: Error): FailureAnalysis {
    const errorMsg = error?.message?.toLowerCase() || ''
    const stderr = this.getErrors()
      .map((e) => e.text.toLowerCase())
      .join(' ')

    if (
      stderr.includes('net::err_connection_refused') ||
      stderr.includes('econnrefused')
    ) {
      return {
        type: 'NETWORK_ERROR',
        message: 'Conexión rechazada por el servidor',
        suggestion: 'Verificar que el gateway y los servicios estén corriendo en los puertos correctos',
      }
    }

    if (
      stderr.includes('401') ||
      stderr.includes('unauthorized') ||
      errorMsg.includes('401')
    ) {
      return {
        type: 'AUTH_ERROR',
        message: 'Error de autenticación',
        suggestion: 'Verificar credenciales y que el token JWT sea válido',
      }
    }

    if (
      stderr.includes('403') ||
      stderr.includes('forbidden') ||
      errorMsg.includes('403')
    ) {
      return {
        type: 'AUTH_ERROR',
        message: 'Error de autorización',
        suggestion: 'Verificar que el rol del usuario tenga permisos para esta operación',
      }
    }

    if (
      stderr.includes('500') ||
      stderr.includes('internal server error')
    ) {
      return {
        type: 'API_ERROR',
        message: 'Error interno del servidor',
        suggestion: 'Revisar logs del backend para identificar el error',
      }
    }

    if (
      errorMsg.includes('timeout') ||
      errorMsg.includes('exceeded') ||
      stderr.includes('timeout')
    ) {
      return {
        type: 'TIMEOUT',
        message: 'Operación excedió el tiempo límite',
        suggestion: 'Aumentar timeout o verificar performance del servicio',
      }
    }

    if (
      errorMsg.includes('locator') ||
      errorMsg.includes('selector') ||
      errorMsg.includes('not found') ||
      errorMsg.includes('not visible')
    ) {
      return {
        type: 'UI_CHANGE',
        message: 'Elemento UI no encontrado',
        suggestion: 'El selector del elemento cambió. Verificar el componente actual.',
      }
    }

    return {
      type: 'UNKNOWN',
      message: error?.message || 'Error no clasificado',
      suggestion: 'Revisar logs detallados para diagnóstico',
    }
  }

  async persist(failed: boolean, error?: Error): Promise<string | null> {
    if (!failed && this.getErrors().length === 0) return null

    const safeName = this.testName.replace(/[^a-zA-Z0-9_-]/g, '_')
    const filename = `logs_fallo_${safeName}.json`
    const filepath = path.join(this.logsDir, filename)

    const analysis = error ? this.analyzeFailure(error) : undefined

    const report = {
      testName: this.testName,
      timestamp: new Date().toISOString(),
      summary: this.getSummary(),
      analysis,
      errors: this.getErrors(),
      warnings: this.getWarnings(),
      allEntries: this.entries,
    }

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2), 'utf-8')
    return filepath
  }
}
