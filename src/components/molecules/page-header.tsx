import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

type PageHeaderProps = {
  title: ReactNode
  description?: string
  eyebrow?: ReactNode
  icon?: LucideIcon
  actions?: ReactNode
  className?: string
}

/**
 * Encabezado consistente para los módulos principales del dashboard.
 * Replica la línea de diseño tipográfica premium de la pestaña Resumen:
 * - Línea contextual superior con acento semántico en primary.
 * - Título principal con peso font-black tracking-tight.
 */
export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: PageHeaderProps) {
  const renderedTitle =
    typeof title === 'string' ? (
      <span className="font-black tracking-tight text-foreground">{title}</span>
    ) : (
      title
    )

  return (
    <header
      className={cn(
        'flex flex-col gap-4 border-b border-border/70 pb-5 xl:flex-row xl:items-center xl:justify-between',
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow && (
          <p className="text-2xl font-medium text-muted-foreground sm:text-3xl">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-medium text-muted-foreground sm:text-3xl">
          {renderedTitle}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {description}
          </p>
        )}
      </div>

      {actions ? (
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  )
}
