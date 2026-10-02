import type { ProjectContract, ProjectContractAmendment } from '@/features/collab/model'

export async function downloadSignedContractPdf(
  contract: ProjectContract,
  projectName: string
): Promise<void> {
  const { downloadSignedContractPdf: downloadFn } = await import('./contract-pdf')
  return downloadFn(contract, projectName)
}

export async function downloadSignedAmendmentPdf(
  amendment: ProjectContractAmendment,
  contract: ProjectContract,
  projectName: string
): Promise<void> {
  const { downloadSignedAmendmentPdf: downloadFn } = await import('./contract-pdf')
  return downloadFn(amendment, contract, projectName)
}
