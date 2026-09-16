import type { MeResponse } from '@/features/auth/model'
import type { ProjectListItem } from '@/features/collab/model'
import type { WorkspaceTab } from '@/pages/dashboard/use-dashboard-navigation'
import {
  useOverviewCollab,
  useOverviewMarketing,
  useOverviewNotifications,
  useOverviewRecentClients,
} from '@/features/overview/hooks'
import {
  OverviewAdminBlockedTasksSection,
  OverviewAdminClientRankingSection,
  OverviewAdminPendingChangeRequestsSection,
  OverviewAdminRecentClientsSection,
  OverviewAdminRecentProjectsSection,
  OverviewAdminWorkloadSection,
  OverviewIdentityCard,
  OverviewMarketingKpisSection,
  OverviewNotificationsSection,
  OverviewWorkerPendingTasksSection,
} from '@/features/overview/ui'

type OpenNotificationPayload = {
  projectId: string
  channel: 'internal' | 'external' | 'system'
  messageId?: string | null
}

type DashboardOverviewProps = {
  identity: MeResponse['data']
  avatarUrl?: string | null
  accessToken: string
  projects?: ProjectListItem[]
  onOpenProfile?: () => void
  onOpenProject?: (projectId: string, tab?: WorkspaceTab) => void
  onOpenNotification?: (payload: OpenNotificationPayload) => void
}

function displayFirstName(identity: MeResponse['data']) {
  if (identity.first_name) return identity.first_name
  const local = identity.email.split('@')[0] ?? ''
  const cleaned = local.replace(/[._-]+/g, ' ').trim()
  if (!cleaned) return identity.email
  return cleaned
    .split(' ')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ')
}

export function DashboardOverview({
  identity,
  avatarUrl,
  accessToken,
  projects = [],
  onOpenProfile,
  onOpenProject,
  onOpenNotification,
}: DashboardOverviewProps) {
  const firstName = displayFirstName(identity)
  const isAdmin = identity.role === 'admin'
  const isWorker = identity.role === 'worker'

  const { notifications, isLoading: isNotifLoading, handleOpen } = useOverviewNotifications(
    accessToken,
    onOpenNotification
  )

  const { metrics, isLoading: isMarketingLoading } = useOverviewMarketing(accessToken)

  const {
    isLoading: isCollabLoading,
    workerPendingTasks,
    adminBlockedTasks,
    adminWorkerWorkload,
    adminClientRanking,
    adminRecentProjects,
    adminPendingChangeRequests,
    isAdminPendingChangeRequestsLoading,
  } = useOverviewCollab({
    accessToken,
    projects,
    role: identity.role,
    userSub: identity.id,
  })

  const recentClientsQ = useOverviewRecentClients(accessToken, isAdmin)

  return (
    <div className="space-y-6">
      <div className="space-y-1 animate-fade-up">
        <p className="text-2xl font-medium text-muted-foreground sm:text-3xl">
          Hola <span className="font-black text-primary">{firstName}</span>
        </p>
        <p className="text-2xl font-medium text-muted-foreground sm:text-3xl">
          Bienvenido a{' '}
          <span className="font-black tracking-tight text-foreground">
            CIMA<span className="text-muted-foreground/70">XIS</span>
          </span>
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 animate-fade-up stagger-1">
        <OverviewIdentityCard
          identity={identity}
          avatarUrl={avatarUrl}
          onOpenProfile={onOpenProfile}
        />
        <OverviewNotificationsSection
          notifications={notifications}
          isLoading={isNotifLoading}
          onOpen={handleOpen}
        />
      </div>

      <div className="animate-fade-up stagger-2">
        <OverviewMarketingKpisSection
          metrics={metrics}
          isLoading={isMarketingLoading}
        />
      </div>

      {isWorker && (
        <div className="animate-fade-up stagger-3">
          <OverviewWorkerPendingTasksSection
            tasks={workerPendingTasks}
            isLoading={isCollabLoading}
            onOpenProject={onOpenProject}
          />
        </div>
      )}

      {isAdmin && (
        <div className="space-y-6 animate-fade-up stagger-3">
          <OverviewAdminPendingChangeRequestsSection
            items={adminPendingChangeRequests}
            isLoading={isAdminPendingChangeRequestsLoading}
            onOpenProject={(projectId) => onOpenProject?.(projectId, 'change-requests')}
          />

          <OverviewAdminBlockedTasksSection
            tasks={adminBlockedTasks}
            isLoading={isCollabLoading}
            onOpenProject={onOpenProject}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <OverviewAdminRecentProjectsSection
              projects={adminRecentProjects}
              isLoading={isCollabLoading}
              onOpenProject={onOpenProject}
            />
            <OverviewAdminRecentClientsSection
              clients={recentClientsQ.data ?? []}
              isLoading={recentClientsQ.isLoading}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <OverviewAdminWorkloadSection
              workload={adminWorkerWorkload}
              isLoading={isCollabLoading}
            />
            <OverviewAdminClientRankingSection
              items={adminClientRanking}
              isLoading={isCollabLoading}
            />
          </div>
        </div>
      )}
    </div>
  )
}
