import type { MeResponse } from '@/shared/types'
import type { ProjectListItem } from '@/features/collab/model'

export type WorkspaceTab =
  | 'board'
  | 'chat'
  | 'brief'
  | 'contract'
  | 'change-requests'
  | 'members'

export interface ProjectWorkspaceProps {
  accessToken: string
  identity: MeResponse['data']
  projectId: string
  projectMeta: ProjectListItem | null
  activeTab?: WorkspaceTab
  chatChannel?: 'internal' | 'external'
  chatMessageId?: string
  initialTaskId?: string
  onBack: () => void
  onTabChange: (tab: WorkspaceTab) => void
}

export const FINALIZATION_COLUMN_KEYS = new Set(['done', 'completed'])
