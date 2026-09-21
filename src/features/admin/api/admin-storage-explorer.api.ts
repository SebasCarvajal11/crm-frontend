import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { ADMIN_STORAGE_ROUTES } from '@/shared/lib/gateway-routes'

export interface StorageFileItem {
  id: string
  projectId: string
  projectName: string
  fileName: string
  title: string | null
  folder: string
  storagePath: string
  mimeType: string
  sizeBytes: number
  version: number
  isClientVisible: boolean
  isPurged: boolean
  purgedAt: string | null
  purgedReason: string | null
  createdByEmail: string | null
  createdAt: string
  taskId: string | null
  taskTitle: string | null
  isSignedContract: boolean
}

export interface StorageFolderSummary {
  folderKey: string
  folderLabel: string
  totalFiles: number
  totalBytes: number
  files: StorageFileItem[]
}

export interface StorageProjectSummary {
  projectId: string
  projectName: string
  projectType: string
  projectStatus: string
  isArchived: boolean
  totalFiles: number
  totalBytes: number
  folders: Record<string, StorageFolderSummary>
}

export interface StorageClientSummary {
  clientSub: string
  clientName: string
  totalFiles: number
  totalBytes: number
  projectsCount: number
  projects: StorageProjectSummary[]
}

export interface StorageGlobalSummary {
  totalClients: number
  totalProjects: number
  totalFiles: number
  totalBytes: number
  purgedFilesCount: number
  purgedBytes: number
}

export interface StorageTreeResponse {
  summary: StorageGlobalSummary
  clients: StorageClientSummary[]
}

export interface PurgeBatchInput {
  fileIds?: string[]
  projectId?: string
  folder?: string
  clientSub?: string
  onlyFinishedProjects?: boolean
  reason?: string
  forcePurgeSigned?: boolean
}

export interface PurgeResult {
  purgedCount: number
  freedBytes: number
  skippedSignedContractsCount: number
}

export async function fetchStorageTree(
  accessToken: string
): Promise<StorageTreeResponse> {
  const res = await api
    .get(ADMIN_STORAGE_ROUTES.tree, {
      headers: bearer(accessToken),
    })
    .json<{ data: StorageTreeResponse }>()
  return res.data
}

export async function purgeStorageFile(
  accessToken: string,
  fileId: string,
  reason = 'Depurado por administración para liberar espacio',
  forcePurgeSigned = false
): Promise<{ purged: boolean; freedBytes: number; fileId: string }> {
  const res = await api
    .delete(ADMIN_STORAGE_ROUTES.purgeFile(fileId), {
      headers: bearer(accessToken),
      json: { reason, forcePurgeSigned },
    })
    .json<{ data: { purged: boolean; freedBytes: number; fileId: string } }>()
  return res.data
}

export async function purgeStorageBatch(
  accessToken: string,
  input: PurgeBatchInput
): Promise<PurgeResult> {
  const res = await api
    .post(ADMIN_STORAGE_ROUTES.purgeBatch, {
      headers: bearer(accessToken),
      json: input,
    })
    .json<{ data: PurgeResult }>()
  return res.data
}
