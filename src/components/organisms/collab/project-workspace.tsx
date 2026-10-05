import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { SectionTabs } from '@/components/molecules/section-tabs'
import { useProjectBoardMutations, useProjectWorkspaceData, useBoardData } from '@/features/collab/hooks'
import { ProjectHeader } from './project-header'
import { TaskSearchBar } from './task-search-bar'
import { TaskBoard } from './task-board'
import { ConversationPanel } from './conversation-panel'
import { BriefPanel } from './brief-panel'
import { ProjectMembers } from './project-members'
import { ContractPanel } from './contract-panel'
import { ChangeRequestsPanel } from './change-requests'
import { WorkspaceTabPanel } from './workspace-tab-panel'
import { useWorkspaceTabs } from './use-workspace-tabs'
import { useWorkspaceTaskSearch } from './use-workspace-task-search'
import { collabKeys } from '@/features/collab/model'
import {
  type WorkspaceTab,
  type ProjectWorkspaceProps as Props,
  FINALIZATION_COLUMN_KEYS,
} from './project-workspace.types'

export function ProjectWorkspace({
  accessToken,
  identity,
  projectId,
  projectMeta,
  activeTab = 'board',
  chatChannel,
  chatMessageId,
  initialTaskId,
  onBack,
  onTabChange,
}: Props) {
  const queryClient = useQueryClient()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(initialTaskId ?? null)
  const [prevInitialTaskId, setPrevInitialTaskId] = useState<string | undefined>(initialTaskId)
  const [prevActiveTab, setPrevActiveTab] = useState<WorkspaceTab>(activeTab)
  const [visitedTabs, setVisitedTabs] = useState<Set<WorkspaceTab>>(() => new Set([activeTab]))

  const { tabs } = useWorkspaceTabs({ accessToken, projectId })

  if (initialTaskId !== prevInitialTaskId) {
    setPrevInitialTaskId(initialTaskId)
    if (initialTaskId) setFocusedTaskId(initialTaskId)
  }

  if (activeTab !== prevActiveTab) {
    setPrevActiveTab(activeTab)
    setVisitedTabs((prev) => new Set(prev).add(activeTab))
  }

  const isClient = identity.role === 'client'
  const canOperate = identity.role === 'admin' || identity.role === 'worker'

  const { boardQ, briefQ, contractQ, changeRequestsQ } = useProjectWorkspaceData({
    accessToken,
    projectId,
    activeTab,
    isClient,
  })
  const { moveTask, invalidateBoardScope } = useProjectBoardMutations({
    accessToken,
    projectId,
    onError: (message) => setErrorMsg(message),
  })

  const boardData = boardQ.data?.data
  const project = boardData?.project ?? projectMeta
  const members = boardData?.members ?? []
  const isTruncated = boardData?.board.tasksTruncated ?? false

  const { boardColumns, boardTasks, tasksByColumn, taskIndexMap } = useBoardData(boardData?.board)

  const { handleTaskSearchDebounced, searchableTasks, isSearching } = useWorkspaceTaskSearch({
    accessToken,
    projectId,
    boardColumns,
    boardTasks,
    isTruncated,
  })

  const handleMoveTask = useCallback(
    (taskId: string, targetColumnId: string) => {
      setErrorMsg(null)
      const task = taskIndexMap.get(taskId)
      const targetColumn = boardColumns.find((column) => column.id === targetColumnId)
      const hasSubtasks = (task?.subtasks?.length ?? 0) > 0
      const isFinalColumn = targetColumn && FINALIZATION_COLUMN_KEYS.has(targetColumn.key)
      if (task && isFinalColumn && hasSubtasks && task.checklistProgress < 100) {
        setErrorMsg('No puedes mover la tarea a la columna final sin completar todas las subtareas')
        return
      }
      moveTask.mutate({
        taskId,
        targetColumnId,
        position: (tasksByColumn[targetColumnId] ?? []).length,
      })
    },
    [taskIndexMap, boardColumns, tasksByColumn, moveTask],
  )

  const handleRefreshChangeRequests = useCallback(() => {
    void changeRequestsQ?.refetch()
    void queryClient.invalidateQueries({ queryKey: collabKeys.timeline(projectId) })
    void queryClient.invalidateQueries({ queryKey: collabKeys.brief(projectId) })
    void queryClient.invalidateQueries({ queryKey: collabKeys.pendingChangeRequests() })
  }, [changeRequestsQ, queryClient, projectId])

  return (
    <div className="flex min-h-0 flex-col gap-4 sm:gap-5 min-w-0 w-full max-w-full h-full flex-1 overflow-hidden">
      <div className="flex flex-col gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            data-tour="workspace-back-btn"
            aria-label="Volver al tablero de proyectos"
            className="gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            Proyectos
          </Button>
        </div>
        <div data-tour="workspace-project-header">
          <ProjectHeader project={project} />
        </div>
      </div>

      {errorMsg && (
        <Alert variant="destructive" role="alert" className="shrink-0">
          <AlertCircle className="size-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <div data-tour="workspace-tabs" className="shrink-0">
        <SectionTabs
          items={tabs}
          value={activeTab}
          onValueChange={onTabChange}
          ariaLabel="Secciones del proyecto"
          getPanelId={(tab) => `tabpanel-${tab}`}
        />
      </div>

      <div className="min-h-0 flex-1 flex flex-col">
        <WorkspaceTabPanel
          tab="board"
          activeTab={activeTab}
          isVisited={true}
          ariaLabel="Tablero de tareas"
          className="flex-1 min-h-0 flex flex-col"
        >
          <div data-tour="workspace-task-search" className="shrink-0 mb-3">
            <TaskSearchBar
              searchableTasks={searchableTasks}
              isSearching={isSearching}
              boardColumns={boardColumns}
              onDebouncedChange={handleTaskSearchDebounced}
              onSelectTask={setFocusedTaskId}
            />
          </div>
          {boardData?.board.tasksTruncated ? (
            <Alert
              className={[
                'mb-3 shrink-0 border-amber-200 bg-amber-50 text-amber-950',
                'dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100',
              ].join(' ')}
            >
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
            onMoveTask={handleMoveTask}
            onTaskSaved={invalidateBoardScope}
            onError={setErrorMsg}
            focusedTaskId={focusedTaskId}
          />
        </WorkspaceTabPanel>

        <WorkspaceTabPanel
          tab="chat"
          activeTab={activeTab}
          isVisited={visitedTabs.has('chat')}
          ariaLabel="Conversación del proyecto"
          className="flex-1 min-h-0 flex flex-col"
        >
          <ConversationPanel
            accessToken={accessToken}
            projectId={projectId}
            identity={identity}
            isClient={isClient}
            initialChannel={chatChannel}
            initialMessageId={chatMessageId}
            members={members}
            tasks={boardTasks}
            project={boardData?.project ?? null}
            onError={setErrorMsg}
            isVisible={activeTab === 'chat'}
          />
        </WorkspaceTabPanel>

        <WorkspaceTabPanel
          tab="brief"
          activeTab={activeTab}
          isVisited={visitedTabs.has('brief')}
          ariaLabel="Brief del proyecto"
          className="flex-1 min-h-0 overflow-y-auto scrollbar-thin"
        >
          <BriefPanel
            brief={briefQ.data?.brief ?? null}
            changeRequests={briefQ.data?.changeRequests ?? []}
            isLoading={briefQ.isLoading}
          />
        </WorkspaceTabPanel>

        <WorkspaceTabPanel
          tab="contract"
          activeTab={activeTab}
          isVisited={visitedTabs.has('contract')}
          ariaLabel="Contrato del proyecto"
          className="flex-1 min-h-0 overflow-y-auto scrollbar-thin"
        >
          <ContractPanel
            accessToken={accessToken}
            project={boardData?.project ?? null}
            contract={contractQ.data?.data ?? null}
            members={members}
            role={identity.role}
            onError={setErrorMsg}
          />
        </WorkspaceTabPanel>

        <WorkspaceTabPanel
          tab="change-requests"
          activeTab={activeTab}
          isVisited={visitedTabs.has('change-requests')}
          ariaLabel="Solicitudes de cambio"
          className="flex-1 min-h-0 overflow-y-auto scrollbar-thin"
        >
          <ChangeRequestsPanel
            accessToken={accessToken}
            projectId={projectId}
            identity={identity}
            tasks={boardTasks}
            members={members}
            changeRequests={changeRequestsQ?.data?.data ?? []}
            isLoading={changeRequestsQ?.isLoading ?? false}
            onRefresh={handleRefreshChangeRequests}
            onError={setErrorMsg}
          />
        </WorkspaceTabPanel>

        <WorkspaceTabPanel
          tab="members"
          activeTab={activeTab}
          isVisited={visitedTabs.has('members')}
          ariaLabel="Integrantes del proyecto"
          className="flex-1 min-h-0 overflow-y-auto scrollbar-thin"
        >
          <ProjectMembers
            members={members}
            isLoading={boardQ.isLoading}
            accessToken={accessToken}
            projectId={projectId}
            identity={identity}
            canManageMembers={identity.role === 'admin'}
            onError={setErrorMsg}
          />
        </WorkspaceTabPanel>
      </div>
    </div>
  )
}
