import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listPlansRequest, type MarketingPlan } from '../api/plans-api'
import { assignablePlans, findPlanByName, sortPlans } from '../ui/plans.utils'

export const plansQueryKey = ['marketing', 'plans'] as const

export interface UsePlansResult {
  /** Todos los planes (activos e inactivos), ordenados. */
  plans: MarketingPlan[]
  /** Solo los activos: los únicos que se ofrecen al asignar o segmentar. */
  activePlans: MarketingPlan[]
  /** Plan por nombre (sin distinguir mayúsculas), o null si no está en el catálogo. */
  findPlan: (name?: string | null) => MarketingPlan | null
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

/**
 * Catálogo de planes comerciales (GET /marketing/plans?includeInactive=true).
 * Se piden también los inactivos para poder mostrar en gris el plan de un
 * cliente que lo conserva después de desactivarlo.
 */
export function usePlans(accessToken: string): UsePlansResult {
  const query = useQuery({
    queryKey: plansQueryKey,
    queryFn: () => listPlansRequest(accessToken, true),
    staleTime: 60_000,
  })

  return useMemo(() => {
    const plans = sortPlans(Array.isArray(query.data) ? query.data : [])
    return {
      plans,
      activePlans: assignablePlans(plans),
      findPlan: (name?: string | null) => findPlanByName(plans, name),
      isLoading: query.isLoading,
      isError: query.isError,
      refetch: () => void query.refetch(),
    }
  }, [query])
}
