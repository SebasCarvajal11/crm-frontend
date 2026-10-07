import { Link } from '@tanstack/react-router'
import { cn } from '@/shared/lib/utils'
import { CimaLogo } from '@/components/ui/cima-logo'

export function SidebarBrand({
  title,
  compact = false,
  headerExtras,
  closeOnNavigate,
}: {
  title?: string
  compact?: boolean
  headerExtras?: React.ReactNode
  closeOnNavigate: () => void
}) {
  return (
    <div className={cn('flex w-full items-center justify-center', !compact && 'pl-2')}>
      <Link
        to="/dashboard"
        aria-label={title || 'Inicio'}
        className="flex w-full items-center justify-center min-w-0 transition-opacity hover:opacity-90"
        onClick={closeOnNavigate}
      >
        <CimaLogo variant={compact ? 'emblem' : 'cimaxis'} tone="inverse" />
      </Link>
      {!compact && headerExtras ? <div className="ml-auto shrink-0">{headerExtras}</div> : null}
    </div>
  )
}
