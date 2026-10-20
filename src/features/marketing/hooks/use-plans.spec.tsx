import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { MarketingPlan } from '../api/plans-api'
import { plansQueryKey, usePlans, type UsePlansResult } from './use-plans'

const mockListPlans = vi.fn()
vi.mock('../api/plans-api', () => ({
  listPlansRequest: (...args: unknown[]) => mockListPlans(...args),
}))

const catalogo: MarketingPlan[] = [
  { planId: 'd', name: 'Diamante', color: '#0ea5e9', sortOrder: 3, active: true, clientCount: 2 },
  { planId: 'x', name: 'Bronce', color: '#a16207', sortOrder: 0, active: false, clientCount: 4 },
  { planId: 'o', name: 'Oro', color: '#f59e0b', sortOrder: 2, active: true, clientCount: 1 },
]

function renderHook(
  data?: MarketingPlan[],
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
): UsePlansResult {
  if (data) queryClient.setQueryData(plansQueryKey, data)
  let result: UsePlansResult | null = null
  function Consumer() {
    result = usePlans('token')
    return null
  }
  renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>
      <Consumer />
    </QueryClientProvider>
  )
  return result!
}

describe('usePlans', () => {
  it('ordena el catálogo y separa los planes activos', () => {
    const { plans, activePlans } = renderHook(catalogo)
    expect(plans.map((p) => p.name)).toEqual(['Bronce', 'Oro', 'Diamante'])
    expect(activePlans.map((p) => p.name)).toEqual(['Oro', 'Diamante'])
  })

  it('encuentra el plan de un cliente aunque esté inactivo o en otra capitalización', () => {
    const { findPlan } = renderHook(catalogo)
    expect(findPlan('bronce')?.active).toBe(false)
    expect(findPlan('DIAMANTE')?.planId).toBe('d')
    expect(findPlan('Platinum')).toBeNull()
  })

  it('sin datos devuelve listas vacías y queda cargando', () => {
    const result = renderHook()
    expect(result.plans).toEqual([])
    expect(result.activePlans).toEqual([])
    expect(result.isLoading).toBe(true)
  })

  it('pide también los planes inactivos', async () => {
    mockListPlans.mockResolvedValueOnce(catalogo)
    const queryClient = new QueryClient()
    renderHook(undefined, queryClient)
    const query = queryClient.getQueryCache().find({ queryKey: plansQueryKey })
    const queryFn = query?.options.queryFn as (() => Promise<MarketingPlan[]>) | undefined
    await expect(queryFn?.()).resolves.toEqual(catalogo)
    expect(mockListPlans).toHaveBeenCalledWith('token', true)
  })
})
