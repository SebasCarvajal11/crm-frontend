import { useCallback, useRef } from 'react'
import { sendChatTypingRequest } from '@/features/collab/api'

type Params = {
  accessToken: string
  projectId: string
  channel: 'external' | 'internal'
}

export function useChatTypingSender({ accessToken, projectId, channel }: Params) {
  const lastSentRef = useRef<number>(0)

  const notifyTyping = useCallback(() => {
    const now = Date.now()
    if (now - lastSentRef.current < 3500) return

    lastSentRef.current = now
    void sendChatTypingRequest(accessToken, projectId, channel).catch(() => {
      // Ignorar fallos de red puntuales para no interferir con la escritura
    })
  }, [accessToken, projectId, channel])

  return { notifyTyping }
}
