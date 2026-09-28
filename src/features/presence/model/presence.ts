import { z } from 'zod'

export const PRESENCE_ROLES = ['worker', 'client', 'admin'] as const
export type PresenceRole = typeof PRESENCE_ROLES[number]
export type PresencePages = Record<PresenceRole, number>
export const FIRST_PAGES: PresencePages = { worker: 1, client: 1, admin: 1 }
const userSchema = z.object({
  subject: z.string(), email: z.string(), first_name: z.string().nullable(), last_name: z.string().nullable(),
  company_name: z.string().nullable(), is_online: z.boolean(),
  last_activity_at: z.iso.datetime({ offset: true }), last_connection_at: z.iso.datetime({ offset: true }).nullable(),
})
export const snapshotSchema = z.object({
  as_of: z.iso.datetime({ offset: true }), online_for_seconds: z.number().int().positive(),
  refresh_after_seconds: z.number().int().min(15).max(120), history_days: z.number().int().positive(),
  groups: z.array(z.object({ role: z.enum(PRESENCE_ROLES), page: z.number().int().positive(),
    page_size: z.number().int().min(1).max(50), total: z.number().int().nonnegative(), online: z.number().int().nonnegative(),
    users: z.array(userSchema).max(50),
  })).length(3).refine((groups) => new Set(groups.map((group) => group.role)).size === 3),
})
export type PresenceSnapshot = z.infer<typeof snapshotSchema>
export type PresenceUser = z.infer<typeof userSchema>
export type PresenceGroup = PresenceSnapshot['groups'][number]

export function presenceName(user: PresenceUser) {
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.company_name || user.email.split('@')[0]
}

const relative = new Intl.RelativeTimeFormat('es', { numeric: 'always' })
export function activityAge(timestamp: string, now: number) {
  const seconds = Math.max(0, Math.floor((now - Date.parse(timestamp)) / 1000))
  if (seconds < 60) return 'hace unos segundos'
  if (seconds < 3600) return relative.format(-Math.floor(seconds / 60), 'minute')
  if (seconds < 86400) return relative.format(-Math.floor(seconds / 3600), 'hour')
  return relative.format(-Math.floor(seconds / 86400), 'day')
}
