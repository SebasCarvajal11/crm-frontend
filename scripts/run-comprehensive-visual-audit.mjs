import { chromium } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const BASE_URL = 'http://127.0.0.1:4175'
const SCREENSHOT_DIR = 'C:/Users/27seb/.gemini/antigravity/brain/0248656a-86db-4252-bbe8-5d7b942cbae3/screenshots'

// 8 Viewports representativos que cubren todos los breakpoints de diseño
const VIEWPORTS = [
  { id: 'tv-4k', label: 'Ultra HD 4K / TV', width: 3840, height: 2160, isMobile: false, hasTouch: false },
  { id: 'desktop-1080p', label: 'Monitor 1080p Estándar', width: 1920, height: 1080, isMobile: false, hasTouch: false },
  { id: 'laptop-1366', label: 'Laptop Compacta', width: 1366, height: 768, isMobile: false, hasTouch: false },
  { id: 'ipad-landscape', label: 'iPad Pro Horizontal', width: 1194, height: 834, isMobile: true, hasTouch: true },
  { id: 'ipad-portrait', label: 'iPad Pro / Air Vertical', width: 834, height: 1194, isMobile: true, hasTouch: true },
  { id: 'ipad-mini', label: 'iPad Clásico / Mini Vertical (768p)', width: 768, height: 1024, isMobile: true, hasTouch: true },
  { id: 'mobile-modern', label: 'Móvil Moderno (iPhone 14 / Pixel)', width: 390, height: 844, isMobile: true, hasTouch: true },
  { id: 'mobile-ultra-small', label: 'Móvil Mínimo / Antiguo (320p)', width: 320, height: 568, isMobile: true, hasTouch: true },
]

const projectId = '22222222-2222-4222-8222-222222222222'
const project2Id = '33333333-3333-4333-8333-333333333333'

const mockProjects = [
  {
    id: projectId,
    name: 'Campaña Lanzamiento CIMA 2026',
    clientName: 'Grupo Inversionista Andino',
    type: 'campaign_service',
    status: 'in_progress',
    progressPercent: 65,
    description: 'Estrategia integral omnicanal y despliegue corporativo.',
    clientSub: 'client-user-1',
    adminResponsibleSub: 'test-user',
    estimatedDueDate: '2026-11-15T00:00:00Z',
    latestApprovedFileId: 'file-1',
    fileRepositoryUrl: 'https://storage.cima.dev/repo',
    isArchived: false,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-10-08T00:00:00Z',
  },
  {
    id: project2Id,
    name: 'Automatización CRM y KrakenD Gateway',
    clientName: 'Soluciones Tecnológicas Alfa',
    type: 'product_order',
    status: 'todo',
    progressPercent: 25,
    description: 'Arquitectura desacoplada y observabilidad Prometheus.',
    clientSub: 'client-user-2',
    adminResponsibleSub: 'test-user',
    estimatedDueDate: '2026-12-01T00:00:00Z',
    latestApprovedFileId: null,
    fileRepositoryUrl: null,
    isArchived: false,
    createdAt: '2026-09-15T00:00:00Z',
    updatedAt: '2026-10-05T00:00:00Z',
  },
]

const mockBoard = {
  project: mockProjects[0],
  members: [
    { sub: 'test-user', name: 'Valeria Quintero', email: 'gerente@cima.dev', role: 'admin', profession: 'Directora de Operaciones', avatarId: 1 },
    { sub: 'worker-1', name: 'Carlos Mendoza', email: 'carlos@cima.dev', role: 'worker', profession: 'Especialista Frontend', avatarId: 2 },
    { sub: 'client-1', name: 'Mauricio Gómez', email: 'mauricio@andino.com', role: 'client', profession: 'Representante Legal', avatarId: 3 },
  ],
  board: {
    columns: [
      { id: 'col-1', projectId, key: 'pending', title: 'Pendiente', position: 0, isClientVisible: true, isDefault: true },
      { id: 'col-2', projectId, key: 'doing', title: 'En progreso', position: 1, isClientVisible: true, isDefault: true },
      { id: 'col-3', projectId, key: 'review', title: 'Revisión y QA', position: 2, isClientVisible: true, isDefault: true },
      { id: 'col-4', projectId, key: 'done', title: 'Completado', position: 3, isClientVisible: true, isDefault: true },
    ],
    tasks: [
      {
        id: 'task-1',
        projectId,
        columnId: 'col-2',
        title: 'Formalización de contrato y firma digital',
        description: 'Verificación del hash criptográfico SHA-256 de las cláusulas contractuales.',
        status: 'doing',
        priority: 'high',
        assignedToSub: 'test-user',
        order: 0,
        subtasks: [
          { id: 'sub-1', title: 'Generar PDF oficial', completed: true },
          { id: 'sub-2', title: 'Sello del cliente', completed: false },
        ],
        dueDate: '2026-10-14T00:00:00Z',
      },
      {
        id: 'task-2',
        projectId,
        columnId: 'col-1',
        title: 'Auditoría de consistencia responsive en 4 resoluciones',
        description: 'Revisión de Safari iOS, iPad, 1080p y 4K.',
        status: 'pending',
        priority: 'urgent',
        assignedToSub: 'worker-1',
        order: 0,
        subtasks: [],
        dueDate: '2026-10-18T00:00:00Z',
      },
      {
        id: 'task-3',
        projectId,
        columnId: 'col-3',
        title: 'Ajuste de degradado fluido con GPU compositor',
        description: 'Verificación de keyframes en perfil de usuario.',
        status: 'review',
        priority: 'normal',
        assignedToSub: 'test-user',
        order: 0,
        subtasks: [{ id: 'sub-3', title: 'Pruebas Vitest', completed: true }],
        dueDate: '2026-10-09T00:00:00Z',
      },
    ],
  },
}

const mockAdminUsers = [
  { id: 'user-1', email: 'gerente@cima.dev', role: 'admin', is_active: true, first_name: 'Valeria', last_name: 'Quintero', force_password_change: false, emailVerifiedAt: '2026-08-01T00:00:00Z', createdAt: '2026-08-01T00:00:00Z' },
  { id: 'user-2', email: 'carlos.mendoza@cima.dev', role: 'worker', is_active: true, first_name: 'Carlos', last_name: 'Mendoza', force_password_change: false, emailVerifiedAt: '2026-08-10T00:00:00Z', createdAt: '2026-08-10T00:00:00Z' },
  { id: 'user-3', email: 'mauricio.gomez@andino.com', role: 'client', is_active: true, first_name: 'Mauricio', last_name: 'Gómez', force_password_change: false, emailVerifiedAt: '2026-08-15T00:00:00Z', createdAt: '2026-08-15T00:00:00Z' },
  { id: 'user-4', email: 'ana.rodriguez@cima.dev', role: 'worker', is_active: true, first_name: 'Ana', last_name: 'Rodríguez', force_password_change: false, emailVerifiedAt: '2026-08-20T00:00:00Z', createdAt: '2026-08-20T00:00:00Z' },
  { id: 'user-5', email: 'felipe.torres@cliente.co', role: 'client', is_active: false, first_name: 'Felipe', last_name: 'Torres', force_password_change: true, emailVerifiedAt: null, createdAt: '2026-09-01T00:00:00Z' },
  { id: 'user-6', email: 'sofia.castillo@cima.dev', role: 'admin', is_active: true, first_name: 'Sofía', last_name: 'Castillo', force_password_change: false, emailVerifiedAt: '2026-09-10T00:00:00Z', createdAt: '2026-09-10T00:00:00Z' },
]

const mockStorageStats = {
  cloudStorage: {
    quotaBytes: 250_000_000_000,
    usedBytes: 85_500_000_000,
    availableBytes: 164_500_000_000,
    usedPercentage: 34.2,
    totalFilesCount: 1420,
    projectFilesCount: 890,
    projectFilesBytes: 65_000_000_000,
    avatarsCount: 180,
    avatarsBytes: 5_500_000_000,
    documentsCount: 350,
    documentsBytes: 15_000_000_000,
  },
  disk: {
    totalBytes: 500_000_000_000,
    usedBytes: 120_000_000_000,
    availableBytes: 380_000_000_000,
    usedPercentage: 24,
  },
  assets: {
    totalAssetsCount: 1420,
    totalAssetsBytes: 85_500_000_000,
    documentsCount: 350,
    documentsBytes: 15_000_000_000,
    avatarsCount: 180,
    avatarsBytes: 5_500_000_000,
  },
  cachedAt: '2026-10-08T20:00:00Z',
}

async function setupMockRoutes(page, role) {
  const token = `fixture.${Buffer.from(JSON.stringify({ role, sub: 'test-user' })).toString('base64url')}.fixture`
  await page.addInitScript(({ token, role }) => {
    sessionStorage.setItem('cima_access_token', token)
    sessionStorage.setItem('cima_user_email', 'gerente@cima.dev')
    sessionStorage.setItem('cima_tour_completed', 'true')
  }, { token, role })

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname

    if (path === '/api/v1/identity/presence') {
      return route.fulfill({ json: { data: { heartbeat_interval_seconds: 60 } } })
    }
    if (path.endsWith('/identity/me')) {
      return route.fulfill({
        json: {
          data: {
            id: '11111111-1111-4111-8111-111111111111',
            email: role === 'admin' ? 'gerente@cima.dev' : role === 'worker' ? 'carlos@cima.dev' : 'cliente@andino.com',
            role,
            first_name: role === 'admin' ? 'Valeria' : role === 'worker' ? 'Carlos' : 'Mauricio',
            last_name: role === 'admin' ? 'Quintero' : role === 'worker' ? 'Mendoza' : 'Gómez',
            emailVerifiedAt: '2026-09-28T00:00:00Z',
          },
        },
      })
    }
    if (path.endsWith('/avatars/current')) {
      return route.fulfill({
        json: { data: { version: 2, urls: { '64': '/avatars/avatar-1.webp', '256': '/avatars/avatar-1.webp' } } },
      })
    }
    if (path.endsWith('/collab/projects')) {
      return route.fulfill({
        json: { data: { items: mockProjects, total: mockProjects.length, page: 1, limit: 50, total_pages: 1 } },
      })
    }
    if (path.endsWith('/board')) {
      return route.fulfill({ json: { data: mockBoard } })
    }
    if (path.includes('/chat/')) {
      return route.fulfill({
        json: {
          data: {
            items: [
              {
                id: 'msg-1',
                channel: 'internal',
                sender_sub: 'test-user',
                sender_name: 'Valeria Quintero',
                sender_role: 'admin',
                message: 'Iniciamos auditoría de responsive e interfaces para CIMA CRM en 4K, 1080p, iPad y móviles.',
                created_at: '2026-10-08T21:00:00Z',
              },
              {
                id: 'msg-2',
                channel: 'internal',
                sender_sub: 'worker-1',
                sender_name: 'Carlos Mendoza',
                sender_role: 'worker',
                message: 'Entendido. Verificando breakpoints en iPad y Safari iOS para evitar recortes de layout.',
                created_at: '2026-10-08T21:05:00Z',
              },
            ],
            total: 2,
            page: 1,
            limit: 50,
            total_pages: 1,
          },
        },
      })
    }
    if (path.endsWith('/notifications/unread/count')) {
      return route.fulfill({ json: { data: { unread_count: 3 } } })
    }
    if (path.endsWith('/notifications/unread') || path.endsWith('/notifications')) {
      return route.fulfill({
        json: {
          data: [
            {
              id: 'notif-1',
              title: 'Nueva tarea asignada',
              body: 'Revisión técnica de interfaz en iPad Pro.',
              created_at: '2026-10-08T21:10:00Z',
              read: false,
              project_id: projectId,
            },
            {
              id: 'notif-2',
              title: 'Contrato listo para revisión',
              body: 'El documento de formalización contractual ha sido actualizado.',
              created_at: '2026-10-08T20:30:00Z',
              read: false,
              project_id: projectId,
            },
          ],
        },
      })
    }
    if (path.endsWith('/admin/users')) {
      return route.fulfill({
        json: { data: { items: mockAdminUsers, total: mockAdminUsers.length, page: 1, limit: 10, total_pages: 1 } },
      })
    }
    if (path.endsWith('/media/storage/stats')) {
      return route.fulfill({ json: { data: mockStorageStats } })
    }
    if (path.endsWith('/admin/storage/tree')) {
      return route.fulfill({
        json: {
          data: {
            summary: { totalClients: 2, totalProjects: 4, totalFiles: 1420, totalBytes: 85500000000, purgedFilesCount: 15, purgedBytes: 250000000 },
            clients: [
              {
                clientId: 'client-1',
                clientName: 'Grupo Inversionista Andino',
                totalFiles: 890,
                totalBytes: 65000000000,
                projects: [{ projectId, projectName: 'Campaña Lanzamiento CIMA 2026', totalFiles: 890, totalBytes: 65000000000 }],
              },
            ],
          },
        },
      })
    }
    if (path.endsWith('/account/sessions')) {
      return route.fulfill({
        json: {
          data: [
            { id: 'sess-1', ip_address: '190.24.112.45', user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', is_current: true, last_active: '2026-10-08T22:00:00Z' },
            { id: 'sess-2', ip_address: '181.129.80.12', user_agent: 'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X)', is_current: false, last_active: '2026-10-08T18:30:00Z' },
          ],
        },
      })
    }
    if (path.includes('/analytics/summary') || path.includes('/kpis/current')) {
      return route.fulfill({
        json: {
          data: {
            totalRevenue: 148500000,
            activeProjects: 8,
            clientRetentionRate: 94.5,
            leadConversionRate: 28.2,
            monthlyGrowthRate: 14.8,
          },
        },
      })
    }
    if (path.startsWith('/api/v1/marketing/')) {
      return route.fulfill({
        json: {
          data: [
            { id: 'camp-1', name: 'Q4 Expansión Corporativa', channel: 'LinkedIn Ads', status: 'active', budget: 15000000, spent: 8500000, leads: 142 },
            { id: 'camp-2', name: 'Webinars Ejecutivos KrakenD', channel: 'Direct Mail', status: 'active', budget: 8000000, spent: 3200000, leads: 88 },
          ],
        },
      })
    }

    // Default fallback
    return route.fulfill({ json: { data: [] } })
  })
}

// Catálogo de vistas por rol
const VIEWS_BY_ROLE = {
  admin: [
    { key: 'overview', name: 'Resumen Ejecutivo', url: '/dashboard?tab=overview' },
    { key: 'collab-board', name: 'Colaboración Kanban', url: `/dashboard?tab=collab&project_id=${projectId}&workspace_tab=board` },
    { key: 'collab-chat', name: 'Colaboración Chat', url: `/dashboard?tab=collab&project_id=${projectId}&workspace_tab=chat&chat_channel=internal` },
    { key: 'collab-contract', name: 'Colaboración Contrato', url: `/dashboard?tab=collab&project_id=${projectId}&workspace_tab=contract` },
    { key: 'collab-members', name: 'Colaboración Miembros', url: `/dashboard?tab=collab&project_id=${projectId}&workspace_tab=members` },
    { key: 'marketing', name: 'Marketing y Campañas', url: '/dashboard?tab=marketing' },
    { key: 'analytics', name: 'Analítica y KPIs', url: '/dashboard?tab=analytics' },
    { key: 'admin-all', name: 'Admin - Vista General', url: '/dashboard?tab=admin' },
    { key: 'admin-users', name: 'Admin - Usuarios y Carrusel', url: '/dashboard?tab=admin', action: async (page) => {
      const btn = page.locator('[data-tour="admin-tab-users"]')
      if (await btn.isVisible()) await btn.click()
    }},
    { key: 'admin-storage', name: 'Admin - Almacenamiento', url: '/dashboard?tab=admin', action: async (page) => {
      const btn = page.locator('[data-tour="admin-tab-storage"]')
      if (await btn.isVisible()) await btn.click()
    }},
    { key: 'admin-invites', name: 'Admin - Incorporación', url: '/dashboard?tab=admin', action: async (page) => {
      const btn = page.locator('[data-tour="admin-tab-invites"]')
      if (await btn.isVisible()) await btn.click()
    }},
    { key: 'account', name: 'Cuenta y Perfil Hero', url: '/dashboard?tab=account' },
    { key: 'notifications', name: 'Centro de Notificaciones', url: '/dashboard?tab=notifications' },
  ],
  worker: [
    { key: 'overview', name: 'Resumen Colaborador', url: '/dashboard?tab=overview' },
    { key: 'collab-board', name: 'Colaboración Kanban', url: `/dashboard?tab=collab&project_id=${projectId}&workspace_tab=board` },
    { key: 'collab-chat', name: 'Colaboración Chat', url: `/dashboard?tab=collab&project_id=${projectId}&workspace_tab=chat&chat_channel=internal` },
    { key: 'collab-members', name: 'Colaboración Miembros', url: `/dashboard?tab=collab&project_id=${projectId}&workspace_tab=members` },
    { key: 'marketing', name: 'Marketing', url: '/dashboard?tab=marketing' },
    { key: 'analytics', name: 'Analítica', url: '/dashboard?tab=analytics' },
    { key: 'account', name: 'Cuenta y Perfil Hero', url: '/dashboard?tab=account' },
    { key: 'notifications', name: 'Centro de Notificaciones', url: '/dashboard?tab=notifications' },
  ],
  client: [
    { key: 'collab-board', name: 'Mi Proyecto Kanban', url: `/dashboard?tab=collab&project_id=${projectId}&workspace_tab=board` },
    { key: 'collab-chat', name: 'Chat con Equipo CIMA', url: `/dashboard?tab=collab&project_id=${projectId}&workspace_tab=chat&chat_channel=external` },
    { key: 'collab-contract', name: 'Firma de Contrato', url: `/dashboard?tab=collab&project_id=${projectId}&workspace_tab=contract` },
    { key: 'account', name: 'Mi Cuenta y Perfil Hero', url: '/dashboard?tab=account' },
    { key: 'notifications', name: 'Notificaciones', url: '/dashboard?tab=notifications' },
  ],
}

async function runAudit() {
  console.log('Iniciando auditoría visual y responsive integral...')
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const report = []

  for (const role of ['admin', 'worker', 'client']) {
    console.log(`\n========================================`)
    console.log(` AUDITANDO ROL: ${role.toUpperCase()}`)
    console.log(`========================================`)

    const views = VIEWS_BY_ROLE[role]

    for (const vp of VIEWPORTS) {
      console.log(`  -> Dispositivo: ${vp.label} (${vp.width}x${vp.height})`)

      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile,
        hasTouch: vp.hasTouch,
        deviceScaleFactor: vp.isMobile ? 2 : 1,
      })

      const page = await context.newPage()
      await setupMockRoutes(page, role)

      for (const v of views) {
        try {
          await page.goto(`${BASE_URL}${v.url}`, { waitUntil: 'domcontentloaded', timeout: 15000 })
          await page.waitForTimeout(600) // tiempo para estabilización de render y suspense

          if (v.action) {
            await v.action(page)
            await page.waitForTimeout(400)
          }

          // Inspección de DOM para anomalías
          const domAnalysis = await page.evaluate((vpWidth) => {
            const docWidth = document.documentElement.scrollWidth
            const bodyWidth = document.body.scrollWidth
            const hasHorizontalOverflow = docWidth > vpWidth + 1 || bodyWidth > vpWidth + 1

            // Encontrar elementos que desbordan
            const overflowingElements = []
            if (hasHorizontalOverflow) {
              const allElements = document.querySelectorAll('*')
              for (const el of allElements) {
                const r = el.getBoundingClientRect()
                if (r.right > vpWidth + 2 || r.left < -2) {
                  overflowingElements.push({
                    tag: el.tagName.toLowerCase(),
                    className: (el.className?.toString?.() || '').slice(0, 70),
                    id: el.id || '',
                    right: Math.round(r.right),
                    width: Math.round(r.width),
                  })
                  if (overflowingElements.length >= 5) break
                }
              }
            }

            return {
              docWidth,
              bodyWidth,
              hasHorizontalOverflow,
              overflowingElements,
            }
          }, vp.width)

          const filename = `${role}__${vp.id}__${v.key}.png`
          const filepath = path.join(SCREENSHOT_DIR, filename)

          await page.screenshot({ fullPage: true, path: filepath })

          const resultItem = {
            role,
            viewport: vp.id,
            viewportLabel: vp.label,
            viewKey: v.key,
            viewName: v.name,
            url: v.url,
            filename,
            filepath,
            analysis: domAnalysis,
          }
          report.push(resultItem)

          const statusBadge = domAnalysis.hasHorizontalOverflow ? '[DESBORDE HORIZONTAL]' : '[OK]'
          console.log(`     ${statusBadge} ${v.name} -> ${filename}`)
        } catch (err) {
          console.error(`     [ERROR] ${v.name} en ${vp.id}:`, err.message)
        }
      }

      await context.close()
    }
  }

  await browser.close()

  const summaryFile = path.join(SCREENSHOT_DIR, 'audit-summary.json')
  fs.writeFileSync(summaryFile, JSON.stringify(report, null, 2), 'utf-8')
  console.log(`\nAuditoría finalizada con éxito. Resumen guardado en: ${summaryFile}`)
}

runAudit().catch((err) => {
  console.error('Fallo en la ejecución de la auditoría:', err)
  process.exit(1)
})
