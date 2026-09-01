import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

type PageHeaderProps = {
  title: string
  description: string
  icon: LucideIcon
  actions?: ReactNode
  className?: string
}

/**
 * Encabezado consistente para los módulos principales del dashboard.
 * Mantiene la identidad visual de CIMA y deja las acciones propias de cada
 * módulo desacopladas del patrón de presentación.
 */
export function PageHeader({ title, description, icon: Icon, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 border-b border-border pb-5 xl:flex-row xl:items-center xl:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="flex items-center gap-2.5 text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">{title}</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>

      {actions ? (
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  )
}
