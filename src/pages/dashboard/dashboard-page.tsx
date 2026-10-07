import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { isHTTPError } from 'ky'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  DashboardBootstrapping,
  DashboardLoadError,
  DashboardMissingIdentity,
  DashboardRedirecting,
} from './dashboard-feedback'
import { useDashboardNavigation } from './use-dashboard-navigation'
import { useDashboardSidebar } from './use-dashboard-sidebar'
import { useScrollToTop } from './use-scroll-to-top'
import { AppShell } from '@/components/templates/app-shell'
import { useSessionStore } from '@/app/session/session-store'
import { logoutRequest } from '@/features/auth/api'
import { useDashboardComposition } from '@/features/composition'
import { useNotificationSync } from '@/features/collab/hooks'
import { InAppNotificationToastContainer } from '@/components/molecules/in-app-notification-toast'
import { getCurrentAvatarRequestOptional } from '@/shared/api'
import { pickAvatarUrl } from '@/shared/lib/avatar-utils'
import { getAccessTokenRole } from '@/shared/lib/access-token-role'
import { useTourStore } from '@/features/tour'
import { DashboardTabContent } from './dashboard-tab-content'
import type { DashboardTab } from '@/routes/-dashboard.search'

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
  const [avatarWarning, setAvatarWarning] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const val = window.sessionStorage.getItem('cima_avatar_warning')
      if (val) {
        window.sessionStorage.removeItem('cima_avatar_warning')
        return val
      }
    }
    return null
  })
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

  const isUnauthorized =
    dashboardQuery.isError && isHTTPError(dashboardQuery.error) && dashboardQuery.error.response.status === 401

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
  const handleOpenHelp = useCallback(() => { useTourStore.getState().openHelpCenter() }, [])
  const handleLogout = useCallback(() => { logoutMutation.mutate() }, [logoutMutation])
  const handleGoToLogin = useCallback(() => {
    clearSession(); queryClient.clear(); navigate({ to: '/login', replace: true })
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

  const isReady = Boolean(identity && !dashboardQuery.isPending)
  useScrollToTop(`${activeTab}-${isReady}`)

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
      userId={identity.id}
      userEmail={identity.email ?? emailStored ?? ''}
      userRole={identity.role}
      userAvatarUrl={pickAvatarUrl(avatarQuery.data?.data.urls, '64')}
      userAvatarColor={avatarQuery.data?.data.color}
      onOpenProfile={handleOpenProfile}
      onOpenNotifications={handleOpenNotifications}
      unreadNotificationsCount={unreadCount}
      onLogout={handleLogout}
      isLoggingOut={logoutMutation.isPending}
      onOpenHelp={handleOpenHelp}
    >
      <InAppNotificationToastContainer
        toasts={activeToasts}
        onOpen={handleOpenNotification}
        onDismiss={dismissToast}
      />
      {avatarWarning && (
        <Alert className="mb-6 border-amber-300/80 bg-amber-50/90 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertTitle className="font-semibold text-xs uppercase tracking-wider">Aviso sobre tu avatar</AlertTitle>
          <AlertDescription className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs">
            <span>{avatarWarning}</span>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setAvatarWarning(null)}
              className="h-7 text-xs border-amber-300 bg-white/80 text-amber-950 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-100 shrink-0"
            >
              Entendido
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {hasRoleMismatch && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Tu sesión necesita actualizarse</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Tu rol cambió desde que iniciaste sesión. Vuelve a iniciar sesión para aplicar los permisos actuales.
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout} disabled={logoutMutation.isPending}>
              Actualizar sesión
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <DashboardTabContent
        activeTab={activeTab}
        canViewOverview={canViewOverview}
        canUseMarketing={canUseMarketing}
        isAdmin={isAdmin}
        identity={identity}
        avatarUrl={pickAvatarUrl(avatarQuery.data?.data.urls, '64')}
        token={token}
        projects={projects?.data}
        project_id={project_id}
        workspace_tab={workspace_tab}
        chat_channel={chat_channel}
        chat_message_id={chat_message_id}
        task_id={task_id}
        onOpenProfile={handleOpenProfile}
        onOpenProject={openProject}
        onCloseProject={closeProject}
        onOpenNotification={openNotificationTarget}
        onWorkspaceTabChange={changeWorkspaceTab}
      />
    </AppShell>
  )
}
