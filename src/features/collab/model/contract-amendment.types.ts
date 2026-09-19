export type AmendmentType = 'services' | 'economic' | 'extension' | 'mixed'
export type AmendmentFeePaymentType = 'one_time' | 'monthly_recurring'

export type ProjectContractAmendment = {
  id: string
  contractId: string
  projectId: string
  amendmentNumber: number
  title: string
  amendmentType: AmendmentType
  status: 'draft' | 'pending_signature' | 'signed'
  serviceScope: string
  additionalFee: number
  feePaymentType: AmendmentFeePaymentType
  termMonthsExtension: number
  additionalTerms: string | null
  clientRequestNotes: string | null
  contentSnapshot: string | null
  contentHash: string | null
  preparedBySub: string
  requestedSignatureAt: string | null
  signedAt: string | null
  signedBySub: string | null
  signerName: string | null
  signatureDataUrl: string | null
  consentAcceptedAt: string | null
  signedIpAddress: string | null
  signedUserAgent: string | null
  signatureCity: string
  createdAt: string
  updatedAt: string
}

export type CreateAmendmentDraftInput = {
  title: string
  amendment_type: AmendmentType
  service_scope: string
  additional_fee: number
  fee_payment_type: AmendmentFeePaymentType
  term_months_extension: number
  additional_terms?: string | null
  signature_city?: string
  client_request_notes?: string | null
}

export type RequestClientAmendmentInput = {
  title: string
  description: string
}

export type SignAmendmentInput = {
  signer_name: string
  signature_data_url: string
  accept_terms: true
}
