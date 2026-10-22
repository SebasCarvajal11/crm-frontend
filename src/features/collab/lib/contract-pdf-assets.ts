import appTextureUrl from '@/assets/backgrounds/app-texture.jpg'
import cimaEmblemUrl from '@/assets/brand/cima-emblem.png'

export type BrandPdfAssets = {
  textureBytes: Uint8Array | null
  logoBytes: Uint8Array | null
}

async function fetchBytesSafely(url: string): Promise<Uint8Array | null> {
  try {
    if (typeof window === 'undefined') {
      const fs = await import(/* @vite-ignore */ 'node:fs')
      const path = await import(/* @vite-ignore */ 'node:path')
      const candidatePaths = [
        path.resolve(process.cwd(), 'src/assets/backgrounds/app-texture.jpg'),
        path.resolve(process.cwd(), 'crm-frontend/src/assets/backgrounds/app-texture.jpg'),
        path.resolve(process.cwd(), 'src/assets/brand/cima-emblem.png'),
        path.resolve(process.cwd(), 'crm-frontend/src/assets/brand/cima-emblem.png'),
      ]
      for (const p of candidatePaths) {
        if (url.includes('texture') && p.includes('texture') && fs.existsSync(p)) {
          return new Uint8Array(fs.readFileSync(p))
        }
        if (url.includes('emblem') && p.includes('emblem') && fs.existsSync(p)) {
          return new Uint8Array(fs.readFileSync(p))
        }
      }
      return null
    }

    const response = await fetch(url)
    if (!response.ok) return null
    const buffer = await response.arrayBuffer()
    return new Uint8Array(buffer)
  } catch {
    return null
  }
}

export async function loadBrandPdfAssets(): Promise<BrandPdfAssets> {
  const [textureBytes, logoBytes] = await Promise.all([
    fetchBytesSafely(appTextureUrl),
    fetchBytesSafely(cimaEmblemUrl),
  ])

  return { textureBytes, logoBytes }
}
