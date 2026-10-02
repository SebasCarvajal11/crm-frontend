import type { MeResponse } from '@/features/auth/model'
import { BarChart3 } from 'lucide-react'
import { CimaLogo } from '@/components/ui/cima-logo'
import { PageHeader } from '@/components/molecules/page-header'
import type { ProjectListItem } from '@/features/collab/model'
import type { WorkspaceTab } from '@/pages/dashboard/use-dashboard-navigation'
import '@/features/overview/ui/overview.css'
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
    <div className="overview-stage space-y-8 w-full max-w-full overflow-x-clip min-w-0">
      <div data-tour="overview-header" className="animate-fade-up">
        <PageHeader
          eyebrow={
            <>
              Hola <span className="font-black text-primary">{firstName}</span>
            </>
          }
          title={
            <span className="flex flex-wrap items-center gap-x-3 gap-y-2 font-medium text-muted-foreground">
              Bienvenido a{' '}
              <CimaLogo variant="cimaxis" width={180} />
            </span>
          }
          description="Resumen ejecutivo y monitoreo en tiempo real de cuentas, proyectos y actividades."
          icon={BarChart3}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] animate-fade-up stagger-1 min-w-0 w-full max-w-full">
        <div data-tour="overview-identity" className="min-w-0 w-full max-w-full">
          <OverviewIdentityCard
            identity={identity}
            avatarUrl={avatarUrl}
            onOpenProfile={onOpenProfile}
          />
        </div>
        <div data-tour="overview-notifications" className="min-w-0 w-full max-w-full">
          <OverviewNotificationsSection
            notifications={notifications}
            isLoading={isNotifLoading}
            onOpen={handleOpen}
          />
        </div>
      </div>

      <div className="animate-fade-up stagger-2 min-w-0 w-full max-w-full" data-tour="overview-kpis">
        <OverviewMarketingKpisSection
          metrics={metrics}
          isLoading={isMarketingLoading}
        />
      </div>

      {isWorker && (
        <div className="animate-fade-up stagger-3 min-w-0 w-full max-w-full" data-tour="overview-worker-tasks">
          <OverviewWorkerPendingTasksSection
            tasks={workerPendingTasks}
            isLoading={isCollabLoading}
            onOpenProject={onOpenProject}
          />
        </div>
      )}

      {isAdmin && (
        <div className="space-y-8 animate-fade-up stagger-3 min-w-0 w-full max-w-full">
          <div data-tour="overview-admin-changes" className="min-w-0 w-full max-w-full">
            <OverviewAdminPendingChangeRequestsSection
              items={adminPendingChangeRequests}
              isLoading={isAdminPendingChangeRequestsLoading}
              onOpenProject={(projectId) => onOpenProject?.(projectId, 'change-requests')}
            />
          </div>

          <div data-tour="overview-admin-blocked" className="min-w-0 w-full max-w-full">
            <OverviewAdminBlockedTasksSection
              tasks={adminBlockedTasks}
              isLoading={isCollabLoading}
              onOpenProject={onOpenProject}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2 min-w-0 w-full max-w-full">
            <div data-tour="overview-recent-projects" className="min-w-0 w-full max-w-full">
              <OverviewAdminRecentProjectsSection
                projects={adminRecentProjects}
                isLoading={isCollabLoading}
                onOpenProject={onOpenProject}
              />
            </div>
            <div data-tour="overview-admin-clients" className="min-w-0 w-full max-w-full">
              <OverviewAdminRecentClientsSection
                clients={recentClientsQ.data ?? []}
                isLoading={recentClientsQ.isLoading}
              />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2 min-w-0 w-full max-w-full">
            <div data-tour="overview-admin-workload" className="min-w-0 w-full max-w-full">
              <OverviewAdminWorkloadSection
                workload={adminWorkerWorkload}
                isLoading={isCollabLoading}
              />
            </div>
            <div data-tour="overview-admin-ranking" className="min-w-0 w-full max-w-full">
              <OverviewAdminClientRankingSection
                items={adminClientRanking}
                isLoading={isCollabLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
