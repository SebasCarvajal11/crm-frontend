/**
 * Tipos para el módulo de Analytics.
 * Estos DTOs vienen directamente del backend (AnalyticsController).
 *
 * AnalyticsSummaryDto, CampaignStatusReportDto e InventoryAlertDto fueron
 * verificados contra respuestas reales del backend (Postman) y contra
 * InventoryAlertDto.java el 2026-08-18 — antes de esta fecha este archivo
 * tenía campos inventados que no existían en el backend real (ver PR de
 * corrección). ClientPlanDistributionDto, ClientActivityDto y KpiSnapshotDto
 * NO han sido verificados todavía: revisar contra el DTO Java real antes de
 * consumirlos (KpiSnapshotDto en particular casi seguro está mal — no se
 * parece en nada a las columnas de la tabla kpi_snapshots en Postgres).
 */

// ── Resumen General ────────────────────────────────────────────────────────
export interface AnalyticsSummaryDto {
  totalClients: number
  totalUsers: number
  totalCampaigns: number
  activeCampaigns: number
  totalProjects: number
  projectsInProgress: number
  totalProducts: number
  totalInventoryItems: number
  totalStock: number
  lowStockAlerts: number
  totalKpiSnapshots: number
  totalMarketingInteractions: number
}

// ── Distribución de Clientes por Plan ──────────────────────────────────────
// ⚠️ NO VERIFICADO contra el backend real, revisar antes de usar en producción.
export interface ClientPlanDistributionDto {
  planName: string
  clientCount: number
  percentage: number
}

// ── Actividad de Clientes ──────────────────────────────────────────────────
// ⚠️ NO VERIFICADO contra el backend real, revisar antes de usar en producción.
export interface ClientActivityDto {
  clientId: string
  clientName: string
  lastActivityDate: string
  activeCampaigns: number
  totalCampaigns: number
}

// ── Estado de Campañas ─────────────────────────────────────────────────────
export interface CampaignStatusReportDto {
  status: string
  campaignCount: number
}

// ── Alertas de Inventario ─────────────────────────────────────────────────
export interface InventoryAlertDto {
  inventoryId: number
  productId: number
  productName: string
  totalStock: number
  pointOfSaleStock: number
  lowStockAlert: number
  inventoryType: string
}

// ── KPI Snapshots ─────────────────────────────────────────────────────────
// ⚠️ NO VERIFICADO contra el backend real — muy probablemente incorrecto.
// La tabla kpi_snapshots real tiene: period, active_campaigns, avg_close_days,
// calculated_at, calculated_by, clients_contacted, closed_projects,
// estimated_revenue, new_clients, projects_in_progress, response_rate.
// No se parece en nada a la forma de abajo (kpiId/kpiName/value/trend).
export interface KpiSnapshotDto {
  kpiId: string
  kpiName: string
  value: number
  previousValue: number
  changePercentage: number
  trend: 'UP' | 'DOWN' | 'STABLE'
  timestamp: string
}
