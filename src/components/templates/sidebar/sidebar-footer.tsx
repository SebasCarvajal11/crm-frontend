import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Bell, ChevronUp, HelpCircle, LogOut, User, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationCounterBadge } from '@/components/atoms/notification-counter-badge'
import { cn } from '@/shared/lib/utils'
import { ROLE_LABEL, roleInitial } from './utils'

function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  active: boolean,
  onClose: () => void
) {
  useEffect(() => {
    if (!active) return
    const onDismiss = (e: MouseEvent | TouchEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', onDismiss)
    document.addEventListener('touchstart', onDismiss)
    return () => {
      document.removeEventListener('mousedown', onDismiss)
      document.removeEventListener('touchstart', onDismiss)
    }
  }, [active, ref, onClose])
}

function UserAvatar({
  userAvatarUrl,
  userRole,
  unreadCount,
  compact,
}: {
  userAvatarUrl?: string | null
  userRole: string
  unreadCount: number
  compact: boolean
}) {
  return (
    <div
      className={cn(
        'relative flex size-8 shrink-0 items-center justify-center',
        'rounded-full bg-primary-foreground/20 text-xs font-semibold text-primary-foreground'
      )}
    >
      {userAvatarUrl ? (
        <img src={userAvatarUrl} alt="Foto de perfil" className="size-8 rounded-full object-cover" />
      ) : (
        roleInitial(userRole)
      )}
      {unreadCount > 0 && compact && (
        <NotificationCounterBadge
          variant="dot"
          count={unreadCount}
          className="absolute -top-0.5 -right-0.5"
        />
      )}
    </div>
  )
}

function UserProfileTrigger({
  userEmail,
  userRole,
  userAvatarUrl,
  unreadCount,
  compact,
  open,
  onClick,
}: {
  userEmail: string
  userRole: string
  userAvatarUrl?: string | null
  unreadCount: number
  compact: boolean
  open: boolean
  onClick: () => void
}) {
  const roleLabel = ROLE_LABEL[userRole] ?? userRole

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-haspopup="menu"
      aria-label={open ? 'Cerrar opciones de usuario' : 'Abrir opciones de usuario'}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg border border-transparent px-2 py-1.5',
        'text-left transition-all duration-150 cursor-pointer active:scale-[0.98]',
        'hover:border-primary-foreground/15 hover:bg-primary-foreground/10',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50',
        compact && 'justify-center px-0'
      )}
    >
      <UserAvatar
        userAvatarUrl={userAvatarUrl}
        userRole={userRole}
        unreadCount={unreadCount}
        compact={compact}
      />
      {!compact && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-primary-foreground/70">{userEmail}</p>
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-medium text-primary-foreground/90">{roleLabel}</p>
            <NotificationCounterBadge count={unreadCount} maxCount={9} size="sm" />
          </div>
        </div>
      )}
      {!compact && (
        <ChevronUp
          className={cn(
            'mt-2 size-4 text-primary-foreground/70 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      )}
    </button>
  )
}

function ActionItem({
  icon: Icon,
  label,
  onClick,
  disabled,
  extra,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
  disabled?: boolean
  extra?: ReactNode
}) {
  return (
    <Button
      type="button"
      role="menuitem"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-8 w-full justify-start rounded-md text-primary-foreground/80',
        'hover:bg-primary-foreground/12 hover:text-primary-foreground cursor-pointer'
      )}
    >
      <Icon className="size-4" />
      <span>{label}</span>
      {extra}
    </Button>
  )
}

function UserMenuActions({
  placement,
  unreadCount,
  isLoggingOut,
  onProfile,
  onNotifications,
  onOpenHelp,
  onLogout,
}: {
  placement: 'inline' | 'side'
  unreadCount: number
  isLoggingOut: boolean
  onProfile: () => void
  onNotifications: () => void
  onOpenHelp?: () => void
  onLogout: () => void
}) {
  return (
    <div
      role="menu"
      aria-orientation="vertical"
      aria-label="Menu de usuario"
      data-tour="sidebar-footer-menu"
      className={cn(
        'space-y-1 rounded-lg border border-primary-foreground/12 bg-primary text-primary-foreground',
        'p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150',
        placement === 'side'
          ? 'absolute bottom-0 left-[calc(100%+0.5rem)] z-50 min-w-[220px]'
          : 'mt-2 border-primary-foreground/10 bg-primary-foreground/[0.05]'
      )}
    >
      <ActionItem icon={User} label="Mi Cuenta" onClick={onProfile} />
      <ActionItem
        icon={Bell}
        label="Notificaciones"
        onClick={onNotifications}
        extra={
          <NotificationCounterBadge count={unreadCount} maxCount={99} size="md" className="ml-auto" />
        }
      />
      {onOpenHelp && (
        <ActionItem icon={HelpCircle} label="CIMA Smart Copilot" onClick={onOpenHelp} />
      )}
      <ActionItem
        icon={LogOut}
        label={isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
        onClick={onLogout}
        disabled={isLoggingOut}
      />
    </div>
  )
}

export interface SidebarFooterProps {
  userEmail: string
  userRole: string
  userAvatarUrl?: string | null
  onOpenProfile: () => void
  onOpenNotifications: () => void
  unreadNotificationsCount: number
  onLogout: () => void
  isLoggingOut: boolean
  compact?: boolean
  menuPlacement?: 'inline' | 'side'
  onCloseSidebar?: () => void
  onOpenHelp?: () => void
}

export function SidebarFooter({
  userEmail,
  userRole,
  userAvatarUrl,
  onOpenProfile,
  onOpenNotifications,
  unreadNotificationsCount,
  onLogout,
  isLoggingOut,
  compact = false,
  menuPlacement = 'inline',
  onCloseSidebar,
  onOpenHelp,
}: SidebarFooterProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useOutsideClick(rootRef, open, () => setOpen(false))

  const handleAction = (callback: () => void) => {
    setOpen(false)
    onCloseSidebar?.()
    callback()
  }

  return (
    <div className="relative border-t border-primary-foreground/10 p-3" ref={rootRef} data-tour="sidebar-footer">
      <div className={cn('rounded-xl bg-primary-foreground/[0.07] p-3', compact && 'p-2')}>
        <UserProfileTrigger
          userEmail={userEmail}
          userRole={userRole}
          userAvatarUrl={userAvatarUrl}
          unreadCount={unreadNotificationsCount}
          compact={compact}
          open={open}
          onClick={() => setOpen((prev) => !prev)}
        />
        {open && (
          <UserMenuActions
            placement={menuPlacement}
            unreadCount={unreadNotificationsCount}
            isLoggingOut={isLoggingOut}
            onProfile={() => handleAction(onOpenProfile)}
            onNotifications={() => handleAction(onOpenNotifications)}
            onOpenHelp={onOpenHelp ? () => handleAction(onOpenHelp) : undefined}
            onLogout={onLogout}
          />
        )}
      </div>
    </div>
  )
}
