import { test, expect } from '@playwright/test'
import { USERS } from '../../fixtures/auth.fixture'

const SCREENSHOT_DIR = 'C:/Users/27seb/.gemini/antigravity/brain/7716f2ab-0cd2-4f33-8081-7796e156df34/screenshots'

test.describe('Cabecera Móvil Anclada (Sticky Header) y Menú Hamburguesa', () => {
  test('header permanece anclado en top: 0 y menú hamburguesa abre el sidebar al hacer scroll', async ({
    page,
    baseURL,
  }) => {
    const frontendUrl = baseURL || 'http://155.248.207.47'
    await page.setViewportSize({ width: 390, height: 844 }) // iPhone 14

    // 1. Iniciar sesión
    await page.goto(`${frontendUrl}/login`)
    await page.getByLabel('Correo').fill('gerente@cima.dev')
    await page.locator('#password').fill('Demo123!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/dashboard', { timeout: 15_000 })
    await page.waitForLoadState('networkidle')

    const header = page.locator('header.md\\:hidden')
    const menuBtn = page.getByRole('button', { name: 'Abrir menu' })

    // Validar estado inicial en la parte superior
    await expect(header).toBeVisible()
    await expect(menuBtn).toBeVisible()

    const initialBbox = await header.boundingBox()
    expect(initialBbox).not.toBeNull()
    expect(initialBbox!.y).toBe(0)

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/05-mobile-header-at-top.png`,
      fullPage: false,
    })

    // 2. Scroll vertical hacia abajo (1000px)
    await page.evaluate(() => window.scrollBy(0, 1000))
    await page.waitForTimeout(500)

    const scrollY = await page.evaluate(() => window.scrollY)
    expect(scrollY).toBeGreaterThan(600)

    // 3. Validar que el header permanece ANCLADO en y: 0 en el viewport
    const scrolledBbox = await header.boundingBox()
    expect(scrolledBbox).not.toBeNull()
    expect(scrolledBbox!.y).toBe(0)

    // 4. Validar que el botón de hamburguesa sigue visible e interactivo
    await expect(menuBtn).toBeVisible()

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/06-mobile-header-scrolled-sticky.png`,
      fullPage: false,
    })

    // 5. Abrir menú hamburguesa desde la posición con scroll
    await menuBtn.click()

    // 6. Validar que el drawer/sidebar móvil se despliega correctamente
    const mobileNav = page.locator('aside[aria-label="Menu de navegacion"]')
    await expect(mobileNav).toBeVisible()
    await expect(mobileNav).toHaveClass(/translate-x-0/)
    await page.waitForTimeout(400) // Esperar duración de animación (300ms)

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/07-mobile-header-scrolled-menu-open.png`,
      fullPage: false,
    })
  })
})
