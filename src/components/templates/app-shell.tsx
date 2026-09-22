import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/utils'
import type { SidebarItem } from './sidebar'
import { DesktopSidebar, MobileSidebar } from './sidebar'
import { BRAND_TEXTURES, useTextureLoaded } from '@/shared/lib/brand-textures'

export type { SidebarItem }

type AppShellProps = {
  title: string
  sidebarItems: SidebarItem[]
  userEmail: string
  userRole: string
  userAvatarUrl?: string | null
  onOpenProfile: () => void
  onOpenNotifications: () => void
  unreadNotificationsCount?: number
  onLogout: () => void
  isLoggingOut?: boolean
  headerExtras?: React.ReactNode
  children: React.ReactNode
  className?: string
}

const shellSidebarOffset = 'md:ml-64 lg:ml-72'
const collapsedSidebarOffset = 'md:ml-20'
const sidebarPreferenceKey = 'cima.sidebar.collapsed'

function readSidebarPreference() {
  try {
    return window.localStorage.getItem(sidebarPreferenceKey) === 'true'
  } catch {
    return false
  }
}

export function AppShell({
  title,
  sidebarItems,
  userEmail,
  userRole,
  userAvatarUrl,
  onOpenProfile,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  onLogout,
  isLoggingOut = false,
  headerExtras,
  children,
  className,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopCollapsed, setDesktopCollapsed] = useState(readSidebarPreference)
  const isTextureLoaded = useTextureLoaded(BRAND_TEXTURES.app)

  useEffect(() => {
    try {
      window.localStorage.setItem(sidebarPreferenceKey, String(desktopCollapsed))
    } catch {
      // La preferencia es opcional; el layout funciona aunque el navegador
      // no permita almacenamiento local.
    }
  }, [desktopCollapsed])

  return (
    <div className={cn('relative flex min-h-screen bg-background', className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center md:bg-fixed transition-opacity duration-300 ease-out"
        style={{
          backgroundImage: `url(${BRAND_TEXTURES.app})`,
          opacity: isTextureLoaded ? 1 : 0,
        }}
      />
      <div className="relative z-10 flex min-h-screen w-full flex-1">
      <DesktopSidebar
        title={title}
        items={sidebarItems}
        userEmail={userEmail}
        userRole={userRole}
        userAvatarUrl={userAvatarUrl}
        onOpenProfile={onOpenProfile}
        onOpenNotifications={onOpenNotifications}
        unreadNotificationsCount={unreadNotificationsCount}
        onLogout={onLogout}
        isLoggingOut={isLoggingOut}
        headerExtras={headerExtras}
        collapsed={desktopCollapsed}
        onCollapsedChange={setDesktopCollapsed}
      />

      <MobileSidebar
        open={mobileOpen}
        setOpen={setMobileOpen}
        title={title}
        items={sidebarItems}
        userEmail={userEmail}
        userRole={userRole}
        userAvatarUrl={userAvatarUrl}
        onOpenProfile={onOpenProfile}
        onOpenNotifications={onOpenNotifications}
        unreadNotificationsCount={unreadNotificationsCount}
        onLogout={onLogout}
        isLoggingOut={isLoggingOut}
        headerExtras={headerExtras}
      />

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col transition-[margin] duration-200 ease-out',
          desktopCollapsed ? collapsedSidebarOffset : shellSidebarOffset,
        )}
      >
        <header
          className={cn(
            'sticky top-0 z-30 flex items-center justify-between gap-2 border-b',
            'bg-card/95 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur md:hidden'
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="size-5" />
          </Button>
          <span className="truncate text-sm font-black uppercase tracking-tight text-primary">{title}</span>
          <div className="flex min-w-0 items-center gap-2">
            {headerExtras}
            <span className="hidden max-w-[120px] truncate text-xs text-muted-foreground sm:inline">{userEmail}</span>
          </div>
        </header>

        <main
          className={cn(
            'min-w-0 flex-1 overflow-x-hidden overflow-y-auto',
            'scrollbar-thin px-4 pt-6 pb-6 sm:px-6 sm:py-6 lg:px-8 scroll-pt-16 view-transition'
          )}
        >
          {children}
        </main>
      </div>
      </div>
    </div>
  )
}
