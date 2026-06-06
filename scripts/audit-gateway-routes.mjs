import { readFileSync, readdirSync } from 'node:fs'
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
    'Rutas HTTP literales detectadas. Usa constantes desde src/shared/lib/gateway-routes.ts.',
  )
  for (const violation of violations) {
    console.error(`- ${violation.file}: ${violation.route}`)
  }
  process.exit(1)
}

console.log('OK: las llamadas HTTP usan el contrato central de gateway')
