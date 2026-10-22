import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { MARKETING_ROUTES } from '@/shared/lib/gateway-routes'

export type TemplateChannel = 'EMAIL' | 'WHATSAPP' | 'IN_APP'

/** Plantilla de mensaje (crm-marketing, marketing_message_templates). */
export interface MessageTemplate {
  templateId: string
  name: string
  channel: TemplateChannel
  /** null = aplica a todos los planes. */
  plan?: string | null
  subject?: string | null
  body: string
  active: boolean
  createdAt?: string | null
}

export type TemplateInput = {
  name: string
  channel: TemplateChannel
  plan?: string | null
  subject?: string | null
  body: string
}

export interface TemplatePreview {
  subject?: string | null
  body: string
}

export async function listTemplatesRequest(
  accessToken: string,
  filters: { channel?: TemplateChannel | null; plan?: string | null } = {}
): Promise<MessageTemplate[]> {
  const searchParams: Record<string, string> = {}
  if (filters.channel) searchParams.channel = filters.channel
  if (filters.plan) searchParams.plan = filters.plan
  return api
    .get(MARKETING_ROUTES.templates, { headers: bearer(accessToken), searchParams })
    .json<MessageTemplate[]>()
}

export async function createTemplateRequest(
  accessToken: string,
  input: TemplateInput
): Promise<MessageTemplate> {
  return api
    .post(MARKETING_ROUTES.templates, { headers: bearer(accessToken), json: input })
    .json<MessageTemplate>()
}

export async function updateTemplateRequest(
  accessToken: string,
  templateId: string,
  input: TemplateInput
): Promise<MessageTemplate> {
  return api
    .put(MARKETING_ROUTES.template(templateId), { headers: bearer(accessToken), json: input })
    .json<MessageTemplate>()
}

export async function setTemplateActiveRequest(
  accessToken: string,
  templateId: string,
  active: boolean
): Promise<MessageTemplate> {
  return api
    .patch(MARKETING_ROUTES.templateActive(templateId), {
      headers: bearer(accessToken),
      json: { active },
    })
    .json<MessageTemplate>()
}

export async function previewTemplateRequest(
  accessToken: string,
  templateId: string,
  clientId: string
): Promise<TemplatePreview> {
  return api
    .post(MARKETING_ROUTES.templatePreview(templateId), {
      headers: bearer(accessToken),
      json: { clientId },
    })
    .json<TemplatePreview>()
}
