import { useCallback, useMemo, useState } from 'react'
import { AlertCircle, ArrowLeft, FileText, KanbanSquare, MessageSquare, Users } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useProjectBoardMutations, useProjectWorkspaceData, useTaskSearch, useBoardData } from '@/features/collab/hooks'
import { ProjectHeader } from './project-header'
import { TaskSearchBar } from './task-search-bar'
import { TaskBoard } from './task-board'
import { ConversationPanel } from './conversation-panel'
import { BriefPanel } from './brief-panel'
import { ProjectMembers } from './project-members'
import type { ProjectListItem } from '@/features/collab/model'
import type { MeResponse } from '@/shared/types'

type WorkspaceTab = 'board' | 'chat' | 'brief' | 'members'

type Props = {
  accessToken: string
  identity: MeResponse['data']
  projectId: string
  projectMeta: ProjectListItem | null
  activeTab?: WorkspaceTab
  chatChannel?: 'internal' | 'external'
  chatMessageId?: string
  onBack: () => void
  onTabChange: (tab: WorkspaceTab) => void
}

const TABS: { value: WorkspaceTab; label: string; icon: React.ReactNode }[] = [
  { value: 'board',   label: 'Tablero',      icon: <KanbanSquare  className="size-4" /> },
  { value: 'chat',    label: 'Conversacion', icon: <MessageSquare className="size-4" /> },
  { value: 'brief',   label: 'Brief',        icon: <FileText      className="size-4" /> },
  { value: 'members', label: 'Integrantes',  icon: <Users         className="size-4" /> },
]

const FINALIZATION_COLUMN_KEYS = new Set(['done', 'completed'])

export function ProjectWorkspace({ accessToken, identity, projectId, projectMeta, activeTab = 'board', chatChannel, chatMessageId, onBack, onTabChange }: Props) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [taskSearchDebounced, setTaskSearchDebounced] = useState('')
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null)

  const isClient = identity.role === 'client'
  const canOperate = identity.role === 'admin' || identity.role === 'worker'

  const { boardQ, briefQ } = useProjectWorkspaceData({ accessToken, projectId, activeTab, isClient })
  const { moveTask, invalidateBoardScope } = useProjectBoardMutations({ accessToken, projectId, onError: (message) => setErrorMsg(message) })

  const boardData = boardQ.data?.data
  const project = boardData?.project ?? projectMeta
  const members = boardData?.members ?? []
  const isTruncated = boardData?.board.tasksTruncated ?? false

  const { boardColumns, boardTasks, tasksByColumn, taskIndexMap } = useBoardData(boardData?.board)

  const handleTaskSearchDebounced = useCallback((value: string) => {
    setTaskSearchDebounced(value)
  }, [])

  const localSearchResults = useMemo(() => {
    if (isTruncated) return []
    const normalized = taskSearchDebounced.trim().toLowerCase()
    if (normalized.length < 2) return []
    return boardTasks
      .filter((task) => {
        const columnTitle = boardColumns.find((c) => c.id === task.columnId)?.title ?? ''
        return [task.title, task.description ?? '', task.priority, columnTitle].join(' ').toLowerCase().includes(normalized)
      })
      .slice(0, 8)
  }, [boardColumns, boardTasks, taskSearchDebounced, isTruncated])

  const { results: remoteSearchResults, isSearching } = useTaskSearch({ accessToken, projectId, rawQuery: taskSearchDebounced, enabled: isTruncated })
  const searchableTasks = isTruncated ? remoteSearchResults : localSearchResults

  return (
    <div className="flex min-h-0 flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack} aria-label="Volver al tablero de proyectos"
            className="gap-1.5 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            Proyectos
          </Button>
        </div>
        <ProjectHeader project={project} />
      </div>

      {errorMsg && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="size-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border bg-card p-1 shadow-sm scrollbar-thin" role="tablist" aria-label="Secciones del proyecto">
        {TABS.map((tab) => (
          <button key={tab.value} type="button" role="tab" aria-selected={activeTab === tab.value}
            aria-controls={`tabpanel-${tab.value}`} onClick={() => onTabChange(tab.value)}
            className={[
              'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              activeTab === tab.value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            ].join(' ')}>
            <span aria-hidden="true">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="min-h-0">
        <div id="tabpanel-board" role="tabpanel" aria-label="Tablero de tareas" style={{ display: activeTab === 'board' ? 'block' : 'none' }}>
          <TaskSearchBar
            searchableTasks={searchableTasks}
            isSearching={isSearching}
            boardColumns={boardColumns}
            onDebouncedChange={handleTaskSearchDebounced}
            onSelectTask={setFocusedTaskId}
          />
          {boardData?.board.tasksTruncated ? (
            <Alert className="mb-3 border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              <AlertDescription>
                Este proyecto tiene {boardData.board.tasksTotal ?? 'más de'}{' '}
                {boardData.board.tasksLimit ?? 2000} tareas. Solo se muestran las primeras{' '}
                {boardData.board.tasksLimit ?? 2000}. Usa la búsqueda de tareas para localizar el resto.
              </AlertDescription>
            </Alert>
          ) : null}
          <TaskBoard
            accessToken={accessToken}
            projectId={projectId}
            columns={boardColumns}
            tasksByColumn={tasksByColumn}
            taskIndexMap={taskIndexMap}
            identity={identity}
            members={members}
            canOperate={canOperate}
            isLoading={boardQ.isLoading}
            onMoveTask={(taskId, targetColumnId) => {
              setErrorMsg(null)
              const task = taskIndexMap.get(taskId)
              const targetColumn = boardColumns.find((column) => column.id === targetColumnId)
              const hasSubtasks = (task?.subtasks?.length ?? 0) > 0
              if (task && targetColumn && FINALIZATION_COLUMN_KEYS.has(targetColumn.key) && hasSubtasks && task.checklistProgress < 100) {
                setErrorMsg('No puedes mover la tarea a la columna final sin completar todas las subtareas')
                return
              }
              moveTask.mutate({ taskId, targetColumnId, position: (tasksByColumn[targetColumnId] ?? []).length })
            }}
            onTaskSaved={invalidateBoardScope}
            onError={setErrorMsg}
            focusedTaskId={focusedTaskId}
          />
        </div>

        <div id="tabpanel-chat" role="tabpanel" style={{ display: activeTab === 'chat' ? 'block' : 'none' }}>
          <ConversationPanel
            accessToken={accessToken}
            projectId={projectId}
            identity={identity}
            isClient={isClient}
            initialChannel={chatChannel}
            initialMessageId={chatMessageId}
            members={members}
            tasks={boardTasks}
            onError={setErrorMsg}
          />
        </div>

        <div id="tabpanel-brief" role="tabpanel" style={{ display: activeTab === 'brief' ? 'block' : 'none' }}>
          <BriefPanel
            brief={briefQ.data?.brief ?? null}
            formalChanges={briefQ.data?.formalChanges ?? []}
            isLoading={briefQ.isLoading}
          />
        </div>

        <div id="tabpanel-members" role="tabpanel" style={{ display: activeTab === 'members' ? 'block' : 'none' }}>
          <ProjectMembers
            members={members}
            isLoading={boardQ.isLoading}
            accessToken={accessToken}
            projectId={projectId}
            identity={identity}
            canManageMembers={identity.role === 'admin'}
            onError={setErrorMsg}
          />
        </div>
      </div>
    </div>
  )
}
