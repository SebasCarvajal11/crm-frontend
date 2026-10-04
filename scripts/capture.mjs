import { chromium } from '@playwright/test'
import path from 'node:path'

const BASE_URL = process.env.TARGET_URL || 'http://155.248.207.47'
const STAGE = process.env.CAPTURE_STAGE || 'antes'
const OUT_DIR = path.resolve('C:/Users/27seb/.gemini/antigravity/brain/e3c6425d-5981-4612-9f97-2db6ee947d2d/screenshots', STAGE)

async function run() {
  console.log(`Iniciando captura de producción para etapa [${STAGE}] en ${BASE_URL}...`)
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'es-CO',
  })
  const page = await context.newPage()

  // 1. Iniciar sesión
  await page.goto(`${BASE_URL}/login`)
  await page.waitForLoadState('networkidle')
  await page.fill('input[type="email"]', 'gerente@cima.dev')
  await page.fill('input[type="password"]', 'Demo123!')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard**', { timeout: 20000 })
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  console.log('Login exitoso en dashboard!')

  // 2. Fase 1.1: SectionTabs (Pestañas de Marketing / Administración)
  await page.goto(`${BASE_URL}/dashboard?tab=marketing`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)
  const tabsMarketing = page.locator('[data-tour="marketing-tabs"]').or(page.locator('role=tablist')).first()
  if (await tabsMarketing.isVisible()) {
    await tabsMarketing.screenshot({ path: path.join(OUT_DIR, '01_section_tabs_marketing.png') })
  }
  await page.screenshot({ path: path.join(OUT_DIR, '01_view_marketing_full.png') })
  console.log('Capturado 01: SectionTabs')

  // 3. Fase 1.2 & 2.4: Analítica (Métricas / Gráfico de KPIs)
  await page.goto(`${BASE_URL}/dashboard?tab=analytics`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  const chartContainer = page.locator('[data-testid="kpi-trend-area-chart"]').or(page.locator('.recharts-responsive-container')).first()
  if (await chartContainer.isVisible()) {
    await chartContainer.screenshot({ path: path.join(OUT_DIR, '07_kpi_trend_chart.png') })
  }
  await page.screenshot({ path: path.join(OUT_DIR, '02_analytics_view_full.png') })
  console.log('Capturado 02 & 07: Analítica y Gráficos')

  // 4. Fase 1.3: Tablero Kanban (Colaboración)
  await page.goto(`${BASE_URL}/dashboard?tab=collab`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: path.join(OUT_DIR, '03_kanban_collab_full.png') })
  console.log('Capturado 03: Kanban')

  // 5. Fase 2.1 & 2.2: Proyecto, Chat y Contrato
  const firstProject = page.locator('[data-tour="collab-card-first"]').or(page.locator('button:has-text("Proyecto")')).first()
  if (await firstProject.isVisible()) {
    await firstProject.click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    // Chat
    const chatTab = page.locator('button:has-text("Chat"), [role="tab"]:has-text("Chat")').first()
    if (await chatTab.isVisible()) {
      await chatTab.click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: path.join(OUT_DIR, '05_chat_messages.png') })
    }
    // Contrato / Formalización
    const contractTab = page.locator('button:has-text("Contrato"), [role="tab"]:has-text("Contrato"), button:has-text("Formalización")').first()
    if (await contractTab.isVisible()) {
      await contractTab.click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: path.join(OUT_DIR, '04_contract_signature.png') })
    }
    console.log('Capturado 04 & 05: Chat y Contrato')
  }

  // 6. Fase 2.3: Panel de Notificaciones
  await page.goto(`${BASE_URL}/dashboard?tab=notifications`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: path.join(OUT_DIR, '06_notifications_panel.png') })
  console.log('Capturado 06: Notificaciones')

  // 7. Fase 3.2 & 3.3: Consola de Administración (Storage y Conmutador de Invitaciones)
  await page.goto(`${BASE_URL}/dashboard?tab=admin`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1500)
  
  // Storage
  const storageCard = page.locator('[data-tour="admin-storage-overview"]').or(page.locator('text=Almacenamiento de Archivos en la Nube')).first()
  if (await storageCard.isVisible()) {
    await storageCard.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    await storageCard.screenshot({ path: path.join(OUT_DIR, '09_admin_storage_card.png') })
  }

  // Subpestaña Centro de Incorporación
  const invitesSubTab = page.locator('[data-tour="admin-tab-invites"]').or(page.locator('button:has-text("Centro de Incorporación")')).first()
  if (await invitesSubTab.isVisible()) {
    await invitesSubTab.click()
    await page.waitForTimeout(1000)
    await page.screenshot({ path: path.join(OUT_DIR, '10_admin_invites_view.png') })
  }

  await page.screenshot({ path: path.join(OUT_DIR, '08_admin_view_full.png') })
  console.log('Capturado 09 & 10: Admin Storage e Invites')

  // 8. Fase 3.1: Tour Spotlight
  await page.goto(`${BASE_URL}/dashboard?tab=collab`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)
  const helpBtn = page.locator('[data-testid="help-widget-trigger"], button[aria-label*="ayuda"]').first()
  if (await helpBtn.isVisible()) {
    await helpBtn.click()
    await page.waitForTimeout(800)
    const allGuidesBtn = page.locator('button:has-text("Todas las guías")').first()
    if (await allGuidesBtn.isVisible()) {
      await allGuidesBtn.click()
      await page.waitForTimeout(500)
      const startMission = page.locator('button:has-text("Iniciar"), button:has-text("Misión 1")').first()
      if (await startMission.isVisible()) {
        await startMission.click()
        await page.waitForTimeout(1200)
        await page.screenshot({ path: path.join(OUT_DIR, '08_tour_spotlight.png') })
      }
    }
    console.log('Capturado 08: Tour Spotlight')
  }

  await browser.close()
  console.log(`Capturas para [${STAGE}] finalizadas con éxito!`)
}

run().catch((err) => {
  console.error('Error durante la captura:', err)
  process.exit(1)
})
