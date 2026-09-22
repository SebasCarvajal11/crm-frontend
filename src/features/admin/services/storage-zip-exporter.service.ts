import JSZip from 'jszip'
import {
  getStorageFileAccess,
  type StorageFileItem,
} from '@/features/admin/api/admin-storage-explorer.api'
import { triggerBlobDownload } from '@/shared/lib'
import { getFolderLabel } from '@/components/organisms/admin/file-manager/file-manager.constants'

export type ExportProgressStage = 'fetching' | 'compressing' | 'complete' | 'error'

export interface ExportProgress {
  stage: ExportProgressStage
  percent: number
  currentFileName?: string
  completedFiles: number
  totalFiles: number
}

export interface ExportZipParams {
  accessToken: string
  clientName: string
  projectName: string
  files: StorageFileItem[]
  archiveName?: string
  onProgress?: (progress: ExportProgress) => void
}

export interface BatchItemToDownload {
  file: StorageFileItem
  relativePath: string
}

export function sanitizePathSegment(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '_').trim() || 'archivo'
}

export function buildManifestContent(
  clientName: string,
  projectName: string,
  files: StorageFileItem[]
): string {
  const activeFiles = files.filter((f) => !f.isPurged)
  const purgedFiles = files.filter((f) => f.isPurged)
  const totalActiveBytes = activeFiles.reduce((acc, f) => acc + f.sizeBytes, 0)

  return JSON.stringify(
    {
      sistema: 'CIMA CRM - Gestor de Almacenamiento',
      version: '1.0.0',
      fechaExportacion: new Date().toISOString(),
      cliente: clientName,
      proyecto: projectName,
      resumen: {
        totalArchivosEmpaquetados: activeFiles.length,
        pesoTotalBytes: totalActiveBytes,
        totalArchivosPurgadosHistoricos: purgedFiles.length,
      },
      archivos: activeFiles.map((f) => ({
        id: f.id,
        nombre: f.fileName,
        carpeta: getFolderLabel(f.folder),
        tamanoBytes: f.sizeBytes,
        esContratoFirmado: f.isSignedContract,
        fechaCreacion: f.createdAt,
      })),
      archivosPreviamenteLiberados: purgedFiles.map((f) => ({
        id: f.id,
        nombre: f.fileName,
        carpeta: getFolderLabel(f.folder),
        tamanoBytes: f.sizeBytes,
      })),
    },
    null,
    2
  )
}

async function fetchFileBlob(accessToken: string, fileId: string): Promise<Blob> {
  const accessRes = await getStorageFileAccess(accessToken, fileId)
  const res = await fetch(accessRes.url)
  if (!res.ok) {
    throw new Error(`Error al transferir archivo (${res.status})`)
  }
  return res.blob()
}


async function fetchWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let currentIndex = 0

  const worker = async () => {
    while (currentIndex < items.length) {
      const idx = currentIndex++
      results[idx] = await fn(items[idx], idx)
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker())
  await Promise.all(workers)
  return results
}

async function populateZipFiles(
  zip: JSZip,
  accessToken: string,
  items: BatchItemToDownload[],
  onProgress?: (progress: ExportProgress) => void
): Promise<void> {
  let completed = 0

  await fetchWithConcurrency(items, 3, async (item) => {
    onProgress?.({
      stage: 'fetching',
      percent: Math.round((completed / items.length) * 80),
      currentFileName: item.file.fileName,
      completedFiles: completed,
      totalFiles: items.length,
    })

    const blob = await fetchFileBlob(accessToken, item.file.id)
    zip.file(item.relativePath, blob)
    completed++

    onProgress?.({
      stage: 'fetching',
      percent: Math.round((completed / items.length) * 80),
      currentFileName: item.file.fileName,
      completedFiles: completed,
      totalFiles: items.length,
    })
  })
}

async function compressAndDownloadZip(
  zip: JSZip,
  fileName: string,
  totalFiles: number,
  onProgress?: (progress: ExportProgress) => void
): Promise<Blob> {
  onProgress?.({
    stage: 'compressing',
    percent: 85,
    completedFiles: totalFiles,
    totalFiles,
  })

  const zipBlob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (metadata) => {
      const compressPercent = 85 + Math.round((metadata.percent / 100) * 14)
      onProgress?.({
        stage: 'compressing',
        percent: compressPercent,
        completedFiles: totalFiles,
        totalFiles,
      })
    }
  )

  triggerBlobDownload(zipBlob, fileName)

  onProgress?.({
    stage: 'complete',
    percent: 100,
    completedFiles: totalFiles,
    totalFiles,
  })

  return zipBlob
}

export async function exportProjectFilesAsZip({
  accessToken,
  clientName,
  projectName,
  files,
  archiveName,
  onProgress,
}: ExportZipParams): Promise<Blob> {
  const activeFiles = files.filter((f) => !f.isPurged)
  if (activeFiles.length === 0) {
    throw new Error('No hay archivos activos para descargar en este proyecto.')
  }

  const zip = new JSZip()
  const manifest = buildManifestContent(clientName, projectName, files)
  zip.file('MANIFEST_RESPALDO.json', manifest)

  const items: BatchItemToDownload[] = activeFiles.map((f) => ({
    file: f,
    relativePath: `${sanitizePathSegment(getFolderLabel(f.folder))}/${sanitizePathSegment(f.fileName)}`,
  }))

  await populateZipFiles(zip, accessToken, items, onProgress)

  const rawName = archiveName || `${projectName || 'Proyecto'}_respaldo.zip`
  const safeName = sanitizePathSegment(rawName)
  const finalName = safeName.endsWith('.zip') ? safeName : `${safeName}.zip`

  return compressAndDownloadZip(zip, finalName, items.length, onProgress)
}
