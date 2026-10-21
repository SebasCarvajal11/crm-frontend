import { CalendarRange, FolderOpen, Search, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ExportFormat } from '@/features/analytics/api'
import { ExportButtons } from '@/components/organisms/analytics-export-buttons'
import type { KpiDetailDto, KpiDetailItemDto } from '../model'
import { ClientNameButton } from '@/features/marketing/ui/client-name-button'
import type { KpiDefinition } from './kpi-definitions'
import {
  detailValueLabel,
  filterDetailItems,
  formatIsoDate,
  formatKpiValue,
  periodLabel,
  subtitleLabel,
} from './analytics-labels'

export interface KpiDetailPanelProps {
  definition: KpiDefinition
  period: string
  detail?: KpiDetailDto | null
  isLoading: boolean
  isError: boolean
  search: string
  onSearchChange: (value: string) => void
  onRetry: () => void
  onPreviousPeriod: () => void
  onExport: (format: ExportFormat) => void
  isExporting: boolean
  exportFormat: ExportFormat | null
  exportError?: string | null
}

/** Contenido del panel lateral con los registros que componen un KPI. */
export function KpiDetailPanel({
  definition,
  period,
  detail,
  isLoading,
  isError,
  search,
  onSearchChange,
  onRetry,
  onPreviousPeriod,
  onExport,
  isExporting,
  exportFormat,
  exportError,
}: KpiDetailPanelProps) {
  const items = detail?.items ?? []
  const filtered = filterDetailItems(definition.apiKey, items, search)
  const total = detail?.total ?? items.length

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4 sm:px-5">
      <div
        className="grid grid-cols-2 gap-3 rounded-xl border border-border/80 bg-muted/20 p-3"
        data-testid="kpi-detail-summary"
      >
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {definition.label}
          </p>
          <p className="text-2xl font-extrabold tracking-tight tabular-nums text-foreground">
            {isLoading ? '…' : formatKpiValue(detail?.kpiValue, definition.formato)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Registros</p>
          <p className="text-2xl font-extrabold tracking-tight tabular-nums text-foreground">
            {isLoading ? '…' : `${total} ${total === 1 ? 'registro' : 'registros'}`}
          </p>
        </div>
        <p className="col-span-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarRange className="size-3.5 text-primary" />
          <span className="capitalize">{periodLabel(period)}</span> · {definition.origen}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, cliente o estado…"
            aria-label="Buscar en el detalle"
            className="h-9 pl-9 text-sm"
            disabled={isLoading || items.length === 0}
          />
        </div>
        <ExportButtons
          label={`detalle de ${definition.label}`}
          onExport={onExport}
          isPending={isExporting}
          pendingFormat={exportFormat}
        />
      </div>
      {exportError && (
        <p className="text-xs text-destructive" role="alert">{exportError}</p>
      )}

      {isLoading ? (
        <div className="space-y-2" role="status" aria-label="Cargando detalle">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/40 py-10 text-center">
          <XCircle className="mx-auto mb-3 size-9 text-destructive" />
          <p className="font-medium">No se pudo cargar el detalle</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-10 text-center">
          <FolderOpen className="mx-auto mb-3 size-9 text-muted-foreground/60" />
          <p className="font-medium">Sin registros en {periodLabel(period)}</p>
          <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
            Este indicador no tuvo movimiento en el mes elegido.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={onPreviousPeriod}>
            Ver el mes anterior
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-10 text-center">
          <p className="font-medium">Ningún registro coincide con «{search.trim()}»</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => onSearchChange('')}>
            Limpiar búsqueda
          </Button>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead className="hidden sm:table-cell">Subtítulo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Valor o estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="max-w-[14rem] font-medium" title={item.title ?? undefined}>
                    <span className="block truncate">
                      <DetailText item={item} text={item.title || '—'} />
                    </span>
                    <span className="block truncate text-xs font-normal text-muted-foreground sm:hidden">
                      <DetailText item={item} text={subtitleLabel(item.subtitle)} />
                    </span>
                    <ClientLine item={item} />
                  </TableCell>
                  <TableCell className="hidden max-w-[12rem] truncate text-muted-foreground sm:table-cell">
                    <DetailText item={item} text={subtitleLabel(item.subtitle)} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatIsoDate(item.date)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right font-semibold tabular-nums">
                    {detailValueLabel(definition.apiKey, item)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {filtered.length === items.length
            ? `Total: ${total} ${total === 1 ? 'registro' : 'registros'}`
            : `Mostrando ${filtered.length} de ${total} registros`}
        </p>
      )}
    </div>
  )
}

/** El nombre del cliente (en el título o el subtítulo) abre su ficha 360°. */
function DetailText({ item, text }: { item: KpiDetailItemDto; text: string }) {
  if (item.clientId && item.clientName && text === item.clientName) {
    return <ClientNameButton clientId={item.clientId} name={text} />
  }
  return <>{text}</>
}

/** Si el cliente no aparece en el título ni en el subtítulo, se muestra debajo. */
function ClientLine({ item }: { item: KpiDetailItemDto }) {
  if (!item.clientId || !item.clientName) return null
  if (item.clientName === item.title || item.clientName === item.subtitle) return null
  return (
    <span className="block truncate text-xs font-normal text-muted-foreground">
      Cliente: <ClientNameButton clientId={item.clientId} name={item.clientName} />
    </span>
  )
}
