import { chromium } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const BASE_URL = process.env.TARGET_URL || 'http://155.248.207.47'
const OUTPUT_DIR = 'C:\\Users\\27seb\\.gemini\\antigravity\\brain\\d4c68a81-8968-412d-9f97-67e28767334d\\screenshots'

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

const VIEWPORTS = [
  { name: '2k_uhd_1440p', width: 2560, height: 1440 },
  { name: 'desktop_1080p', width: 1920, height: 1080 },
  { name: 'laptop_768p', width: 1366, height: 768 },
  { name: 'laptop_800p', width: 1280, height: 800 },
]

const ZOOM_LEVELS = [1.0, 1.1, 1.25, 1.5]

async function measurePageMetrics(page, selector) {
  return await page.evaluate((sel) => {
    const main = document.querySelector('main')
    const board = document.querySelector(sel)
    const docEl = document.documentElement

    const mainRect = main ? main.getBoundingClientRect() : null
    const boardRect = board ? board.getBoundingClientRect() : null

    return {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      docScrollHeight: docEl.scrollHeight,
      docClientHeight: docEl.clientHeight,
      mainScrollHeight: main ? main.scrollHeight : 0,
      mainClientHeight: main ? main.clientHeight : 0,
      mainOverflowY: main ? Math.max(0, main.scrollHeight - main.clientHeight) : 0,
      boardTop: boardRect ? Math.round(boardRect.top) : null,
      boardBottom: boardRect ? Math.round(boardRect.bottom) : null,
      boardHeight: boardRect ? Math.round(boardRect.height) : null,
      viewportBottomOverflow: boardRect ? Math.max(0, Math.round(boardRect.bottom - window.innerHeight)) : null,
    }
  }, selector)
}

async function run() {
  console.log(`\n======================================================`)
  console.log(` AUDITORÍA EXHAUSTIVA DE SCROLL DESKTOP - COLABORACIÓN `)
  console.log(` Target: ${BASE_URL}`)
  console.log(`======================================================\n`)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'es-CO',
  })
  const page = await context.newPage()

  console.log('1. Autenticando usuario gerente@cima.dev...')
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' })
  await page.locator('input[type="email"]').fill('gerente@cima.dev')
  await page.locator('input[type="password"]').fill('Demo123!')
  await page.getByRole('button', { name: /Entrar/i }).click()
  await page.waitForURL('**/dashboard**', { timeout: 25000 })
  await page.waitForLoadState('networkidle')
  console.log('✓ Login exitoso.\n')

  // Obtener primer ID de proyecto disponible
  await page.goto(`${BASE_URL}/dashboard?tab=collab`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const firstProjectCard = page.locator('[data-tour="collab-card-first"], button:has-text("Proyecto")').first()
  let targetProjectId = '8e2143d1-27e2-405f-ac70-89f5f498b287'
  
  const auditResults = []

  // 1. Auditoría de Vista Principal: Tablero Kanban de Proyectos
  console.log('--- FASE 1: Tablero General de Proyectos (Collab Panel) ---')
  for (const vp of VIEWPORTS) {
    for (const zoom of ZOOM_LEVELS) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto(`${BASE_URL}/dashboard?tab=collab`, { waitUntil: 'networkidle' })
      
      // Aplicar zoom de CIMA
      await page.evaluate((z) => {
        window.localStorage.setItem('cima_ui_zoom', String(z))
        document.documentElement.style.zoom = String(z)
        document.documentElement.style.setProperty('--app-zoom', String(z))
      }, zoom)
      await page.waitForTimeout(600)

      const metrics = await measurePageMetrics(page, '[data-tour="collab-columns-container"]')
      
      const screenshotName = `projects_${vp.name}_z${Math.round(zoom * 100)}.png`
      const screenshotPath = path.join(OUTPUT_DIR, screenshotName)
      await page.screenshot({ path: screenshotPath, fullPage: false })

      auditResults.push({
        view: 'Proyectos Kanban',
        viewport: vp.name,
        resolution: `${vp.width}x${vp.height}`,
        zoom: `${Math.round(zoom * 100)}%`,
        mainHeight: metrics.mainClientHeight,
        mainScroll: metrics.mainScrollHeight,
        overflowY: metrics.mainOverflowY,
        boardHeight: metrics.boardHeight,
        boardBottom: metrics.boardBottom,
        cutoffPx: metrics.viewportBottomOverflow,
        hasOuterScroll: metrics.mainOverflowY > 0,
        screenshot: screenshotName,
      })

      console.log(`[${vp.name}] Zoom ${Math.round(zoom * 100)}%: Overflow Main = ${metrics.mainOverflowY}px, Board Cutoff = ${metrics.viewportBottomOverflow}px (Guardado: ${screenshotName})`)
    }
  }

  // 2. Auditoría de Vista Proyecto: Tablero Kanban de Tareas (Project Workspace)
  console.log('\n--- FASE 2: Tablero Kanban de Tareas del Proyecto (Workspace Tasks) ---')
  for (const vp of VIEWPORTS) {
    for (const zoom of ZOOM_LEVELS) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      const workspaceUrl = `${BASE_URL}/dashboard?tab=collab&project_id=${targetProjectId}&workspace_tab=board`
      await page.goto(workspaceUrl, { waitUntil: 'networkidle' })

      // Aplicar zoom de CIMA
      await page.evaluate((z) => {
        window.localStorage.setItem('cima_ui_zoom', String(z))
        document.documentElement.style.zoom = String(z)
        document.documentElement.style.setProperty('--app-zoom', String(z))
      }, zoom)
      await page.waitForTimeout(600)

      const metrics = await measurePageMetrics(page, '[data-tour="workspace-task-columns"]')

      const screenshotName = `tasks_${vp.name}_z${Math.round(zoom * 100)}.png`
      const screenshotPath = path.join(OUTPUT_DIR, screenshotName)
      await page.screenshot({ path: screenshotPath, fullPage: false })

      auditResults.push({
        view: 'Tareas Kanban (Workspace)',
        viewport: vp.name,
        resolution: `${vp.width}x${vp.height}`,
        zoom: `${Math.round(zoom * 100)}%`,
        mainHeight: metrics.mainClientHeight,
        mainScroll: metrics.mainScrollHeight,
        overflowY: metrics.mainOverflowY,
        boardHeight: metrics.boardHeight,
        boardBottom: metrics.boardBottom,
        cutoffPx: metrics.viewportBottomOverflow,
        hasOuterScroll: metrics.mainOverflowY > 0,
        screenshot: screenshotName,
      })

      console.log(`[${vp.name}] Zoom ${Math.round(zoom * 100)}%: Overflow Main = ${metrics.mainOverflowY}px, Tasks Cutoff = ${metrics.viewportBottomOverflow}px (Guardado: ${screenshotName})`)
    }
  }

  // Guardar reporte JSON
  const reportPath = path.join(OUTPUT_DIR, 'audit-collab-metrics.json')
  fs.writeFileSync(reportPath, JSON.stringify(auditResults, null, 2), 'utf-8')
  console.log(`\n✓ Reporte de métricas guardado en ${reportPath}`)

  await browser.close()
  console.log('✓ Auditoría finalizada exitosamente.\n')
}

run().catch((err) => {
  console.error('Error fatal durante la auditoría:', err)
  process.exit(1)
})
