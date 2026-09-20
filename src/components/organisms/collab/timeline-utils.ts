import {
  CheckCircle2,
  File as FileIconBase,
  FileImage,
  FileText,
  FileVideo,
  GitPullRequestArrow,
  GitPullRequestClosed,
} from 'lucide-react'
import type { ProjectTimelineItem } from '@/features/collab/model'

export const fileIcon = (mimeType: string) =>
  mimeType.startsWith('image/')
    ? FileImage
    : mimeType.startsWith('video/')
      ? FileVideo
      : mimeType.includes('pdf') || mimeType.startsWith('text/')
        ? FileText
        : FileIconBase

export const itemIcon = (item: ProjectTimelineItem) => {
  if (item.kind === 'task_completed') return CheckCircle2
  if (item.kind === 'change_accepted') return GitPullRequestArrow
  if (item.kind === 'change_rejected') return GitPullRequestClosed
  return fileIcon(item.mimeType ?? 'application/octet-stream')
}

export const supportsPreview = (mimeType: string) =>
  mimeType.startsWith('image/') ||
  mimeType.startsWith('video/') ||
  mimeType === 'application/pdf' ||
  mimeType.startsWith('text/')

export const formatBogotaDate = (iso: string | null | undefined): string => {
  if (!iso) return '—'
  const ts = Date.parse(iso)
  if (!Number.isFinite(ts)) return '—'
  try {
    return new Date(ts).toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      dateStyle: 'medium',
      timeStyle: 'short',
      hour12: false,
    })
  } catch {
    return '—'
  }
}

export const badgeClassByKind: Record<ProjectTimelineItem['kind'], string> = {
  file: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
  task_completed:
    'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  change_accepted:
    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  change_rejected:
    'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
}
