import { useState } from 'react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/utils'
import type { SidebarItem } from './types'
import { shellSidebarWidth } from './utils'
import { SidebarBrand } from './sidebar-brand'
import { SidebarNav } from './sidebar-nav'
import { SidebarFooter } from './sidebar-footer'

export function DesktopSidebar({
  title,
  items,
  userEmail,
  userRole,
  userAvatarUrl,
  onOpenProfile,
  onOpenNotifications,
  onLogout,
  isLoggingOut,
  headerExtras,
}: {
  title: string
  items: SidebarItem[]
  userEmail: string
  userRole: string
  userAvatarUrl?: string | null
  onOpenProfile: () => void
  onOpenNotifications: () => void
  onLogout: () => void
  isLoggingOut: boolean
  headerExtras?: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 hidden shrink-0 flex-col bg-primary text-primary-foreground md:flex',
        collapsed ? 'md:w-20' : shellSidebarWidth
      )}
      aria-label="Barra de navegacion lateral"
    >
      <div className="flex items-center gap-2 border-b border-primary-foreground/10 p-3">
        <div className="min-w-0 flex-1 px-1">
          <SidebarBrand title={title} headerExtras={collapsed ? undefined : headerExtras} closeOnNavigate={() => {}} />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed((prev) => !prev)}
          className="text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
          aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </Button>
      </div>
      <SidebarNav items={items} compact={collapsed} onItemClick={() => {}} />
      <SidebarFooter
        userEmail={userEmail}
        userRole={userRole}
        userAvatarUrl={userAvatarUrl}
        onOpenProfile={onOpenProfile}
        onOpenNotifications={onOpenNotifications}
        onLogout={onLogout}
        isLoggingOut={isLoggingOut}
        compact={collapsed}
        menuPlacement="side"
      />
    </aside>
  )
}
