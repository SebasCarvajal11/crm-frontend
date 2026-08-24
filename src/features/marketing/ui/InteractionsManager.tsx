import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bot,
  CheckCircle2,
  MessageSquare,
  MessageSquarePlus,
  Search,
  TrendingUp,
  User,
  XCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  listInteractionsRequest,
  registerInteractionResponseRequest,
  type MarketingInteraction,
  type InteractionType,
} from '../api/interactions-api'
import { listClientsRequest } from '../api/clients-api'
import { RegisterContactDialog } from './RegisterContactDialog'

interface InteractionsManagerProps {
  accessToken: string
}

const INTERACTION_TYPES: {
  value: InteractionType
  label: string
  esRespuesta: boolean
  chip: string
}[] = [
  { value: 'no_response', label: 'Sin respuesta', esRespuesta: false, chip: 'bg-muted text-muted-foreground border-border' },
  { value: 'message', label: 'Mensaje enviado', esRespuesta: false, chip: 'bg-primary/10 text-primary border-primary/30' },
  { value: 'open', label: 'Abrió el correo', esRespuesta: false, chip: 'bg-sky-50 text-sky-800 border-sky-300' },
  { value: 'click', label: 'Hizo clic', esRespuesta: true, chip: 'bg-sky-50 text-sky-800 border-sky-300' },
  { value: 'inquiry', label: 'Consultó', esRespuesta: true, chip: 'bg-amber-50 text-amber-800 border-amber-300' },
  { value: 'purchase', label: 'Compró', esRespuesta: true, chip: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  { value: 'testimonial', label: 'Dio testimonio', esRespuesta: true, chip: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
]

const TIPOS_RESPUESTA: InteractionType[] = ['click', 'inquiry', 'purchase', 'testimonial']

function typeMeta(type: InteractionType) {
  return INTERACTION_TYPES.find((t) => t.value === type) ?? INTERACTION_TYPES[0]
}

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value)
  )
}

export function InteractionsManager({ accessToken }: InteractionsManagerProps) {
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [originFilter, setOriginFilter] = useState<'ALL' | 'AUTO' | 'MANUAL' | 'PENDING'>('ALL')

  const [target, setTarget] = useState<MarketingInteraction | null>(null)
  const [responseText, setResponseText] = useState('')
  const [responseType, setResponseType] = useState<InteractionType>('inquiry')
  const [formError, setFormError] = useState<string | null>(null)

  const interactionsQuery = useQuery({
    queryKey: ['marketing', 'interactions'],
    queryFn: () => listInteractionsRequest(accessToken),
  })

  const clientsQuery = useQuery({
    queryKey: ['marketing', 'clients'],
    queryFn: () => listClientsRequest(accessToken),
  })

  const responseMutation = useMutation({
    mutationFn: ({ id, text, type }: { id: number; text: string; type: InteractionType }) =>
      registerInteractionResponseRequest(accessToken, id, text, type),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['marketing', 'interactions'] })
      void queryClient.invalidateQueries({ queryKey: ['analytics'] })
      closeDialog()
    },
    onError: () => setFormError('No se pudo registrar la respuesta. Intente nuevamente.'),
  })

  const interactions = interactionsQuery.data ?? []
  const clients = clientsQuery.data ?? []

  const clientLabel = useMemo(() => {
    const mapa = new Map<string, string>()
    clients.forEach((c) =>
      mapa.set(c.clientId, c.contactInfo || c.additionalInfo || `${c.clientId.slice(0, 8)}…`)
    )
    return (clientId: string) => mapa.get(clientId) ?? `${clientId.slice(0, 8)}…`
  }, [clients])

  const resumen = useMemo(() => {
    const automaticas = interactions.filter((i) => i.executionId != null).length
    const conRespuesta = interactions.filter(
      (i) => i.response || TIPOS_RESPUESTA.includes(i.interactionType)
    ).length
    const clientesUnicos = new Set(interactions.map((i) => i.clientId)).size
    const tasa = clientesUnicos > 0 ? Math.round((conRespuesta / clientesUnicos) * 100) : 0

    return {
      total: interactions.length,
      automaticas,
      manuales: interactions.length - automaticas,
      conRespuesta,
      pendientes: interactions.length - conRespuesta,
      tasa,
    }
  }, [interactions])

  const filtered = useMemo(() => {
    const termino = searchTerm.trim().toLowerCase()
    return interactions
      .filter((i) => {
        if (originFilter === 'AUTO' && i.executionId == null) return false
        if (originFilter === 'MANUAL' && i.executionId != null) return false
        if (originFilter === 'PENDING' && i.response) return false
        if (!termino) return true
        return (
          clientLabel(i.clientId).toLowerCase().includes(termino) ||
          (i.response ?? '').toLowerCase().includes(termino)
        )
      })
      .sort((a, b) => new Date(b.contactDate).getTime() - new Date(a.contactDate).getTime())
  }, [interactions, searchTerm, originFilter, clientLabel])

  function openDialog(interaction: MarketingInteraction) {
    setTarget(interaction)
    setResponseText(interaction.response ?? '')
    setResponseType(
      TIPOS_RESPUESTA.includes(interaction.interactionType) ? interaction.interactionType : 'inquiry'
    )
    setFormError(null)
  }

  function closeDialog() {
    setTarget(null)
    setResponseText('')
    setFormError(null)
  }

  function handleSubmit() {
    if (!target) return
    if (!responseText.trim()) {
      setFormError('Escriba lo que respondió el cliente.')
      return
    }
    responseMutation.mutate({
      id: target.interactionId,
      text: responseText.trim(),
      type: responseType,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <MessageSquare className="h-6 w-6 text-primary" />
            HISTORIAL DE INTERACCIONES
          </h2>
          <p className="text-sm text-muted-foreground">
            Contactos realizados y respuestas recibidas de los clientes
          </p>
        </div>
        <RegisterContactDialog accessToken={accessToken} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Tasa de respuesta"
          value={`${resumen.tasa}%`}
          hint={`${resumen.conRespuesta} de ${resumen.total} contactos`}
          icon={TrendingUp}
          accent="border-l-primary"
        />
        <SummaryCard
          label="Automáticas"
          value={String(resumen.automaticas)}
          hint="Generadas por workflows"
          icon={Bot}
          accent="border-l-sky-500"
        />
        <SummaryCard
          label="Manuales"
          value={String(resumen.manuales)}
          hint="Registradas por el equipo"
          icon={User}
          accent="border-l-muted-foreground"
        />
        <SummaryCard
          label="Sin responder"
          value={String(resumen.pendientes)}
          hint="Pendientes de seguimiento"
          icon={MessageSquarePlus}
          accent="border-l-amber-500"
        />
      </div>

      {resumen.pendientes > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
          <MessageSquarePlus className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-semibold">
              {resumen.pendientes} contacto(s) sin respuesta registrada
            </p>
            <p className="text-muted-foreground">
              La tasa de respuesta solo sube cuando se registra lo que contestó el cliente.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente o respuesta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={originFilter}
          onChange={(e) => setOriginFilter(e.target.value as typeof originFilter)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm sm:w-56"
        >
          <option value="ALL">Todas las interacciones</option>
          <option value="AUTO">Solo automáticas</option>
          <option value="MANUAL">Solo manuales</option>
          <option value="PENDING">Sin respuesta registrada</option>
        </select>
      </div>

      {interactionsQuery.isLoading ? (
        <Skeleton className="h-80 w-full rounded-lg" />
      ) : interactionsQuery.isError ? (
        <Card className="border-destructive/40">
          <CardContent className="py-10 text-center">
            <XCircle className="mx-auto mb-3 h-10 w-10 text-destructive" />
            <p className="font-medium">No se pudieron cargar las interacciones</p>
            <Button variant="outline" className="mt-4" onClick={() => interactionsQuery.refetch()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-14 text-center">
            <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium">
              {interactions.length === 0
                ? 'Aún no hay interacciones registradas'
                : 'Ninguna interacción coincide con el filtro'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {interactions.length === 0
                ? 'Se generan al ejecutar un flujo de automatización sobre un cliente.'
                : 'Pruebe con otros criterios.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-semibold">Cliente</th>
                    <th className="px-4 py-3 font-semibold">Fecha</th>
                    <th className="px-4 py-3 font-semibold">Canal</th>
                    <th className="px-4 py-3 font-semibold">Tipo</th>
                    <th className="px-4 py-3 font-semibold">Origen</th>
                    <th className="px-4 py-3 font-semibold">Respuesta</th>
                    <th className="px-4 py-3 text-right font-semibold">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((interaction) => {
                    const meta = typeMeta(interaction.interactionType)
                    const esAutomatica = interaction.executionId != null
                    return (
                      <tr
                        key={interaction.interactionId}
                        className="border-b last:border-0 hover:bg-muted/30"
                      >
                        <td className="px-4 py-3 font-medium">
                          {clientLabel(interaction.clientId)}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {formatDateTime(interaction.contactDate)}
                        </td>
                        <td className="px-4 py-3 text-xs">{interaction.channel ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.chip}`}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            {esAutomatica ? (
                              <>
                                <Bot className="h-3.5 w-3.5" />
                                Workflow #{interaction.executionId}
                              </>
                            ) : (
                              <>
                                <User className="h-3.5 w-3.5" />
                                Manual
                              </>
                            )}
                          </span>
                        </td>
                        <td className="max-w-xs px-4 py-3">
                          {interaction.response ? (
                            <span className="line-clamp-2 text-xs" title={interaction.response}>
                              {interaction.response}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin respuesta</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant={interaction.response ? 'ghost' : 'outline'}
                            size="sm"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => openDialog(interaction)}
                          >
                            {interaction.response ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Editar
                              </>
                            ) : (
                              <>
                                <MessageSquarePlus className="h-3.5 w-3.5" />
                                Registrar
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={target !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar respuesta del cliente</DialogTitle>
            <DialogDescription>
              Se actualiza la misma interacción, no se crea una nueva. Este dato alimenta
              la tasa de respuesta.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {target && (
              <div className="rounded-md bg-muted/50 p-3 text-sm">
                <p className="font-medium">{clientLabel(target.clientId)}</p>
                <p className="text-xs text-muted-foreground">
                  Contactado el {formatDateTime(target.contactDate)} por{' '}
                  {target.channel ?? 'canal no especificado'}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="responseText">¿Qué respondió el cliente?</Label>
              <textarea
                id="responseText"
                rows={3}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Me interesa la propuesta, agendemos una reunión…"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responseType">Tipo de respuesta</Label>
              <select
                id="responseType"
                value={responseType}
                onChange={(e) => setResponseType(e.target.value as InteractionType)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {INTERACTION_TYPES.filter((t) => t.esRespuesta).map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Solo estos tipos cuentan como respuesta efectiva en el indicador de conversión.
              </p>
            </div>

            {formError && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={responseMutation.isPending}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={responseMutation.isPending}>
              {responseMutation.isPending ? 'Guardando…' : 'Registrar respuesta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  hint: string
  icon: typeof MessageSquare
  accent: string
}) {
  return (
    <Card className={`border-l-4 ${accent}`}>
      <CardContent className="flex items-start justify-between gap-3 pt-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-3xl font-bold leading-none">{value}</p>
          <p className="mt-2 truncate text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="rounded-full bg-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}