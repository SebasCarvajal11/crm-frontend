import { HardDrive, RefreshCw, FileText, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminStorageStats } from '@/features/admin/hooks'

type Props = {
  accessToken: string
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function getProgressColor(percentage: number): string {
  if (percentage >= 85) return 'bg-rose-600 dark:bg-rose-500'
  if (percentage >= 70) return 'bg-amber-500 dark:bg-amber-400'
  return 'bg-emerald-600 dark:bg-emerald-500'
}

export function AdminStorageCard({ accessToken }: Props) {
  const { stats, isLoading, isFetching, refetch } = useAdminStorageStats(accessToken)

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  const { disk, assets } = stats
  const indicatorColor = getProgressColor(disk.usedPercentage)

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <HardDrive className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Almacenamiento en Instancia</CardTitle>
              <CardDescription className="text-xs">
                Capacidad y uso de disco en el servidor de producción (Oracle Cloud)
              </CardDescription>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">
              Uso del disco: <span className="font-bold">{disk.usedPercentage}%</span>
            </span>
            <span className="text-xs text-muted-foreground">
              {formatBytes(disk.usedBytes)} de {formatBytes(disk.totalBytes)}
            </span>
          </div>
          <Progress
            value={disk.usedPercentage}
            className="h-3 bg-muted"
            indicatorClassName={indicatorColor}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="rounded-md border bg-muted/20 p-2.5">
            <p className="text-[11px] text-muted-foreground">Usado</p>
            <p className="text-sm font-semibold text-foreground">{formatBytes(disk.usedBytes)}</p>
          </div>
          <div className="rounded-md border bg-muted/20 p-2.5">
            <p className="text-[11px] text-muted-foreground">Disponible</p>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {formatBytes(disk.availableBytes)}
            </p>
          </div>
          <div className="rounded-md border bg-muted/20 p-2.5">
            <p className="text-[11px] text-muted-foreground">Capacidad Total</p>
            <p className="text-sm font-semibold text-foreground">{formatBytes(disk.totalBytes)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/10 px-3 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileText className="size-3.5 text-primary" />
            <span>Documentos:</span>
            <span className="font-medium text-foreground">
              {assets.documentsCount} ({formatBytes(assets.documentsBytes)})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <ImageIcon className="size-3.5 text-primary" />
            <span>Avatares:</span>
            <span className="font-medium text-foreground">
              {assets.avatarsCount} ({formatBytes(assets.avatarsBytes)})
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
