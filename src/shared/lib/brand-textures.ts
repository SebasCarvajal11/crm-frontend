import { useEffect, useState } from 'react'

export const BRAND_TEXTURES = {
  app: '/backgrounds/app-texture.webp',
  sidebar: '/backgrounds/sidebar-texture.webp',
} as const

export type BrandTextureKey = keyof typeof BRAND_TEXTURES

/**
 * Hook que detecta de manera sincrónica si la textura ya se encuentra decodificada
 * en la memoria caché del navegador (memory-cache / disk-cache).
 * Evita cualquier retraso si ya está en caché, y provee estado de carga para fade-in suave.
 */
export function useTextureLoaded(src: string): boolean {
  const [loaded, setLoaded] = useState(() => {
    if (typeof window === 'undefined') return false
    const img = new Image()
    img.src = src
    return img.complete
  })

  useEffect(() => {
    if (loaded) return

    let active = true
    const img = new Image()
    img.src = src

    const onComplete = () => {
      if (active) setLoaded(true)
    }

    if (typeof img.decode === 'function') {
      img.decode().then(onComplete).catch(onComplete)
    } else {
      img.onload = onComplete
      img.onerror = onComplete
    }

    return () => {
      active = false
    }
  }, [src, loaded])

  return loaded
}
