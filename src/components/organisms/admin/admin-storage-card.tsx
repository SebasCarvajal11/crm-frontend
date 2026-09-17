import { Cloud, HardDrive, RefreshCw, FolderKanban, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminStorageStats } from '@/features/admin/hooks'
import type { CloudStorageStats, DiskStats } from '@/features/admin/api'

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

function CloudStorageSection({ cloud }: { cloud: CloudStorageStats }) {
  const color = getProgressColor(cloud.usedPercentage)
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">
            Uso en la nube: <span className="font-bold">{cloud.usedPercentage}%</span>
          </span>
          <span className="text-xs text-muted-foreground">
            {formatBytes(cloud.usedBytes)} de {formatBytes(cloud.quotaBytes)}
          </span>
        </div>
        <Progress value={Math.max(1, cloud.usedPercentage)} className="h-3 bg-muted" indicatorClassName={color} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md border bg-muted/20 p-2.5">
          <p className="text-[11px] text-muted-foreground">Archivos en Nube</p>
          <p className="text-sm font-semibold text-foreground">{formatBytes(cloud.usedBytes)}</p>
        </div>
        <div className="rounded-md border bg-emerald-500/10 border-emerald-500/30 p-2.5">
          <p className="text-[11px] text-muted-foreground">Disponible para Subir</p>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {formatBytes(cloud.availableBytes)}
          </p>
        </div>
        <div className="rounded-md border bg-muted/20 p-2.5">
          <p className="text-[11px] text-muted-foreground">Cuota Incluida</p>
          <p className="text-sm font-semibold text-foreground">{formatBytes(cloud.quotaBytes)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/10 px-3 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <FolderKanban className="size-3.5 text-primary" />
          <span>Archivos de Proyectos:</span>
          <span className="font-medium text-foreground">
            {cloud.projectFilesCount} ({formatBytes(cloud.projectFilesBytes)})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <ImageIcon className="size-3.5 text-primary" />
          <span>Avatares:</span>
          <span className="font-medium text-foreground">
            {cloud.avatarsCount} ({formatBytes(cloud.avatarsBytes)})
          </span>
        </div>
      </div>
    </div>
  )
}

function ServerDiskSection({ disk }: { disk: DiskStats }) {
  const color = getProgressColor(disk.usedPercentage)
  return (
    <div className="rounded-lg border bg-muted/10 p-3 space-y-2 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="size-4 text-muted-foreground" />
          <div>
            <p className="text-xs font-semibold text-foreground">Salud del Servidor (Máquina Virtual)</p>
            <p className="text-[11px] text-muted-foreground">
              Disco de la instancia Linux (Docker, Postgres, SO). No consume cuota de archivos.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-muted-foreground">{disk.usedPercentage}%</span>
      </div>
      <Progress value={disk.usedPercentage} className="h-1.5 bg-muted" indicatorClassName={color} />
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{formatBytes(disk.usedBytes)} usados</span>
        <span>{formatBytes(disk.availableBytes)} libres de {formatBytes(disk.totalBytes)}</span>
      </div>
    </div>
  )
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

  const cloud = stats.cloudStorage ?? {
    quotaBytes: 10 * 1024 * 1024 * 1024,
    usedBytes: stats.assets.totalAssetsBytes,
    availableBytes: Math.max(0, 10 * 1024 * 1024 * 1024 - stats.assets.totalAssetsBytes),
    usedPercentage: Number(((stats.assets.totalAssetsBytes / (10 * 1024 * 1024 * 1024)) * 100).toFixed(2)),
    totalFilesCount: stats.assets.totalAssetsCount,
    projectFilesCount: stats.assets.documentsCount,
    projectFilesBytes: stats.assets.documentsBytes,
    avatarsCount: stats.assets.avatarsCount,
    avatarsBytes: stats.assets.avatarsBytes,
    documentsCount: 0,
    documentsBytes: 0,
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <Cloud className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Almacenamiento de Archivos (OCI Object Storage)
              </CardTitle>
              <CardDescription className="text-xs">
                Capacidad para proyectos, entregables, briefs y avatares en Oracle Cloud
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
      <CardContent className="space-y-2">
        <CloudStorageSection cloud={cloud} />
        <ServerDiskSection disk={stats.disk} />
      </CardContent>
    </Card>
  )
}
