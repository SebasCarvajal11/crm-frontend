import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import type { WorkspaceTab } from './project-workspace.types'

type WorkspaceTabPanelProps = {
  tab: WorkspaceTab
  activeTab: WorkspaceTab
  isVisited: boolean
  children: ReactNode
  ariaLabel?: string
  className?: string
}

/**
 * Contenedor de subpestaña con montaje perezoso y animación de entrada
 * reactivada en cada cambio de vista sin perder el estado del formulario.
 */
export function WorkspaceTabPanel({
  tab,
  activeTab,
  isVisited,
  children,
  ariaLabel,
  className,
}: WorkspaceTabPanelProps) {
  if (!isVisited) return null

  const isActive = activeTab === tab

  return (
    <div
      id={`tabpanel-${tab}`}
      role="tabpanel"
      aria-label={ariaLabel}
      aria-hidden={!isActive}
      className={cn(
        isActive ? 'tab-pane-transition min-h-0' : 'hidden',
        className,
      )}
    >
      {children}
    </div>
  )
}
