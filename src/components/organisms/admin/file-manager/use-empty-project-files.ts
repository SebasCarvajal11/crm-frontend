import { useState, useCallback } from 'react'
import {
  exportProjectFilesAsZip,
  type ExportProgress,
} from '@/features/admin/services/storage-zip-exporter.service'
import type { StorageFileItem } from '@/features/admin/api/admin-storage-explorer.api'

interface UseEmptyProjectFilesParams {
  accessToken?: string
  clientName: string
  projectName: string
  files: StorageFileItem[]
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function useEmptyProjectFiles({
  accessToken,
  clientName,
  projectName,
  files,
  onClose,
  onConfirm,
}: UseEmptyProjectFilesParams) {
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressStep, setProgressStep] = useState('')

  const executePurge = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)
    setProgress(20)
    setProgressStep('Preparando depuración segura...')
    let current = 20
    const interval = setInterval(() => {
      current = Math.min(current + 15, 92)
      setProgress(current)
      if (current >= 45 && current < 75) {
        setProgressStep('Eliminando archivos binarios en la nube...')
      } else if (current >= 75) {
        setProgressStep('Liberando cuota y registrando auditoría...')
      }
    }, 280)

    try {
      await onConfirm()
      clearInterval(interval)
      setProgress(100)
      setProgressStep('¡Vaciado completado con éxito!')
      setTimeout(() => {
        setLoading(false)
        onClose()
      }, 400)
    } catch (err) {
      clearInterval(interval)
      const msg = err instanceof Error ? err.message : 'Error al vaciar los archivos del proyecto'
      setErrorMessage(msg)
      setLoading(false)
    }
  }, [onConfirm, onClose])

  const handleDownloadOnly = useCallback(async () => {
    if (!accessToken || files.length === 0) return
    setLoading(true)
    setErrorMessage(null)
    try {
      await exportProjectFilesAsZip({
        accessToken,
        clientName,
        projectName,
        files,
        onProgress: (p: ExportProgress) => {
          setProgress(p.percent)
          setProgressStep(
            p.stage === 'compressing'
              ? 'Comprimiendo paquete ZIP...'
              : `Descargando archivo ${p.completedFiles + 1}/${p.totalFiles}...`,
          )
        },
      })
      setProgress(100)
      setProgressStep('¡Respaldo descargado!')
      setTimeout(() => setLoading(false), 500)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al generar respaldo')
      setLoading(false)
    }
  }, [accessToken, clientName, projectName, files])

  const handleDownloadAndPurge = useCallback(async () => {
    if (!accessToken || files.length === 0) {
      await executePurge()
      return
    }
    setLoading(true)
    setErrorMessage(null)
    try {
      await exportProjectFilesAsZip({
        accessToken,
        clientName,
        projectName,
        files,
        onProgress: (p: ExportProgress) => {
          setProgress(Math.round(p.percent * 0.6))
          setProgressStep(
            p.stage === 'compressing'
              ? 'Comprimiendo respaldo...'
              : `Descargando copia ${p.completedFiles + 1}/${p.totalFiles}...`,
          )
        },
      })
      await executePurge()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error en la operación')
      setLoading(false)
    }
  }, [accessToken, clientName, projectName, files, executePurge])

  const canDownload = Boolean(accessToken && files.some((f) => !f.isPurged))

  return {
    loading,
    errorMessage,
    progress,
    progressStep,
    canDownload,
    executePurge,
    handleDownloadOnly,
    handleDownloadAndPurge,
  }
}
