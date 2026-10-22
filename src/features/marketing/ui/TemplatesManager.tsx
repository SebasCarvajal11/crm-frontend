import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, Plus, Search, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { IconButton } from '@/components/ui/icon-button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogMedia,
  DialogTitle,
} from '@/components/ui/dialog'
import { parseApiError } from '@/shared/lib'
import { listClientsRequest } from '../api/clients-api'
import {
  createTemplateRequest,
  listTemplatesRequest,
  setTemplateActiveRequest,
  updateTemplateRequest,
  type MessageTemplate,
  type TemplateInput,
} from '../api/templates-api'
import { usePlans } from '../hooks/use-plans'
import { ConfirmActionDialog } from './confirm-action-dialog'
import { TemplateEditorDialog } from './template-editor-dialog'
import { TemplatePreviewPanel } from './template-preview-panel'
import { TemplatesTable } from './templates-table'
import { TemplatesExplainer } from './templates-explainer'
import { TEMPLATE_CHANNELS, channelLabel, filterTemplates, type TemplateFilters } from './templates.utils'

interface TemplatesManagerProps {
  accessToken: string
}

const FILTROS_INICIALES: TemplateFilters = { channel: 'ALL', plan: 'ALL', search: '' }

/** Pestaña "Plantillas" (admin y worker): biblioteca de mensajes reutilizables. */
export function TemplatesManager({ accessToken }: TemplatesManagerProps) {
  const queryClient = useQueryClient()
  const { plans } = usePlans(accessToken)
  const [filters, setFilters] = useState<TemplateFilters>(FILTROS_INICIALES)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<MessageTemplate | null>(null)
  const [previewing, setPreviewing] = useState<MessageTemplate | null>(null)
  const [toggleTarget, setToggleTarget] = useState<MessageTemplate | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const templatesQuery = useQuery({
    queryKey: ['marketing', 'templates', 'all'],
    queryFn: () => listTemplatesRequest(accessToken),
  })
  const clientsQuery = useQuery({
    queryKey: ['marketing', 'clients'],
    queryFn: () => listClientsRequest(accessToken),
  })

  const templates = useMemo(
    () => (Array.isArray(templatesQuery.data) ? templatesQuery.data : []),
    [templatesQuery.data]
  )
  const visibles = useMemo(() => filterTemplates(templates, filters), [templates, filters])
  const clients = clientsQuery.data ?? []

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['marketing', 'templates'] })

  const saveMutation = useMutation({
    mutationFn: (input: TemplateInput) =>
      editing
        ? updateTemplateRequest(accessToken, editing.templateId, input)
        : createTemplateRequest(accessToken, input),
    onSuccess: (t) => {
      invalidate()
      setNotice(editing ? `Plantilla «${t.name}» actualizada.` : `Plantilla «${t.name}» creada.`)
      cerrarEditor()
    },
    onError: async (error) => setFormError(await parseApiError(error)),
  })

  const toggleMutation = useMutation({
    mutationFn: (t: MessageTemplate) => setTemplateActiveRequest(accessToken, t.templateId, !t.active),
    onSuccess: (t) => {
      invalidate()
      setNotice(t.active ? `Plantilla «${t.name}» activada.` : `Plantilla «${t.name}» desactivada.`)
    },
    onError: async (error) => setNotice(`No se pudo cambiar el estado: ${await parseApiError(error)}`),
  })

  function abrirEditor(t: MessageTemplate | null) {
    setEditing(t)
    setFormError(null)
    setEditorOpen(true)
  }

  function cerrarEditor() {
    setEditorOpen(false)
    setEditing(null)
    setFormError(null)
  }

  const hayFiltros = filters.channel !== 'ALL' || filters.plan !== 'ALL' || Boolean(filters.search?.trim())

  return (
    <div className="space-y-5">
      <div
        data-tour="marketing-templates-action"
        className={[
          'flex flex-col gap-3.5 rounded-xl border border-border/70 bg-card p-4.5 shadow-2xs',
          'sm:flex-row sm:items-center sm:justify-between',
        ].join(' ')}
      >
        <div className="flex items-center gap-3">
          <div
            className={[
              'flex size-10 shrink-0 items-center justify-center rounded-xl',
              'bg-primary/10 text-primary ring-1 ring-primary/20 shadow-2xs',
            ].join(' ')}
          >
            <FileText className="size-5" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-base font-bold tracking-tight text-foreground">Plantillas de mensajes</h2>
            <p className="text-xs text-muted-foreground">
              Mensajes reutilizables por canal y plan, con variables del cliente
            </p>
          </div>
        </div>
        <Button
          className="h-9 shrink-0 gap-2 rounded-lg font-semibold shadow-2xs"
          onClick={() => abrirEditor(null)}
          data-tour="marketing-new-template-btn"
        >
          <Plus className="size-4" />
          Nueva plantilla
        </Button>
      </div>

      {notice && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
          <span>{notice}</span>
          <IconButton label="Cerrar aviso" onClick={() => setNotice(null)}>
            <XCircle className="h-4 w-4" />
          </IconButton>
        </div>
      )}

      <TemplatesExplainer forceOpen={!templatesQuery.isLoading && templates.length === 0} />

      <div className="flex flex-col gap-3 sm:flex-row" data-tour="marketing-templates-filters">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o contenido…"
            aria-label="Buscar plantillas"
            value={filters.search ?? ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>
        <select
          aria-label="Filtrar por canal"
          value={filters.channel}
          onChange={(e) => setFilters({ ...filters, channel: e.target.value as TemplateFilters['channel'] })}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm sm:w-48"
        >
          <option value="ALL">Todos los canales</option>
          {TEMPLATE_CHANNELS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Filtrar por plan"
          value={filters.plan}
          onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm sm:w-48"
        >
          <option value="ALL">Todos los planes</option>
          {plans.map((p) => (
            <option key={p.planId} value={p.name}>
              {p.name}
              {p.active ? '' : ' (inactivo)'}
            </option>
          ))}
        </select>
      </div>

      {templatesQuery.isLoading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : templatesQuery.isError ? (
        <Card className="border-destructive/40">
          <CardContent className="py-10 text-center">
            <XCircle className="mx-auto mb-3 h-10 w-10 text-destructive" />
            <p className="font-medium">No se pudieron cargar las plantillas</p>
            <Button variant="outline" className="mt-4" onClick={() => templatesQuery.refetch()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TemplatesTable
          templates={visibles}
          filtered={templates.length > 0 && hayFiltros}
          isBusy={toggleMutation.isPending}
          onCreate={() => abrirEditor(null)}
          onClearFilters={() => setFilters(FILTROS_INICIALES)}
          onEdit={(t) => abrirEditor(t)}
          onPreview={(t) => setPreviewing(t)}
          onToggleActive={(t) => setToggleTarget(t)}
        />
      )}

      <TemplateEditorDialog
        open={editorOpen}
        template={editing}
        plans={plans}
        isPending={saveMutation.isPending}
        serverError={formError}
        onClose={cerrarEditor}
        onSubmit={(input) => {
          setFormError(null)
          saveMutation.mutate(input)
        }}
        previewSlot={
          editing ? (
            <TemplatePreviewPanel
              accessToken={accessToken}
              templateId={editing.templateId}
              clients={clients}
              showSubject={editing.channel === 'EMAIL'}
              idPrefix="tpl-editor-preview"
            />
          ) : null
        }
      />

      <Dialog open={previewing !== null} onOpenChange={(open) => !open && setPreviewing(null)}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogMedia variant="info">
              <FileText className="size-5" />
            </DialogMedia>
            <div className="flex min-w-0 flex-col gap-1 text-left">
              <DialogTitle>Vista previa: {previewing?.name}</DialogTitle>
              <DialogDescription>
                {previewing ? `${channelLabel(previewing.channel)} · ${previewing.plan || 'Todos los planes'}` : ''}
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogBody>
            {previewing && (
              <TemplatePreviewPanel
                key={previewing.templateId}
                accessToken={accessToken}
                templateId={previewing.templateId}
                clients={clients}
                showSubject={previewing.channel === 'EMAIL'}
              />
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={toggleTarget !== null}
        title={toggleTarget?.active ? `¿Desactivar «${toggleTarget?.name}»?` : `¿Activar «${toggleTarget?.name}»?`}
        description={
          toggleTarget?.active
            ? 'No se podrá elegir en automatizaciones nuevas ni en WhatsApp. Las automatizaciones que ya la usan enviarán su mensaje propio. Puede volver a activarla cuando quiera.'
            : 'Volverá a estar disponible en automatizaciones y en WhatsApp.'
        }
        confirmLabel={toggleTarget?.active ? 'Desactivar' : 'Activar'}
        tone={toggleTarget?.active ? 'warning' : 'default'}
        onCancel={() => setToggleTarget(null)}
        onConfirm={() => {
          if (toggleTarget) toggleMutation.mutate(toggleTarget)
          setToggleTarget(null)
        }}
      />
    </div>
  )
}
