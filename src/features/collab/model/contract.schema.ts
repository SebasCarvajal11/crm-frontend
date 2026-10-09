import { z } from 'zod'
import type { ProjectContract } from './collab.types'
import type { ProjectContractAmendment } from './contract-amendment.types'

export const projectContractStatusSchema = z.enum([
  'draft',
  'pending_signature',
  'signed',
])

export const providerKindSchema = z.enum(['cima', 'independent'])
export const clientKindSchema = z.enum(['natural', 'juridical'])
export const amendmentTypeSchema = z.enum([
  'services',
  'economic',
  'extension',
  'mixed',
])
export const amendmentFeePaymentTypeSchema = z.enum([
  'one_time',
  'monthly_recurring',
])

const nullableString = z.string().nullable().optional().transform((v) => v ?? null)

export const projectContractSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  status: projectContractStatusSchema,
  providerKind: providerKindSchema,
  providerName: z.string(),
  providerTaxId: nullableString,
  providerRepresentative: nullableString,
  providerRepresentativeDocument: nullableString,
  clientKind: clientKindSchema,
  clientName: z.string(),
  clientDocument: nullableString,
  clientCompanyName: nullableString,
  clientTaxId: nullableString,
  clientRepresentative: nullableString,
  clientRepresentativeDocument: nullableString,
  clientEmail: z.string(),
  clientPhone: nullableString,
  planName: z.string(),
  monthlyFee: z.coerce.number().default(0),
  currency: z.literal('COP').default('COP'),
  taxIncluded: z.boolean().default(false),
  termMonths: z.coerce.number().default(0),
  serviceScope: z.string().default(''),
  additionalTerms: nullableString,
  contentSnapshot: nullableString,
  contentHash: nullableString,
  preparedBySub: z.string().default(''),
  requestedSignatureAt: nullableString,
  signedAt: nullableString,
  signedBySub: nullableString,
  signerName: nullableString,
  signatureDataUrl: nullableString,
  consentAcceptedAt: nullableString,
  signatureCity: z.string().default('Medellín'),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const projectContractAmendmentSchema = z.object({
  id: z.string(),
  contractId: z.string(),
  projectId: z.string(),
  amendmentNumber: z.coerce.number(),
  title: z.string(),
  amendmentType: amendmentTypeSchema,
  status: projectContractStatusSchema,
  serviceScope: z.string().default(''),
  additionalFee: z.coerce.number().default(0),
  feePaymentType: amendmentFeePaymentTypeSchema,
  termMonthsExtension: z.coerce.number().default(0),
  additionalTerms: nullableString,
  clientRequestNotes: nullableString,
  contentSnapshot: nullableString,
  contentHash: nullableString,
  preparedBySub: z.string().default(''),
  requestedSignatureAt: nullableString,
  signedAt: nullableString,
  signedBySub: nullableString,
  signerName: nullableString,
  signatureDataUrl: nullableString,
  consentAcceptedAt: nullableString,
  signedIpAddress: nullableString,
  signedUserAgent: nullableString,
  signatureCity: z.string().default('Medellín'),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ValidatedProjectContract = z.infer<typeof projectContractSchema>
export type ValidatedContractAmendment = z.infer<
  typeof projectContractAmendmentSchema
>

/**
 * Valida y normaliza la respuesta de contrato proveniente del BFF KrakenD.
 */
export function parseProjectContractResponse(
  raw: unknown
): { data: ProjectContract | null } {
  if (!raw || typeof raw !== 'object') {
    return { data: null }
  }

  const candidate = 'data' in raw
    ? (raw as { data: unknown }).data
    : raw

  if (
    !candidate ||
    typeof candidate !== 'object' ||
    Object.keys(candidate).length === 0
  ) {
    return { data: null }
  }

  const result = projectContractSchema.safeParse(candidate)
  if (result.success) {
    return { data: result.data as ProjectContract }
  }

  if (typeof (candidate as Record<string, unknown>).id === 'string') {
    console.warn(
      '[collab/contract.schema] Advertencia al validar contrato:',
      result.error.issues
    )
    return { data: candidate as ProjectContract }
  }

  return { data: null }
}

/**
 * Valida y normaliza el arreglo de adendas contractuales del BFF KrakenD.
 */
export function parseProjectAmendmentsResponse(
  raw: unknown
): { data: ProjectContractAmendment[] } {
  if (!raw || typeof raw !== 'object') {
    return { data: [] }
  }

  const candidate = 'data' in raw
    ? (raw as { data: unknown }).data
    : raw

  if (!Array.isArray(candidate)) {
    return { data: [] }
  }

  const validated = candidate.map((item) => {
    const result = projectContractAmendmentSchema.safeParse(item)
    return result.success ? (result.data as ProjectContractAmendment) : (item as ProjectContractAmendment)
  })

  return { data: validated }
}
