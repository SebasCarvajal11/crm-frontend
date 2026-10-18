/**
 * Tipos oficiales para el módulo de Analytics.
 * Sincronizados fielmente con las entidades y DTOs de crm-marketing (Spring Boot).
 * ADR-011: Tipado y Contratos de Analítica Frontend-Backend.
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
// Sincronizado con ClientPlanDistributionDto.java
export interface ClientPlanDistributionDto {
  plan: string
  clientCount: number
}

// ── Actividad de Clientes ──────────────────────────────────────────────────
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
// Sincronizado con KpiSnapshotDto.java (ADR-011)
export interface KpiSnapshotDto {
  snapshotsId: number | null
  period: string
  calculatedAt: string
  newClients: number
  closedProjects: number
  estimatedRevenue: number
  activeCampaigns: number
  clientsContacted: number
  responseRate: number
  avgCloseDays: number
  projectsInProgress: number
  calculatedBy: string | null
}

// ── Detalle de KPI, comparación mensual y proyectos (crm-marketing PR #9) ──
// Fechas ISO sin zona (p. ej. 2026-10-07T00:36:37); period en formato YYYY-MM.
export type KpiKey =
  | 'new_clients'
  | 'closed_projects'
  | 'revenue'
  | 'active_campaigns'
  | 'clients_contacted'
  | 'response_rate'
  | 'avg_close_days'
  | 'projects_in_progress'

export interface KpiDetailItemDto {
  id: string
  title: string | null
  subtitle: string | null
  date: string | null
  value: number | null
  status: string | null
  clientId: string | null
  clientName: string | null
}

/** total = número de registros; kpiValue = valor que muestra la tarjeta. */
export interface KpiDetailDto {
  kpi: KpiKey
  period: string
  total: number
  kpiValue: number | null
  items: KpiDetailItemDto[]
}

export interface KpiDeltaDto {
  kpi: KpiKey
  current: number | null
  previous: number | null
  /** null cuando el período anterior vale 0 (no hay base de comparación). */
  deltaPercent: number | null
}

export interface KpiComparisonDto {
  period: string
  previousPeriod: string
  kpis: KpiDeltaDto[]
}

export type ProjectStatus = 'todo' | 'in_progress' | 'in_review' | 'completed'

export interface ProjectAnalyticsDto {
  projectId: string
  name: string | null
  status: string | null
  clientId: string | null
  clientName: string | null
  createdAt: string | null
  updatedAt: string | null
  /** Lo aprobado del cliente del proyecto (las propuestas aún no se vinculan a un proyecto). */
  approvedProposalsValue: number | null
}

/** Respuesta de POST /api/v1/integration/sync. */
export interface CrmSyncResultDto {
  clientesSincronizados: number
  proyectosSincronizados: number
  fecha: string
}
