import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AvatarDirectoryService,
  type UserAvatarEntity,
} from '@/shared/lib/avatar-directory-service'
import { pickAvatarUrl } from '@/shared/lib/avatar-utils'

export function useUserAvatars(
  accessToken: string | null | undefined,
  userIds: (string | null | undefined)[],
  preferredSize: '64' | '256' | '512' = '64'
) {
  useSyncExternalStore(
    AvatarDirectoryService.subscribe,
    AvatarDirectoryService.getSnapshot,
    AvatarDirectoryService.getSnapshot
  )

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
    queryKey: ['media', 'avatars', 'directory', idsKey],
    queryFn: () => AvatarDirectoryService.fetchAvatarsBatched(accessToken!, sortedIds),
    enabled: Boolean(accessToken && sortedIds.length > 0),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })

  const { avatarMap, profileMap } = useMemo(() => {
    const aMap: Record<string, string> = {}
    const pMap: Record<string, UserAvatarEntity> = {}
    for (const sub of sortedIds) {
      const entity = AvatarDirectoryService.getEntity(sub)
      pMap[sub] = entity
      const preferred = pickAvatarUrl(entity.urls, preferredSize)
      aMap[sub] = preferred ?? entity.url
    }
    return { avatarMap: aMap, profileMap: pMap }
  }, [sortedIds, preferredSize])

  const getAvatarUrl = useCallback(
    (sub?: string | null) => {
      if (!sub) return null
      const entity = profileMap[sub] ?? AvatarDirectoryService.getEntity(sub)
      return pickAvatarUrl(entity.urls, preferredSize) ?? entity.url
    },
    [profileMap, preferredSize]
  )

  const getAvatarColor = useCallback(
    (sub?: string | null) => {
      if (!sub) return null
      const entity = profileMap[sub] ?? AvatarDirectoryService.getEntity(sub)
      return entity.color
    },
    [profileMap]
  )

  const getAvatarProfile = useCallback(
    (sub?: string | null) => (sub ? (profileMap[sub] ?? AvatarDirectoryService.getEntity(sub)) : null),
    [profileMap]
  )

  return {
    avatarMap,
    profileMap,
    getAvatarUrl,
    getAvatarColor,
    getAvatarProfile,
    isLoading: avatarsQuery.isLoading,
    isFetching: avatarsQuery.isFetching,
    refetch: avatarsQuery.refetch,
  }
}
