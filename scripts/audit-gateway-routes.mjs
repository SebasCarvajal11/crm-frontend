import { readFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const srcDir = path.join(root, 'src')
const allowedLiteralFetchFiles = new Set([
  'src/features/auth/workers/image-crop.worker.ts',
])

const httpCallWithLiteralRoute =
  /\b(?:api\.(?:get|post|put|patch|delete|head)|fetch)\(\s*(['"`])((?:\\.|(?!\1).)+)\1/g

function walk(dir) {
  const files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walk(full))
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(full)
    }
  }
  return files
}

// 1. Validar llamadas HTTP con literales directamente en código
const violations = []

for (const file of walk(srcDir)) {
  const rel = path.relative(root, file).replaceAll(path.sep, '/')
  if (rel === 'src/shared/lib/gateway-routes.ts') continue
  if (allowedLiteralFetchFiles.has(rel)) continue

  const source = readFileSync(file, 'utf8')
  for (const match of source.matchAll(httpCallWithLiteralRoute)) {
    const route = match[2]
    if (route.includes('${')) continue
    if (/^(https?:)?\/\//.test(route)) continue
    if (route.startsWith('blob:') || route.startsWith('data:')) continue

    violations.push({
      file: rel,
      route,
      index: match.index,
    })
  }
}

if (violations.length > 0) {
  console.error(
    'Error: Rutas HTTP literales detectadas. Usa constantes desde src/shared/lib/gateway-routes.ts.',
  )
  for (const violation of violations) {
    console.error(`- ${violation.file}: ${violation.route}`)
  }
  process.exit(1)
}

console.log('✓ OK: Todas las llamadas HTTP usan el contrato central de gateway.')

// 2. Validar que las rutas en gateway-routes.ts existan en los manifiestos de los microservicios
const manifests = [
  '../crm-auth/gateway/gateway.manifest.json',
  '../crm-collab/gateway/gateway.manifest.json',
  '../crm-media/gateway/gateway.manifest.json',
]

const manifestEndpoints = new Set()

for (const relPath of manifests) {
  const absPath = path.resolve(root, relPath)
  if (!existsSync(absPath)) {
    console.error(`Error: No se encontró el manifiesto en ${absPath}`)
    process.exit(1)
  }

  try {
    const content = JSON.parse(readFileSync(absPath, 'utf8'))
    if (content.endpoints && Array.isArray(content.endpoints)) {
      for (const ep of content.endpoints) {
        if (ep.endpoint) {
          manifestEndpoints.add(ep.endpoint)
        }
      }
    }
  } catch (err) {
    console.error(`Error al procesar el manifiesto ${absPath}:`, err.message)
    process.exit(1)
  }
}

const gatewayRoutesFile = path.join(root, 'src/shared/lib/gateway-routes.ts')
if (!existsSync(gatewayRoutesFile)) {
  console.error(`Error: No se encontró el archivo de rutas en ${gatewayRoutesFile}`)
  process.exit(1)
}

const routesSource = readFileSync(gatewayRoutesFile, 'utf8')
const routeDefRegex = /\b([a-zA-Z0-9_]+)\s*:\s*(?:\([^)]*\)\s*=>\s*)?(?:`([^`]+)`|'([^']+)'|"([^"]+)")/g

const routeViolations = []
const whitelist = new Set(['/openapi.yaml', '/docs'])

for (const match of routesSource.matchAll(routeDefRegex)) {
  const name = match[1]
  const rawValue = match[2] || match[3] || match[4]

  // Ignorar constantes base de versionado u otras intermedias que no empiezan con / o $
  if (!rawValue.startsWith('/') && !rawValue.startsWith('$')) {
    continue
  }

  // Normalizar el path
  let route = rawValue
  route = route.replaceAll('${AUTH_API}', '/api/v1')
  route = route.replaceAll('${COLLAB_API}', '/api/v1')
  route = route.replaceAll('${MEDIA_API}', '/api/v1')
  route = route.replaceAll('${AUTH_VERSION}', 'v1')
  route = route.replaceAll('${COLLAB_VERSION}', 'v1')
  route = route.replaceAll('${MEDIA_VERSION}', 'v1')

  // Reemplazar ${encodeURIComponent(param)} o ${param} por {param}
  route = route.replace(/\$\{\s*encodeURIComponent\(\s*([a-zA-Z0-9_]+)\s*\)\s*\}/g, '{$1}')
  route = route.replace(/\$\{\s*([a-zA-Z0-9_]+)\s*\}/g, '{$1}')

  if (!manifestEndpoints.has(route) && !whitelist.has(route)) {
    routeViolations.push({
      name,
      raw: rawValue,
      normalized: route,
    })
  }
}

if (routeViolations.length > 0) {
  console.error('Error: Rutas en gateway-routes.ts no declaradas en los manifiestos del gateway:')
  for (const v of routeViolations) {
    console.error(`- Campo: "${v.name}" | Valor raw: "${v.raw}" | Normalizado esperado: "${v.normalized}"`)
  }
  process.exit(1)
}

console.log('✓ OK: Todas las rutas de gateway-routes.ts coinciden con los manifiestos del gateway.')
process.exit(0)
