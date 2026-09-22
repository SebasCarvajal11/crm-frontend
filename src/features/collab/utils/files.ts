import { getProjectFileAccessRequest } from '@/features/collab/api/collab-api.files'

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

import { triggerBlobDownload } from '@/shared/lib'
export { triggerBlobDownload }

async function fetchBlobWithProgress(
  url: string,
  onProgress?: (percent: number) => void
): Promise<{ blob: Blob; mime: string }> {
  const res = await fetch(url, { method: 'GET' })
  if (!res.ok) {
    throw new Error(`Error al transferir el archivo (${res.status})`)
  }

  const contentLengthHeader = res.headers.get('content-length')
  const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0
  const mime = res.headers.get('content-type') || 'application/octet-stream'

  if (!res.body) {
    const blob = await res.blob()
    onProgress?.(100)
    return { blob, mime }
  }

  const reader = res.body.getReader()
  const chunks: BlobPart[] = []
  let loadedBytes = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) {
      chunks.push(value)
      loadedBytes += value.length
      if (totalBytes > 0 && onProgress) {
        const percent = Math.min(99, Math.round((loadedBytes / totalBytes) * 100))
        onProgress(percent)
      }
    }
  }

  onProgress?.(100)
  const blob = new Blob(chunks, { type: mime })
  return { blob, mime }
}

export async function downloadGatewayFile(
  accessToken: string,
  fileId: string,
  fileName: string,
  onProgress?: (percent: number) => void
) {
  const accessRes = await getProjectFileAccessRequest(accessToken, fileId, false)
  const { blob } = await fetchBlobWithProgress(accessRes.data.url, onProgress)
  triggerBlobDownload(blob, fileName)
}

export async function previewGatewayFile(
  accessToken: string,
  fileId: string,
  fileName: string,
  onProgress?: (percent: number) => void
): Promise<{ blob: Blob; objectUrl: string; mime: string; fileName: string }> {
  const accessRes = await getProjectFileAccessRequest(accessToken, fileId, true)
  const { blob, mime } = await fetchBlobWithProgress(accessRes.data.url, onProgress)
  return {
    blob,
    objectUrl: URL.createObjectURL(blob),
    mime: blob.type || mime || 'application/octet-stream',
    fileName,
  }
}
