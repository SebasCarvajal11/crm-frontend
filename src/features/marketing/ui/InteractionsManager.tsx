import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2,
  MessageSquare,
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
  listInteractionsRequest,
  registerInteractionResponseRequest,
  type MarketingInteraction,
  type InteractionType,
} from '../api/interactions-api'
import { listClientsRequest } from '../api/clients-api'
import { RegisterContactDialog } from './RegisterContactDialog'
import { SummaryCard } from './summary-card'
import { InteractionsTable } from './interactions-table'
import { InteractionResponseDialog } from './interaction-response-dialog'
import { TIPOS_RESPUESTA } from './interaction-types.constants'

interface InteractionsManagerProps {
  accessToken: string
}

export function InteractionsManager({ accessToken }: InteractionsManagerProps) {
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [originFilter, setOriginFilter] = useState<'ALL' | 'AUTO' | 'MANUAL' | 'PENDING'>('ALL')
  const [target, setTarget] = useState<MarketingInteraction | null>(null)

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
      setTarget(null)
    },
  })

  const interactions = useMemo(() => interactionsQuery.data ?? [], [interactionsQuery.data])
  const clients = useMemo(() => clientsQuery.data ?? [], [clientsQuery.data])

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <MessageSquare className="h-6 w-6 text-primary" />
            HISTORIAL DE INTERACCIONES
          </h2>
          <p className="text-sm text-muted-foreground">
            Contactos registrados automáticamente por flujos o cargados de forma manual
          </p>
        </div>
        <RegisterContactDialog accessToken={accessToken} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total contactos"
          value={resumen.total}
          hint={`${resumen.automaticas} automáticas / ${resumen.manuales} manuales`}
          icon={MessageSquare}
          accent="border-l-primary"
        />
        <SummaryCard
          label="Con respuesta"
          value={resumen.conRespuesta}
          hint="Respuestas registradas o clics"
          icon={CheckCircle2}
          accent="border-l-emerald-500"
        />
        <SummaryCard
          label="Pendientes"
          value={resumen.pendientes}
          hint="Sin respuesta aún"
          icon={User}
          accent="border-l-amber-500"
        />
        <SummaryCard
          label="Tasa de respuesta"
          value={`${resumen.tasa}%`}
          hint="Sobre clientes únicos contactados"
          icon={TrendingUp}
          accent="border-l-sky-500"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente o contenido de respuesta..."
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
        <InteractionsTable
          filtered={filtered}
          clientLabel={clientLabel}
          onOpenDialog={(item) => setTarget(item)}
        />
      )}

      <InteractionResponseDialog
        target={target}
        clientLabel={target ? clientLabel(target.clientId) : ''}
        isPending={responseMutation.isPending}
        onClose={() => setTarget(null)}
        onSubmit={({ response, type }) => {
          if (!target) return
          responseMutation.mutate({
            id: target.interactionId,
            text: response,
            type,
          })
        }}
      />
    </div>
  )
}