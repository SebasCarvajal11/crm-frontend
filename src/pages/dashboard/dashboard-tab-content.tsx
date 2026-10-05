import { lazy, Suspense } from 'react'
import { DashboardOverview } from '@/features/composition/ui'
import { DashboardTabSkeleton } from './dashboard-feedback'
import type { DashboardTab } from '@/routes/-dashboard.search'
import type { MeResponse } from '@/shared/types'
import type { ProjectListItem } from '@/features/collab/model'
import type { MentionPayload } from './use-dashboard-navigation'

const CollabPanel = lazy(() => import('@/features/collab/ui').then((m) => ({ default: m.CollabPanel })))
const NotificationsPanel = lazy(() => import('@/features/collab/ui').then((m) => ({ default: m.NotificationsPanel })))
const MarketingPanel = lazy(() => import('@/features/marketing').then((m) => ({ default: m.MarketingPanel })))
const DashboardAnalytics = lazy(() =>
  import('@/components/organisms/dashboard-analytics').then((m) => ({ default: m.DashboardAnalytics })),
)
const AdminConsole = lazy(() => import('@/features/admin/ui').then((m) => ({ default: m.AdminConsole })))
const AccountPanel = lazy(() => import('@/components/organisms/account-panel').then((m) => ({ default: m.AccountPanel })))

type DashboardTabContentProps = {
  activeTab: DashboardTab
  canViewOverview: boolean
  canUseMarketing: boolean
  isAdmin: boolean
  identity: MeResponse['data']
  avatarUrl?: string | null
  token: string
  projects?: ProjectListItem[]
  project_id?: string
  workspace_tab?: 'board' | 'chat' | 'brief' | 'contract' | 'change-requests' | 'members'
  chat_channel?: 'internal' | 'external'
  chat_message_id?: string
  task_id?: string
  onOpenProfile: () => void
  onOpenProject: (projectId: string) => void
  onCloseProject: () => void
  onOpenNotification: (item: MentionPayload) => void
  onWorkspaceTabChange: (tab: 'board' | 'chat' | 'brief' | 'contract' | 'change-requests' | 'members') => void
}

export function DashboardTabContent({
  activeTab,
  canViewOverview,
  canUseMarketing,
  isAdmin,
  identity,
  avatarUrl,
  token,
  projects,
  project_id,
  workspace_tab,
  chat_channel,
  chat_message_id,
  task_id,
  onOpenProfile,
  onOpenProject,
  onCloseProject,
  onOpenNotification,
  onWorkspaceTabChange,
}: DashboardTabContentProps) {
  return (
    <>
      {activeTab === 'overview' && canViewOverview && (
        <div className="tab-pane-transition">
          <DashboardOverview
            identity={identity}
            avatarUrl={avatarUrl}
            accessToken={token}
            projects={projects}
            onOpenProfile={onOpenProfile}
            onOpenProject={onOpenProject}
            onOpenNotification={onOpenNotification}
          />
        </div>
      )}
      <Suspense fallback={<DashboardTabSkeleton />}>
        {activeTab === 'collab' && (
          <div className="tab-pane-transition flex-1 min-h-0 flex flex-col h-full w-full">
            <CollabPanel
              accessToken={token}
              identity={identity}
              initialProjects={projects}
              openProjectId={project_id}
              workspaceTab={workspace_tab}
              chatChannel={chat_channel}
              chatMessageId={chat_message_id}
              taskId={task_id}
              onOpenProject={onOpenProject}
              onCloseProject={onCloseProject}
              onTabChange={onWorkspaceTabChange}
            />
          </div>
        )}
        {activeTab === 'marketing' && canUseMarketing && (
          <div className="tab-pane-transition">
            <MarketingPanel accessToken={token} />
          </div>
        )}
        {activeTab === 'account' && (
          <div className="tab-pane-transition">
            <AccountPanel accessToken={token} identity={identity} />
          </div>
        )}
        {activeTab === 'notifications' && (
          <div className="tab-pane-transition">
            <NotificationsPanel
              accessToken={token}
              onOpenNotification={onOpenNotification}
            />
          </div>
        )}
        {activeTab === 'admin' && isAdmin && (
          <div className="tab-pane-transition">
            <AdminConsole accessToken={token} />
          </div>
        )}
        {activeTab === 'analytics' && canUseMarketing && (
          <div className="tab-pane-transition">
            <DashboardAnalytics accessToken={token} />
          </div>
        )}
      </Suspense>
    </>
  )
}
