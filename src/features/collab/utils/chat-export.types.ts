import type { MeResponse } from '@/shared/types'
import type { ProjectChatMessage, ProjectMember } from '@/features/collab/model'

export type ChatExportChannel = 'external' | 'internal' | 'both'
export type ChatExportFormat = 'txt' | 'json'

export interface ChatExportOptions {
  projectId: string
  projectName: string
  channel: ChatExportChannel
  format: ChatExportFormat
  members: ProjectMember[]
  issuer: MeResponse['data']
}

export interface ChatExportPayload {
  projectId: string
  projectName: string
  channel: ChatExportChannel
  exportedAt: string
  issuer: {
    userSub: string
    email: string
    fullName: string
    role: string
  }
  participants: Array<{
    userSub: string
    fullName: string
    email: string | null
    role: string
  }>
  messagesCount: number
  messages: ProjectChatMessage[]
  integritySha256?: string
}
