import type { ReactNode } from 'react'

type NotificationCollapseRowProps = {
  id: string
  isDismissing: boolean
  children: ReactNode
}

export function NotificationCollapseRow({
  id,
  isDismissing,
  children,
}: NotificationCollapseRowProps) {
  return (
    <div
      data-notification-id={id}
      data-dismissing={isDismissing ? 'true' : 'false'}
      className="notification-collapse-row"
    >
      <div className="notification-collapse-inner">
        {children}
      </div>
    </div>
  )
}
