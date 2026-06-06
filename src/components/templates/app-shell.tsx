import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/utils'
import type { SidebarItem } from './sidebar'
import { DesktopSidebar, MobileSidebar } from './sidebar'

export type { SidebarItem }

type AppShellProps = {
  title: string
  sidebarItems: SidebarItem[]
  userEmail: string
  userRole: string
  userAvatarUrl?: string | null
  onOpenProfile: () => void
  onOpenNotifications: () => void
  onLogout: () => void
  isLoggingOut?: boolean
  headerExtras?: React.ReactNode
  children: React.ReactNode
  className?: string
}

const shellSidebarOffset = 'md:ml-64 lg:ml-72'

export function AppShell({
  title,
  sidebarItems,
  userEmail,
  userRole,
  userAvatarUrl,
  onOpenProfile,
  onOpenNotifications,
  onLogout,
  isLoggingOut = false,
  headerExtras,
  children,
  className,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className={cn('flex min-h-screen bg-background', className)}>
      <DesktopSidebar
        title={title}
        items={sidebarItems}
        userEmail={userEmail}
        userRole={userRole}
        userAvatarUrl={userAvatarUrl}
        onOpenProfile={onOpenProfile}
        onOpenNotifications={onOpenNotifications}
        onLogout={onLogout}
        isLoggingOut={isLoggingOut}
        headerExtras={headerExtras}
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
        onLogout={onLogout}
        isLoggingOut={isLoggingOut}
        headerExtras={headerExtras}
      />

      <div className={cn('flex min-w-0 flex-1 flex-col', shellSidebarOffset)}>
        <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b bg-card/95 p-3 backdrop-blur md:hidden">
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

        <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
