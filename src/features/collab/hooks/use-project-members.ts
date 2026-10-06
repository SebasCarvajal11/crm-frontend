import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { parseApiError } from '@/shared/lib'
import { listProjectMembersRequest, upsertProjectMemberRequest } from '@/features/collab/api'
import { collabKeys } from '@/features/collab/model'
import type { ClientSearchResult } from '@/shared/types'
import type { ProjectMember } from '@/features/collab/model'
import { useUserAvatars } from '@/shared/hooks'

type Params = {
  accessToken: string
  projectId: string
  members: ProjectMember[]
  selectedWorkers: ClientSearchResult[]
  setSelectedWorkers: (updater: (prev: ClientSearchResult[]) => ClientSearchResult[]) => void
  identityEmail?: string | null
  onError: (msg: string) => void
}

export function useProjectMembers({
  accessToken,
  projectId,
  members,
  selectedWorkers,
  setSelectedWorkers,
  onError,
}: Params) {
  const queryClient = useQueryClient()

  const membersQ = useQuery({
    queryKey: collabKeys.projectMembers(projectId),
    queryFn: () => listProjectMembersRequest(accessToken, projectId),
    initialData: members.length > 0 ? { data: members } : undefined,
    staleTime: 20_000,
  })

  const resolvedMembers = Array.isArray(membersQ.data?.data)
    ? membersQ.data.data
    : Array.isArray(members) ? members : []
  const avatarSubjects = Array.from(
    new Set(resolvedMembers.map((m) => m.userSub).filter(Boolean))
  )
  const { getAvatarUrl, getAvatarColor } = useUserAvatars(accessToken, avatarSubjects)

  const addWorker = useMutation({
    mutationFn: async () => {
      for (const worker of selectedWorkers) {
        await upsertProjectMemberRequest(accessToken, projectId, {
          user_sub: worker.subject,
          user_email: worker.email,
          role: 'worker',
        })
      }
    },
    onSuccess: async () => {
      setSelectedWorkers(() => [])
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: collabKeys.projectMembers(projectId) }),
        queryClient.invalidateQueries({ queryKey: collabKeys.projectBoard(projectId) }),
        queryClient.invalidateQueries({ queryKey: collabKeys.projects() }),
      ])
    },
    onError: (error) => {
      void parseApiError(error).then((m) => onError(m || 'No se pudo agregar trabajador al proyecto'))
    },
  })

  const memberAvatarUrl = (memberSub: string) => getAvatarUrl(memberSub)

  const memberAvatarColor = (memberSub: string) => getAvatarColor(memberSub)

  return {
    membersQ,
    resolvedMembers,
    addWorker,
    memberAvatarUrl,
    memberAvatarColor,
  }
}
