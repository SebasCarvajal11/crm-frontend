import { useEffect, useMemo } from 'react'
import type { MutableRefObject } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listExternalChatRequest,
  listInternalChatRequest,
  markExternalChatReadRequest,
  markInternalChatReadRequest,
} from '@/features/collab/api'
import { collabKeys } from '@/features/collab/model'
import { getUserAvatarsRequest } from '@/features/media/api'
import type { ProjectChatMessage, ProjectMember } from '@/features/collab/model'

type Channel = 'external' | 'internal'
const EMPTY_MESSAGES: ProjectChatMessage[] = []

/** IDs persistidos en mod-collab (UUID). Los optimistas usan `temp-…` y no deben ir a mark-read. */
const PERSISTED_CHAT_MESSAGE_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type Params = {
  accessToken: string
  projectId: string
  isClient: boolean
  channel: Channel
  members: ProjectMember[]
  lastMarkedRef: MutableRefObject<Record<Channel, string | null>>
}

export function useProjectChatData({
  accessToken,
  projectId,
  isClient,
  channel,
  members,
  lastMarkedRef,
}: Params) {
  const queryClient = useQueryClient()

  const externalQ = useQuery({
    queryKey: collabKeys.chatExternal(projectId),
    queryFn: () => listExternalChatRequest(accessToken, projectId),
    staleTime: 15_000,
  })

  const internalQ = useQuery({
    queryKey: collabKeys.chatInternal(projectId),
    queryFn: () => listInternalChatRequest(accessToken, projectId),
    enabled: !isClient,
    staleTime: 15_000,
  })

  const externalMessages = externalQ.data?.data.items ?? EMPTY_MESSAGES
  const internalMessages = internalQ.data?.data.items ?? EMPTY_MESSAGES
  const messages = useMemo(
    () => (channel === 'external' ? externalMessages : internalMessages),
    [channel, externalMessages, internalMessages]
  )
  // El API devuelve mensajes en orden descendente (más reciente primero).
  const readUpToMessageId = useMemo(() => {
    for (const message of messages) {
      if (PERSISTED_CHAT_MESSAGE_ID.test(message.id)) return message.id
    }
    return null
  }, [messages])
  const memberBySub = useMemo(() => new Map(members.map((member) => [member.userSub, member] as const)), [members])
  const avatarSubjects = useMemo(() => Array.from(new Set(members.map((m) => m.userSub))), [members])

  const avatarsQ = useQuery({
    queryKey: ['media', 'avatars', 'users', projectId, avatarSubjects.join(',')],
    queryFn: () => getUserAvatarsRequest(accessToken, avatarSubjects),
    enabled: avatarSubjects.length > 0,
    staleTime: 60_000,
  })

  const avatarBySub = avatarsQ.data?.data.items ?? {}

  useEffect(() => {
    if (!readUpToMessageId) return
    if (lastMarkedRef.current[channel] === readUpToMessageId) return

    const req = channel === 'external' ? markExternalChatReadRequest : markInternalChatReadRequest

    void req(accessToken, projectId, { up_to_message_id: readUpToMessageId })
      .then(() => {
        lastMarkedRef.current[channel] = readUpToMessageId
        void queryClient.invalidateQueries({ queryKey: collabKeys.mentionNotifications() })
        void queryClient.invalidateQueries({ queryKey: collabKeys.mentionNotificationsCount() })
      })
      .catch(() => undefined)
  }, [accessToken, projectId, channel, readUpToMessageId, queryClient, lastMarkedRef])

  return {
    externalQ,
    internalQ,
    messages,
    memberBySub,
    avatarBySub,
  }
}


