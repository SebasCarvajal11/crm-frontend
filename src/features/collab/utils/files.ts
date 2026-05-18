import { downloadProjectFileBlobRequest } from '@/features/collab/api/collab-api.projects'

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function triggerBlobDownload(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(objectUrl)
}

export async function downloadGatewayFile(accessToken: string, fileId: string, fileName: string) {
  const blob = await downloadProjectFileBlobRequest(accessToken, fileId, false)
  triggerBlobDownload(blob, fileName)
}

export async function previewGatewayFile(
  accessToken: string,
  fileId: string,
  fileName: string
): Promise<{ blob: Blob; objectUrl: string; mime: string; fileName: string }> {
  const blob = await downloadProjectFileBlobRequest(accessToken, fileId, true)
  return {
    blob,
    objectUrl: URL.createObjectURL(blob),
    mime: blob.type || 'application/octet-stream',
    fileName,
  }
}
