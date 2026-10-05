import { Alert, AlertDescription } from '@/components/ui/alert'
import { TaskSearchBar } from './task-search-bar'
import { TaskBoard } from './task-board'
import { ConversationPanel } from './conversation-panel'
import { BriefPanel } from './brief-panel'
import { ProjectMembers } from './project-members'
import { ContractPanel } from './contract-panel'
import { ChangeRequestsPanel } from './change-requests'
import { WorkspaceTabPanel } from './workspace-tab-panel'
import type {
  Project,
  ProjectContract,
  ProjectChangeRequest,
  ProjectMember,
  ProjectTask,
  ProjectTaskColumn,
} from '@/features/collab/model'
import type { MeResponse } from '@/shared/types'
import type { WorkspaceTab } from './project-workspace.types'

export interface WorkspaceTabPanelsProps {
  activeTab: WorkspaceTab
  accessToken: string
  projectId: string
  identity: MeResponse['data']
  project: Project | null
  members: ProjectMember[]
  canOperate: boolean
  isClient: boolean
  boardColumns: ProjectTaskColumn[]
  boardTasks: ProjectTask[]
  tasksByColumn: Record<string, ProjectTask[]>
  taskIndexMap: Map<string, ProjectTask>
  isBoardLoading: boolean
  isTruncated: boolean
  tasksTotal?: number | null
  tasksLimit?: number | null
  searchableTasks: ProjectTask[]
  isSearching: boolean
  focusedTaskId: string | null
  onTaskSearchDebounced: (q: string) => void
  onSelectTask: (taskId: string | null) => void
  onMoveTask: (taskId: string, targetColumnId: string) => void
  onTaskSaved: () => void
  onError: (msg: string) => void
  chatChannel?: 'internal' | 'external'
  chatMessageId?: string
  briefData?: {
    brief: {
      projectId: string
      content: string
      updatedBySub: string
      updatedAt: string
    } | null
    changeRequests?: ProjectChangeRequest[]
  } | null
  isBriefLoading: boolean
  contractData?: ProjectContract | null
  changeRequestsData?: ProjectChangeRequest[]
  isChangeRequestsLoading: boolean
  onRefreshChangeRequests: () => void
}

export function WorkspaceTabPanels(props: WorkspaceTabPanelsProps) {
  const {
    activeTab, accessToken, projectId, identity, project, members,
    canOperate, isClient, boardColumns, boardTasks, tasksByColumn,
    taskIndexMap, isBoardLoading, isTruncated, tasksTotal, tasksLimit,
    searchableTasks, isSearching, focusedTaskId, onTaskSearchDebounced,
    onSelectTask, onMoveTask, onTaskSaved, onError, chatChannel,
    chatMessageId, briefData, isBriefLoading, contractData,
    changeRequestsData, isChangeRequestsLoading, onRefreshChangeRequests,
  } = props

  return (
    <div className="min-h-0 flex-1 flex flex-col">
      <WorkspaceTabPanel
        tab="board"
        activeTab={activeTab}
        isVisited={activeTab === 'board'}
        ariaLabel="Tablero de tareas"
        className="flex-1 min-h-0 flex flex-col"
      >
        <div data-tour="workspace-task-search" className="shrink-0 mb-3">
          <TaskSearchBar
            searchableTasks={searchableTasks}
            isSearching={isSearching}
            boardColumns={boardColumns}
            onDebouncedChange={onTaskSearchDebounced}
            onSelectTask={onSelectTask}
          />
        </div>
        {isTruncated && (
          <Alert
            className={[
              'mb-3 shrink-0 border-amber-200 bg-amber-50 text-amber-950',
              'dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100',
            ].join(' ')}
          >
            <AlertDescription>
              Este proyecto tiene {tasksTotal ?? 'más de'} {tasksLimit ?? 2000} tareas.
              Solo se muestran las primeras {tasksLimit ?? 2000}.
              Usa la búsqueda de tareas para localizar el resto.
            </AlertDescription>
          </Alert>
        )}
        <TaskBoard
          accessToken={accessToken}
          projectId={projectId}
          columns={boardColumns}
          tasksByColumn={tasksByColumn}
          taskIndexMap={taskIndexMap}
          identity={identity}
          members={members}
          canOperate={canOperate}
          isLoading={isBoardLoading}
          onMoveTask={onMoveTask}
          onTaskSaved={onTaskSaved}
          onError={onError}
          focusedTaskId={focusedTaskId}
        />
      </WorkspaceTabPanel>

      <WorkspaceTabPanel
        tab="chat"
        activeTab={activeTab}
        isVisited={activeTab === 'chat'}
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
          project={project}
          onError={onError}
          isVisible={activeTab === 'chat'}
        />
      </WorkspaceTabPanel>

      <WorkspaceTabPanel
        tab="brief"
        activeTab={activeTab}
        isVisited={activeTab === 'brief'}
        ariaLabel="Brief del proyecto"
        className="flex-1 min-h-0 overflow-y-auto scrollbar-thin"
      >
        <BriefPanel
          brief={briefData?.brief ?? null}
          changeRequests={briefData?.changeRequests ?? []}
          isLoading={isBriefLoading}
        />
      </WorkspaceTabPanel>

      <WorkspaceTabPanel
        tab="contract"
        activeTab={activeTab}
        isVisited={activeTab === 'contract'}
        ariaLabel="Contrato del proyecto"
        className="flex-1 min-h-0 overflow-y-auto scrollbar-thin"
      >
        <ContractPanel
          accessToken={accessToken}
          project={project}
          contract={contractData ?? null}
          members={members}
          role={identity.role}
          onError={onError}
        />
      </WorkspaceTabPanel>

      <WorkspaceTabPanel
        tab="change-requests"
        activeTab={activeTab}
        isVisited={activeTab === 'change-requests'}
        ariaLabel="Solicitudes de cambio"
        className="flex-1 min-h-0 overflow-y-auto scrollbar-thin"
      >
        <ChangeRequestsPanel
          accessToken={accessToken}
          projectId={projectId}
          identity={identity}
          tasks={boardTasks}
          members={members}
          changeRequests={changeRequestsData ?? []}
          isLoading={isChangeRequestsLoading}
          onRefresh={onRefreshChangeRequests}
          onError={onError}
        />
      </WorkspaceTabPanel>

      <WorkspaceTabPanel
        tab="members"
        activeTab={activeTab}
        isVisited={activeTab === 'members'}
        ariaLabel="Integrantes del proyecto"
        className="flex-1 min-h-0 overflow-y-auto scrollbar-thin"
      >
        <ProjectMembers
          members={members}
          isLoading={isBoardLoading}
          accessToken={accessToken}
          projectId={projectId}
          identity={identity}
          canManageMembers={identity.role === 'admin'}
          onError={onError}
        />
      </WorkspaceTabPanel>
    </div>
  )
}
