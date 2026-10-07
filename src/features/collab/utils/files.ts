import { getProjectFileAccessRequest } from '@/features/collab/api/collab-api.files'
import { formatBytes, parseApiError, triggerBlobDownload } from '@/shared/lib'

export const formatFileSize = formatBytes

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
  try {
    const accessRes = await getProjectFileAccessRequest(accessToken, fileId, false)
    const { blob } = await fetchBlobWithProgress(accessRes.data.url, onProgress)
    triggerBlobDownload(blob, fileName)
  } catch (error) {
    const message = await parseApiError(error)
    throw new Error(message, { cause: error })
  }
}

export async function previewGatewayFile(
  accessToken: string,
  fileId: string,
  fileName: string,
  onProgress?: (percent: number) => void
): Promise<{ blob: Blob; objectUrl: string; mime: string; fileName: string }> {
  try {
    const accessRes = await getProjectFileAccessRequest(accessToken, fileId, true)
    const { blob, mime } = await fetchBlobWithProgress(accessRes.data.url, onProgress)
    return {
      blob,
      objectUrl: URL.createObjectURL(blob),
      mime: blob.type || mime || 'application/octet-stream',
      fileName,
    }
  } catch (error) {
    const message = await parseApiError(error)
    throw new Error(message, { cause: error })
  }
}
