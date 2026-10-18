import { api } from '@/shared/lib'
import { bearer } from '@/shared/lib/bearer'
import { ANALYTICS_ROUTES } from '@/shared/lib/gateway-routes'

import type { KpiComparisonDto, KpiDetailDto, KpiKey, KpiSnapshotDto } from '../model'

/**
 * Forma real de KpiSnapshotDto alineada con crm-marketing (ADR-011).
 */
export type KpiSnapshot = KpiSnapshotDto

export async function getCurrentKpisRequest(
  accessToken: string,
  period?: string
): Promise<KpiSnapshot> {
  const url = period
    ? ANALYTICS_ROUTES.kpisCurrentByPeriod(period)
    : ANALYTICS_ROUTES.kpisCurrent
  return api.get(url, { headers: bearer(accessToken) }).json<KpiSnapshot>()
}

export async function getKpisByPeriodRequest(
  accessToken: string,
  period: string
): Promise<KpiSnapshot> {
  return api
    .get(ANALYTICS_ROUTES.kpisByPeriod(period), { headers: bearer(accessToken) })
    .json<KpiSnapshot>()
}

export async function getKpiHistoryRequest(
  accessToken: string,
  from: string,
  to: string
): Promise<KpiSnapshot[]> {
  return api
    .get(`${ANALYTICS_ROUTES.kpisHistory}?from=${from}&to=${to}`, {
      headers: bearer(accessToken),
    })
    .json<KpiSnapshot[]>()
}

export async function calculateKpisRequest(
  accessToken: string,
  period?: string
): Promise<KpiSnapshot> {
  const url = period
    ? ANALYTICS_ROUTES.kpisCalculateByPeriod(period)
    : ANALYTICS_ROUTES.kpisCalculate
  return api.post(url, { headers: bearer(accessToken) }).json<KpiSnapshot>()
}

export function ultimosPeriodos(cantidad = 12): { value: string; label: string }[] {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ]
  const hoy = new Date()
  const resultado: { value: string; label: string }[] = []

  for (let i = 0; i < cantidad; i++) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    resultado.push({
      value: `${fecha.getFullYear()}-${mes}`,
      label: `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`,
    })
  }
  return resultado
}

// ── Detalle de cada KPI y comparación con el mes anterior ───────────────────
export async function getKpiDetailRequest(
  accessToken: string,
  kpi: KpiKey,
  period: string
): Promise<KpiDetailDto> {
  return api
    .get(ANALYTICS_ROUTES.kpiDetail(kpi), {
      headers: bearer(accessToken),
      searchParams: { period },
    })
    .json<KpiDetailDto>()
}

export async function compareKpisRequest(
  accessToken: string,
  period: string
): Promise<KpiComparisonDto> {
  return api
    .get(ANALYTICS_ROUTES.kpisCompare, {
      headers: bearer(accessToken),
      searchParams: { period },
    })
    .json<KpiComparisonDto>()
}

export async function exportKpiDetailRequest(
  accessToken: string,
  kpi: KpiKey,
  period: string,
  format: 'xlsx' | 'pdf'
): Promise<Blob> {
  return api
    .get(ANALYTICS_ROUTES.exportKpiDetail(kpi), {
      headers: bearer(accessToken),
      searchParams: { period, format },
    })
    .blob()
}
