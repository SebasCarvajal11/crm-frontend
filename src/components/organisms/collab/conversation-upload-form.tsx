import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, FileText, FileUp, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { uploadProjectFileWithMetadataRequest } from '@/features/collab/api'
import { collabKeys } from '@/features/collab/model'
import type { DataResponse, ProjectFileEnriched, ProjectTimelineItem } from '@/features/collab/model'
import { isBlockedByExtension, SAFE_FILE_ACCEPT } from '@/shared/lib'
import { cn } from '@/shared/lib/utils'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type Props = {
  accessToken: string
  projectId: string
  onError: (msg: string) => void
}

const MAX_FILE_BYTES = 25 * 1024 * 1024

export function ConversationUploadForm({ accessToken, projectId, onError }: Props) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [clientVisible, setClientVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const resetSelectedFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0] ?? null
    if (!file) return
    if (isBlockedByExtension(file.name)) {
      onError('Tipo de archivo bloqueado por seguridad')
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      onError('El archivo supera el limite de 25 MB')
      return
    }
    setSelectedFile(file)
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''))
    }
  }

  const upload = useMutation({
    mutationFn: () => {
      if (!selectedFile) throw new Error('Debes seleccionar un archivo')
      if (isBlockedByExtension(selectedFile.name)) throw new Error('Tipo de archivo bloqueado por seguridad')
      if (selectedFile.size > MAX_FILE_BYTES) throw new Error('El archivo supera el limite de 25 MB')
      setIsSuccess(false)
      setProgress(0)
      return uploadProjectFileWithMetadataRequest(
        accessToken,
        projectId,
        selectedFile,
        {
          fileName: selectedFile.name,
          title: title.trim(),
          description: description.trim() || null,
          mimeType: selectedFile.type || 'application/octet-stream',
          sizeBytes: selectedFile.size,
          isClientVisible: clientVisible,
          origin: 'manual_upload',
        },
        (pct) => setProgress(pct),
      )
    },
    onSuccess: (response: DataResponse<ProjectFileEnriched>) => {
      const file = response.data
      queryClient.setQueryData<DataResponse<ProjectTimelineItem[]>>(collabKeys.timeline(projectId), (current) => {
        const nextItem: ProjectTimelineItem = {
          id: file.id,
          kind: 'file',
          label: 'Archivo',
          title: file.title ?? file.fileName,
          occurredAt: file.createdAt,
          fileId: file.id,
          fileName: file.fileName,
          mimeType: file.mimeType,
          taskId: file.taskId,
          changeRequestId: null,
          createdBySub: file.createdBySub,
          createdByEmail: file.createdByEmail,
          isClientVisible: file.isClientVisible,
        }
        const items = current?.data ?? []
        const deduped = [nextItem, ...items.filter((item) => item.id !== nextItem.id || item.kind !== nextItem.kind)]
        return { data: deduped }
      })
      setIsSuccess(true)
      setProgress(100)
      setTitle('')
      setDescription('')
      resetSelectedFile()
      void queryClient.invalidateQueries({ queryKey: collabKeys.timeline(projectId) })
      void queryClient.invalidateQueries({ queryKey: collabKeys.files(projectId) })
      setTimeout(() => setIsSuccess(false), 4000)
    },
    onError: (e) => onError(e instanceof Error ? e.message : 'No se pudo subir el archivo'),
  })

  return (
    <div className="rounded-lg border p-3 space-y-3 bg-muted/20">
      <div className="space-y-1">
        <Label htmlFor="conv-file-title">Titulo</Label>
        <Input
          id="conv-file-title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (isSuccess) setIsSuccess(false)
          }}
          placeholder="Ej: Brief v2 aprobado"
        />
      </div>
      <Textarea
        value={description}
        onChange={(e) => {
          setDescription(e.target.value)
          if (isSuccess) setIsSuccess(false)
        }}
        placeholder="Descripcion opcional del archivo"
      />
      <div className="space-y-1.5">
        <input
          ref={fileInputRef}
          type="file"
          accept={SAFE_FILE_ACCEPT}
          className="hidden"
          onChange={(e) => {
            if (isSuccess) setIsSuccess(false)
            upload.reset()
            const file = e.target.files?.[0] ?? null
            if (file && isBlockedByExtension(file.name)) {
              onError('Tipo de archivo bloqueado por seguridad')
              resetSelectedFile()
              return
            }
            setSelectedFile(file)
            if (file && !title) {
              setTitle(file.name.replace(/\.[^/.]+$/, ''))
            }
          }}
        />

        {!selectedFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 text-center select-none',
              isDragging
                ? 'border-primary bg-primary/10 scale-[1.01]'
                : 'border-border/80 hover:border-primary/50 hover:bg-muted/40 bg-background/50',
            )}
            role="button"
            tabIndex={0}
            aria-label="Subir archivo: arrastra o haz clic aquí"
          >
            <FileUp className="size-6 text-muted-foreground/80 mb-1.5" />
            <p className="text-xs font-medium text-foreground">
              Arrastra un archivo aquí o <span className="text-primary underline">explora</span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Máximo 25 MB (PDF, imágenes, docs)</p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2.5 rounded-lg border bg-background shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex size-7 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                <FileText className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-xs text-foreground truncate max-w-[200px]" title={selectedFile.name}>
                  {selectedFile.name}
                </p>
                <p className="text-[10px] text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={resetSelectedFile}
              aria-label="Quitar archivo seleccionado"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Checkbox checked={clientVisible} onCheckedChange={(v) => setClientVisible(v === true)} />
          Visible para cliente
        </label>
      </div>

      {upload.isPending && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Subiendo archivo al almacenamiento...</span>
            <span className="font-semibold text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {isSuccess && (
        <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>¡Archivo subido y registrado con éxito!</span>
        </div>
      )}

      {upload.isError && (
        <div className="flex items-center justify-between gap-2 rounded-md bg-destructive/10 border border-destructive/30 p-2.5 text-xs text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{upload.error instanceof Error ? upload.error.message : 'Error al subir el archivo'}</span>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => upload.mutate()} className="h-7 text-xs">
            Reintentar
          </Button>
        </div>
      )}

      <Button
        type="button"
        onClick={() => upload.mutate()}
        disabled={upload.isPending || !selectedFile || title.trim().length < 2}
        className="gap-2"
      >
        <Upload className="size-4" />
        {upload.isPending ? `Subiendo (${progress}%)...` : 'Subir archivo'}
      </Button>
    </div>
  )
}
