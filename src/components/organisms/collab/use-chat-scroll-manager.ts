import { useEffect, useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'

type Channel = 'external' | 'internal'

type Params = {
  channel: Channel
  messageCount: number
  containerRef: RefObject<HTMLDivElement | null>
  isVisible?: boolean
}

const STICK_TO_BOTTOM_THRESHOLD = 56

export function useChatScrollManager({
  channel,
  messageCount,
  containerRef,
  isVisible = true,
}: Params) {
  const activeChannelRef = useRef(channel)
  const isVisibleRef = useRef(isVisible)
  const previousMessageCountRef = useRef<Record<Channel, number>>({ external: 0, internal: 0 })
  const initializedScrollRef = useRef<Record<Channel, boolean>>({ external: false, internal: false })
  const stickToBottomRef = useRef<Record<Channel, boolean>>({ external: true, internal: true })

  useEffect(() => {
    activeChannelRef.current = channel
  }, [channel])

  useEffect(() => {
    isVisibleRef.current = isVisible
  }, [isVisible])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || !isVisible) return

    const previousCount = previousMessageCountRef.current[channel]
    const hasHeight = container.clientHeight > 0
    const isInitialPaint = !initializedScrollRef.current[channel] && messageCount > 0 && hasHeight
    const shouldStick = stickToBottomRef.current[channel]

    if (isInitialPaint) {
      container.scrollTop = container.scrollHeight
      initializedScrollRef.current[channel] = true
    } else if (messageCount > previousCount && shouldStick && hasHeight) {
      container.scrollTop = container.scrollHeight
    }

    if (hasHeight && !initializedScrollRef.current[channel] && messageCount > 0) {
      container.scrollTop = container.scrollHeight
      initializedScrollRef.current[channel] = true
    }

    previousMessageCountRef.current[channel] = messageCount
  }, [channel, messageCount, isVisible, containerRef])

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
      if (!isVisibleRef.current) return
      const activeChannel = activeChannelRef.current
      if (stickToBottomRef.current[activeChannel] && container.clientHeight > 0) {
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

