import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react'
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

  const resetSelectedFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
      <div className="space-y-1">
        <Input
          ref={fileInputRef}
          type="file"
          accept={SAFE_FILE_ACCEPT}
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
          }}
        />
        <p className="text-[11px] text-muted-foreground">Tamano maximo permitido: 25 MB.</p>
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
