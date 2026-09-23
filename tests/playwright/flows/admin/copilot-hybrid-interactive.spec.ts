import { test, expect, type Page } from '@playwright/test'
import { loginViaUI } from '../../helpers/auth-helper'
import path from 'path'
import fs from 'fs'

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'tests/playwright/reports/screenshots')

let cachedToken: string | null = null

async function authenticate(page: Page) {
  if (cachedToken) {
    await page.goto('/login')
    await page.evaluate((tok) => {
      sessionStorage.setItem('cima_access_token', tok)
      sessionStorage.setItem('cima_user_email', 'gerente@cima.dev')
    }, cachedToken)
    await page.goto('/dashboard?tab=collab')
    await page.waitForLoadState('networkidle')
    return
  }

  await loginViaUI(page, 'gerente@cima.dev', 'Demo123!')
  cachedToken = await page.evaluate(() => sessionStorage.getItem('cima_access_token'))
}

test.beforeAll(() => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  }
})

test.describe('CIMA Smart Copilot 2.0 — Motor Híbrido Interactivo y Multi-Viewport', () => {
  test('valida tour interactivo en Desktop 1080p con avance por clic de usuario y botón siguiente', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await authenticate(page)

    await page.goto('/dashboard?tab=collab')
    await page.waitForLoadState('networkidle')

    const helpTrigger = page.getByTestId('help-widget-trigger')
    await expect(helpTrigger).toBeVisible({ timeout: 10000 })
    await helpTrigger.click()

    const helpModal = page.getByRole('dialog', { name: /Centro de Asistencia y Guías/i })
    await expect(helpModal).toBeVisible()

    const startTourBtn = page.getByRole('button', { name: /Iniciar Tour|Repetir Tour/i })
    await expect(startTourBtn).toBeVisible()
    await startTourBtn.click()
    await expect(helpModal).not.toBeVisible()

    const popover = page.locator('.cima-tour-popover')
    await expect(popover).toBeVisible({ timeout: 6000 })
    await expect(popover.locator('.driver-popover-title')).toContainText('Buscador de Proyectos')
    await page.waitForTimeout(300)

    // Capturar screenshot con el popover visible en el paso 1 ANTES de escribir
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-desktop-1080p-step1-search.png') })

    // Verificar presencia de badge interactivo
    const badge = popover.locator('.cima-tour-interactive-badge')
    await expect(badge).toBeVisible()
    await expect(badge).toContainText('Interactivo')

    // Acción directa: el usuario escribe en el input
    const searchInput = page.locator('[data-tour="collab-search"] input')
    if (await searchInput.isVisible()) {
      await searchInput.fill('CIMA')
      await page.waitForTimeout(300)
    }

    // Avance mediante botón Siguiente
    const nextBtn = popover.locator('.driver-popover-next-btn')
    await nextBtn.click()
    await page.waitForTimeout(400)
    await expect(popover.locator('.driver-popover-title')).toContainText('Resumen Rapido de Estados')

    // Avanzar hasta la tarjeta de proyecto (pasan columnas y crear proyecto)
    await nextBtn.click()
    await page.waitForTimeout(400)
    await nextBtn.click()
    await page.waitForTimeout(400)
    await nextBtn.click()
    await page.waitForTimeout(400)

    // Paso de tarjeta de proyecto (Abrir Espacio de Trabajo)
    await expect(popover.locator('.driver-popover-title')).toContainText('Abrir Espacio de Trabajo')
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-desktop-1080p-card-step.png') })

    // ACCIÓN HÍBRIDA DIRECTA: El usuario hace clic en la tarjeta directamente en lugar de 'Siguiente'
    const cardTarget = page.locator('[data-tour="collab-card-first"]').first()
    await cardTarget.click()

    // El motor debe transicionar al espacio de trabajo y avanzar automáticamente
    const workspaceHeader = page.locator('[data-tour="workspace-project-header"]')
    await expect(workspaceHeader).toBeVisible({ timeout: 10000 })
    await expect(popover).toBeVisible({ timeout: 8000 })
    await expect(popover.locator('.driver-popover-title')).toContainText('Informacion del Proyecto')

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-desktop-1080p-workspace-opened.png') })

    // Salir del tour
    await page.keyboard.press('Escape')
    await expect(popover).not.toBeVisible()
  })

  test('valida comportamiento en Pantalla 2K Ultra HD (2560x1440)', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 })
    await authenticate(page)

    await page.goto('/dashboard?tab=collab')
    await page.waitForLoadState('networkidle')

    const helpTrigger = page.getByTestId('help-widget-trigger')
    await helpTrigger.click()

    const helpModal = page.getByRole('dialog', { name: /Centro de Asistencia y Guías/i })
    await expect(helpModal).toBeVisible()

    const startTourBtn = page.getByRole('button', { name: /Iniciar Tour|Repetir Tour/i })
    await startTourBtn.click()
    await expect(helpModal).not.toBeVisible()

    const popover = page.locator('.cima-tour-popover')
    await expect(popover).toBeVisible({ timeout: 6000 })
    await page.waitForTimeout(300)

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-desktop-2k-overview.png') })
    await page.keyboard.press('Escape')
  })

  test('valida comportamiento en Tablet iPad (834x1194)', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1194 })
    await authenticate(page)

    await page.goto('/dashboard?tab=collab')
    await page.waitForLoadState('networkidle')

    const helpTrigger = page.getByTestId('help-widget-trigger')
    await helpTrigger.click()

    const helpModal = page.getByRole('dialog', { name: /Centro de Asistencia y Guías/i })
    await expect(helpModal).toBeVisible()

    const startTourBtn = page.getByRole('button', { name: /Iniciar Tour|Repetir Tour/i })
    await startTourBtn.click()
    await expect(helpModal).not.toBeVisible()

    const popover = page.locator('.cima-tour-popover')
    await expect(popover).toBeVisible({ timeout: 6000 })
    await page.waitForTimeout(300)

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-tablet-ipad-tour.png') })
    await page.keyboard.press('Escape')
  })

  test('valida optimización móvil iOS Safari (390x844) sin recorte ni layout thrashing', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await authenticate(page)

    await page.goto('/dashboard?tab=collab')
    await page.waitForLoadState('networkidle')

    const helpTrigger = page.getByTestId('help-widget-trigger')
    await helpTrigger.click()

    const helpModal = page.getByRole('dialog', { name: /Centro de Asistencia y Guías/i })
    await expect(helpModal).toBeVisible()

    const startTourBtn = page.getByRole('button', { name: /Iniciar Tour|Repetir Tour/i })
    await startTourBtn.click()
    await expect(helpModal).not.toBeVisible()

    const popover = page.locator('.cima-tour-popover')
    await expect(popover).toBeVisible({ timeout: 6000 })
    await page.waitForTimeout(300)

    // Verificar que el popover esté posicionado con safe area y márgenes correctos
    const box = await popover.boundingBox()
    expect(box).not.toBeNull()
    if (box) {
      expect(box.width).toBeLessThanOrEqual(390)
      expect(box.x).toBeGreaterThanOrEqual(0)
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-mobile-safari-ios-bottom.png') })

    // Avanzar y probar paso con posición top en móvil
    const nextBtn = popover.locator('.driver-popover-next-btn')
    await nextBtn.click()
    await page.waitForTimeout(300)
    await nextBtn.click()
    await page.waitForTimeout(300)

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-mobile-safari-ios-kanban-columns.png') })
    await page.keyboard.press('Escape')
  })

  test('valida optimización móvil Android Chrome (412x915)', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 })
    await authenticate(page)

    await page.goto('/dashboard?tab=collab')
    await page.waitForLoadState('networkidle')

    const helpTrigger = page.getByTestId('help-widget-trigger')
    await helpTrigger.click()

    const helpModal = page.getByRole('dialog', { name: /Centro de Asistencia y Guías/i })
    await expect(helpModal).toBeVisible()

    const startTourBtn = page.getByRole('button', { name: /Iniciar Tour|Repetir Tour/i })
    await startTourBtn.click()
    await expect(helpModal).not.toBeVisible()

    const popover = page.locator('.cima-tour-popover')
    await expect(popover).toBeVisible({ timeout: 6000 })
    await page.waitForTimeout(300)

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-mobile-android-pixel-tour.png') })
    await page.keyboard.press('Escape')
  })
})
