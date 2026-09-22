import { formatBytes } from '@/shared/lib'

interface StorageSummary {
  totalClients: number
  totalProjects: number
  totalBytes: number
  purgedBytes: number
}

interface Props {
  summary: StorageSummary
}

export function StorageSummaryCards({ summary }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-center text-xs">
      <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5">
        <p className="text-[11px] text-muted-foreground">Clientes con Archivos</p>
        <p className="font-semibold text-foreground text-sm">{summary.totalClients}</p>
      </div>
      <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5">
        <p className="text-[11px] text-muted-foreground">Proyectos Registrados</p>
        <p className="font-semibold text-foreground text-sm">{summary.totalProjects}</p>
      </div>
      <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5">
        <p className="text-[11px] text-muted-foreground">Espacio Activo en Nube</p>
        <p className="font-semibold text-foreground text-sm">{formatBytes(summary.totalBytes)}</p>
      </div>
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5">
        <p className="text-[11px] text-muted-foreground">Espacio Purgado/Liberado</p>
        <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
          {formatBytes(summary.purgedBytes)}
        </p>
      </div>
    </div>
  )
}
