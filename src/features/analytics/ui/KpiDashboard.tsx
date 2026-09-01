import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BadgeDollarSign,
  CalendarRange,
  CheckCircle2,
  Clock,
  FolderCheck,
  FolderKanban,
  Megaphone,
  RefreshCw,
  Send,
  TrendingUp,
  UserPlus,
  XCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getCurrentKpisRequest,
  calculateKpisRequest,
  ultimosPeriodos,
  type KpiSnapshot,
} from '../api/kpis-api'

interface KpiDashboardProps {
  accessToken: string
}

type Formato = 'entero' | 'moneda' | 'porcentaje' | 'dias'

const KPIS: {
  key: keyof KpiSnapshot
  label: string
  origen: string
  icon: typeof UserPlus
  formato: Formato
  destacado?: boolean
}[] = [
  {
    key: 'newClients',
    label: 'Clientes nuevos',
    origen: 'Altas registradas en el período',
    icon: UserPlus,
    formato: 'entero',
  },
  {
    key: 'estimatedRevenue',
    label: 'Ingresos estimados',
    origen: 'Propuestas aprobadas en el período',
    icon: BadgeDollarSign,
    formato: 'moneda',
    destacado: true,
  },
  {
    key: 'activeCampaigns',
    label: 'Campañas activas',
    origen: 'Vigentes durante el período',
    icon: Megaphone,
    formato: 'entero',
  },
  {
    key: 'clientsContacted',
    label: 'Clientes contactados',
    origen: 'Distintos, con al menos un contacto',
    icon: Send,
    formato: 'entero',
  },
  {
    key: 'responseRate',
    label: 'Tasa de respuesta',
    origen: 'Respuestas sobre clientes contactados',
    icon: TrendingUp,
    formato: 'porcentaje',
    destacado: true,
  },
  {
    key: 'closedProjects',
    label: 'Proyectos cerrados',
    origen: 'Finalizados en el período',
    icon: FolderCheck,
    formato: 'entero',
  },
  {
    key: 'projectsInProgress',
    label: 'Proyectos en curso',
    origen: 'Abiertos al cierre del período',
    icon: FolderKanban,
    formato: 'entero',
  },
  {
    key: 'avgCloseDays',
    label: 'Tiempo promedio de cierre',
    origen: 'Días entre alta del cliente y cierre',
    icon: Clock,
    formato: 'dias',
  },
]

function formatear(valor: number, formato: Formato): string {
  switch (formato) {
    case 'moneda':
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(valor)
    case 'porcentaje':
      return `${valor.toFixed(1)}%`
    case 'dias':
      return valor === 0 ? '—' : `${valor.toFixed(0)} d`
    default:
      return String(valor)
  }
}

function formatearFechaHora(valor?: string | null) {
  if (!valor) return '—'
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(valor)
  )
}

export function KpiDashboard({ accessToken }: KpiDashboardProps) {
  const queryClient = useQueryClient()
  const periodos = useMemo(() => ultimosPeriodos(12), [])

  const [period, setPeriod] = useState<string>('')
  const [aviso, setAviso] = useState<string | null>(null)

  const kpisQuery = useQuery({
    queryKey: ['analytics', 'kpis', 'current', period],
    queryFn: () => getCurrentKpisRequest(accessToken, period),
  })

  const calculateMutation = useMutation({
    mutationFn: () => calculateKpisRequest(accessToken, period),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['analytics'] })
      setAviso(
        `Indicadores de ${etiquetaPeriodo(period)} consolidados y guardados el ${formatearFechaHora(
          data.calculatedAt
        )}.`
      )
    },
    onError: () =>
      setAviso('No se pudieron consolidar los indicadores. Verifique sus permisos.'),
  })

  const kpis = kpisQuery.data

  function etiquetaPeriodo(value: string) {
    return periodos.find((p) => p.value === value)?.label ?? value
  }

  const sinDatos =
    kpis != null &&
    kpis.newClients === 0 &&
    kpis.clientsContacted === 0 &&
    kpis.activeCampaigns === 0 &&
    kpis.estimatedRevenue === 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Indicadores de gestión</h2>
          <p className="text-sm text-muted-foreground">
            Los ocho indicadores del período, calculados en el momento de la consulta
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <label
              htmlFor="period"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              <CalendarRange className="h-3.5 w-3.5" />
              Período
            </label>
            <select
              id="period"
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value)
                setAviso(null)
              }}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm capitalize"
            >
              {periodos.map((p) => (
                <option key={p.value} value={p.value} className="capitalize">
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => kpisQuery.refetch()}
            disabled={kpisQuery.isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${kpisQuery.isFetching ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>

          <Button
            className="gap-2"
            onClick={() => calculateMutation.mutate()}
            disabled={calculateMutation.isPending}
          >
            <CheckCircle2 className="h-4 w-4" />
            {calculateMutation.isPending ? 'Consolidando…' : 'Consolidar período'}
          </Button>
        </div>
      </div>

      {aviso && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
          <span>{aviso}</span>
          <IconButton label="Cerrar aviso" onClick={() => setAviso(null)}>
            <XCircle className="h-4 w-4" />
          </IconButton>
        </div>
      )}

      {kpisQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : kpisQuery.isError ? (
        <Card className="border-destructive/40">
          <CardContent className="py-10 text-center">
            <XCircle className="mx-auto mb-3 h-10 w-10 text-destructive" />
            <p className="font-medium">No se pudieron calcular los indicadores</p>
            <Button variant="outline" className="mt-4" onClick={() => kpisQuery.refetch()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : kpis ? (
        <>
          {sinDatos && (
            <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <p className="font-semibold">Sin actividad registrada en {etiquetaPeriodo(period)}</p>
              <p className="text-muted-foreground">
                No es un error: en ese mes no hubo altas, campañas ni contactos. Pruebe con
                otro período.
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {KPIS.map((kpi) => {
              const Icon = kpi.icon
              const valor = Number(kpis[kpi.key] ?? 0)
              return (
                <Card
                  key={String(kpi.key)}
                  className={`border-l-4 ${
                    kpi.destacado ? 'border-l-primary' : 'border-l-muted-foreground/30'
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {kpi.label}
                      </p>
                      <div className="rounded-full bg-muted p-1.5">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </div>
                    <p className="mt-2 text-2xl font-bold leading-none">
                      {formatear(valor, kpi.formato)}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">{kpi.origen}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">Calculado el </span>
              {formatearFechaHora(kpis.calculatedAt)} sobre los datos actuales.
            </p>
            <p className="mt-1">
              «Consolidar período» guarda una fotografía de estos valores. La fotografía no
              cambia después, y es la que permite comparar meses entre sí en el historial.
              {kpis.snapshotsId == null && ' Este período aún no tiene fotografía guardada.'}
            </p>
          </div>
        </>
      ) : null}
    </div>
  )
}
