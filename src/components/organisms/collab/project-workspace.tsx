import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { SectionTabs } from '@/components/molecules/section-tabs'
import { useProjectBoardMutations, useProjectWorkspaceData, useBoardData } from '@/features/collab/hooks'
import { ProjectHeader } from './project-header'
import { WorkspaceTabPanels } from './workspace-tab-panels'
import { useWorkspaceTabs } from './use-workspace-tabs'
import { useWorkspaceTaskSearch } from './use-workspace-task-search'
import { collabKeys } from '@/features/collab/model'
import {
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

  const { tabs } = useWorkspaceTabs({ accessToken, projectId })

  if (initialTaskId !== prevInitialTaskId) {
    setPrevInitialTaskId(initialTaskId)
    if (initialTaskId) setFocusedTaskId(initialTaskId)
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

      <WorkspaceTabPanels
        activeTab={activeTab}
        accessToken={accessToken}
        projectId={projectId}
        identity={identity}
        project={boardData?.project ?? null}
        members={members}
        canOperate={canOperate}
        isClient={isClient}
        boardColumns={boardColumns}
        boardTasks={boardTasks}
        tasksByColumn={tasksByColumn}
        taskIndexMap={taskIndexMap}
        isBoardLoading={boardQ.isLoading}
        isTruncated={isTruncated}
        tasksTotal={boardData?.board.tasksTotal}
        tasksLimit={boardData?.board.tasksLimit}
        searchableTasks={searchableTasks}
        isSearching={isSearching}
        focusedTaskId={focusedTaskId}
        onTaskSearchDebounced={handleTaskSearchDebounced}
        onSelectTask={setFocusedTaskId}
        onMoveTask={handleMoveTask}
        onTaskSaved={invalidateBoardScope}
        onError={setErrorMsg}
        chatChannel={chatChannel}
        chatMessageId={chatMessageId}
        briefData={briefQ.data}
        isBriefLoading={briefQ.isLoading}
        contractData={contractQ.data?.data ?? null}
        changeRequestsData={changeRequestsQ?.data?.data ?? []}
        isChangeRequestsLoading={changeRequestsQ?.isLoading ?? false}
        onRefreshChangeRequests={handleRefreshChangeRequests}
      />
    </div>
  )
}

