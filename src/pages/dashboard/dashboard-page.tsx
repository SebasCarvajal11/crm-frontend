import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo } from 'react'
import { isHTTPError } from 'ky'
import { BarChart3, KanbanSquare, ChartAreaIcon, Megaphone, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  DashboardBootstrapping,
  DashboardLoadError,
  DashboardMissingIdentity,
  DashboardRedirecting,
} from './dashboard-feedback'
import { useDashboardNavigation } from './use-dashboard-navigation'
import { AppShell } from '@/components/templates/app-shell'
import { useSessionStore } from '@/app/session/session-store'
import { logoutRequest } from '@/features/auth/api'
import { AccountPanel } from '@/features/auth/ui'
import { AdminConsole } from '@/features/admin/ui'
import { useDashboardComposition } from '@/features/composition'
import { DashboardOverview } from '@/features/composition/ui'
import { CollabPanel, NotificationsPanel } from '@/features/collab/ui'
import { countUnreadNotificationsRequest } from '@/features/collab/api'
import { collabKeys } from '@/features/collab/model'
import { MarketingPanel } from '@/features/marketing'
import { getCurrentAvatarRequestOptional } from '@/shared/api'
import { pickAvatarUrl } from '@/shared/lib/avatar-utils'
import { getAccessTokenRole } from '@/shared/lib/access-token-role'
import type { DashboardTab } from '@/routes/-dashboard.search'
import { DashboardAnalytics} from '@/components/organisms/dashboard-analytics'

type Props = {
  tab?: DashboardTab
  project_id?: string
  workspace_tab?: 'board' | 'chat' | 'brief' | 'contract' | 'members'
  chat_channel?: 'internal' | 'external'
  chat_message_id?: string
}

export function DashboardPage({ tab, project_id, workspace_tab, chat_channel, chat_message_id }: Props) {
  const token = useSessionStore((s) => s.token)
  const bootstrapped = useSessionStore((s) => s.bootstrapped)
  const emailStored = useSessionStore((s) => s.email)
  const clearSession = useSessionStore((s) => s.clearSession)
  const {
    navigate,
    goTo,
    goToMention,
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
  const unreadNotificationsQuery = useQuery({
    queryKey: collabKeys.notificationsCount(),
    queryFn: () => countUnreadNotificationsRequest(token!),
    enabled: bootstrapped && Boolean(token),
    refetchInterval: 20_000,
    select: (response) => response.data.unread_count,
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

  const sidebarItems = useMemo(
    () => [
      {
        key: 'overview',
        label: 'Resumen',
        icon: <BarChart3 className="size-4" />,
        onClick: () => goTo('overview'),
        isActive: activeTab === 'overview',
        hidden: !canViewOverview,
      },
      {
        key: 'collab',
        label: 'Colaboración',
        icon: <KanbanSquare className="size-4" />,
        onClick: () => goTo('collab'),
        isActive: activeTab === 'collab',
      },
      {
        key: 'marketing',
        label: 'Marketing',
        icon: <Megaphone className="size-4" />,
        onClick: () => goTo('marketing'),
        isActive: activeTab === 'marketing',
        hidden: !canUseMarketing,
      },
      {
        key: 'analytics',
        label: 'Analítica',
        icon: <ChartAreaIcon className="size-4" />,
        onClick: () => goTo('analytics'),
        isActive: activeTab === 'analytics',
        hidden: !canUseMarketing,
      },
      {
        key: 'admin',
        label: 'Administración',
        icon: <ShieldCheck className="size-4" />,
        onClick: () => goTo('admin'),
        isActive: activeTab === 'admin',
        hidden: !isAdmin,
      },
    ],
    [activeTab, goTo, canViewOverview, canUseMarketing, isAdmin],
  )

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
      unreadNotificationsCount={unreadNotificationsQuery.data ?? 0}
      onLogout={handleLogout}
      isLoggingOut={logoutMutation.isPending}
    >
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
      {activeTab === 'overview' && canViewOverview && (
        <DashboardOverview
          identity={identity}
          avatarUrl={pickAvatarUrl(avatarQuery.data?.data.urls, '64')}
          accessToken={token}
          projects={projects?.data}
          onOpenProfile={handleOpenProfile}
          onOpenProject={openProject}
          onOpenNotification={goToMention}
        />
      )}
      {activeTab === 'collab' && (
        <CollabPanel
          accessToken={token}
          identity={identity}
          initialProjects={projects?.data}
          openProjectId={project_id}
          workspaceTab={workspace_tab}
          chatChannel={chat_channel}
          chatMessageId={chat_message_id}
          onOpenProject={openProject}
          onCloseProject={closeProject}
          onTabChange={changeWorkspaceTab}
        />
      )}
      {activeTab === 'marketing' && canUseMarketing && <MarketingPanel accessToken={token} />}
      {activeTab === 'account' && <AccountPanel accessToken={token} identity={identity} />}
      {activeTab === 'notifications' && <NotificationsPanel accessToken={token} onOpenNotification={goToMention} />}
      {activeTab === 'admin' && isAdmin && <AdminConsole accessToken={token} />}
      {activeTab === 'analytics' && canUseMarketing && <DashboardAnalytics accessToken={token} />}
    </AppShell>
  )
}
