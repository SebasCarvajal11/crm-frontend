import { test, type Page } from '@playwright/test'
import { projectId, setupDashboard } from '../tour/fixtures'
import fs from 'node:fs'
import path from 'node:path'

const SCREENSHOT_DIR = 'C:/Users/27seb/.gemini/antigravity/brain/d4c68a81-8968-412d-9f97-67e28767334d/screenshots/mobile_audit'
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })

const mockInitialMessages = [
  {
    id: 'msg-brand-1',
    projectId,
    channel: 'external',
    messageType: 'text',
    authorSub: '11111111-1111-4111-8111-111111111111',
    authorEmail: 'tutorial@example.com',
    authorFirstName: 'Equipo',
    authorLastName: 'CIMA',
    authorRole: 'admin',
    authorProfession: 'Lead',
    body: 'Hola',
    mentionedSubs: null,
    metadata: null,
    createdAt: '2026-04-01T10:00:00Z',
    readStatus: {
      isSeen: true,
      seenCount: 2,
      requiredCount: 2,
      reads: [],
    },
  },
  {
    id: 'msg-brand-2',
    projectId,
    channel: 'external',
    messageType: 'text',
    authorSub: '11111111-1111-4111-8111-111111111111',
    authorEmail: 'tutorial@example.com',
    authorFirstName: 'Equipo',
    authorLastName: 'CIMA',
    authorRole: 'admin',
    authorProfession: 'Lead',
    body: '@administrador',
    mentionedSubs: null,
    metadata: null,
    createdAt: '2026-04-01T10:01:00Z',
    readStatus: {
      isSeen: true,
      seenCount: 2,
      requiredCount: 2,
      reads: [],
    },
  },
]

async function mockChatMessages(page: Page) {
  await page.route(`**/collab/projects/${projectId}/chat/external**`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          data: {
            items: mockInitialMessages,
            total: mockInitialMessages.length,
            page: 1,
            limit: 50,
            total_pages: 1,
          },
        },
      })
      return
    }
    await route.fallback()
  })
}

test.describe('Mobile Audit Visual Captures', () => {
  test('01. Capturar Centro de Incorporación en mobile', async ({ page }, testInfo) => {
    await setupDashboard(page, 'admin')
    await page.goto('/dashboard?tab=admin')
    await page.waitForLoadState('networkidle')

    const invitesTab = page.locator('[data-tour="admin-tab-invites"]').or(page.locator('button:has-text("Centro de Incorporación")')).first()
    if (await invitesTab.isVisible()) {
      await invitesTab.click()
      await page.waitForTimeout(300)
    }

    const shotPath = path.join(SCREENSHOT_DIR, `01_centro_incorporacion_${testInfo.project.name}.png`)
    await page.screenshot({ path: shotPath, fullPage: true })
  })

  test('02. Capturar Chat Colaborativo en mobile', async ({ page }, testInfo) => {
    await setupDashboard(page, 'admin')
    await mockChatMessages(page)
    await page.goto(`/dashboard?tab=collab&project_id=${projectId}&workspace_tab=chat`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    const shotPath = path.join(SCREENSHOT_DIR, `02_chat_colaborativo_${testInfo.project.name}.png`)
    await page.screenshot({ path: shotPath, fullPage: true })
  })

  test('03. Capturar Archivos en mobile', async ({ page }, testInfo) => {
    await setupDashboard(page, 'admin')
    await mockChatMessages(page)
    await page.goto(`/dashboard?tab=collab&project_id=${projectId}&workspace_tab=chat`)
    await page.waitForLoadState('networkidle')

    const filesBtn = page.getByRole('tab', { name: 'Archivos' })
    if (await filesBtn.isVisible()) {
      await filesBtn.click()
      await page.waitForTimeout(300)
    }

    const shotPath = path.join(SCREENSHOT_DIR, `03_archivos_${testInfo.project.name}.png`)
    await page.screenshot({ path: shotPath, fullPage: true })
  })

  test('04. Capturar Trazabilidad en mobile', async ({ page }, testInfo) => {
    await setupDashboard(page, 'admin')
    await mockChatMessages(page)
    await page.goto(`/dashboard?tab=collab&project_id=${projectId}&workspace_tab=chat`)
    await page.waitForLoadState('networkidle')

    const timelineBtn = page.getByRole('tab', { name: 'Trazabilidad' })
    if (await timelineBtn.isVisible()) {
      await timelineBtn.click()
      await page.waitForTimeout(300)
    }

    const shotPath = path.join(SCREENSHOT_DIR, `04_trazabilidad_${testInfo.project.name}.png`)
    await page.screenshot({ path: shotPath, fullPage: true })
  })
})
