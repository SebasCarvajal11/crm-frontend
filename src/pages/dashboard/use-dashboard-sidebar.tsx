import { useMemo } from 'react'
import { BarChart3, ChartAreaIcon, KanbanSquare, Megaphone, ShieldCheck } from 'lucide-react'
import type { DashboardTab } from '@/routes/-dashboard.search'
import type { SidebarItem } from '@/components/templates/sidebar'
import {
  preloadCollab,
  preloadMarketing,
  preloadAnalytics,
  preloadAdmin,
} from './dashboard-tab-preload'

type Params = {
  activeTab: DashboardTab
  goTo: (next: DashboardTab) => void
  canViewOverview: boolean
  canUseMarketing: boolean
  isAdmin: boolean
}

export function useDashboardSidebar({
  activeTab,
  goTo,
  canViewOverview,
  canUseMarketing,
  isAdmin,
}: Params): SidebarItem[] {
  return useMemo(
    () => [
      {
        key: 'overview',
        label: 'Resumen',
        icon: <BarChart3 className="size-4" />,
        onClick: () => goTo('overview'),
        isActive: activeTab === 'overview',
        hidden: !canViewOverview,
      },
      {
        key: 'collab',
        label: 'Colaboración',
        icon: <KanbanSquare className="size-4" />,
        onClick: () => goTo('collab'),
        onMouseEnter: preloadCollab,
        isActive: activeTab === 'collab',
      },
      {
        key: 'marketing',
        label: 'Marketing',
        icon: <Megaphone className="size-4" />,
        onClick: () => goTo('marketing'),
        onMouseEnter: preloadMarketing,
        isActive: activeTab === 'marketing',
        hidden: !canUseMarketing,
      },
      {
        key: 'analytics',
        label: 'Analítica',
        icon: <ChartAreaIcon className="size-4" />,
        onClick: () => goTo('analytics'),
        onMouseEnter: preloadAnalytics,
        isActive: activeTab === 'analytics',
        hidden: !canUseMarketing,
      },
      {
        key: 'admin',
        label: 'Administración',
        icon: <ShieldCheck className="size-4" />,
        onClick: () => goTo('admin'),
        onMouseEnter: preloadAdmin,
        isActive: activeTab === 'admin',
        hidden: !isAdmin,
      },
    ],
    [activeTab, goTo, canViewOverview, canUseMarketing, isAdmin],
  )
}
