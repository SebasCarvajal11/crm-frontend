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
      className="rounded-xl border border-border/70 bg-muted/50 p-1"
    >
      <div className="relative grid grid-cols-3 w-full">
        <div
          data-testid="invite-role-sliding-pill"
          className={[
            'absolute inset-y-0 left-0 rounded-lg bg-card shadow-xs border border-border/80 pointer-events-none',
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
                'relative z-10 flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-1 sm:px-3',
                'text-[11px] sm:text-xs font-semibold rounded-lg outline-none transition-colors duration-150',
                'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                isSelected ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              <Icon
                className={[
                  'size-3.5 sm:size-4 shrink-0 transition-colors duration-150',
                  isSelected ? 'text-primary' : 'text-muted-foreground',
                ].join(' ')}
              />
              <span className="truncate">{role.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
