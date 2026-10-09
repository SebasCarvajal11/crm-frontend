import { chromium } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const BASE_URL = 'http://127.0.0.1:4180'
const SCREENSHOT_DIR = path.resolve('C:/Users/27seb/.gemini/antigravity/brain/0248656a-86db-4252-bbe8-5d7b942cbae3/screenshots')

const MOCK_STORAGE = {
  auth_token: 'mock-jwt-admin-token',
  refresh_token: 'mock-refresh-token',
  user_role: 'admin',
  user_email: 'gerente@cima.dev',
  user_name: 'Valeria Quintero',
  auth_user: JSON.stringify({
    id: 'usr-admin-001',
    name: 'Valeria Quintero',
    email: 'gerente@cima.dev',
    role: 'admin',
    company_name: 'CIMA S.A.S.',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  }),
}

async function test() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 834, height: 1194 },
    deviceScaleFactor: 2,
  })

  await context.addInitScript((storage) => {
    for (const [key, val] of Object.entries(storage)) {
      window.localStorage.setItem(key, val)
    }
  }, MOCK_STORAGE)

  await context.route('**/api/v1/**', async (route) => {
    const url = route.request().url()
    if (url.includes('/users') || url.includes('/profile')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: '1', name: 'Valeria Quintero', email: 'gerente@cima.dev', role: 'admin', is_active: true },
            { id: '2', name: 'Carlos Mendoza', email: 'carlos.mendoza@cima.dev', role: 'worker', is_active: true },
            { id: '3', name: 'Mauricio Gómez', email: 'mauricio.gomez@andino.com', role: 'client', is_active: true },
            { id: '4', name: 'Ana Rodríguez', email: 'ana.rodriguez@cima.dev', role: 'worker', is_active: true },
            { id: '5', name: 'Sofía Herrera', email: 'sofia.herrera@retail.com', role: 'client', is_active: true },
            { id: '6', name: 'David Paredes', email: 'david.paredes@cima.dev', role: 'admin', is_active: true },
          ],
        }),
      })
      return
    }
    if (url.includes('/composition/dashboard')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          stats: { active_projects: 3, pending_tasks: 8, completed_deliverables: 15, team_members: 6 },
          projects: [],
          recent_activity: [],
        }),
      })
      return
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) })
  })

  const page = await context.newPage()
  await page.goto(`${BASE_URL}/dashboard?tab=admin`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  // Test before expanding
  const beforeHeight = await page.evaluate(() => document.documentElement.scrollHeight)

  // Expand inner containers for full screenshot
  await page.evaluate(() => {
    document.documentElement.style.overflow = 'visible'
    document.body.style.overflow = 'visible'
    document.body.style.height = 'auto'
    const elements = document.querySelectorAll('*')
    for (const el of elements) {
      const style = window.getComputedStyle(el)
      if (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflow === 'hidden') {
        el.style.overflow = 'visible'
        el.style.height = 'auto'
        el.style.maxHeight = 'none'
      }
    }
  })

  await page.waitForTimeout(500)
  const afterHeight = await page.evaluate(() => document.documentElement.scrollHeight)

  console.log(`Height before: ${beforeHeight}, Height after expansion: ${afterHeight}`)

  const testFile = path.join(SCREENSHOT_DIR, 'test_expanded_ipad_portrait.png')
  await page.screenshot({ fullPage: true, path: testFile })
  console.log('Saved test screenshot to:', testFile)

  await browser.close()
}

test()
