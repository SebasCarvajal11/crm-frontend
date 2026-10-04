import { useState, useCallback } from 'react'
import type { ProjectChatMessage } from '@/features/collab/model'

export function useNewlyArrivedMessages(messages: ProjectChatMessage[]): {
  isNewlyArrived: (id: string) => boolean
} {
  const [initialIds, setInitialIds] = useState<Set<string>>(
    () => new Set(messages.map((m) => m.id))
  )
  const [hasCapturedInitial, setHasCapturedInitial] = useState(
    () => messages.length > 0
  )

  if (!hasCapturedInitial && messages.length > 0) {
    setHasCapturedInitial(true)
    setInitialIds(new Set(messages.map((m) => m.id)))
  }

  const isNewlyArrived = useCallback(
    (id: string): boolean => !initialIds.has(id),
    [initialIds]
  )

  return { isNewlyArrived }
}

