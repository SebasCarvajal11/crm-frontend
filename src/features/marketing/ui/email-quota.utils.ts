import type { EmailQuota } from '../api/notifications-api'

/** Porcentaje usado del cupo diario (0–100). */
export function quotaPercent(quota: EmailQuota): number {
  if (!quota.dailyLimit || quota.dailyLimit <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((quota.sentToday / quota.dailyLimit) * 100)))
}

/** Validación simple del destinatario del correo de prueba. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}
