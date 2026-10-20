import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { MARKETING_ROUTES } from '@/shared/lib/gateway-routes'

/** Cupo diario de correos de crm-marketing. */
export interface EmailQuota {
  /** false = el envío de correos está en modo simulado. */
  enabled: boolean
  dailyLimit: number
  sentToday: number
  remaining: number
}

export interface TestEmailResult {
  deliveryStatus: string
  detail?: string | null
}

export async function getEmailQuotaRequest(accessToken: string): Promise<EmailQuota> {
  return api.get(MARKETING_ROUTES.emailQuota, { headers: bearer(accessToken) }).json<EmailQuota>()
}

export async function sendTestEmailRequest(
  accessToken: string,
  to: string
): Promise<TestEmailResult> {
  return api
    .post(MARKETING_ROUTES.testEmail, { headers: bearer(accessToken), json: { to } })
    .json<TestEmailResult>()
}
