import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { isHTTPError } from 'ky'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  DashboardBootstrapping,
  DashboardLoadError,
  DashboardMissingIdentity,
  DashboardRedirecting,
  DashboardTabSkeleton,
} from './dashboard-feedback'
import { useDashboardNavigation } from './use-dashboard-navigation'
import { warmDashboardChunks } from './dashboard-tab-preload'
import { useDashboardSidebar } from './use-dashboard-sidebar'
import { AppShell } from '@/components/templates/app-shell'
import { useSessionStore } from '@/app/session/session-store'
import { logoutRequest } from '@/features/auth/api'
import { useDashboardComposition } from '@/features/composition'
import { DashboardOverview } from '@/features/composition/ui'
import { useNotificationSync } from '@/features/collab/hooks'
import { InAppNotificationToastContainer } from '@/components/molecules/in-app-notification-toast'
import { getCurrentAvatarRequestOptional } from '@/shared/api'
import { pickAvatarUrl } from '@/shared/lib/avatar-utils'
import { getAccessTokenRole } from '@/shared/lib/access-token-role'
import type { DashboardTab } from '@/routes/-dashboard.search'

const CollabPanel = lazy(() =>
  import('@/features/collab/ui').then((m) => ({ default: m.CollabPanel }))
)
const NotificationsPanel = lazy(() =>
  import('@/features/collab/ui').then((m) => ({ default: m.NotificationsPanel }))
)
const MarketingPanel = lazy(() =>
  import('@/features/marketing').then((m) => ({ default: m.MarketingPanel }))
)
const DashboardAnalytics = lazy(() =>
  import('@/components/organisms/dashboard-analytics').then((m) => ({ default: m.DashboardAnalytics }))
)
const AdminConsole = lazy(() =>
  import('@/features/admin/ui').then((m) => ({ default: m.AdminConsole }))
)
const AccountPanel = lazy(() =>
  import('@/components/organisms/account-panel').then((m) => ({ default: m.AccountPanel }))
)

type Props = {
  tab?: DashboardTab
  project_id?: string
  workspace_tab?: 'board' | 'chat' | 'brief' | 'contract' | 'change-requests' | 'members'
  chat_channel?: 'internal' | 'external'
  chat_message_id?: string
  task_id?: string
}

export function DashboardPage({ tab, project_id, workspace_tab, chat_channel, chat_message_id, task_id }: Props) {
  const token = useSessionStore((s) => s.token)
  const bootstrapped = useSessionStore((s) => s.bootstrapped)
  const emailStored = useSessionStore((s) => s.email)
  const clearSession = useSessionStore((s) => s.clearSession)
  const {
    navigate,
    goTo,
    openNotificationTarget,
    openProject,
    closeProject,
    changeWorkspaceTab,
  } = useDashboardNavigation()
  const queryClient = useQueryClient()

  const dashboardQuery = useDashboardComposition(token, bootstrapped)
  const avatarQuery = useQuery({
    queryKey: ['media', 'avatar', 'current', token],
    queryFn: () => getCurrentAvatarRequestOptional(token!),
    enabled: bootstrapped && Boolean(token),
    retry: false,
  })
  const {
    unreadCount,
    activeToasts,
    dismissToast,
    handleOpenNotification,
  } = useNotificationSync({
    accessToken: bootstrapped && token ? token : null,
    onOpenTarget: (item) => {
      openNotificationTarget({
        projectId: item.project_id,
        channel: item.channel,
        resourceType: item.resource_type,
        resourceId: item.resource_id,
        messageId: item.message_id,
      })
    },
  })

  const isUnauthorized = dashboardQuery.isError && isHTTPError(dashboardQuery.error) && dashboardQuery.error.response.status === 401

  useEffect(() => {
    if (!bootstrapped || token) return
    navigate({ to: '/login', replace: true })
  }, [bootstrapped, token, navigate])

  useEffect(() => {
    const err = dashboardQuery.error
    if (!err || !isHTTPError(err)) return
    if (err.response.status === 401) {
      clearSession()
      queryClient.clear()
      navigate({ to: '/login', replace: true })
    }
  }, [dashboardQuery.error, clearSession, navigate, queryClient])

  useEffect(() => {
    if (!dashboardQuery.isSuccess || !dashboardQuery.data?.identity) return
    const role = dashboardQuery.data.identity.role
    const isClient = role === 'client'
    const fallbackTab: DashboardTab = isClient ? 'collab' : 'overview'

    if (
      (tab === 'overview' && isClient) ||
      (tab === 'admin' && role !== 'admin') ||
      ((tab === 'marketing' || tab === 'analytics') && role !== 'admin' && role !== 'worker')
    ) {
      navigate({ to: '/dashboard', search: (prev) => ({ ...prev, tab: fallbackTab }), replace: true })
    }
  }, [tab, dashboardQuery.isSuccess, dashboardQuery.data, navigate])

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const currentToken = useSessionStore.getState().token
      if (!currentToken) return
      try {
        await logoutRequest(currentToken)
      } catch {
        // ignore server logout failures when clearing local session
      }
    },
    onSettled: () => {
      clearSession()
      queryClient.clear()
      navigate({ to: '/login', replace: true })
    },
  })
  const handleOpenProfile = useCallback(() => goTo('account'), [goTo])
  const handleOpenNotifications = useCallback(() => goTo('notifications'), [goTo])
  const handleLogout = useCallback(() => { logoutMutation.mutate() }, [logoutMutation])
  const handleGoToLogin = useCallback(() => {
    clearSession()
    queryClient.clear()
    navigate({ to: '/login', replace: true })
  }, [clearSession, queryClient, navigate])

  const identity = dashboardQuery.data?.identity
  const projects = dashboardQuery.data?.projects
  const accessTokenRole = getAccessTokenRole(token)
  const hasRoleMismatch = Boolean(identity && accessTokenRole && identity.role !== accessTokenRole)
  const isAdmin = identity?.role === 'admin'
  const canUseMarketing = !hasRoleMismatch && (identity?.role === 'admin' || identity?.role === 'worker')
  const canViewOverview = !hasRoleMismatch && (identity?.role === 'admin' || identity?.role === 'worker')
  const defaultTab: DashboardTab = canViewOverview ? 'overview' : 'collab'

  const activeTab: DashboardTab = useMemo(() => {
    const currentTab = tab ?? defaultTab
    if (currentTab === 'overview' && !canViewOverview) return defaultTab
    if (currentTab === 'admin' && !isAdmin) return defaultTab
    if ((currentTab === 'marketing' || currentTab === 'analytics') && !canUseMarketing) return defaultTab
    return currentTab
  }, [tab, defaultTab, canViewOverview, isAdmin, canUseMarketing])

  const [visitedTabs, setVisitedTabs] = useState<Set<DashboardTab>>(() => new Set([activeTab]))
  const [prevActiveTab, setPrevActiveTab] = useState(activeTab)

  if (activeTab !== prevActiveTab) {
    setPrevActiveTab(activeTab)
    setVisitedTabs((prev) => (prev.has(activeTab) ? prev : new Set(prev).add(activeTab)))
  }

  useEffect(() => {
    if (!identity?.role) return
    warmDashboardChunks(identity.role)
  }, [identity?.role])

  const sidebarItems = useDashboardSidebar({
    activeTab,
    goTo,
    canViewOverview,
    canUseMarketing,
    isAdmin,
  })

  if (isUnauthorized) return <DashboardRedirecting />
  if (!bootstrapped || dashboardQuery.isPending || !token) return <DashboardBootstrapping />
  if (dashboardQuery.isError && !isHTTPError(dashboardQuery.error)) {
    return <DashboardLoadError error={dashboardQuery.error} onRetry={() => dashboardQuery.refetch()} />
  }
  if (!identity) {
    return <DashboardMissingIdentity onRetry={() => dashboardQuery.refetch()} onGoToLogin={handleGoToLogin} />
  }

  return (
    <AppShell
      title="CRM CIMA"
      sidebarItems={sidebarItems}
      userEmail={identity.email ?? emailStored ?? ''}
      userRole={identity.role}
      userAvatarUrl={pickAvatarUrl(avatarQuery.data?.data.urls, '64')}
      onOpenProfile={handleOpenProfile}
      onOpenNotifications={handleOpenNotifications}
      unreadNotificationsCount={unreadCount}
      onLogout={handleLogout}
      isLoggingOut={logoutMutation.isPending}
    >
      <InAppNotificationToastContainer
        toasts={activeToasts}
        onOpen={handleOpenNotification}
        onDismiss={dismissToast}
      />
      {hasRoleMismatch && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Tu sesión necesita actualizarse</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>Tu rol cambió desde que iniciaste sesión. Vuelve a iniciar sesión para aplicar los permisos actuales.</span>
            <Button variant="outline" size="sm" onClick={handleLogout} disabled={logoutMutation.isPending}>
              Actualizar sesión
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {visitedTabs.has('overview') && canViewOverview && (
        <div style={{ display: activeTab === 'overview' ? 'block' : 'none' }}>
          <DashboardOverview
            identity={identity}
            avatarUrl={pickAvatarUrl(avatarQuery.data?.data.urls, '64')}
            accessToken={token}
            projects={projects?.data}
            onOpenProfile={handleOpenProfile}
            onOpenProject={openProject}
            onOpenNotification={openNotificationTarget}
          />
        </div>
      )}
      <Suspense fallback={<DashboardTabSkeleton />}>
        {visitedTabs.has('collab') && (
          <div style={{ display: activeTab === 'collab' ? 'block' : 'none' }}>
            <CollabPanel
              accessToken={token}
              identity={identity}
              initialProjects={projects?.data}
              openProjectId={project_id}
              workspaceTab={workspace_tab}
              chatChannel={chat_channel}
              chatMessageId={chat_message_id}
              taskId={task_id}
              onOpenProject={openProject}
              onCloseProject={closeProject}
              onTabChange={changeWorkspaceTab}
            />
          </div>
        )}
        {visitedTabs.has('marketing') && canUseMarketing && (
          <div style={{ display: activeTab === 'marketing' ? 'block' : 'none' }}>
            <MarketingPanel accessToken={token} />
          </div>
        )}
        {visitedTabs.has('account') && (
          <div style={{ display: activeTab === 'account' ? 'block' : 'none' }}>
            <AccountPanel accessToken={token} identity={identity} />
          </div>
        )}
        {visitedTabs.has('notifications') && (
          <div style={{ display: activeTab === 'notifications' ? 'block' : 'none' }}>
            <NotificationsPanel
              accessToken={token}
              onOpenNotification={openNotificationTarget}
            />
          </div>
        )}
        {visitedTabs.has('admin') && isAdmin && (
          <div style={{ display: activeTab === 'admin' ? 'block' : 'none' }}>
            <AdminConsole accessToken={token} />
          </div>
        )}
        {visitedTabs.has('analytics') && canUseMarketing && (
          <div style={{ display: activeTab === 'analytics' ? 'block' : 'none' }}>
            <DashboardAnalytics accessToken={token} />
          </div>
        )}
      </Suspense>
    </AppShell>
  )
}
