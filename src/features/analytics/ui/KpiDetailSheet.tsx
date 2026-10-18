import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { triggerBlobDownload } from '@/shared/lib'
import type { ExportFormat } from '@/features/analytics/api'
import { exportKpiDetailRequest, getKpiDetailRequest } from '../api/kpis-api'
import { analyticsKeys } from '../model/query-keys'
import type { KpiDefinition } from './kpi-definitions'
import { KpiDetailPanel } from './KpiDetailPanel'
import { periodLabel, previousPeriod } from './analytics-labels'

interface KpiDetailSheetProps {
  accessToken: string
  definition: KpiDefinition | null
  period: string
  onClose: () => void
  onPeriodChange: (period: string) => void
}

/** Panel lateral con el detalle de un KPI: tabla, buscador y exportación. */
export function KpiDetailSheet({
  accessToken,
  definition,
  period,
  onClose,
  onPeriodChange,
}: KpiDetailSheetProps) {
  const open = definition !== null
  const kpi = definition?.apiKey

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="right" className="w-full gap-0 sm:data-[side=right]:max-w-2xl" data-tour="analytics-kpi-detail">
        <SheetHeader className="pr-12 sm:px-5">
          <SheetTitle className="text-lg font-bold tracking-tight">
            {definition ? `Detalle: ${definition.label}` : 'Detalle del indicador'}
          </SheetTitle>
          <SheetDescription className="capitalize">
            {periodLabel(period)}
          </SheetDescription>
        </SheetHeader>
        {definition && kpi && (
          <KpiDetailBody
            // Al cambiar de KPI o de mes se reinician el buscador y la exportación.
            key={`${kpi}-${period}`}
            accessToken={accessToken}
            definition={definition}
            period={period}
            onPeriodChange={onPeriodChange}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

function KpiDetailBody({
  accessToken,
  definition,
  period,
  onPeriodChange,
}: {
  accessToken: string
  definition: KpiDefinition
  period: string
  onPeriodChange: (period: string) => void
}) {
  const kpi = definition.apiKey
  const [search, setSearch] = useState('')
  const [exportFormat, setExportFormat] = useState<ExportFormat | null>(null)

  const detailQuery = useQuery({
    queryKey: analyticsKeys.kpiDetail(kpi, period),
    queryFn: () => getKpiDetailRequest(accessToken, kpi, period),
    staleTime: 60_000,
  })

  const exportMutation = useMutation({
    mutationFn: async (format: ExportFormat) => {
      setExportFormat(format)
      const blob = await exportKpiDetailRequest(accessToken, kpi, period, format)
      return { blob, format }
    },
    onSuccess: ({ blob, format }) =>
      triggerBlobDownload(blob, `detalle-${kpi.replace(/_/g, '-')}-${period}.${format}`),
    onSettled: () => setExportFormat(null),
  })

  return (
    <KpiDetailPanel
      definition={definition}
      period={period}
      detail={detailQuery.data}
      isLoading={detailQuery.isLoading}
      isError={detailQuery.isError}
      search={search}
      onSearchChange={setSearch}
      onRetry={() => void detailQuery.refetch()}
      onPreviousPeriod={() => onPeriodChange(previousPeriod(period))}
      onExport={(format) => exportMutation.mutate(format)}
      isExporting={exportMutation.isPending}
      exportFormat={exportFormat}
      exportError={exportMutation.isError ? 'No se pudo generar el archivo. Intente de nuevo.' : null}
    />
  )
}
