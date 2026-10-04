import { usePrefersReducedMotion } from '@/shared/hooks/use-prefers-reduced-motion'
import { ROLES, type InviteRole } from './invite-role-switcher.types'

type Props = {
  activeRole: InviteRole
  onChange: (role: InviteRole) => void
}

export function InviteRoleSwitcher({ activeRole, onChange }: Props) {
  const reducedMotion = usePrefersReducedMotion()
  const activeIndex = ROLES.findIndex((r) => r.id === activeRole)
  const pillStyle = reducedMotion
    ? undefined
    : {
        transform: `translateX(${activeIndex * 100}%)`,
        width: `${100 / ROLES.length}%`,
      }

  return (
    <div
      role="tablist"
      aria-label="Selección de tipo de rol a invitar"
      className="relative flex items-center p-1 rounded-xl bg-muted/50 border border-border/70"
    >
      <div
        data-testid="invite-role-sliding-pill"
        className={[
          'absolute inset-y-1 left-1 rounded-lg bg-card shadow-xs border border-border/60 pointer-events-none',
          reducedMotion ? '' : 'transition-transform duration-160 ease-[cubic-bezier(0.16,1,0.3,1)]',
        ].join(' ')}
        style={pillStyle}
        aria-hidden="true"
      />
      {ROLES.map((role) => {
        const Icon = role.icon
        const isSelected = role.id === activeRole
        return (
          <button
            key={role.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            data-testid={`invite-role-tab-${role.id}`}
            data-tour={role.dataTour}
            onClick={() => onChange(role.id)}
            className={[
              'relative z-10 flex-1 flex items-center justify-center gap-2 py-2 px-3',
              'text-xs font-semibold rounded-lg outline-none transition-colors duration-150',
              'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
              isSelected ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            <Icon className="size-4 shrink-0" />
            <span>{role.label}</span>
          </button>
        )
      })}
    </div>
  )
}
