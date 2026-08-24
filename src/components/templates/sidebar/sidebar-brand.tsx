import { Link } from '@tanstack/react-router'

export function SidebarBrand({
  title,
  headerExtras,
  closeOnNavigate,
}: {
  title: string
  headerExtras?: React.ReactNode
  closeOnNavigate: () => void
}) {
  return (
    <div className="flex items-center gap-3">
      <Link
        to="/dashboard"
        className="min-w-0 truncate text-lg font-black uppercase tracking-tight text-primary-foreground"
        onClick={closeOnNavigate}
      >
        {title}
      </Link>
      {headerExtras ? <div className="ml-auto shrink-0">{headerExtras}</div> : null}
    </div>
  )
}
