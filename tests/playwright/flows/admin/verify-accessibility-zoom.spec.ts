import { test, expect } from '@playwright/test'

const outDir = 'C:/Users/27seb/.gemini/antigravity/brain/eb94f670-8c42-40f0-94f1-5d3670e9372d/scratch'

test('validar widget de accesibilidad, escalado, persistencia y responsividad', async ({ page }) => {
  // 1. Iniciar en escritorio
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('http://localhost:5173/login')
  await page.getByLabel('Correo').fill('gerente@cima.dev')
  await page.locator('input#password').fill('Demo123!')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('**/dashboard', { timeout: 15_000 })
  await page.waitForTimeout(1000)

  // 2. Verificar existencia de la burbuja colapsada
  const trigger = page.getByTestId('zoom-widget-trigger')
  await expect(trigger).toBeVisible()

  // 3. Abrir barra de herramientas
  await trigger.click()
  const toolbar = page.getByTestId('zoom-widget-toolbar')
  await expect(toolbar).toBeVisible()

  // 4. Aumentar zoom a 110% y luego 125%
  const zoomInBtn = page.getByTestId('zoom-in-btn')
  await zoomInBtn.click()
  await page.waitForTimeout(200)
  expect(await page.getByTestId('zoom-percentage-btn').innerText()).toBe('110%')

  await zoomInBtn.click()
  await page.waitForTimeout(200)
  expect(await page.getByTestId('zoom-percentage-btn').innerText()).toBe('125%')

  // Validar estilo en documentElement
  const currentZoomStyle = await page.evaluate(() => document.documentElement.style.zoom)
  expect(currentZoomStyle).toBe('1.25')

  // 5. Cerrar barra y verificar micro-badge con 125%
  await page.getByTestId('zoom-close-btn').click()
  await expect(trigger).toBeVisible()
  const badge = page.getByTestId('zoom-active-badge')
  await expect(badge).toBeVisible()
  expect(await badge.innerText()).toBe('125%')

  // Captura Desktop 125%
  await page.screenshot({ path: `${outDir}/zoom-verified-desktop-125.png` })

  // 6. Probar persistencia tras recarga
  await page.reload()
  await page.waitForTimeout(1000)
  const persistedZoom = await page.evaluate(() => ({
    style: document.documentElement.style.zoom,
    storage: localStorage.getItem('cima_ui_zoom'),
  }))
  expect(persistedZoom.style).toBe('1.25')
  expect(persistedZoom.storage).toBe('1.25')
  await expect(page.getByTestId('zoom-active-badge')).toHaveText('125%')

  // 7. Probar zoom a 150% y 200%
  await page.getByTestId('zoom-widget-trigger').click()
  await page.getByTestId('zoom-in-btn').click() // 150%
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${outDir}/zoom-verified-desktop-150.png` })

  await page.getByTestId('zoom-in-btn').click() // 175%
  await page.getByTestId('zoom-in-btn').click() // 200%
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${outDir}/zoom-verified-desktop-200.png` })

  // 8. Restablecer al 100% mediante botón de reseteo
  await page.getByTestId('zoom-reset-btn').click()
  await page.waitForTimeout(300)
  expect(await page.getByTestId('zoom-percentage-btn').innerText()).toBe('100%')
  const resetZoomStyle = await page.evaluate(() => document.documentElement.style.zoom)
  expect(resetZoomStyle).toBe('1')

  // 9. Vista Tablet (768x1024) con zoom 125%
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.getByTestId('zoom-in-btn').click() // 110%
  await page.getByTestId('zoom-in-btn').click() // 125%
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${outDir}/zoom-verified-tablet-125.png` })

  // 10. Vista Móvil (390x844) con zoom 125%
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${outDir}/zoom-verified-mobile-125.png` })

  // Verificar que en móvil no hay scroll horizontal indeseado
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2) // margen de subpixel

  // 11. Navegar a /dashboard?tab=collab en escritorio para verificar tablero y chat con zoom 125%
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('http://localhost:5173/dashboard?tab=collab')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `${outDir}/zoom-verified-collab-125.png` })
})
