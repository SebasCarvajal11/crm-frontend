import { chromium } from '@playwright/test'

async function check() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 834, height: 1194 } })
  await context.addInitScript(() => {
    localStorage.setItem('auth_token', 'mock-admin')
    localStorage.setItem('user_role', 'admin')
    localStorage.setItem('auth_user', JSON.stringify({ id: '1', name: 'Valeria Quintero', role: 'admin', email: 'gerente@cima.dev' }))
  })
  const page = await context.newPage()
  await page.goto('http://127.0.0.1:4180/dashboard?tab=admin')
  await page.waitForTimeout(1000)
  const info = await page.evaluate(() => {
    const el = document.querySelector('[data-tour="admin-tabs"]')
    let cur = el
    const res = []
    while (cur && cur !== document.documentElement) {
      res.push({
        tag: cur.tagName,
        cls: (cur.className || '').toString().slice(0, 40),
        h: cur.clientHeight,
        sh: cur.scrollHeight,
        oy: window.getComputedStyle(cur).overflowY,
      })
      cur = cur.parentElement
    }
    return res
  })
  console.log(JSON.stringify(info, null, 2))
  await browser.close()
}

check()
