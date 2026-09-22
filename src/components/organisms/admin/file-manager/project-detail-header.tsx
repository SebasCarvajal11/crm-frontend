import { Briefcase, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatBytes } from '@/shared/lib'

interface ProjectStats {
  totalFiles: number
  activeFilesCount: number
  purgedFilesCount: number
  activeBytes: number
}

interface Props {
  projectName: string
  clientName?: string
  projectStats: ProjectStats
  isPurging: boolean
  onExportZip: () => void
  onOpenEmptyDialog: () => void
}

export function ProjectDetailHeader({
  projectName,
  clientName,
  projectStats,
  isPurging,
  onExportZip,
  onOpenEmptyDialog,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
      <div>
        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Briefcase className="size-4 text-primary" />
          {projectName}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          Cliente: <span className="font-medium text-foreground">{clientName}</span>
          {' • '}
          Total: <span className="font-semibold text-foreground">{projectStats.totalFiles}</span> archivos
          {' ('}
          <span className="text-emerald-700 dark:text-emerald-400 font-medium">
            {projectStats.activeFilesCount} en nube: {formatBytes(projectStats.activeBytes)}
          </span>
          {projectStats.purgedFilesCount > 0 && (
            <>
              {' • '}
              <span className="text-rose-600 dark:text-rose-400">
                {projectStats.purgedFilesCount} liberados
              </span>
            </>
          )}
          {')'}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
        <Button
          variant="outline"
          size="sm"
          onClick={onExportZip}
          disabled={projectStats.activeFilesCount === 0 || isPurging}
          className="text-xs gap-1.5"
          title="Descargar todos los archivos activos en paquete ZIP"
        >
          <Download className="size-3.5" />
          Descargar Proyecto (.zip)
        </Button>
        {projectStats.activeFilesCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenEmptyDialog}
            disabled={isPurging}
            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 gap-1.5"
          >
            <Trash2 className="size-3.5" />
            Vaciar archivos del proyecto
          </Button>
        )}
      </div>
    </div>
  )
}
