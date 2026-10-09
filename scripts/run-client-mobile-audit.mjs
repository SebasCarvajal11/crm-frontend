import { chromium } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const BASE_URL = 'http://127.0.0.1:4180'
const SCREENSHOT_DIR = path.resolve('C:/Users/27seb/.gemini/antigravity/brain/0248656a-86db-4252-bbe8-5d7b942cbae3/screenshots')
const projectId = 'proj-alpha-001'

const VIEWPORTS = [
  { id: 'mobile-modern', label: 'Mobile Moderno (iPhone 14 / Pixel 7)', width: 390, height: 844, isMobile: true },
  { id: 'mobile-ultra-small', label: 'Mobile Ultra-Small / Antiguo (320x568)', width: 320, height: 568, isMobile: true },
]

const views = [
  { key: 'collab-board', name: 'Mi Proyecto Kanban', url: `/dashboard?tab=collab&project_id=${projectId}&workspace_tab=board` },
  { key: 'collab-chat', name: 'Chat con Equipo CIMA', url: `/dashboard?tab=collab&project_id=${projectId}&workspace_tab=chat&chat_channel=external` },
  { key: 'collab-contract', name: 'Firma de Contrato', url: `/dashboard?tab=collab&project_id=${projectId}&workspace_tab=contract` },
  { key: 'account', name: 'Mi Cuenta y Perfil Hero', url: '/dashboard?tab=account' },
  { key: 'notifications', name: 'Notificaciones', url: '/dashboard?tab=notifications' },
]

const MOCK_STORAGE = {
  auth_token: 'mock-jwt-client-token',
  refresh_token: 'mock-refresh-token',
  user_role: 'client',
  user_email: 'cliente@corporativo.com',
  user_name: 'Cliente Corporativo',
  auth_user: JSON.stringify({
    id: 'usr-client-001',
    name: 'Cliente Corporativo',
    email: 'cliente@corporativo.com',
    role: 'client',
    company_name: 'Inversiones Globales S.A.S.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  }),
}

async function run() {
  const browser = await chromium.launch({ headless: true })
  const summaryFile = path.join(SCREENSHOT_DIR, 'audit-summary.json')
  let existing = []
  if (fs.existsSync(summaryFile)) {
    existing = JSON.parse(fs.readFileSync(summaryFile, 'utf-8'))
  }

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
      deviceScaleFactor: 2,
    })

    await context.addInitScript((storage) => {
      for (const [key, val] of Object.entries(storage)) {
        window.localStorage.setItem(key, val)
      }
    }, MOCK_STORAGE)

    await context.route('**/api/v1/**', async (route) => {
      const url = route.request().url()
      if (url.includes('/users/me') || url.includes('/profile')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'usr-client-001',
            name: 'Cliente Corporativo',
            email: 'cliente@corporativo.com',
            role: 'client',
            company_name: 'Inversiones Globales S.A.S.',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          }),
        })
        return
      }

      if (url.includes('/composition/dashboard')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            stats: { active_projects: 1, pending_tasks: 2, completed_deliverables: 5, team_members: 4 },
            projects: [
              {
                id: projectId,
                title: 'Transformación Digital y Branding',
                type: 'campaign_service',
                status: 'in_progress',
                progress_percentage: 65,
                client_name: 'Inversiones Globales S.A.S.',
                assigned_agent_name: 'Carlos Mendoza',
                tasks: [
                  { id: 't1', title: 'Diseño conceptual de landing page', status: 'in_progress', priority: 'high' },
                  { id: 't2', title: 'Aprobación de contrato maestro', status: 'in_progress', priority: 'high' },
                ],
              },
            ],
            recent_activity: [],
          }),
        })
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      })
    })

    const page = await context.newPage()

    for (const v of views) {
      const fullUrl = `${BASE_URL}${v.url}`
      await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(1000)

      const domAnalysis = await page.evaluate((viewportWidth) => {
        const bodyWidth = document.body.scrollWidth
        const docWidth = document.documentElement.scrollWidth
        const hasHorizontalOverflow = docWidth > viewportWidth + 2

        const overflowingElements = []
        if (hasHorizontalOverflow) {
          const all = document.querySelectorAll('*')
          for (const el of all) {
            const r = el.getBoundingClientRect()
            if (r.right > viewportWidth + 2) {
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

        return { docWidth, bodyWidth, hasHorizontalOverflow, overflowingElements }
      }, vp.width)

      const filename = `client__${vp.id}__${v.key}.png`
      const filepath = path.join(SCREENSHOT_DIR, filename)

      await page.screenshot({ fullPage: true, path: filepath })
      console.log(`[CAPTURA OK] ${filename} (Overflow: ${domAnalysis.hasHorizontalOverflow})`)

      existing = existing.filter((item) => item.filename !== filename)
      existing.push({
        role: 'client',
        viewport: vp.id,
        viewportLabel: vp.label,
        viewKey: v.key,
        viewName: v.name,
        url: v.url,
        filename,
        filepath,
        analysis: domAnalysis,
      })
    }

    await context.close()
  }

  await browser.close()
  fs.writeFileSync(summaryFile, JSON.stringify(existing, null, 2), 'utf-8')
  console.log(`Auditoría cliente completada. Total registros: ${existing.length}`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
