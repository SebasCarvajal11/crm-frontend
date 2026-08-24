import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo } from 'react'
import { isHTTPError } from 'ky'
import { BarChart3, KanbanSquare, Megaphone, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { AppShell } from '@/components/templates/app-shell'
import { useSessionStore } from '@/app/session/session-store'
import { logoutRequest } from '@/features/auth/api'
import { AccountPanel } from '@/features/auth/ui'
import { AdminConsole } from '@/features/admin/ui'
import { useDashboardComposition } from '@/features/composition'
import { DashboardOverview } from '@/features/composition/ui'
import { CollabPanel, NotificationsPanel } from '@/features/collab/ui'
import { MarketingPanel } from '@/features/marketing'
import { getCurrentAvatarRequestOptional } from '@/shared/api'
import { pickAvatarUrl } from '@/shared/lib/avatar-utils'
import type { DashboardTab } from '@/routes/-dashboard.search'

type Props = {
  tab?: DashboardTab
  project_id?: string
  workspace_tab?: 'board' | 'chat' | 'brief' | 'members'
  chat_channel?: 'internal' | 'external'
  chat_message_id?: string
}

export function DashboardPage({ tab, project_id, workspace_tab, chat_channel, chat_message_id }: Props) {
  const token = useSessionStore((s) => s.token)
  const bootstrapped = useSessionStore((s) => s.bootstrapped)
  const emailStored = useSessionStore((s) => s.email)
  const clearSession = useSessionStore((s) => s.clearSession)
  const navigate = useNavigate({ from: '/dashboard' })
  const queryClient = useQueryClient()

  const dashboardQuery = useDashboardComposition(token, bootstrapped)
  const avatarQuery = useQuery({
    queryKey: ['media', 'avatar', 'current', token],
    queryFn: () => getCurrentAvatarRequestOptional(token!),
    enabled: bootstrapped && Boolean(token),
    retry: false,
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
    if (tab === 'admin' && dashboardQuery.data?.identity?.role !== 'admin') {
      navigate({ to: '/dashboard', search: (prev) => ({ ...prev, tab: 'overview' }), replace: true })
    }
  }, [tab, dashboardQuery.data, navigate])

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

  const goTo = useCallback(
    (next: DashboardTab) => {
      navigate({
        to: '/dashboard',
        search: (prev) => ({
          ...prev,
          tab: next,
          ...(next === 'collab'
            ? {}
            : {
                project_id: undefined,
                workspace_tab: undefined,
                chat_channel: undefined,
                chat_message_id: undefined,
              }),
        }),
        replace: true,
      })
    },
    [navigate],
  )

  const goToMention = useCallback(
    (payload: { projectId: string; channel: 'internal' | 'external' | 'system'; messageId: string }) => {
      navigate({
        to: '/dashboard',
        search: (prev) => ({
          ...prev,
          tab: 'collab',
          project_id: payload.projectId,
          workspace_tab: 'chat',
          chat_channel: payload.channel === 'internal' ? 'internal' : 'external',
          chat_message_id: payload.messageId,
        }),
        replace: true,
      })
    },
    [navigate],
  )

  const openProject = useCallback(
    (projectId: string) => {
      navigate({
        to: '/dashboard',
        search: (prev) => ({ ...prev, tab: 'collab', project_id: projectId, workspace_tab: 'board' }),
        replace: true,
      })
    },
    [navigate],
  )

  const closeProject = useCallback(() => {
    navigate({
      to: '/dashboard',
      search: (prev) => ({ ...prev, project_id: undefined, workspace_tab: undefined, chat_channel: undefined, chat_message_id: undefined }),
      replace: true,
    })
  }, [navigate])

  const changeWorkspaceTab = useCallback(
    (workspaceTab: 'board' | 'chat' | 'brief' | 'members') => {
      navigate({
        to: '/dashboard',
        search: (prev) => ({ ...prev, workspace_tab: workspaceTab }),
        replace: true,
      })
    },
    [navigate],
  )

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
  const isAdmin = identity?.role === 'admin'
  const activeTab: DashboardTab = useMemo(() => {
    const currentTab = tab ?? 'overview'
    if (currentTab === 'admin' && !isAdmin) return 'overview'
    return currentTab
  }, [tab, isAdmin])

  const sidebarItems = useMemo(
    () => [
      { key: 'overview', label: 'Resumen', icon: <BarChart3 className="size-4" />, onClick: () => goTo('overview'), isActive: activeTab === 'overview' },
      { key: 'collab', label: 'Colaboración', icon: <KanbanSquare className="size-4" />, onClick: () => goTo('collab'), isActive: activeTab === 'collab' },
      { key: 'marketing', label: 'Marketing', icon: <Megaphone className="size-4" />, onClick: () => goTo('marketing'), isActive: activeTab === 'marketing' },
      { key: 'admin', label: 'Administración', icon: <ShieldCheck className="size-4" />, onClick: () => goTo('admin'), isActive: activeTab === 'admin', hidden: !isAdmin },
    ],
    [activeTab, goTo, isAdmin],
  )

  if (isUnauthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4" role="status" aria-live="polite">
        <p className="text-sm text-muted-foreground">Redirigiendo al inicio de sesión…</p>
      </div>
    )
  }

  if (!bootstrapped || dashboardQuery.isPending || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4" role="status" aria-live="polite" aria-busy="true">
        <div className="w-full max-w-sm space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <p className="text-sm text-muted-foreground text-center">Comprobando sesión…</p>
        </div>
      </div>
    )
  }

  if (dashboardQuery.isError && !isHTTPError(dashboardQuery.error)) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-sm space-y-4">
          <Alert variant="destructive">
            <AlertTitle>No se pudo cargar tu perfil</AlertTitle>
            <AlertDescription>
              {dashboardQuery.error instanceof Error
                ? dashboardQuery.error.message
                : 'Ocurrió un error inesperado al validar tu sesión.'}
            </AlertDescription>
          </Alert>
          <Button variant="outline" className="w-full" onClick={() => dashboardQuery.refetch()}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  if (!identity) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-sm space-y-4">
          <Alert variant="destructive"><AlertTitle>No se pudo cargar tu identidad</AlertTitle><AlertDescription>La sesión no trajo información de usuario. Reintenta o vuelve a iniciar sesión.</AlertDescription></Alert>
          <Button variant="outline" className="w-full" onClick={() => dashboardQuery.refetch()}>Reintentar</Button>
          <Button className="w-full" onClick={handleGoToLogin}>Ir al login</Button>
        </div>
      </div>
    )
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
      onLogout={handleLogout}
      isLoggingOut={logoutMutation.isPending}
    >
      {activeTab === 'overview' && <DashboardOverview identity={identity} />}
      {activeTab === 'collab' && <CollabPanel accessToken={token} identity={identity} initialProjects={projects?.data} openProjectId={project_id} workspaceTab={workspace_tab} chatChannel={chat_channel} chatMessageId={chat_message_id} onOpenProject={openProject} onCloseProject={closeProject} onTabChange={changeWorkspaceTab} />}
      {activeTab === 'marketing' && <MarketingPanel accessToken={token} />}
      {activeTab === 'account' && <AccountPanel accessToken={token} identity={identity} />}
      {activeTab === 'notifications' && <NotificationsPanel accessToken={token} onOpenNotification={goToMention} />}
      {activeTab === 'admin' && isAdmin && <AdminConsole accessToken={token} />}
    </AppShell>
  )
}


