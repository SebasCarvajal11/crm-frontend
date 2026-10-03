import type { MeResponse } from '@/features/auth/model'
import { BarChart3 } from 'lucide-react'
import { CimaLogo } from '@/components/ui/cima-logo'
import { PageHeader } from '@/components/molecules/page-header'
import { cn } from '@/shared/lib/utils'
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
          actions={
            <div
              className={cn(
                "flex items-center gap-2 rounded-full border border-emerald-500/25",
                "bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold",
                "text-emerald-700 dark:text-emerald-400 shadow-2xs"
              )}
            >
              <span className="relative flex size-2 shrink-0">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"
                />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span>Sistema Operativo • Conectado</span>
            </div>
          }
        />
      </div>

      <div
        className={cn(
          "grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]",
          "animate-fade-up stagger-1 min-w-0 w-full max-w-full items-stretch"
        )}
      >
        <div data-tour="overview-identity" className="min-w-0 w-full max-w-full h-full">
          <OverviewIdentityCard
            identity={identity}
            avatarUrl={avatarUrl}
            onOpenProfile={onOpenProfile}
          />
        </div>
        <div data-tour="overview-notifications" className="min-w-0 w-full max-w-full h-full">
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
        <div className="space-y-6 min-w-0 w-full max-w-full">
          {/* Zona de Triaje Operativo / Atención Inmediata */}
          <div
            className={cn(
              "grid gap-6 lg:grid-cols-2 min-w-0 w-full max-w-full items-stretch",
              "animate-fade-up stagger-3"
            )}
          >
            <div data-tour="overview-admin-changes" className="min-w-0 w-full max-w-full h-full">
              <OverviewAdminPendingChangeRequestsSection
                items={adminPendingChangeRequests}
                isLoading={isAdminPendingChangeRequestsLoading}
                onOpenProject={(projectId) => onOpenProject?.(projectId, 'change-requests')}
              />
            </div>

            <div data-tour="overview-admin-blocked" className="min-w-0 w-full max-w-full h-full">
              <OverviewAdminBlockedTasksSection
                tasks={adminBlockedTasks}
                isLoading={isCollabLoading}
                onOpenProject={onOpenProject}
              />
            </div>
          </div>

          {/* Matriz de Actividad Reciente */}
          <div
            className={cn(
              "grid gap-6 lg:grid-cols-2 min-w-0 w-full max-w-full items-stretch",
              "animate-fade-up stagger-4"
            )}
          >
            <div data-tour="overview-recent-projects" className="min-w-0 w-full max-w-full h-full">
              <OverviewAdminRecentProjectsSection
                projects={adminRecentProjects}
                isLoading={isCollabLoading}
                onOpenProject={onOpenProject}
              />
            </div>
            <div data-tour="overview-admin-clients" className="min-w-0 w-full max-w-full h-full">
              <OverviewAdminRecentClientsSection
                clients={recentClientsQ.data ?? []}
                isLoading={recentClientsQ.isLoading}
              />
            </div>
          </div>

          {/* Matriz de Capacidad y Cartera */}
          <div
            className={cn(
              "grid gap-6 lg:grid-cols-2 min-w-0 w-full max-w-full items-stretch",
              "animate-fade-up stagger-4"
            )}
          >
            <div data-tour="overview-admin-workload" className="min-w-0 w-full max-w-full h-full">
              <OverviewAdminWorkloadSection
                workload={adminWorkerWorkload}
                isLoading={isCollabLoading}
              />
            </div>
            <div data-tour="overview-admin-ranking" className="min-w-0 w-full max-w-full h-full">
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
