import fs from 'fs'
import path from 'path'

const FRONTEND_DEFAULT_URL = 'http://localhost:5173'
const GATEWAY_DEFAULT_URL = 'http://localhost:18080'

type EnvFile = Record<string, string>

function parseEnvFile(filePath: string): EnvFile {
  if (!fs.existsSync(filePath)) return {}

  const values: EnvFile = {}
  const content = fs.readFileSync(filePath, 'utf8')

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const separatorIndex = line.indexOf('=')
    if (separatorIndex < 1) continue

    const key = line.slice(0, separatorIndex).trim()
    const rawValue = line.slice(separatorIndex + 1).trim()
    values[key] = rawValue.replace(/^['"]|['"]$/g, '')
  }

  return values
}

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, '')
}

const frontendEnv = parseEnvFile(path.resolve(process.cwd(), '.env'))
const infraEnv = parseEnvFile(path.resolve(process.cwd(), '../crm-infra/.env.docker'))

export function getFrontendUrl(): string {
  return normalizeUrl(
    process.env.E2E_FRONTEND_URL ||
      process.env.FRONTEND_URL ||
      frontendEnv.FRONTEND_URL ||
      frontendEnv.VITE_FRONTEND_URL ||
      FRONTEND_DEFAULT_URL
  )
}

export function getGatewayUrl(): string {
  if (process.env.E2E_GATEWAY_URL) return normalizeUrl(process.env.E2E_GATEWAY_URL)
  if (process.env.GATEWAY_URL) return normalizeUrl(process.env.GATEWAY_URL)
  if (process.env.BASE_URL) return normalizeUrl(process.env.BASE_URL)
  if (frontendEnv.VITE_API_PROXY_TARGET) return normalizeUrl(frontendEnv.VITE_API_PROXY_TARGET)

  const gatewayHostPort = infraEnv.GATEWAY_HOST_PORT
  if (gatewayHostPort) {
    return normalizeUrl(`http://localhost:${gatewayHostPort}`)
  }

  return GATEWAY_DEFAULT_URL
}
