import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, FolderOpen, User, X } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { UserChip } from '@/components/molecules/user-chip'
import { UserSearch } from '@/components/molecules/user-search'
import { parseApiError } from '@/shared/lib'
import type { ClientSearchResult } from '@/shared/types'
import { createProjectRequest } from '@/features/collab/api'
import { collabKeys } from '@/features/collab/model'
import type { ProjectType } from '@/features/collab/model'

type Props = {
  accessToken: string
  open: boolean
  onClose: () => void
  onCreated: (projectId: string) => void
}

/** Organismo: modal para crear un nuevo proyecto con busqueda de cliente en tiempo real. */
export function CreateProjectModal({ accessToken, open, onClose, onCreated }: Props) {
  const queryClient = useQueryClient()
  const [name,           setName]           = useState('')
  const [description,    setDescription]    = useState('')
  const [brief,          setBrief]          = useState('')
  const [fileRepositoryUrl, setFileRepositoryUrl] = useState('')
  const [type,           setType]           = useState<ProjectType>('campaign_service')
  const [errorMsg,       setErrorMsg]       = useState<string | null>(null)
  const [selectedClient, setSelectedClient] = useState<ClientSearchResult | null>(null)
  const [selectedWorkers, setSelectedWorkers] = useState<ClientSearchResult[]>([])

  const createProject = useMutation({
    mutationFn: () =>
      createProjectRequest(accessToken, {
        name:        name.trim(),
        client_name: selectedClient?.email ?? '',
        client_sub: selectedClient?.subject,
        worker_subs: selectedWorkers.map((w) => w.subject),
        type,
        description: description.trim() || `Proyecto de tipo ${type}`,
        brief:       brief.trim()       || 'Brief inicial del proyecto.',
        file_repository_url: fileRepositoryUrl.trim() || undefined,
      }),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: collabKeys.projects() })
      handleClose()
      onCreated(res.data.id)
    },
    onError: (e) => parseApiError(e).then((m) => setErrorMsg(m || 'No se pudo crear el proyecto')),
  })

  const handleClose = () => {
    setName(''); setDescription(''); setBrief(''); setFileRepositoryUrl(''); setType('campaign_service')
    setSelectedClient(null); setSelectedWorkers([]); setErrorMsg(null)
    onClose()
  }

  const canSubmit = name.trim().length >= 3 && !!selectedClient && selectedWorkers.length >= 1

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border-border/60 shadow-xl">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-3">
            <div
              className={
                'flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ' +
                'shrink-0 ring-1 ring-primary/20 shadow-2xs'
              }
            >
              <FolderOpen className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground tracking-tight">Nuevo proyecto</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Completa los datos y asocia un cliente para crear el espacio de trabajo colaborativo.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          id="create-project-form"
          className="space-y-4 px-5 py-4 sm:px-6 max-h-[75vh] overflow-y-auto"
          onSubmit={(event) => {
            event.preventDefault()
            createProject.mutate()
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="cp-name" className="text-xs font-semibold text-foreground/90">
              Nombre del proyecto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cp-name"
              placeholder="Ej. Rediseño Web Corporativo 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 rounded-lg border-border/70 text-xs focus-visible:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cp-type" className="text-xs font-semibold text-foreground/90">
              Tipo de proyecto <span className="text-destructive">*</span>
            </Label>
            <Select value={type} onValueChange={(v) => setType(v as ProjectType)}>
              <SelectTrigger id="cp-type" className="h-9 rounded-lg border-border/70 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="campaign_service" className="text-xs">Campaña / Servicio</SelectItem>
                <SelectItem value="product_order" className="text-xs">Pedido de Producto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground/90">
              Cliente asignado <span className="text-destructive">*</span>
            </Label>
            {selectedClient ? (
              <div
                className={
                  'flex items-center justify-between gap-2 rounded-lg border border-border/70 ' +
                  'bg-muted/30 px-3 py-2 shadow-2xs'
                }
              >
                <div className="flex items-center gap-2 min-w-0">
                  <User className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
                  <span className="text-xs font-medium text-foreground truncate">{selectedClient.email}</span>
                  <Badge variant="secondary" className="text-[10px] shrink-0 font-medium">Cliente</Badge>
                </div>
                <IconButton
                  label="Quitar cliente"
                  onClick={() => setSelectedClient(null)}
                  className={
                    'size-6 shrink-0 text-muted-foreground hover:text-destructive ' +
                    'hover:bg-destructive/10 transition-colors'
                  }
                >
                  <X className="size-3.5" />
                </IconButton>
              </div>
            ) : (
              <UserSearch
                accessToken={accessToken}
                role="client"
                selected={selectedClient ? [selectedClient] : []}
                onSelect={(u) => setSelectedClient(u)}
                placeholder="Busca por email del cliente…"
                queryKeyPrefix="client-search"
              />
            )}
            <p className="text-[11px] text-muted-foreground">Busca un usuario cliente registrado en el sistema.</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground/90">
              Trabajadores iniciales <span className="text-destructive">*</span>
            </Label>
            {selectedWorkers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {selectedWorkers.map((worker) => (
                  <UserChip
                    key={worker.subject}
                    email={worker.email}
                    onRemove={() => setSelectedWorkers((prev) => prev.filter((w) => w.subject !== worker.subject))}
                  />
                ))}
              </div>
            )}
            <UserSearch
              accessToken={accessToken}
              role="worker"
              selected={selectedWorkers}
              onSelect={(worker) =>
                setSelectedWorkers((prev) =>
                  prev.some((w) => w.subject === worker.subject) ? prev : [...prev, worker],
                )
              }
              placeholder="Busca por email del trabajador..."
              queryKeyPrefix="worker-create-project-search"
            />
            <p className="text-[11px] text-muted-foreground">
              Debes seleccionar al menos un trabajador. Luego podrás agregar más en Integrantes.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cp-desc" className="text-xs font-semibold text-foreground/90">Descripción</Label>
            <Textarea
              id="cp-desc"
              placeholder="Describe el alcance y contexto general del proyecto…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] rounded-lg border-border/70 text-xs resize-none focus-visible:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cp-brief" className="text-xs font-semibold text-foreground/90">Brief inicial</Label>
            <Textarea
              id="cp-brief"
              placeholder="Objetivos, referencias, restricciones y entregables previstos…"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              className="min-h-[80px] rounded-lg border-border/70 text-xs resize-none focus-visible:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="cp-file-repository"
              className="flex items-center gap-1.5 text-xs font-semibold text-foreground/90"
            >
              <FolderOpen className="size-3.5 text-primary" aria-hidden="true" />
              Repositorio de archivos externos
            </Label>
            <Input
              id="cp-file-repository"
              type="url"
              inputMode="url"
              placeholder="https://drive.google.com/... o enlace de OneDrive / Dropbox"
              value={fileRepositoryUrl}
              onChange={(event) => setFileRepositoryUrl(event.target.value)}
              className="h-9 rounded-lg border-border/70 text-xs focus-visible:ring-primary/20"
            />
            <p className="text-[11px] text-muted-foreground">
              Opcional. Enlace a Google Drive o OneDrive para assets pesados sin saturar el almacenamiento de OCI.
            </p>
          </div>

          {errorMsg && (
            <Alert variant="destructive" className="py-2.5 rounded-lg border-destructive/30">
              <AlertCircle className="size-4" />
              <AlertTitle className="text-xs font-semibold">Error al crear proyecto</AlertTitle>
              <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
            </Alert>
          )}
        </form>

        <DialogFooter
          className="px-5 py-3.5 sm:px-6 border-t border-border/50 bg-muted/15 flex items-center justify-end gap-2.5"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={createProject.isPending}
            className="rounded-lg text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="sm"
            form="create-project-form"
            disabled={!canSubmit || createProject.isPending}
            className="rounded-lg text-xs shadow-xs"
          >
            {createProject.isPending ? 'Creando…' : 'Crear proyecto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}



