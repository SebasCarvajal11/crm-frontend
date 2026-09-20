import { FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ExportFormat } from '@/features/analytics/api'

export interface ExportButtonsProps {
  label: string
  onExport: (format: ExportFormat) => void
  isPending: boolean
  pendingFormat: ExportFormat | null
}

export function ExportButtons({ label, onExport, isPending, pendingFormat }: ExportButtonsProps) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Exportar ${label}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onExport('xlsx')}
        disabled={isPending}
        className="gap-1.5"
      >
        {isPending && pendingFormat === 'xlsx' ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <FileSpreadsheet className="size-3.5" />
        )}
        Excel
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onExport('pdf')}
        disabled={isPending}
        className="gap-1.5"
      >
        {isPending && pendingFormat === 'pdf' ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <FileText className="size-3.5" />
        )}
        PDF
      </Button>
    </div>
  )
}
