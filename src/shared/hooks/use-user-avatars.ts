import { useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUserAvatarsRequest } from '@/shared/api'
import { pickAvatarUrl } from '@/shared/lib/avatar-utils'

import type { UserAvatarsResponse } from '@/shared/types'

const MAX_BATCH_SIZE = 100

async function fetchAvatarsInBatches(
  accessToken: string,
  ids: string[]
): Promise<UserAvatarsResponse> {
  if (ids.length <= MAX_BATCH_SIZE) {
    return getUserAvatarsRequest(accessToken, ids)
  }
  const chunks: string[][] = []
  for (let i = 0; i < ids.length; i += MAX_BATCH_SIZE) {
    chunks.push(ids.slice(i, i + MAX_BATCH_SIZE))
  }
  const responses = await Promise.all(
    chunks.map((chunk) => getUserAvatarsRequest(accessToken, chunk))
  )
  const mergedItems: UserAvatarsResponse['data']['items'] = Object.assign(
    {},
    ...responses.map((r) => r.data.items)
  )
  return { data: { items: mergedItems } }
}

export function useUserAvatars(
  accessToken: string | null | undefined,
  userIds: (string | null | undefined)[],
  preferredSize: '64' | '256' | '512' = '64'
) {
  const sortedIds = useMemo(() => {
    const set = new Set<string>()
    for (const id of userIds) {
      if (id && typeof id === 'string' && id.trim()) {
        set.add(id.trim())
      }
    }
    return Array.from(set).sort()
  }, [userIds])

  const idsKey = sortedIds.join(',')

  const avatarsQuery = useQuery({
    queryKey: ['media', 'avatars', 'users', idsKey],
    queryFn: () => fetchAvatarsInBatches(accessToken!, sortedIds),
    enabled: Boolean(accessToken && sortedIds.length > 0),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })

  const avatarMap = useMemo(() => {
    const items = avatarsQuery.data?.data.items ?? {}
    const map: Record<string, string> = {}
    for (const [sub, payload] of Object.entries(items)) {
      const url = pickAvatarUrl(payload?.urls, preferredSize)
      if (url) map[sub] = url
    }
    return map
  }, [avatarsQuery.data, preferredSize])

  const getAvatarUrl = useCallback(
    (sub?: string | null) => (sub ? avatarMap[sub] ?? null : null),
    [avatarMap]
  )

  return {
    avatarMap,
    getAvatarUrl,
    isLoading: avatarsQuery.isLoading,
    isFetching: avatarsQuery.isFetching,
    refetch: avatarsQuery.refetch,
  }
}
