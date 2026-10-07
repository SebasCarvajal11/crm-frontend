import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/utils'
import type { SidebarItem } from './types'
import { shellSidebarWidth } from './utils'
import { SidebarBrand } from './sidebar-brand'
import { SidebarNav } from './sidebar-nav'
import { SidebarFooter } from './sidebar-footer'
import { BRAND_TEXTURES, useTextureLoaded } from '@/shared/lib/brand-textures'

export function DesktopSidebar({
  title,
  items,
  userId,
  userEmail,
  userRole,
  userAvatarUrl,
  userAvatarColor,
  onOpenProfile,
  onOpenNotifications,
  unreadNotificationsCount,
  onLogout,
  isLoggingOut,
  headerExtras,
  collapsed,
  onCollapsedChange,
  onOpenHelp,
}: {
  title: string
  items: SidebarItem[]
  userId?: string | null
  userEmail: string
  userRole: string
  userAvatarUrl?: string | null
  userAvatarColor?: string | null
  onOpenProfile: () => void
  onOpenNotifications: () => void
  unreadNotificationsCount: number
  onLogout: () => void
  isLoggingOut: boolean
  headerExtras?: React.ReactNode
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  onOpenHelp?: () => void
}) {
  const isTextureLoaded = useTextureLoaded(BRAND_TEXTURES.sidebar)

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 hidden shrink-0 flex-col bg-gradient-to-b from-[#680609] via-[#86070c] to-[#4d0407] shadow-xl border-r border-black/10',
        'text-primary-foreground transition-[width] duration-200 ease-out md:flex',
        collapsed ? 'md:w-20' : shellSidebarWidth
      )}
      aria-label="Barra de navegacion lateral"
    >
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 z-0 overflow-hidden bg-cover bg-center',
          'transition-opacity duration-300 ease-out'
        )}
        style={{
          backgroundImage: `url(${BRAND_TEXTURES.sidebar})`,
          opacity: isTextureLoaded ? 0.85 : 0,
          mixBlendMode: 'overlay',
        }}
      />
      <div className="relative z-10 flex h-full flex-col">
      <div
        className={cn(
          'border-b border-primary-foreground/10',
          collapsed ? 'flex flex-col items-center gap-2 px-2 py-3' : 'flex items-center gap-2 p-3'
        )}
      >
        {collapsed ? (
          <>
            <SidebarBrand
              title={title}
              compact={true}
              closeOnNavigate={() => {}}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onCollapsedChange(false)}
              className="text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              aria-label="Expandir barra lateral"
              title="Expandir barra lateral"
            >
              <PanelLeftOpen className="size-4" />
            </Button>
          </>
        ) : (
          <>
            <div className="min-w-0 flex-1 flex items-center justify-center">
              <SidebarBrand
                title={title}
                compact={false}
                headerExtras={headerExtras}
                closeOnNavigate={() => {}}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onCollapsedChange(true)}
              className="text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              aria-label="Colapsar barra lateral"
              title="Colapsar barra lateral"
            >
              <PanelLeftClose className="size-4" />
            </Button>
          </>
        )}
      </div>
      <SidebarNav items={items} compact={collapsed} onItemClick={() => {}} />
      <SidebarFooter
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
        compact={collapsed}
        menuPlacement={collapsed ? 'side' : 'inline'}
        onOpenHelp={onOpenHelp}
      />
      </div>
    </aside>
  )
}
