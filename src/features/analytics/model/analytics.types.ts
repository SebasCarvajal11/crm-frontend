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
