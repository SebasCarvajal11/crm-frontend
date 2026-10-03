import { useRef, useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useVirtualizer } from '@tanstack/react-virtual'
import { TaskCard } from './task-card'
import type { ProjectTask, ProjectTaskColumn } from '@/features/collab/model'

type Props = {
  column: ProjectTaskColumn
  tasks: ProjectTask[]
  selectedTaskId: string | null
  canDrag: boolean
  canCreateTask: boolean
  isFirstColumn?: boolean
  onSelectTask: (t: ProjectTask) => void
  onDropTask: (taskId: string) => void
  onCreateTask: () => void
}

/** Organismo: columna kanban de tareas con alto fijo y soporte drag-and-drop. */
export function TaskColumn({
  column,
  tasks,
  selectedTaskId,
  canDrag,
  canCreateTask,
  isFirstColumn,
  onSelectTask,
  onDropTask,
  onCreateTask,
}: Props) {
  const [isDragOver, setIsDragOver] = useState(false)
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Estimated height of TaskCard (including spacing)
    overscan: 3,
  })

  return (
    <section
      id={`kanban-col-${column.id}`}
      aria-label={`Columna ${column.title}, ${tasks.length} tarea${tasks.length !== 1 ? 's' : ''}`}
      className={`flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs ${
        isDragOver
          ? 'border-primary/80 bg-primary/[0.04] shadow-md ring-2 ring-primary/20'
          : 'bg-muted/20 border-border/80 hover:border-border'
      }`}
      onDragOver={(e) => {
        if (canDrag) {
          e.preventDefault()
          setIsDragOver(true)
        }
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        if (!canDrag) return
        e.preventDefault()
        setIsDragOver(false)
        const id = e.dataTransfer.getData('text/task-id')
        if (id) onDropTask(id)
      }}
    >
      <div
        className={[
          'flex items-center justify-between gap-2 border-b border-border/70',
          'bg-card/90 px-3.5 py-3 rounded-t-2xl shrink-0 backdrop-blur-md',
        ].join(' ')}
      >
        <h3
          className="min-w-0 flex-1 truncate text-sm font-bold tracking-tight text-foreground leading-tight"
          title={column.title}
        >
          {column.title}
        </h3>
        <div className="flex shrink-0 items-center gap-2">
          {column.isClientVisible && (
            <span title="Columna visible para el cliente">
              <Users className="size-3.5 text-muted-foreground" aria-label="Visible para el cliente" />
            </span>
          )}
          <Badge
            variant="secondary"
            className="text-xs font-bold min-w-[1.5rem] justify-center tabular-nums shadow-2xs"
          >
            {tasks.length}
          </Badge>
          {canCreateTask && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              data-tour={isFirstColumn ? 'workspace-create-task-btn' : undefined}
              className={[
                'size-7 rounded-lg text-muted-foreground transition-all duration-150',
                'hover:scale-105 hover:bg-primary/10 hover:text-primary',
                'focus-visible:scale-105 focus-visible:bg-primary/10 focus-visible:text-primary',
              ].join(' ')}
              onClick={onCreateTask}
              aria-label={`Crear tarea en ${column.title}`}
              title={`Nueva tarea en ${column.title}`}
            >
              <Plus className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* El cuerpo se adapta al alto disponible en móvil y conserva una referencia uniforme en escritorio. */}
      <div
        ref={parentRef}
        className="h-[min(62dvh,520px)] overflow-y-auto scroll-smooth scrollbar-thin p-2"
        style={{ position: 'relative' }}
        aria-label={`Tareas de la columna ${column.title}`}
      >
        {tasks.length === 0 ? (
          <div className="flex h-full min-h-[200px] items-center justify-center p-2">
            <div
              className={[
                'flex size-full flex-col items-center justify-center rounded-xl border-2 border-dashed',
                'p-4 text-center transition-all duration-200',
                isDragOver
                  ? 'border-primary/60 bg-primary/10 scale-[1.01]'
                  : 'border-border/60 bg-card/30',
              ].join(' ')}
            >
              <p className="text-xs font-medium text-muted-foreground/70">
                {canDrag ? 'Arrastra tareas aquí' : 'Sin tareas'}
              </p>
            </div>
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualizer.getVirtualItems()[0]?.start ?? 0}px)`,
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const task = tasks[virtualRow.index]
                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    className="pb-2 w-full shrink-0"
                  >
                    <TaskCard
                      task={task}
                      isSelected={task.id === selectedTaskId}
                      canDrag={canDrag}
                      onClick={() => onSelectTask(task)}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

