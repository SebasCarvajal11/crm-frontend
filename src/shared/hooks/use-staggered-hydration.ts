import { useEffect, useState } from 'react'

export type StaggeredHydrationLevels = {
  tier2: boolean
  tier3: boolean
}

/**
 * Orquesta la hidratación escalonada de consultas pesadas en el dashboard.
 * Permite que el primer render visual (Tier 1) ocurra inmediatamente sin contención
 * de socket ni bloqueo del hilo principal de JavaScript.
 *
 * Tier 1 (0ms): Crítico / Above-the-fold (Identidad, Proyectos locales).
 * Tier 2 (~120ms): Secundario (Notificaciones, Tareas prioritarias).
 * Tier 3 (~350ms): Periférico / Analítica (KPIs, Directorios, Gráficos).
 */
export function useStaggeredHydration(
  tier2DelayMs = 120,
  tier3DelayMs = 350
): StaggeredHydrationLevels {
  const [tier2, setTier2] = useState(false)
  const [tier3, setTier3] = useState(false)

  useEffect(() => {
    const t2 = setTimeout(() => setTier2(true), tier2DelayMs)
    const t3 = setTimeout(() => setTier3(true), tier3DelayMs)

    return () => {
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [tier2DelayMs, tier3DelayMs])

  return { tier2, tier3 }
}
