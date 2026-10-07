import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CimaLogo } from '@/components/ui/cima-logo'
import { cn } from '@/shared/lib/utils'
import type { SidebarItem } from './sidebar'
import { DesktopSidebar, MobileSidebar } from './sidebar'
import { BRAND_TEXTURES, useTextureLoaded } from '@/shared/lib/brand-textures'

export type { SidebarItem }

type AppShellProps = {
  title: string
  sidebarItems: SidebarItem[]
  userId?: string | null
  userEmail: string
  userRole: string
  userAvatarUrl?: string | null
  userAvatarColor?: string | null
  onOpenProfile: () => void
  onOpenNotifications: () => void
  unreadNotificationsCount?: number
  onLogout: () => void
  isLoggingOut?: boolean
  headerExtras?: React.ReactNode
  onOpenHelp?: () => void
  children: React.ReactNode
  className?: string
}

const shellSidebarOffset = 'md:ml-64 lg:ml-72'
const collapsedSidebarOffset = 'md:ml-20'
const sidebarPreferenceKey = 'cima.sidebar.collapsed'

function readSidebarPreference() {
  try {
    const saved = window.localStorage.getItem(sidebarPreferenceKey)
    if (saved !== null) return saved === 'true'
    return typeof window !== 'undefined' && window.innerWidth < 1024
  } catch {
    return typeof window !== 'undefined' && window.innerWidth < 1024
  }
}

export function AppShell({
  title,
  sidebarItems,
  userId,
  userEmail,
  userRole,
  userAvatarUrl,
  userAvatarColor,
  onOpenProfile,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  onLogout,
  isLoggingOut = false,
  headerExtras,
  onOpenHelp,
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
    <div className={cn('relative flex min-h-dvh md:h-dvh md:max-h-dvh md:overflow-hidden bg-background', className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center md:bg-fixed transition-opacity duration-300 ease-out"
        style={{
          backgroundImage: `url(${BRAND_TEXTURES.app})`,
          opacity: isTextureLoaded ? 1 : 0,
        }}
      />
      <div className="relative z-10 flex min-h-dvh md:min-h-0 md:h-full w-full flex-1">
      <DesktopSidebar
        title={title}
        items={sidebarItems}
        userId={userId}
        userEmail={userEmail}
        userRole={userRole}
        userAvatarUrl={userAvatarUrl}
        userAvatarColor={userAvatarColor}
        onOpenProfile={onOpenProfile}
        onOpenNotifications={onOpenNotifications}
        unreadNotificationsCount={unreadNotificationsCount}
        onLogout={onLogout}
        isLoggingOut={isLoggingOut}
        headerExtras={headerExtras}
        collapsed={desktopCollapsed}
        onCollapsedChange={setDesktopCollapsed}
        onOpenHelp={onOpenHelp}
      />

      <MobileSidebar
        open={mobileOpen}
        setOpen={setMobileOpen}
        title={title}
        items={sidebarItems}
        userId={userId}
        userEmail={userEmail}
        userRole={userRole}
        userAvatarUrl={userAvatarUrl}
        userAvatarColor={userAvatarColor}
        onOpenProfile={onOpenProfile}
        onOpenNotifications={onOpenNotifications}
        unreadNotificationsCount={unreadNotificationsCount}
        onLogout={onLogout}
        isLoggingOut={isLoggingOut}
        headerExtras={headerExtras}
        onOpenHelp={onOpenHelp}
      />

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col md:h-full md:min-h-0 md:overflow-hidden transition-[margin] duration-200 ease-out',
          desktopCollapsed ? collapsedSidebarOffset : shellSidebarOffset,
        )}
      >
        <header
          className={cn(
            'sticky top-0 z-30 flex items-center justify-between gap-2 border-b',
            'bg-background/85 px-3.5 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md border-border/80 md:hidden'
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
            data-tour="mobile-navigation-trigger"
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="size-5" />
          </Button>
          <CimaLogo width={100} />
          <div className="flex min-w-0 items-center gap-2">
            {headerExtras}
            <span className="hidden max-w-[120px] truncate text-xs text-muted-foreground sm:inline">{userEmail}</span>
          </div>
        </header>

        <main
          className={cn(
            'min-w-0 flex-1 overflow-x-hidden overflow-y-auto md:flex md:flex-col md:min-h-0',
            'scrollbar-thin px-4 pt-4 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-6 md:pb-6 lg:px-8 scroll-pt-16 view-transition'
          )}
        >
          <div className="mx-auto w-full max-w-[1920px] 2xl:max-w-[2400px] flex-1 md:flex md:flex-col md:min-h-0">
            {children}
          </div>
        </main>
      </div>
      </div>
    </div>
  )
}
