import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, FolderOpen, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProjectRequest } from '@/features/collab/api'
import { collabKeys } from '@/features/collab/model'
import { parseApiError } from '@/shared/lib'

type Props = {
  accessToken: string
  projectId: string
  initialUrl: string | null
  canManage: boolean
  onError: (message: string) => void
}

/** Acceso y mantenimiento del repositorio externo asociado a los archivos pesados del proyecto. */
export function ProjectFileRepositoryLink({ accessToken, projectId, initialUrl, canManage, onError }: Props) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [url, setUrl] = useState(initialUrl ?? '')

  const save = useMutation({
    mutationFn: (fileRepositoryUrl: string | null) =>
      updateProjectRequest(accessToken, projectId, { file_repository_url: fileRepositoryUrl }),
    onSuccess: async () => {
      setIsEditing(false)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: collabKeys.projectBoard(projectId) }),
        queryClient.invalidateQueries({ queryKey: collabKeys.projects() }),
      ])
    },
    onError: (error) => {
      void parseApiError(error).then((message) => onError(message || 'No se pudo actualizar el repositorio externo'))
    },
  })

  const cancelEditing = () => {
    setUrl(initialUrl ?? '')
    setIsEditing(false)
  }

  const startEditing = () => {
    setUrl(initialUrl ?? '')
    setIsEditing(true)
  }

  if (isEditing) {
    return (
      <div className="mb-4 space-y-2 rounded-lg border border-dashed bg-muted/20 p-3">
        <Label htmlFor="project-file-repository">Repositorio de archivos pesados</Label>
        <Input
          id="project-file-repository"
          type="url"
          inputMode="url"
          autoFocus
          placeholder="https://drive.google.com/..."
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />
        <p className="text-xs leading-5 text-muted-foreground">Pega un enlace de Drive, OneDrive u otro repositorio compartido. Déjalo vacío para quitarlo.</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={cancelEditing} disabled={save.isPending}>Cancelar</Button>
          <Button size="sm" onClick={() => save.mutate(url.trim() || null)} disabled={save.isPending}>
            {save.isPending ? 'Guardando…' : 'Guardar enlace'}
          </Button>
        </div>
      </div>
    )
  }

  if (!initialUrl) {
    if (!canManage) return null
    return (
      <button
        type="button"
        onClick={startEditing}
        className="mb-4 flex w-full items-center gap-3 rounded-lg border border-dashed px-3 py-2.5 text-left transition-colors hover:border-primary/50 hover:bg-muted/50"
      >
        <FolderOpen className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">Agregar repositorio externo</span>
          <span className="block text-xs text-muted-foreground">Vincula los archivos pesados del proyecto.</span>
        </span>
        <Pencil className="size-3.5 text-muted-foreground" aria-hidden="true" />
      </button>
    )
  }

  return (
    <div className="mb-4 rounded-lg border bg-muted/20 p-3">
      <div className="flex items-start gap-3">
        <FolderOpen className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Repositorio externo</p>
          <a
            href={initialUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 block truncate text-xs text-primary underline-offset-4 hover:underline"
            title={initialUrl}
          >
            {initialUrl}
          </a>
        </div>
        <Button asChild variant="outline" size="icon-xs">
          <a href={initialUrl} target="_blank" rel="noreferrer" aria-label="Abrir repositorio externo">
            <ExternalLink className="size-3.5" />
          </a>
        </Button>
      </div>
      {canManage && (
        <div className="mt-2 flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={startEditing}>
            <Pencil className="size-3.5" /> Editar
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => save.mutate(null)} disabled={save.isPending}>
            <Trash2 className="size-3.5" /> Quitar
          </Button>
        </div>
      )}
    </div>
  )
}
