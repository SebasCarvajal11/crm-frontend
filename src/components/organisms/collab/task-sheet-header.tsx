import { FileText, MessageSquare, Paperclip, Pencil, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { PriorityBadge } from '@/components/molecules/priority-badge'
import type { ProjectTask } from '@/features/collab/model'

export type TaskSheetTab = 'info' | 'comments' | 'files'

type Props = {
  title: string
  priority: ProjectTask['priority']
  isClientVisible: boolean
  canEdit: boolean
  editing: boolean
  tab: TaskSheetTab
  onTabChange: (tab: TaskSheetTab) => void
  onStartEditing: () => void
  onClose: () => void
}

const TABS_CONFIG = [
  { key: 'info' as const, label: 'Detalle', icon: FileText },
  { key: 'comments' as const, label: 'Comentarios', icon: MessageSquare },
  { key: 'files' as const, label: 'Archivos', icon: Paperclip },
]

export function TaskSheetHeader({
  title,
  priority,
  isClientVisible,
  canEdit,
  editing,
  tab,
  onTabChange,
  onStartEditing,
  onClose,
}: Props) {
  return (
    <SheetHeader className="border-b border-border/70 bg-card/60 px-5 pb-3 pt-5 backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <SheetTitle className="line-clamp-2 text-base font-bold tracking-tight text-foreground sm:text-lg">
            {title}
          </SheetTitle>
          <SheetDescription className="mt-1.5 flex flex-wrap items-center gap-2">
            <PriorityBadge priority={priority} size="xs" />
            {isClientVisible && (
              <span
                className={
                  'inline-flex items-center gap-1 rounded-full border border-violet-200/80 ' +
                  'bg-violet-50/80 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700 ' +
                  'dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300'
                }
              >
                <User className="size-3" aria-hidden="true" />
                Visible al cliente
              </span>
            )}
          </SheetDescription>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {canEdit && !editing && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              onClick={onStartEditing}
              aria-label="Editar tarea"
            >
              <Pencil className="size-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            onClick={onClose}
            aria-label="Cerrar panel"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <div className="-mx-5 mt-3 flex gap-1 border-b border-border/60 px-5 pb-0" role="tablist">
        {TABS_CONFIG.map((item) => {
          const Icon = item.icon
          const isActive = tab === item.key
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(item.key)}
              className={[
                '-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-semibold transition-all',
                isActive
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {item.label}
            </button>
          )
        })}
      </div>
    </SheetHeader>
  )
}
