import type { FullConfig } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getFrontendUrl, getGatewayUrl } from './helpers/e2e-env'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const GATEWAY_URL = getGatewayUrl()
const FRONTEND_URL = getFrontendUrl()
const HEALTH_TIMEOUT = 30_000
const HEALTH_INTERVAL = 2_000

async function waitForService(
  name: string,
  url: string,
  timeout: number = HEALTH_TIMEOUT
): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5_000) })
      if (res.ok) {
        console.log(`  [OK] ${name} respondiendo en ${url}`)
        return true
      }
    } catch {
      // servicio no disponible aun
    }
    await new Promise((r) => setTimeout(r, HEALTH_INTERVAL))
  }
  console.error(`  [FAIL] ${name} no responde en ${url} tras ${timeout}ms`)
  return false
}

async function ensureDirectories() {
  const dirs = [
    path.resolve(__dirname, '../test-results'),
    path.resolve(__dirname, '../test-results/console-logs'),
    path.resolve(__dirname, 'reports'),
    path.resolve(__dirname, 'reports/html'),
  ]
  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export default async function globalSetup(_config: FullConfig) {
  console.log('\n🔍 Verificando disponibilidad de servicios...\n')

  await ensureDirectories()

  const services = [
    { name: 'Gateway (KrakenD)', url: `${GATEWAY_URL}/api/v1/health` },
    { name: 'Frontend', url: `${FRONTEND_URL}/` },
  ]

  const results = await Promise.all(
    services.map((s) => waitForService(s.name, s.url))
  )

  const allReady = results.every(Boolean)

  if (!allReady) {
    console.error(
      '\n⚠️  Algunos servicios no están disponibles. ' +
      'Asegúrate de ejecutar "docker compose up" antes de los tests.\n'
    )
    throw new Error('Servicios no disponibles para E2E tests')
  }

  console.log('\n✅ Todos los servicios están listos. Iniciando tests...\n')
}
