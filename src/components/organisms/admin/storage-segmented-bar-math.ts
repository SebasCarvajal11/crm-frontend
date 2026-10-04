import type { CloudStorageStats } from '@/features/admin/api'
import type { StorageSegment, StorageSegmentsResult } from './storage-segmented-bar.types'

const CONFIG = {
  projects: {
    label: 'Archivos de Proyectos',
    colorClass: 'bg-primary',
    dotClass: 'bg-primary ring-primary/30',
    badgeBgClass: 'bg-primary/10 text-primary border-primary/20',
  },
  avatars: {
    label: 'Avatares de Usuario',
    colorClass: 'bg-purple-500',
    dotClass: 'bg-purple-500 ring-purple-500/30',
    badgeBgClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  documents: {
    label: 'Documentos Directos',
    colorClass: 'bg-amber-500',
    dotClass: 'bg-amber-500 ring-amber-500/30',
    badgeBgClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  other: {
    label: 'Otros Archivos',
    colorClass: 'bg-cyan-500',
    dotClass: 'bg-cyan-500 ring-cyan-500/30',
    badgeBgClass: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  },
  available: {
    label: 'Espacio Libre',
    colorClass: 'bg-muted/80',
    dotClass: 'bg-emerald-500 ring-emerald-500/30',
    badgeBgClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  },
} as const

function calculateRawPercentage(bytes: number, quota: number): number {
  if (quota <= 0 || bytes <= 0) return 0
  return Number(((bytes / quota) * 100).toFixed(1))
}

function buildSegment(
  id: keyof typeof CONFIG,
  bytes: number,
  quota: number,
  count?: number,
): StorageSegment {
  return {
    id,
    label: CONFIG[id].label,
    bytes: Math.max(0, bytes),
    percentage: calculateRawPercentage(bytes, quota),
    count,
    colorClass: CONFIG[id].colorClass,
    dotClass: CONFIG[id].dotClass,
    badgeBgClass: CONFIG[id].badgeBgClass,
  }
}

export function calculateStorageSegments(cloud: CloudStorageStats): StorageSegmentsResult {
  const quota = Math.max(cloud.quotaBytes, 1)
  const knownUsed = cloud.projectFilesBytes + cloud.avatarsBytes + cloud.documentsBytes
  const otherBytes = Math.max(0, cloud.usedBytes - knownUsed)
  const availableBytes = Math.max(0, cloud.quotaBytes - cloud.usedBytes)

  const segments: StorageSegment[] = [
    buildSegment('projects', cloud.projectFilesBytes, quota, cloud.projectFilesCount),
    buildSegment('avatars', cloud.avatarsBytes, quota, cloud.avatarsCount),
  ]

  if (cloud.documentsCount > 0 || cloud.documentsBytes > 0) {
    segments.push(buildSegment('documents', cloud.documentsBytes, quota, cloud.documentsCount))
  }
  if (otherBytes > 0) {
    segments.push(buildSegment('other', otherBytes, quota))
  }
  if (availableBytes > 0) {
    segments.push(buildSegment('available', availableBytes, quota))
  }

  const totalUsedPercentage = Math.min(100, calculateRawPercentage(cloud.usedBytes, quota))

  return {
    segments,
    totalUsedPercentage,
    totalUsedBytes: cloud.usedBytes,
    quotaBytes: cloud.quotaBytes,
  }
}
