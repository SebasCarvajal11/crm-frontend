import { memo, useRef } from 'react'
import { Plus, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useVirtualizer, type Virtualizer } from '@tanstack/react-virtual'
import { TaskCard } from './task-card'
import { useColumnDropzone } from './use-column-dropzone'
import type { ProjectTask, ProjectTaskColumn } from '@/features/collab/model'

type Props = {
  column: ProjectTaskColumn
  tasks: ProjectTask[]
  selectedTaskId: string | null
  canDrag: boolean
  canCreateTask: boolean
  isFirstColumn?: boolean
  columns?: ProjectTaskColumn[]
  onSelectTask: (t: ProjectTask) => void
  onDropTask: (taskId: string) => void
  onMoveTask?: (taskId: string, targetColumnId: string) => void
  onCreateTask: () => void
}

type HeaderProps = {
  title: string
  taskCount: number
  isClientVisible?: boolean
  canCreateTask: boolean
  isFirstColumn?: boolean
  onCreateTask: () => void
}

const createColumnButtonClass = [
  'size-7 rounded-lg text-muted-foreground transition-all duration-150',
  'hover:scale-105 hover:bg-primary/10 hover:text-primary',
  'focus-visible:scale-105 focus-visible:bg-primary/10 focus-visible:text-primary',
].join(' ')

function TaskColumnHeaderActions({
  title,
  taskCount,
  isClientVisible,
  canCreateTask,
  isFirstColumn,
  onCreateTask,
}: HeaderProps) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      {isClientVisible && (
        <span title="Columna visible para el cliente">
          <Users className="size-3.5 text-muted-foreground" aria-label="Visible para el cliente" />
        </span>
      )}
      <Badge
        variant="secondary"
        className="text-xs font-bold min-w-[1.5rem] justify-center tabular-nums shadow-2xs"
      >
        {taskCount}
      </Badge>
      {canCreateTask && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          data-tour={isFirstColumn ? 'workspace-create-task-btn' : undefined}
          className={createColumnButtonClass}
          onClick={onCreateTask}
          aria-label={`Crear tarea en ${title}`}
          title={`Nueva tarea en ${title}`}
        >
          <Plus className="size-3.5" />
        </Button>
      )}
    </div>
  )
}

function TaskColumnHeader(props: HeaderProps) {
  const headerClass = [
    'flex items-center justify-between gap-2 border-b border-border/70',
    'bg-card/90 px-3.5 py-3 rounded-t-2xl shrink-0 backdrop-blur-md',
  ].join(' ')

  return (
    <div className={headerClass}>
      <h3
        className="min-w-0 flex-1 truncate text-sm font-bold tracking-tight text-foreground leading-tight"
        title={props.title}
      >
        {props.title}
      </h3>
      <TaskColumnHeaderActions {...props} />
    </div>
  )
}

function TaskColumnEmptyState({
  canDrag,
  isDragOver,
}: {
  canDrag: boolean
  isDragOver: boolean
}) {
  const borderStyle = isDragOver
    ? 'border-primary/60 bg-primary/10 ring-1 ring-primary/30'
    : 'border-border/60 bg-card/30'

  const emptyClass = [
    'flex size-full flex-col items-center justify-center rounded-xl',
    'border-2 border-dashed p-4 text-center transition-all duration-150',
    borderStyle,
  ].join(' ')

  return (
    <div className="flex h-full min-h-[140px] items-center justify-center p-2">
      <div className={emptyClass}>
        <p className="text-xs font-medium text-muted-foreground/70">
          {canDrag ? 'Arrastra tareas aquí' : 'Sin tareas'}
        </p>
      </div>
    </div>
  )
}

type ListProps = {
  tasks: ProjectTask[]
  selectedTaskId: string | null
  canDrag: boolean
  virtualizer: Virtualizer<HTMLDivElement, Element>
  onSelectTask: (t: ProjectTask) => void
  columns?: ProjectTaskColumn[]
  onMoveTask?: (taskId: string, targetColumnId: string) => void
}

type VirtualItemProps = {
  virtualRow: ReturnType<Virtualizer<HTMLDivElement, Element>['getVirtualItems']>[number]
  task: ProjectTask
  isSelected: boolean
  canDrag: boolean
  measureElement: (node: Element | null) => void
  onSelectTask: (t: ProjectTask) => void
  columns?: ProjectTaskColumn[]
  onMoveTask?: (taskId: string, targetColumnId: string) => void
}

const TaskColumnVirtualItem = memo(function TaskColumnVirtualItem({
  virtualRow,
  task,
  isSelected,
  canDrag,
  measureElement,
  onSelectTask,
  columns,
  onMoveTask,
}: VirtualItemProps) {
  return (
    <div
      key={virtualRow.key}
      data-index={virtualRow.index}
      ref={measureElement}
      className="pb-2 w-full shrink-0"
    >
      <TaskCard
        task={task}
        isSelected={isSelected}
        canDrag={canDrag}
        onSelect={onSelectTask}
        columns={columns}
        onMoveTask={onMoveTask}
      />
    </div>
  )
})

function TaskColumnVirtualList({
  tasks,
  selectedTaskId,
  canDrag,
  virtualizer,
  onSelectTask,
  columns,
  onMoveTask,
}: ListProps) {
  const virtualItems = virtualizer.getVirtualItems()
  const offset = virtualItems[0]?.start ?? 0

  return (
    <div style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${offset}px)`,
        }}
      >
        {virtualItems.map((virtualRow) => (
          <TaskColumnVirtualItem
            key={virtualRow.key}
            virtualRow={virtualRow}
            task={tasks[virtualRow.index]}
            isSelected={tasks[virtualRow.index].id === selectedTaskId}
            canDrag={canDrag}
            measureElement={virtualizer.measureElement}
            onSelectTask={onSelectTask}
            columns={columns}
            onMoveTask={onMoveTask}
          />
        ))}
      </div>
    </div>
  )
}

type BodyProps = {
  parentRef: React.RefObject<HTMLDivElement | null>
  props: Props
  isDragOver: boolean
  virtualizer: Virtualizer<HTMLDivElement, Element>
}

function TaskColumnBody({ parentRef, props, isDragOver, virtualizer }: BodyProps) {
  const { column, tasks, selectedTaskId, canDrag, onSelectTask, columns, onMoveTask } = props
  return (
    <div
      ref={parentRef}
      className="flex-1 min-h-[260px] sm:min-h-0 overflow-y-auto scroll-smooth scrollbar-thin p-2 relative"
      aria-label={`Tareas de la columna ${column.title}`}
    >
      {tasks.length === 0 ? (
        <TaskColumnEmptyState canDrag={canDrag} isDragOver={isDragOver} />
      ) : (
        <TaskColumnVirtualList
          tasks={tasks}
          selectedTaskId={selectedTaskId}
          canDrag={canDrag}
          virtualizer={virtualizer}
          onSelectTask={onSelectTask}
          columns={columns}
          onMoveTask={onMoveTask}
        />
      )}
    </div>
  )
}

function getColumnSectionClass(isDragOver: boolean): string {
  const dropzoneClass = isDragOver
    ? 'border-primary/80 ring-2 ring-primary/40 bg-primary/[0.03] shadow-md'
    : 'bg-muted/20 border-border/80 hover:border-border'

  return [
    'flex flex-col rounded-2xl border transition-all duration-150 h-full',
    'overflow-hidden shadow-2xs kanban-column-dropzone',
    dropzoneClass,
  ].join(' ')
}

/** Organismo: columna kanban de tareas con alto fijo y soporte drag-and-drop. */
export function TaskColumn(props: Props) {
  const { column, tasks, canDrag, onDropTask } = props
  const parentRef = useRef<HTMLDivElement>(null)
  const dropzone = useColumnDropzone({ canDrag, onDropTask })
  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 3,
  })

  return (
    <section
      id={`kanban-col-${column.id}`}
      aria-label={`Columna ${column.title}, ${tasks.length} tarea${tasks.length !== 1 ? 's' : ''}`}
      data-drag-over={dropzone.isDragOver}
      data-testid={`kanban-column-${column.id}`}
      className={getColumnSectionClass(dropzone.isDragOver)}
      onDragOver={dropzone.onDragOver}
      onDragLeave={dropzone.onDragLeave}
      onDrop={dropzone.onDrop}
    >
      <TaskColumnHeader
        title={column.title}
        taskCount={tasks.length}
        isClientVisible={column.isClientVisible}
        canCreateTask={props.canCreateTask}
        isFirstColumn={props.isFirstColumn}
        onCreateTask={props.onCreateTask}
      />
      <TaskColumnBody
        parentRef={parentRef}
        props={props}
        isDragOver={dropzone.isDragOver}
        virtualizer={virtualizer}
      />
    </section>
  )
}
