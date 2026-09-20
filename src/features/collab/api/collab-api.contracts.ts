import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { PROJECT_ROUTES } from '@/shared/lib/gateway-routes'
import type {
  CreateAmendmentDraftInput,
  DataResponse,
  ProjectContract,
  ProjectContractAmendment,
  RequestClientAmendmentInput,
  SignAmendmentInput,
} from '@/features/collab/model'

export type ProjectContractDraftInput = {
  provider_kind: 'cima' | 'independent'
  provider_name: string
  provider_tax_id?: string | null
  provider_representative?: string | null
  provider_representative_document?: string | null
  client_kind: 'natural' | 'juridical'
  client_name: string
  client_document?: string | null
  client_company_name?: string | null
  client_tax_id?: string | null
  client_representative?: string | null
  client_representative_document?: string | null
  client_email: string
  client_phone?: string | null
  plan_name: string
  monthly_fee: number
  currency: 'COP'
  tax_included: boolean
  term_months: number
  service_scope: string
  additional_terms?: string | null
  signature_city: string
}

export async function getProjectContractRequest(
  accessToken: string,
  projectId: string
): Promise<DataResponse<ProjectContract | null>> {
  return api
    .get(PROJECT_ROUTES.contract(projectId), { headers: bearer(accessToken) })
    .json<DataResponse<ProjectContract | null>>()
}

export async function saveProjectContractDraftRequest(
  accessToken: string,
  projectId: string,
  body: ProjectContractDraftInput
): Promise<DataResponse<ProjectContract>> {
  return api
    .put(PROJECT_ROUTES.contract(projectId), { headers: bearer(accessToken), json: body })
    .json<DataResponse<ProjectContract>>()
}

export async function requestProjectContractSignatureRequest(
  accessToken: string,
  projectId: string
): Promise<DataResponse<ProjectContract>> {
  return api
    .post(PROJECT_ROUTES.contractRequestSignature(projectId), {
      headers: bearer(accessToken),
      json: {},
    })
    .json<DataResponse<ProjectContract>>()
}

export async function signProjectContractRequest(
  accessToken: string,
  projectId: string,
  body: { signer_name: string; signature_data_url: string; accept_terms: true }
): Promise<DataResponse<ProjectContract>> {
  return api
    .post(PROJECT_ROUTES.contractSign(projectId), { headers: bearer(accessToken), json: body })
    .json<DataResponse<ProjectContract>>()
}

export async function listProjectContractAmendmentsRequest(
  accessToken: string,
  projectId: string
): Promise<DataResponse<ProjectContractAmendment[]>> {
  return api
    .get(PROJECT_ROUTES.contractAmendments(projectId), { headers: bearer(accessToken) })
    .json<DataResponse<ProjectContractAmendment[]>>()
}

export async function saveProjectContractAmendmentDraftRequest(
  accessToken: string,
  projectId: string,
  body: CreateAmendmentDraftInput
): Promise<DataResponse<ProjectContractAmendment>> {
  return api
    .post(PROJECT_ROUTES.contractAmendments(projectId), { headers: bearer(accessToken), json: body })
    .json<DataResponse<ProjectContractAmendment>>()
}

export async function requestClientContractAmendmentRequest(
  accessToken: string,
  projectId: string,
  body: RequestClientAmendmentInput
): Promise<DataResponse<ProjectContractAmendment>> {
  return api
    .post(PROJECT_ROUTES.contractAmendmentsRequest(projectId), { headers: bearer(accessToken), json: body })
    .json<DataResponse<ProjectContractAmendment>>()
}

export async function requestProjectContractAmendmentSignatureRequest(
  accessToken: string,
  projectId: string,
  amendmentId: string
): Promise<DataResponse<ProjectContractAmendment>> {
  return api
    .post(PROJECT_ROUTES.contractAmendmentRequestSignature(projectId, amendmentId), {
      headers: bearer(accessToken),
      json: {},
    })
    .json<DataResponse<ProjectContractAmendment>>()
}

export async function signProjectContractAmendmentRequest(
  accessToken: string,
  projectId: string,
  amendmentId: string,
  body: SignAmendmentInput
): Promise<DataResponse<ProjectContractAmendment>> {
  return api
    .post(PROJECT_ROUTES.contractAmendmentSign(projectId, amendmentId), {
      headers: bearer(accessToken),
      json: body,
    })
    .json<DataResponse<ProjectContractAmendment>>()
}
