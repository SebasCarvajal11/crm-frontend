import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/utils'
import type { SidebarItem } from './types'
import { SidebarBrand } from './sidebar-brand'
import { SidebarNav } from './sidebar-nav'
import { SidebarFooter } from './sidebar-footer'

export function MobileSidebar({
  open,
  setOpen,
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
  open: boolean
  setOpen: (open: boolean) => void
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
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/45 md:hidden"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-primary text-primary-foreground shadow-xl transition-transform duration-300 md:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Menu de navegacion"
        {...(!open ? { inert: true } : {})}
      >
        <div className="flex items-center justify-between border-b border-primary-foreground/10 px-4 py-4">
          <div className="min-w-0 flex-1">
            <SidebarBrand title={title} headerExtras={headerExtras} closeOnNavigate={() => setOpen(false)} />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menu"
            className="text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <X className="size-5" />
          </Button>
        </div>
        <SidebarNav items={items} onItemClick={() => setOpen(false)} />
        <SidebarFooter
          userEmail={userEmail}
          userRole={userRole}
          userAvatarUrl={userAvatarUrl}
          onOpenProfile={onOpenProfile}
          onOpenNotifications={onOpenNotifications}
          onLogout={onLogout}
          isLoggingOut={isLoggingOut}
          menuPlacement="inline"
          onCloseSidebar={() => setOpen(false)}
        />
      </aside>
    </>
  )
}
