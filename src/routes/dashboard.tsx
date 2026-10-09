import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'
import { parseDashboardSearch } from './-dashboard.search'

const LazyDashboardPage = lazyRouteComponent(
  () => import('@/pages/dashboard/dashboard-page'),
  'DashboardPage',
)

export const Route = createFileRoute('/dashboard')({
  validateSearch: parseDashboardSearch,
  component: DashboardRoute,
})

function DashboardRoute() {
  const search = Route.useSearch()
  return <LazyDashboardPage {...search} />
}

