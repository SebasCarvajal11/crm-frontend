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
    <div className={cn('flex items-center gap-3', compact && 'w-full justify-center')}>
      <Link
        to="/dashboard"
        aria-label={title || 'Inicio'}
        className={cn(
          'flex items-center gap-2.5 min-w-0 transition-opacity hover:opacity-90',
          compact && 'justify-center'
        )}
        onClick={closeOnNavigate}
      >
        <CimaLogo size={28} showText={!compact} textColor="text-white" subtitle={false} />
      </Link>
      {!compact && headerExtras ? <div className="ml-auto shrink-0">{headerExtras}</div> : null}
    </div>
  )
}
