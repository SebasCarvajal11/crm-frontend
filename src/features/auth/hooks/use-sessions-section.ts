import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listSessionsRequest, revokeSessionRequest } from '@/features/auth/api'
import { authKeys, type SessionsResponse } from '@/features/auth/model'
import { parseApiError } from '@/features/auth/utils'
import { useSessionStore } from '@/app/session/session-store'

const PAGE_SIZE = 2
const PAGE_BLOCK_SIZE = 5

export function useSessionsSection(accessToken: string) {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const sessionsQueryKey = [...authKeys.sessions(), accessToken] as const

  const sessionsQ = useQuery({
    queryKey: sessionsQueryKey,
    queryFn: () => listSessionsRequest(accessToken),
    enabled: Boolean(accessToken),
  })

  const sessions = useMemo(() => sessionsQ.data?.data.sessions ?? [], [sessionsQ.data])

  const revokeMutation = useMutation({
    mutationFn: async (familyId: string) => {
      try {
        return await revokeSessionRequest(accessToken, familyId)
      } catch (e) {
        throw new Error(await parseApiError(e), { cause: e })
      }
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: authKeys.sessions() }),
  })

  const revokeAllMutation = useMutation({
    mutationFn: async () => {
      const cached = queryClient.getQueryData<SessionsResponse>(sessionsQueryKey)
      const freshSessions = cached?.data.sessions ?? []
      const allFamilies = freshSessions.map((session) => session.family)
      if (allFamilies.length > 0) {
        await Promise.allSettled(
          allFamilies.map((familyId) => revokeSessionRequest(accessToken, familyId))
        )
      }
    },
    onSuccess: () => {
      queryClient.clear()
      useSessionStore.getState().clearSession()
      window.location.replace('/login')
    },
  })

  const totalPages = Math.max(1, Math.ceil(sessions.length / PAGE_SIZE))
  const pageSafe = Math.min(Math.max(1, page), totalPages)
  const pageStart = (pageSafe - 1) * PAGE_SIZE
  const pageSessions = sessions.slice(pageStart, pageStart + PAGE_SIZE)

  const pageWindow = useMemo(() => {
    const blockIndex = Math.floor((pageSafe - 1) / PAGE_BLOCK_SIZE)
    const start = blockIndex * PAGE_BLOCK_SIZE + 1
    const end = Math.min(start + PAGE_BLOCK_SIZE - 1, totalPages)
    const pages: number[] = []
    for (let p = start; p <= end; p += 1) pages.push(p)
    return pages
  }, [pageSafe, totalPages])

  return {
    pageSafe,
    pageSessions,
    pageWindow,
    revokeAllMutation,
    revokeMutation,
    sessions,
    sessionsQ,
    setPage,
    totalPages,
  }
}
