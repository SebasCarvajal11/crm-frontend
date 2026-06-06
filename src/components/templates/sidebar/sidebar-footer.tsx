import { useEffect, useRef, useState } from 'react'
import { Bell, ChevronUp, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { ROLE_LABEL, roleInitial } from './utils'

export function SidebarFooter({
  userEmail,
  userRole,
  userAvatarUrl,
  onOpenProfile,
  onOpenNotifications,
  onLogout,
  isLoggingOut,
  compact = false,
  menuPlacement = 'inline',
  onCloseSidebar,
}: {
  userEmail: string
  userRole: string
  userAvatarUrl?: string | null
  onOpenProfile: () => void
  onOpenNotifications: () => void
  onLogout: () => void
  isLoggingOut: boolean
  compact?: boolean
  menuPlacement?: 'inline' | 'side'
  onCloseSidebar?: () => void
}) {
  const roleLabel = ROLE_LABEL[userRole] ?? userRole
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div className="border-t border-primary-foreground/10 p-3" ref={rootRef}>
      <div className={cn('rounded-xl bg-primary-foreground/[0.07] p-3', compact && 'p-2')}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'flex w-full items-start gap-3 rounded-lg border border-transparent px-2 py-1.5 text-left transition-all hover:border-primary-foreground/15 hover:bg-primary-foreground/10',
            compact && 'justify-center px-0'
          )}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20 text-xs font-semibold text-primary-foreground">
            {userAvatarUrl ? (
              <img src={userAvatarUrl} alt="Foto de perfil" className="size-8 rounded-full object-cover" />
            ) : (
              roleInitial(userRole)
            )}
          </div>
          {!compact && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-primary-foreground/70">{userEmail}</p>
              <p className="text-xs font-medium text-primary-foreground/90">{roleLabel}</p>
            </div>
          )}
          {!compact && (
            <ChevronUp className={cn('mt-2 size-4 text-primary-foreground/70 transition-transform', open && 'rotate-180')} />
          )}
        </button>

        {open && !compact && (
          <div
            className={cn(
              'space-y-1 rounded-lg border border-primary-foreground/12 bg-primary text-primary-foreground p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150',
              menuPlacement === 'side'
                ? 'absolute bottom-3 left-[calc(100%+0.5rem)] z-50 min-w-[220px]'
                : 'mt-2 bg-primary-foreground/[0.04]'
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setOpen(false)
                onCloseSidebar?.()
                onOpenProfile()
              }}
              className="h-8 w-full justify-start rounded-md text-primary-foreground/80 hover:bg-primary-foreground/12 hover:text-primary-foreground"
            >
              <User className="size-4" />
              <span>Mi Cuenta</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setOpen(false)
                onCloseSidebar?.()
                onOpenNotifications()
              }}
              className="h-8 w-full justify-start rounded-md text-primary-foreground/80 hover:bg-primary-foreground/12 hover:text-primary-foreground"
            >
              <Bell className="size-4" />
              <span>Notificaciones</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onLogout}
              disabled={isLoggingOut}
              className="h-8 w-full justify-start rounded-md text-primary-foreground/80 hover:bg-primary-foreground/12 hover:text-primary-foreground"
            >
              <LogOut className="size-4" />
              <span>{isLoggingOut ? 'Cerrando sesion...' : 'Cerrar Sesion'}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
