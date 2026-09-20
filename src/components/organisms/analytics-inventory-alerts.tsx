import { CheckCircle2 } from 'lucide-react'
import type { InventoryAlertDto } from '@/features/analytics/model'
import type { ExportFormat } from '@/features/analytics/api'
import { ExportButtons } from './analytics-export-buttons'

interface Props {
  data: InventoryAlertDto[] | undefined
  isLoading: boolean
  isError: boolean
  onExport: (format: ExportFormat) => void
  isExporting: boolean
  exportFormat: ExportFormat | null
}

export function getStockSeverity(item: InventoryAlertDto): 'critical' | 'warning' {
  if (item.pointOfSaleStock <= 0) return 'critical'
  const ratio = item.pointOfSaleStock / Math.max(item.lowStockAlert, 1)
  return ratio <= 0.5 ? 'critical' : 'warning'
}

export function InventoryAlertsCard({
  data,
  isLoading,
  isError,
  onExport,
  isExporting,
  exportFormat,
}: Props) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">Alertas de Inventario</h3>
        <ExportButtons
          label="inventario"
          onExport={onExport}
          isPending={isExporting}
          pendingFormat={exportFormat}
        />
      </div>
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive">Error al cargar alertas de inventario.</p>
        ) : data && data.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left">Producto</th>
                <th className="py-2 px-4 text-left">Tipo</th>
                <th className="py-2 px-4 text-right">Stock Total</th>
                <th className="py-2 px-4 text-right">Stock Punto de Venta</th>
                <th className="py-2 px-4 text-right">Umbral de Alerta</th>
                <th className="py-2 px-4 text-center">Severidad</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => {
                const severity = getStockSeverity(item)
                return (
                  <tr key={item.inventoryId} className="border-b interactive-row">
                    <td className="py-2 px-4 font-medium">{item.productName}</td>
                    <td className="py-2 px-4 text-muted-foreground">{item.inventoryType}</td>
                    <td className="py-2 px-4 text-right">{item.totalStock}</td>
                    <td className="py-2 px-4 text-right">{item.pointOfSaleStock}</td>
                    <td className="py-2 px-4 text-right">{item.lowStockAlert}</td>
                    <td className="py-2 px-4 text-center">
                      <span
                        className={`rounded px-2 py-1 text-xs font-semibold ${
                          severity === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {severity === 'critical' ? 'CRÍTICO' : 'ATENCIÓN'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <CheckCircle2 className="size-8 text-green-500" />
            <p className="text-sm font-medium">Todo el inventario está en niveles saludables</p>
            <p className="text-xs text-muted-foreground">
              No hay productos por debajo del umbral de alerta.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
