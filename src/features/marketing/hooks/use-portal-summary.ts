import { useQuery } from '@tanstack/react-query'
import { getMyCommercialSummaryRequest, portalKeys } from '../api/portal-api'
import { MESSAGES_REFETCH_MS, isNotSyncedError } from '../ui/portal.utils'

/**
 * Resumen comercial del cliente autenticado (GET /marketing/me/summary). Se usa
 * para el encabezado de "Mi espacio comercial" y para el contador del menú
 * (propuestas pendientes + mensajes sin leer). Un 404 significa que la cuenta
 * aún no está sincronizada con marketing: no se reintenta.
 */
export function usePortalSummary(accessToken: string, enabled = true) {
  return useQuery({
    queryKey: portalKeys.summary,
    queryFn: () => getMyCommercialSummaryRequest(accessToken),
    enabled: enabled && Boolean(accessToken),
    staleTime: 15_000,
    refetchInterval: enabled ? MESSAGES_REFETCH_MS * 3 : false,
    retry: (count, error) => !isNotSyncedError(error) && count < 2,
  })
}

/** Número del contador del menú: propuestas por decidir + mensajes de CIMA sin leer. */
export function portalBadgeCount(summary?: { pendingProposals?: number; unreadMessages?: number } | null): number {
  if (!summary) return 0
  return Math.max(0, summary.pendingProposals ?? 0) + Math.max(0, summary.unreadMessages ?? 0)
}
