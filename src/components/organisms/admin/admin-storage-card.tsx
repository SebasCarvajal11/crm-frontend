import {
  Cloud,
  HardDrive,
  RefreshCw,
  FolderKanban,
  Image as ImageIcon,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminStorageStats } from '@/features/admin/hooks'
import { formatBytes } from '@/shared/lib'
import type { CloudStorageStats, DiskStats } from '@/features/admin/api'

type Props = {
  accessToken: string
}

function getProgressColor(percentage: number): string {
  if (percentage >= 85) return 'bg-gradient-to-r from-rose-500 to-red-600'
  if (percentage >= 70) return 'bg-gradient-to-r from-amber-500 to-orange-500'
  return 'bg-gradient-to-r from-emerald-500 to-teal-500'
}

function CloudUsageBar({ cloud }: { cloud: CloudStorageStats }) {
  const color = getProgressColor(cloud.usedPercentage)
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-medium">
        <span className="text-foreground">
          Uso en la nube: <span className="font-bold tabular-nums text-foreground">{cloud.usedPercentage}%</span>
        </span>
        <span className="text-xs text-muted-foreground font-medium">
          {formatBytes(cloud.usedBytes)} de {formatBytes(cloud.quotaBytes)}
        </span>
      </div>
      <Progress
        value={Math.max(1, cloud.usedPercentage)}
        className="h-2.5 bg-muted/80 rounded-full overflow-hidden"
        indicatorClassName={color}
      />
    </div>
  )
}

function CloudStatBoxes({ cloud }: { cloud: CloudStorageStats }) {
  return (
    <div className="grid grid-cols-3 gap-2.5 text-center">
      <div className="rounded-xl border border-border/60 bg-muted/20 p-3 shadow-2xs">
        <p className="text-[11px] font-semibold text-muted-foreground">Archivos en Nube</p>
        <p className="mt-1 text-sm sm:text-base font-bold text-foreground tabular-nums">{formatBytes(cloud.usedBytes)}</p>
      </div>
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 shadow-2xs">
        <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">Disponible</p>
        <p className="mt-1 text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
          {formatBytes(cloud.availableBytes)}
        </p>
      </div>
      <div className="rounded-xl border border-border/60 bg-muted/20 p-3 shadow-2xs">
        <p className="text-[11px] font-semibold text-muted-foreground">Cuota Total</p>
        <p className="mt-1 text-sm sm:text-base font-bold text-foreground tabular-nums">{formatBytes(cloud.quotaBytes)}</p>
      </div>
    </div>
  )
}

function CloudBreakdownBadges({ cloud }: { cloud: CloudStorageStats }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/60 px-3.5 py-2.5 text-xs text-muted-foreground shadow-2xs">
      <div className="flex items-center gap-1.5 font-medium">
        <FolderKanban className="size-3.5 text-primary" />
        <span>Archivos de Proyectos:</span>
        <span className="font-bold text-foreground tabular-nums">
          {cloud.projectFilesCount} ({formatBytes(cloud.projectFilesBytes)})
        </span>
      </div>
      <div className="flex items-center gap-1.5 font-medium">
        <ImageIcon className="size-3.5 text-primary" />
        <span>Avatares:</span>
        <span className="font-bold text-foreground tabular-nums">
          {cloud.avatarsCount} ({formatBytes(cloud.avatarsBytes)})
        </span>
      </div>
      {cloud.documentsCount > 0 && (
        <div className="flex items-center gap-1.5 font-medium">
          <FileText className="size-3.5 text-primary" />
          <span>Documentos Directos:</span>
          <span className="font-bold text-foreground tabular-nums">
            {cloud.documentsCount} ({formatBytes(cloud.documentsBytes)})
          </span>
        </div>
      )}
    </div>
  )
}

function CloudStorageSection({ cloud }: { cloud: CloudStorageStats }) {
  return (
    <div className="space-y-4">
      <CloudUsageBar cloud={cloud} />
      <CloudStatBoxes cloud={cloud} />
      <CloudBreakdownBadges cloud={cloud} />
    </div>
  )
}

function ServerDiskSection({ disk }: { disk: DiskStats }) {
  const color = getProgressColor(disk.usedPercentage)
  return (
    <div data-tour="admin-storage-server-disk" className="rounded-xl border border-border/60 bg-muted/15 p-3.5 space-y-2 mt-4 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="size-4 text-primary/80" />
          <div>
            <p className="text-xs font-bold text-foreground">Estado del Servidor y Base de Datos</p>
            <p className="text-[11px] text-muted-foreground">
              Almacenamiento del servidor para la base de datos interna. No descuenta cuota en la nube.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold tabular-nums text-foreground">{disk.usedPercentage}%</span>
      </div>
      <Progress value={disk.usedPercentage} className="h-1.5 bg-muted/80 rounded-full" indicatorClassName={color} />
      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium tabular-nums">
        <span>{formatBytes(disk.usedBytes)} usados</span>
        <span>{formatBytes(disk.availableBytes)} libres de {formatBytes(disk.totalBytes)}</span>
      </div>
    </div>
  )
}

function StorageSkeleton() {
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

function StorageErrorCard({ onRetry, isFetching }: { onRetry: () => void; isFetching: boolean }) {
  return (
    <Card className="border-border/60 shadow-sm border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-6 text-center space-y-3">
        <AlertCircle className="size-8 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            No se pudieron sincronizar las estadísticas de almacenamiento
          </p>
          <p className="text-xs text-muted-foreground">
            Verifique la conexión con el servicio de almacenamiento de archivos.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isFetching}
          className="gap-1.5 text-xs"
        >
          <RefreshCw className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Reintentar conexión
        </Button>
      </CardContent>
    </Card>
  )
}

export function AdminStorageCard({ accessToken }: Props) {
  const { stats, isLoading, isError, isFetching, refetch } = useAdminStorageStats(accessToken)

  if (isLoading) return <StorageSkeleton />
  if (isError || !stats) {
    return <StorageErrorCard onRetry={() => refetch()} isFetching={isFetching} />
  }

  const fallbackQuota = stats.assets.totalAssetsBytes > 0 ? stats.assets.totalAssetsBytes : 0
  const cloud = stats.cloudStorage ?? {
    quotaBytes: fallbackQuota,
    usedBytes: stats.assets.totalAssetsBytes,
    availableBytes: 0,
    usedPercentage: stats.assets.totalAssetsBytes > 0 ? 100 : 0,
    totalFilesCount: stats.assets.totalAssetsCount,
    projectFilesCount: stats.assets.documentsCount,
    projectFilesBytes: stats.assets.documentsBytes,
    avatarsCount: stats.assets.avatarsCount,
    avatarsBytes: stats.assets.avatarsBytes,
    documentsCount: 0,
    documentsBytes: 0,
  }

  return (
    <Card data-tour="admin-storage-overview" className="rounded-2xl border-border/70 bg-card shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <Cloud className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Almacenamiento de Archivos en la Nube
              </CardTitle>
              <CardDescription className="text-xs">
                Capacidad para proyectos, entregables, briefs y recursos multimedia
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
