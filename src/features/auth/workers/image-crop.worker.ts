/**
 * Web Worker para procesamiento de imagen (recorte) fuera del hilo principal.
 * Evita que el navegador se congele al procesar imagenes de alta resolucion.
 *
 * Recibe el ArrayBuffer de la imagen directamente (transferable) para evitar
 * que el worker tenga que hacer fetch() de una blob URL, lo cual es bloqueado
 * por la CSP (connect-src no incluye blob:).
 */

type CropArea = { x: number; y: number; width: number; height: number }

type WorkerInput = {
  buffer: ArrayBuffer
  mimeType: string
  pixelCrop: CropArea
}

type WorkerOutput =
  | { ok: true; blob: Blob }
  | { ok: false; error: string }

self.onmessage = async (e: MessageEvent<WorkerInput>) => {
  const { buffer, mimeType, pixelCrop } = e.data

  try {
    const imageBlob = new Blob([buffer], { type: mimeType })
    const bitmap = await createImageBitmap(imageBlob)

    const offscreen = new OffscreenCanvas(pixelCrop.width, pixelCrop.height)
    const ctx = offscreen.getContext('2d')
    if (!ctx) {
      self.postMessage({ ok: false, error: 'No se pudo crear contexto 2D en worker' } satisfies WorkerOutput)
      return
    }

    ctx.drawImage(
      bitmap,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    )

    bitmap.close()

    const blob = await offscreen.convertToBlob({ type: 'image/jpeg', quality: 0.95 })
    self.postMessage({ ok: true, blob } satisfies WorkerOutput)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido en worker de recorte'
    self.postMessage({ ok: false, error: message } satisfies WorkerOutput)
  }
}
