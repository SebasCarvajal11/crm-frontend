import { chromium } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import { spawn } from 'child_process'

const PREVIEW_PORT = 4176
const BASE_URL = `http://127.0.0.1:${PREVIEW_PORT}`
const OUTPUT_DIR = 'C:\\Users\\27seb\\.gemini\\antigravity\\brain\\d4c68a81-8968-412d-9f97-67e28767334d\\screenshots\\despues'

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

const projectId = '22222222-2222-4222-8222-222222222222'
const project = {
  id: projectId,
  name: 'Proyecto de prueba CIMA',
  clientName: 'Cliente CIMA',
  type: 'campaign_service',
  status: 'in_progress',
  progressPercent: 40,
  description: 'Validación de interfaz sin scroll',
  clientSub: null,
  adminResponsibleSub: 'test-user',
  estimatedDueDate: null,
  latestApprovedFileId: null,
  fileRepositoryUrl: null,
  isArchived: false,
  createdAt: '2026-09-28T00:00:00Z',
  updatedAt: '2026-09-28T00:00:00Z',
}

const mockProjects = [
  project,
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Campaña Estratégica Q4',
    clientName: 'Moda Bella',
    type: 'campaign_service',
    status: 'in_review',
    progressPercent: 75,
    description: 'Revisión final de piezas',
    clientSub: null,
    adminResponsibleSub: 'test-user',
    estimatedDueDate: null,
    latestApprovedFileId: null,
    fileRepositoryUrl: null,
    isArchived: false,
    createdAt: '2026-09-28T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    name: 'Lanzamiento Petal Restore',
    clientName: 'Petal Cosmetics',
    type: 'product_order',
    status: 'completed',
    progressPercent: 100,
    description: 'Entregables completados',
    clientSub: null,
    adminResponsibleSub: 'test-user',
    estimatedDueDate: null,
    latestApprovedFileId: null,
    fileRepositoryUrl: null,
    isArchived: false,
    createdAt: '2026-09-28T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    name: 'Plan de Captación Leads',
    clientName: 'Urban Hub',
    type: 'campaign_service',
    status: 'todo',
    progressPercent: 10,
    description: 'Backlog inicial',
    clientSub: null,
    adminResponsibleSub: 'test-user',
    estimatedDueDate: null,
    latestApprovedFileId: null,
    fileRepositoryUrl: null,
    isArchived: false,
    createdAt: '2026-09-28T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
]

const pageOf = (items) => ({ items, total: items.length, page: 1, limit: 100, total_pages: 1 })

async function setupPageRoutes(page) {
  const token = `fixture.${Buffer.from(JSON.stringify({ role: 'admin', sub: '11111111-1111-4111-8111-111111111111' })).toString('base64url')}.fixture`
  await page.addInitScript(({ token }) => {
    sessionStorage.setItem('cima_access_token', token)
    sessionStorage.setItem('cima_user_email', 'gerente@cima.dev')
  }, { token })

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname

    if (path === '/api/v1/identity/presence') return route.fulfill({ json: { data: { heartbeat_interval_seconds: 60 } } })
    if (path.endsWith('/identity/me')) return route.fulfill({ json: { data: { id: '11111111-1111-4111-8111-111111111111', email: 'gerente@cima.dev', role: 'admin', first_name: 'Gerente', last_name: 'CIMA', emailVerifiedAt: '2026-09-28T00:00:00Z' } } })
    if (path.endsWith('/avatars/current')) return route.fulfill({ status: 404, json: {} })
    if (path.endsWith('/collab/projects')) return route.fulfill({ json: { data: pageOf(mockProjects) } })
    if (path.endsWith('/projects/search')) return route.fulfill({ json: { data: mockProjects } })
    if (path.endsWith('/board')) {
      return route.fulfill({
        json: {
          data: {
            project,
            members: [],
            board: {
              columns: [
                { id: 'col-1', projectId, key: 'pending', title: 'Pendiente', position: 0, isClientVisible: true, isDefault: true },
                { id: 'col-2', projectId, key: 'doing', title: 'En Curso', position: 1, isClientVisible: true, isDefault: true },
                { id: 'col-3', projectId, key: 'review', title: 'En Revisión', position: 2, isClientVisible: true, isDefault: true },
                { id: 'col-4', projectId, key: 'done', title: 'Completado', position: 3, isClientVisible: true, isDefault: true },
              ],
              tasks: [
                { id: 't-1', projectId, columnId: 'col-1', title: 'Auditoría inicial de requerimientos', priority: 'high', position: 0, checklistProgress: 50, subtasks: [] },
                { id: 't-2', projectId, columnId: 'col-2', title: 'Diseño de arquitectura escalable', priority: 'medium', position: 0, checklistProgress: 100, subtasks: [] },
                { id: 't-3', projectId, columnId: 'col-2', title: 'Implementación sin desbordamientos', priority: 'high', position: 1, checklistProgress: 20, subtasks: [] },
                { id: 't-4', projectId, columnId: 'col-3', title: 'Revisión con Playwright CLI', priority: 'medium', position: 0, checklistProgress: 80, subtasks: [] },
                { id: 't-5', projectId, columnId: 'col-4', title: 'Despliegue verificado', priority: 'low', position: 0, checklistProgress: 100, subtasks: [] },
              ],
            },
          },
        },
      })
    }
    if (path.endsWith('/notifications/unread/count')) return route.fulfill({ json: { data: { unread_count: 0 } } })
    if (path.includes('/chat/')) return route.fulfill({ json: { data: pageOf([]) } })
    if (path.endsWith('/brief') || path.endsWith('/contract')) return route.fulfill({ json: { data: null } })
    if (path.endsWith('/members') || path.endsWith('/change-requests') || path.endsWith('/change-requests/pending') || path.endsWith('/timeline') || path.endsWith('/files') || path.endsWith('/notifications/unread')) {
      return route.fulfill({ json: { data: [] } })
    }
    if (path.endsWith('/account/sessions')) return route.fulfill({ json: { data: [] } })
    if (path.endsWith('/admin/users')) return route.fulfill({ json: { data: pageOf([]) } })
    if (path.endsWith('/admin/storage/tree')) {
      return route.fulfill({ json: { data: { summary: { totalClients: 0, totalProjects: 0, totalFiles: 0, totalBytes: 0, purgedFilesCount: 0, purgedBytes: 0 }, clients: [] } } })
    }
    if (path.endsWith('/media/storage/stats')) {
      return route.fulfill({
        json: {
          data: {
            cloudStorage: { quotaBytes: 1_000_000, usedBytes: 0, availableBytes: 1_000_000, usedPercentage: 0, totalFilesCount: 0, projectFilesCount: 0, projectFilesBytes: 0, avatarsCount: 0, avatarsBytes: 0, documentsCount: 0, documentsBytes: 0 },
            disk: { totalBytes: 1_000_000, usedBytes: 0, availableBytes: 1_000_000, usedPercentage: 0 },
            assets: { totalAssetsCount: 0, totalAssetsBytes: 0, documentsCount: 0, documentsBytes: 0, avatarsCount: 0, avatarsBytes: 0 }, cachedAt: '2026-09-28T00:00:00Z',
          },
        },
      })
    }
    if (path.startsWith('/api/v1/marketing/')) return route.fulfill({ json: [] })
    if (path.includes('/analytics/summary') || path.includes('/kpis/current')) return route.fulfill({ json: {} })
    if (path.startsWith('/api/v1/analytics/')) return route.fulfill({ json: [] })

    return route.fulfill({ json: { data: {} } })
  })
}

async function measureMetrics(page, selector) {
  return await page.evaluate((sel) => {
    const main = document.querySelector('main')
    const board = document.querySelector(sel)
    const docEl = document.documentElement
    const body = document.body
    const boardRect = board ? board.getBoundingClientRect() : null

    return {
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,
      htmlScrollHeight: docEl.scrollHeight,
      htmlClientHeight: docEl.clientHeight,
      bodyScrollHeight: body.scrollHeight,
      bodyClientHeight: body.clientHeight,
      mainScrollHeight: main ? main.scrollHeight : 0,
      mainClientHeight: main ? main.clientHeight : 0,
      mainOverflowY: main ? Math.max(0, main.scrollHeight - main.clientHeight) : 0,
      boardTop: boardRect ? Math.round(boardRect.top) : null,
      boardBottom: boardRect ? Math.round(boardRect.bottom) : null,
      boardHeight: boardRect ? Math.round(boardRect.height) : null,
      viewportBottomOverflow: boardRect ? Math.max(0, Math.round(boardRect.bottom - window.innerHeight)) : null,
      outerScrollable: docEl.scrollHeight > window.innerHeight || body.scrollHeight > window.innerHeight,
    }
  }, selector)
}

async function run() {
  console.log(`Iniciando servidor Vite Preview en puerto ${PREVIEW_PORT}...`)
  const previewProcess = spawn('pnpm', ['exec', 'vite', 'preview', '--host', '127.0.0.1', '--port', String(PREVIEW_PORT), '--strictPort'], {
    cwd: path.resolve('d:/BACKUP CELULAR OLIMPO/crm-frontend'),
    shell: true,
  })

  // Esperar a que el servidor esté listo
  await new Promise((resolve) => setTimeout(resolve, 3000))

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, locale: 'es-CO' })
  const page = await context.newPage()
  page.on('pageerror', (err) => console.error('PAGE ERROR DETECTED:', err))

  await setupPageRoutes(page)

  const verificationResults = []

  console.log('\n--- VERIFICACIÓN POST-IMPLEMENTACIÓN: TABLERO DE PROYECTOS ---')
  for (const vp of VIEWPORTS) {
    for (const zoom of ZOOM_LEVELS) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto(`${BASE_URL}/dashboard?tab=collab`, { waitUntil: 'networkidle' })

      await page.evaluate((z) => {
        window.localStorage.setItem('cima_ui_zoom', String(z))
        document.documentElement.style.zoom = String(z)
        document.documentElement.style.setProperty('--app-zoom', String(z))
      }, zoom)
      await page.waitForTimeout(600)

      const m = await measureMetrics(page, '[data-tour="collab-columns-container"]')
      const screenshotName = `after_projects_${vp.name}_z${Math.round(zoom * 100)}.png`
      await page.screenshot({ path: path.join(OUTPUT_DIR, screenshotName), fullPage: false })

      verificationResults.push({
        view: 'Proyectos Kanban (AFTER)',
        viewport: vp.name,
        resolution: `${vp.width}x${vp.height}`,
        zoom: `${Math.round(zoom * 100)}%`,
        htmlScroll: m.htmlScrollHeight,
        windowHeight: m.windowHeight,
        mainHeight: m.mainClientHeight,
        mainScroll: m.mainScrollHeight,
        mainOverflowY: m.mainOverflowY,
        boardHeight: m.boardHeight,
        boardBottom: m.boardBottom,
        cutoffPx: m.viewportBottomOverflow,
        outerScrollable: m.outerScrollable,
      })

      console.log(`[${vp.name}] Zoom ${Math.round(zoom * 100)}%: Main Overflow = ${m.mainOverflowY}px, Board Height = ${m.boardHeight}px, Board Bottom = ${m.boardBottom}px (Win: ${m.windowHeight}px), Board Cutoff = ${m.viewportBottomOverflow}px, Outer Scroll = ${m.outerScrollable}`)
    }
  }

  console.log('\n--- VERIFICACIÓN POST-IMPLEMENTACIÓN: TABLERO DE TAREAS ---')
  for (const vp of VIEWPORTS) {
    for (const zoom of ZOOM_LEVELS) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto(`${BASE_URL}/dashboard?tab=collab&project_id=${projectId}&workspace_tab=board`, { waitUntil: 'networkidle' })

      await page.evaluate((z) => {
        window.localStorage.setItem('cima_ui_zoom', String(z))
        document.documentElement.style.zoom = String(z)
        document.documentElement.style.setProperty('--app-zoom', String(z))
      }, zoom)
      await page.waitForTimeout(600)

      const m = await measureMetrics(page, '[data-tour="workspace-task-columns"]')
      const screenshotName = `after_tasks_${vp.name}_z${Math.round(zoom * 100)}.png`
      await page.screenshot({ path: path.join(OUTPUT_DIR, screenshotName), fullPage: false })

      verificationResults.push({
        view: 'Tareas Kanban Workspace (AFTER)',
        viewport: vp.name,
        resolution: `${vp.width}x${vp.height}`,
        zoom: `${Math.round(zoom * 100)}%`,
        htmlScroll: m.htmlScrollHeight,
        windowHeight: m.windowHeight,
        mainHeight: m.mainClientHeight,
        mainScroll: m.mainScrollHeight,
        mainOverflowY: m.mainOverflowY,
        boardHeight: m.boardHeight,
        boardBottom: m.boardBottom,
        cutoffPx: m.viewportBottomOverflow,
        outerScrollable: m.outerScrollable,
      })

      console.log(`[${vp.name}] Zoom ${Math.round(zoom * 100)}%: Main Overflow = ${m.mainOverflowY}px, Tasks Height = ${m.boardHeight}px, Tasks Bottom = ${m.boardBottom}px (Win: ${m.windowHeight}px), Tasks Cutoff = ${m.viewportBottomOverflow}px, Outer Scroll = ${m.outerScrollable}`)
    }
  }

  const reportPath = path.join(OUTPUT_DIR, 'verification-metrics.json')
  fs.writeFileSync(reportPath, JSON.stringify(verificationResults, null, 2), 'utf-8')
  console.log(`\n✓ Reporte post-implementación guardado en ${reportPath}`)

  await browser.close()
  previewProcess.kill()
  process.exit(0)
}

run().catch((err) => {
  console.error('Error durante la verificación:', err)
  process.exit(1)
})
