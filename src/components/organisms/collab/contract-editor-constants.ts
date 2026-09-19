import type { Project, ProjectContract, ProjectMember } from '@/features/collab/model'
import type { ProjectContractDraftInput } from '@/features/collab/api'

export const SERVICE_PLANS = [
  { name: 'Platinum', baseFee: 1_300_000, scope: '12 publicaciones mensuales.' },
  { name: 'Oro', baseFee: 1_800_000, scope: '20 publicaciones mensuales y 1 video profesional.' },
  {
    name: 'Diamante',
    baseFee: 2_400_000,
    scope: '24 publicaciones mensuales, 1 video profesional y 10 fotografías de producto.',
  },
] as const

export const CIMA_PROVIDER = {
  name: 'CIMA — Centro de Innovación Multimedia y Artística',
  taxId: '901.763.191-0',
  representative: 'Annyul Vianney Moreno Ospina',
  representativeDocument: '1.032.413.946',
} as const

export const INDEPENDENT_PROVIDER = {
  name: 'Anderson Darley Giraldo Jutinico',
  taxId: '1.024.517.021',
} as const

export const formatMoney = (amount: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)

export function defaultDraft(project: Project, members: ProjectMember[]): ProjectContractDraftInput {
  const client = members.find((member) => member.role === 'client')
  return {
    provider_kind: 'cima',
    provider_name: CIMA_PROVIDER.name,
    provider_tax_id: CIMA_PROVIDER.taxId,
    provider_representative: CIMA_PROVIDER.representative,
    provider_representative_document: CIMA_PROVIDER.representativeDocument,
    client_kind: client?.client_kind ?? 'natural',
    client_name: client?.company_name || project.clientName,
    client_document: '',
    client_company_name: client?.company_name || '',
    client_tax_id: '',
    client_representative: '',
    client_representative_document: '',
    client_email: client?.email || '',
    client_phone: '',
    plan_name: SERVICE_PLANS[0].name,
    monthly_fee: Math.round(SERVICE_PLANS[0].baseFee * 1.19),
    currency: 'COP',
    tax_included: true,
    term_months: 6,
    service_scope: SERVICE_PLANS[0].scope,
    additional_terms: '',
    signature_city: 'Bogotá, D.C.',
  }
}

export function toDraft(contract: ProjectContract): ProjectContractDraftInput {
  return {
    provider_kind: contract.providerKind,
    provider_name: contract.providerName,
    provider_tax_id: contract.providerTaxId,
    provider_representative: contract.providerRepresentative,
    provider_representative_document: contract.providerRepresentativeDocument,
    client_kind: contract.clientKind,
    client_name: contract.clientName,
    client_document: contract.clientDocument,
    client_company_name: contract.clientCompanyName,
    client_tax_id: contract.clientTaxId,
    client_representative: contract.clientRepresentative,
    client_representative_document: contract.clientRepresentativeDocument,
    client_email: contract.clientEmail,
    client_phone: contract.clientPhone,
    plan_name: contract.planName,
    monthly_fee: contract.monthlyFee,
    currency: 'COP',
    tax_included: contract.taxIncluded,
    term_months: contract.termMonths,
    service_scope: contract.serviceScope,
    additional_terms: contract.additionalTerms,
    signature_city: contract.signatureCity,
  }
}
