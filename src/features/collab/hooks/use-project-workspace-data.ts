import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getProjectBriefRequest,
  getProjectContractRequest,
  getProjectBoardRequest,
  listExternalChatRequest,
  listInternalChatRequest,
  listProjectChangeRequestsRequest,
} from '@/features/collab/api'
import { collabKeys } from '@/features/collab/model'

import type { WorkspaceTab } from '@/components/organisms/collab/project-workspace.types'

type Params = {
  accessToken: string
  projectId: string
  activeTab: WorkspaceTab
  isClient: boolean
}

async function fetchBriefPanel(accessToken: string, projectId: string) {
  const [briefRes, crRes] = await Promise.all([
    getProjectBriefRequest(accessToken, projectId),
    listProjectChangeRequestsRequest(accessToken, projectId),
  ])
  return {
    brief: briefRes.data ?? null,
    changeRequests: crRes.data ?? [],
  }
}

export function useProjectWorkspaceData({ accessToken, projectId, activeTab, isClient }: Params) {
  const queryClient = useQueryClient()

  const boardQ = useQuery({
    queryKey: collabKeys.projectBoard(projectId),
    queryFn: () => getProjectBoardRequest(accessToken, projectId),
    staleTime: 30_000,
  })

  const briefQ = useQuery({
    queryKey: [...collabKeys.brief(projectId), 'panel'],
    queryFn: () => fetchBriefPanel(accessToken, projectId),
    enabled: activeTab === 'brief',
    staleTime: 60_000,
  })

  const contractQ = useQuery({
    queryKey: collabKeys.contract(projectId),
    queryFn: () => getProjectContractRequest(accessToken, projectId),
    enabled: activeTab === 'contract',
    staleTime: 30_000,
  })

  const changeRequestsQ = useQuery({
    queryKey: collabKeys.changeRequests(projectId),
    queryFn: () => listProjectChangeRequestsRequest(accessToken, projectId),
    enabled: activeTab === 'change-requests',
    staleTime: 15_000,
  })

  useEffect(() => {
    void queryClient.prefetchQuery({
      queryKey: [...collabKeys.chatExternal(projectId), 20],
      queryFn: () => listExternalChatRequest(accessToken, projectId, { limit: 20, page: 1 }),
      staleTime: 15_000,
    })

    if (!isClient) {
      void queryClient.prefetchQuery({
        queryKey: [...collabKeys.chatInternal(projectId), 20],
        queryFn: () => listInternalChatRequest(accessToken, projectId, { limit: 20, page: 1 }),
        staleTime: 15_000,
      })
    }

    void queryClient.prefetchQuery({
      queryKey: [...collabKeys.brief(projectId), 'panel'],
      queryFn: () => fetchBriefPanel(accessToken, projectId),
      staleTime: 60_000,
    })
  }, [accessToken, isClient, projectId, queryClient])

  return { boardQ, briefQ, contractQ, changeRequestsQ }
}


