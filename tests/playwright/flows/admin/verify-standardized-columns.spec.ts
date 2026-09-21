import { test, expect } from '@playwright/test'
import { CollabPage } from '../../page-objects/collab.page'
import { ProjectPage } from '../../page-objects/project.page'
import { DashboardPage } from '../../page-objects/dashboard.page'
import { USERS } from '../../fixtures/auth.fixture'

const SCREENSHOT_DIR = 'C:/Users/27seb/.gemini/antigravity/brain/7716f2ab-0cd2-4f33-8081-7796e156df34/screenshots'

test.describe('Estandarización Canónica de Columnas - Campaña vs Producto', () => {
  test.setTimeout(60_000)
  test('Admin y Trabajador visualizan 6 columnas idénticas en Campaña y Producto', async ({
    browser,
    baseURL,
  }) => {
    const frontendUrl = baseURL || 'http://155.248.207.47'
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await context.newPage()

    // Login como Admin
    await page.goto(`${frontendUrl}/login`)
    await page.getByLabel('Correo').fill('gerente@cima.dev')
    await page.locator('#password').fill('Demo123!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('**/dashboard', { timeout: 15_000 })

    const dashboard = new DashboardPage(page)
    await dashboard.navigateToCollab()
    const collab = new CollabPage(page)
    await collab.expectLoaded()

    // 1. Proyecto de Campaña
    const campaignCard = page.locator('button[aria-label^="Abrir proyecto"]').filter({ hasText: /Relanzamiento|Sistema de marca/i }).first()
    await expect(campaignCard).toBeVisible()
    await campaignCard.click()

    const project = new ProjectPage(page)
    await project.expectLoaded()
    await project.navigateToBoard()

    // Validar exactamente 6 columnas en Campaña
    const campaignColumns = page.locator('[aria-label^="Columna "]')
    await expect(campaignColumns).toHaveCount(6)

    await expect(page.locator('[aria-label^="Columna Pendiente"]')).toBeVisible()
    await expect(page.locator('[aria-label^="Columna En Curso"]')).toBeVisible()
    await expect(page.locator('[aria-label*="Columna En Revisión Interna"]')).toBeVisible()
    await expect(page.locator('[aria-label*="Columna En Aprobación"]')).toBeVisible()
    await expect(page.locator('[aria-label^="Columna Bloqueado"]')).toBeVisible()
    await expect(page.locator('[aria-label^="Columna Terminado"]')).toBeVisible()

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/01-admin-campaign-6-columns.png`,
      fullPage: false,
    })

    // 2. Volver a proyectos y abrir Proyecto de Producto
    await project.goBack()
    await collab.expectLoaded()

    const productCard = page.locator('button[aria-label^="Abrir proyecto"]').filter({ hasText: /Packaging retail|Lanzamiento omnicanal|Portafolio premium/i }).first()
    await expect(productCard).toBeVisible()
    await productCard.click()

    await project.expectLoaded()
    await project.navigateToBoard()

    // Validar exactamente las mismas 6 columnas en Producto
    const productColumns = page.locator('[aria-label^="Columna "]')
    await expect(productColumns).toHaveCount(6)

    await expect(page.locator('[aria-label^="Columna Pendiente"]')).toBeVisible()
    await expect(page.locator('[aria-label^="Columna En Curso"]')).toBeVisible()
    await expect(page.locator('[aria-label*="Columna En Revisión Interna"]')).toBeVisible()
    await expect(page.locator('[aria-label*="Columna En Aprobación"]')).toBeVisible()
    await expect(page.locator('[aria-label^="Columna Bloqueado"]')).toBeVisible()
    await expect(page.locator('[aria-label^="Columna Terminado"]')).toBeVisible()

    // Validar que las columnas legacy YA NO EXISTEN
    await expect(page.locator('[aria-label*="Columna Arte Aprobado"]')).toHaveCount(0)
    await expect(page.locator('[aria-label*="Columna En Producción"]')).toHaveCount(0)
    await expect(page.locator('[aria-label*="Columna Control de Calidad"]')).toHaveCount(0)
    await expect(page.locator('[aria-label*="Columna Esperando Material"]')).toHaveCount(0)
    await expect(page.locator('[aria-label*="Columna Despachado"]')).toHaveCount(0)
    await expect(page.locator('[aria-label*="Columna Entregado"]')).toHaveCount(0)

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/02-admin-product-6-columns.png`,
      fullPage: false,
    })

    await context.close()
  })

  test('Cliente visualiza exactamente 4 columnas tanto en Campaña como en Producto', async ({
    browser,
    baseURL,
  }) => {
    const frontendUrl = baseURL || 'http://155.248.207.47'

    // Cliente 1 (Campaña): direccion@auroraestudio.co
    const client1Context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const client1Page = await client1Context.newPage()

    await client1Page.goto(`${frontendUrl}/login`)
    await client1Page.getByLabel('Correo').fill('direccion@auroraestudio.co')
    await client1Page.locator('#password').fill('Demo123!')
    await client1Page.getByRole('button', { name: 'Entrar' }).click()
    await client1Page.waitForURL('**/dashboard', { timeout: 15_000 })

    const dashboard1 = new DashboardPage(client1Page)
    await dashboard1.navigateToCollab()
    const collab1 = new CollabPage(client1Page)
    await collab1.expectLoaded()

    const campaignCard = client1Page.locator('button[aria-label*="Sistema de marca"]').first()
    await expect(campaignCard).toBeVisible()
    await campaignCard.click()

    const project1 = new ProjectPage(client1Page)
    await project1.expectLoaded()
    await project1.navigateToBoard()

    // 4 columnas en Campaña para cliente
    const clientCampaignCols = client1Page.locator('[aria-label^="Columna "]')
    await expect(clientCampaignCols).toHaveCount(4)
    await expect(client1Page.locator('[aria-label^="Columna En Curso"]')).toBeVisible()
    await expect(client1Page.locator('[aria-label*="Columna En Aprobación"]')).toBeVisible()
    await expect(client1Page.locator('[aria-label^="Columna Bloqueado"]')).toBeVisible()
    await expect(client1Page.locator('[aria-label^="Columna Terminado"]')).toBeVisible()

    // Columnas internas ocultas
    await expect(client1Page.locator('[aria-label^="Columna Pendiente"]')).toHaveCount(0)
    await expect(client1Page.locator('[aria-label*="Columna En Revisión Interna"]')).toHaveCount(0)

    await client1Page.screenshot({
      path: `${SCREENSHOT_DIR}/03-client-campaign-4-columns.png`,
      fullPage: false,
    })
    await client1Context.close()

    // Cliente 2 (Producto): marketing@cafesierraalta.com
    const client2Context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const client2Page = await client2Context.newPage()

    await client2Page.goto(`${frontendUrl}/login`)
    await client2Page.getByLabel('Correo').fill('marketing@cafesierraalta.com')
    await client2Page.locator('#password').fill('Demo123!')
    await client2Page.getByRole('button', { name: 'Entrar' }).click()
    await client2Page.waitForURL('**/dashboard', { timeout: 15_000 })

    const dashboard2 = new DashboardPage(client2Page)
    await dashboard2.navigateToCollab()
    const collab2 = new CollabPage(client2Page)
    await collab2.expectLoaded()

    const productCard = client2Page.locator('button[aria-label*="Packaging retail"]').first()
    await expect(productCard).toBeVisible()
    await productCard.click()

    const project2 = new ProjectPage(client2Page)
    await project2.expectLoaded()
    await project2.navigateToBoard()

    // 4 columnas en Producto para cliente
    const clientProductCols = client2Page.locator('[aria-label^="Columna "]')
    await expect(clientProductCols).toHaveCount(4)
    await expect(client2Page.locator('[aria-label^="Columna En Curso"]')).toBeVisible()
    await expect(client2Page.locator('[aria-label*="Columna En Aprobación"]')).toBeVisible()
    await expect(client2Page.locator('[aria-label^="Columna Bloqueado"]')).toBeVisible()
    await expect(client2Page.locator('[aria-label^="Columna Terminado"]')).toBeVisible()

    // Columnas internas y legacy estrictamente ocultas
    await expect(client2Page.locator('[aria-label^="Columna Pendiente"]')).toHaveCount(0)
    await expect(client2Page.locator('[aria-label*="Columna En Revisión Interna"]')).toHaveCount(0)
    await expect(client2Page.locator('[aria-label*="Columna Arte Aprobado"]')).toHaveCount(0)
    await expect(client2Page.locator('[aria-label*="Columna En Producción"]')).toHaveCount(0)

    await client2Page.screenshot({
      path: `${SCREENSHOT_DIR}/04-client-product-4-columns.png`,
      fullPage: false,
    })
    await client2Context.close()
  })
})
