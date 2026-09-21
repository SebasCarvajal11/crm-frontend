import { test, expect } from '@playwright/test'

test('Diagnóstico de rendimiento al cambiar de pestañas', async ({ page }) => {
  test.setTimeout(90_000)
  await page.setViewportSize({ width: 1440, height: 900 })

  const networkLogs: { url: string; method: string; durationMs: number; status: number }[] = []
  
  page.on('response', async (res) => {
    try {
      const timing = res.request().timing()
      const durationMs = timing.responseEnd > 0 ? Math.round(timing.responseEnd) : -1
      networkLogs.push({
        url: res.url(),
        method: res.request().method(),
        durationMs,
        status: res.status(),
      })
    } catch {
      // ignore
    }
  })

  console.log('\n=== INICIANDO SESION ===')
  await page.goto('/login')
  await page.getByLabel('Correo').fill('gerente@cima.dev')
  await page.locator('input#password').fill('Demo123!')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 })
  await page.waitForLoadState('networkidle')

  console.log('Sesion iniciada exitosamente en /dashboard.')

  // Helper para medir transición de pestaña del sidebar
  async function measureSidebarTab(tabName: string, expectedSelector: string) {
    networkLogs.length = 0
    const start = performance.now()

    const btn = page.locator(`aside:visible nav[aria-label="Navegacion principal"] button:has-text("${tabName}")`)
    await btn.click()

    // Medir si aparece el skeleton
    const skeleton = page.locator('div[aria-label="Cargando sección"]')
    let skeletonVisibleMs = 0
    const skeletonVisible = await skeleton.isVisible().catch(() => false)
    if (skeletonVisible) {
      const skeletonStart = performance.now()
      await skeleton.waitFor({ state: 'detached', timeout: 10_000 }).catch(() => {})
      skeletonVisibleMs = Math.round(performance.now() - skeletonStart)
    }

    // Esperar al selector esperado
    await page.locator(expectedSelector).first().waitFor({ state: 'visible', timeout: 15_000 })
    const end = performance.now()
    const totalDuration = Math.round(end - start)

    console.log(`\n[SIDEBAR TAB] -> "${tabName}": ${totalDuration}ms (Skeleton visible: ${skeletonVisibleMs}ms)`)
    const apiCalls = networkLogs.filter(n => n.url.includes('/api/v1/'))
    const jsCalls = networkLogs.filter(n => n.url.includes('.js'))
    console.log(`  Peticiones API: ${apiCalls.length}, Chunks JS: ${jsCalls.length}`)
    for (const api of apiCalls) {
      console.log(`    API ${api.method} ${new URL(api.url).pathname}: ${api.durationMs}ms [${api.status}]`)
    }
    for (const js of jsCalls) {
      console.log(`    JS Chunk: ${new URL(js.url).pathname} [${js.status}]`)
    }
    return { totalDuration, skeletonVisibleMs }
  }

  // Medir pestañas de sidebar (primera pasada: carga de chunks)
  console.log('\n--- PRIMERA PASADA: CAMBIO DE PESTAÑAS SIDEBAR ---')
  await measureSidebarTab('Colaboración', 'button:has-text("Nuevo Proyecto")')
  await measureSidebarTab('Marketing', 'button:has-text("Nueva Campaña"), button:has-text("Nuevo Plan"), h1:has-text("Marketing")')
  await measureSidebarTab('Analítica', 'div:has-text("Analítica"), h1')
  await measureSidebarTab('Administración', 'h1:has-text("Administración"), div:has-text("Usuarios")')
  await measureSidebarTab('Resumen', 'div:has-text("Proyectos Activos"), div:has-text("Resumen")')

  // Medir pestañas de sidebar (segunda pasada: chunks ya cacheados en memoria del navegador)
  console.log('\n--- SEGUNDA PASADA (RE-VISITA): CAMBIO DE PESTAÑAS SIDEBAR ---')
  await measureSidebarTab('Colaboración', 'button:has-text("Nuevo Proyecto")')
  await measureSidebarTab('Marketing', 'button:has-text("Nueva Campaña"), button:has-text("Nuevo Plan"), h1:has-text("Marketing")')
  await measureSidebarTab('Administración', 'h1:has-text("Administración"), div:has-text("Usuarios")')
  await measureSidebarTab('Resumen', 'div:has-text("Proyectos Activos"), div:has-text("Resumen")')

  // Medir pestañas de workspace de proyecto
  console.log('\n--- PESTAÑAS DENTRO DEL PROYECTO (WORKSPACE) ---')
  await measureSidebarTab('Colaboración', 'button:has-text("Nuevo Proyecto"), button:has-text("Nuevo proyecto")')
  
  // Abrir primer proyecto
  const firstProjectCard = page.locator('button[aria-label*="Abrir proyecto"]').first()
  await firstProjectCard.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {})
  if (await firstProjectCard.isVisible()) {
    await firstProjectCard.click()
    await page.locator('button:has-text("Proyectos")').waitFor({ state: 'visible', timeout: 10_000 })
    console.log('Proyecto abierto.')

    async function measureWorkspaceTab(tabLabel: string, selector: string) {
      networkLogs.length = 0
      const start = performance.now()
      const tabBtn = page.locator(`button[role="tab"]:has-text("${tabLabel}")`)
      await tabBtn.click()
      await page.locator(selector).first().waitFor({ state: 'visible', timeout: 15_000 })
      const totalDuration = Math.round(performance.now() - start)
      console.log(`\n[WORKSPACE TAB] -> "${tabLabel}": ${totalDuration}ms`)
      const apiCalls = networkLogs.filter(n => n.url.includes('/api/v1/'))
      for (const api of apiCalls) {
        console.log(`    API ${api.method} ${new URL(api.url).pathname}: ${api.durationMs}ms [${api.status}]`)
      }
    }

    await measureWorkspaceTab('Conversación', 'div#tabpanel-chat, div:has-text("Mensajes")')
    await measureWorkspaceTab('Brief', 'div#tabpanel-brief')
    await measureWorkspaceTab('Contrato', 'div#tabpanel-contract')
    await measureWorkspaceTab('Solicitud de cambios', 'div#tabpanel-change-requests')
    await measureWorkspaceTab('Integrantes', 'div#tabpanel-members')
    await measureWorkspaceTab('Tablero', 'div#tabpanel-board')

    // Segunda pasada dentro del proyecto
    console.log('\n--- SEGUNDA PASADA WORKSPACE (YA VISITADAS) ---')
    await measureWorkspaceTab('Conversación', 'div#tabpanel-chat')
    await measureWorkspaceTab('Brief', 'div#tabpanel-brief')
    await measureWorkspaceTab('Contrato', 'div#tabpanel-contract')
    await measureWorkspaceTab('Tablero', 'div#tabpanel-board')
  }
})
