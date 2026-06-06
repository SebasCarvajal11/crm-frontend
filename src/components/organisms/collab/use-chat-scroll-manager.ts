import { useEffect, useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'

type Channel = 'external' | 'internal'

type Params = {
  channel: Channel
  messageCount: number
  containerRef: RefObject<HTMLDivElement | null>
}

const STICK_TO_BOTTOM_THRESHOLD = 56

export function useChatScrollManager({ channel, messageCount, containerRef }: Params) {
  const activeChannelRef = useRef(channel)
  const previousMessageCountRef = useRef<Record<Channel, number>>({ external: 0, internal: 0 })
  const initializedScrollRef = useRef<Record<Channel, boolean>>({ external: false, internal: false })
  const stickToBottomRef = useRef<Record<Channel, boolean>>({ external: true, internal: true })

  useEffect(() => {
    activeChannelRef.current = channel
  }, [channel])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const previousCount = previousMessageCountRef.current[channel]
    const isInitialPaint = !initializedScrollRef.current[channel]
    const shouldStick = stickToBottomRef.current[channel]

    if (isInitialPaint) {
      container.scrollTop = container.scrollHeight
      initializedScrollRef.current[channel] = true
    } else if (messageCount > previousCount && shouldStick) {
      container.scrollTop = container.scrollHeight
    }

    previousMessageCountRef.current[channel] = messageCount
  }, [channel, messageCount, containerRef])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateStickState = () => {
      const activeChannel = activeChannelRef.current
      const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight
      stickToBottomRef.current[activeChannel] = distanceToBottom < STICK_TO_BOTTOM_THRESHOLD
    }

    updateStickState()
    container.addEventListener('scroll', updateStickState, { passive: true })

    const resizeObserver = new ResizeObserver(() => {
      const activeChannel = activeChannelRef.current
      if (stickToBottomRef.current[activeChannel]) {
        container.scrollTop = container.scrollHeight
      }
    })

    resizeObserver.observe(container)

    return () => {
      container.removeEventListener('scroll', updateStickState)
      resizeObserver.disconnect()
    }
  }, [containerRef])
}
