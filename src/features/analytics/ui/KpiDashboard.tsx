import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarRange, ChartAreaIcon, CheckCircle2, RefreshCw, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { MetricRibbon } from '@/components/molecules/metric-ribbon'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getCurrentKpisRequest,
  calculateKpisRequest,
  ultimosPeriodos,
} from '../api/kpis-api'
import { analyticsKeys } from '../model/query-keys'
import { KPIS, formatear, formatearFechaHora } from './kpi-definitions'

interface KpiDashboardProps {
  accessToken: string
}

export function KpiDashboard({ accessToken }: KpiDashboardProps) {
  const queryClient = useQueryClient()
  const periodos = useMemo(() => ultimosPeriodos(12), [])

  const [period, setPeriod] = useState<string>(() => ultimosPeriodos(1)[0]?.value ?? '')
  const [aviso, setAviso] = useState<string | null>(null)

  const kpisQuery = useQuery({
    queryKey: analyticsKeys.kpis(period),
    queryFn: () => getCurrentKpisRequest(accessToken, period),
    staleTime: 60_000,
  })

  const calculateMutation = useMutation({
    mutationFn: () => calculateKpisRequest(accessToken, period),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border/80 bg-card p-4 sm:px-5 sm:py-3.5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs">
            <ChartAreaIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-foreground leading-snug">
              Indicadores del Período Comercial
            </h2>
            <p className="text-xs font-medium text-muted-foreground">
              Métricas consolidadas de gestión calculadas para el período seleccionado.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <Select
            value={period}
            onValueChange={(val) => {
              setPeriod(val)
              setAviso(null)
            }}
          >
            <SelectTrigger
              className="h-9 min-w-[150px] bg-muted/20 text-xs font-semibold capitalize rounded-xl border-border/80"
              aria-label="Seleccionar período"
            >
              <CalendarRange className="mr-1.5 size-3.5 text-primary" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              {periodos.map((p) => (
                <SelectItem key={p.value} value={p.value} className="text-xs capitalize font-medium">
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-9 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
            onClick={() => kpisQuery.refetch()}
            disabled={kpisQuery.isFetching}
          >
            <RefreshCw className={`size-3.5 ${kpisQuery.isFetching ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>

          <Button
            size="sm"
            className="gap-1.5 h-9 rounded-xl text-xs font-semibold shadow-xs"
            onClick={() => calculateMutation.mutate()}
            disabled={calculateMutation.isPending}
          >
            <CheckCircle2 className="size-3.5" />
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
        <MetricRibbon
          items={[]}
          columns={4}
          isLoading={true}
          skeletonCount={8}
          ariaLabel="Cargando indicadores"
        />
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

          <MetricRibbon
            items={KPIS.map((kpi) => {
              const Icon = kpi.icon
              const valor = Number(kpis[kpi.key] ?? 0)
              return {
                id: String(kpi.key),
                label: kpi.label,
                value: formatear(valor, kpi.formato),
                subtext: kpi.origen,
                icon: <Icon className="size-4" />,
                accent: kpi.destacado ? 'primary' : 'muted',
                highlight: kpi.destacado,
              }
            })}
            columns={4}
            ariaLabel="Indicadores de gestión"
          />

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
