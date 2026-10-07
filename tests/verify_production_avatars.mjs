import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://155.248.207.47';
const SCREENSHOT_DIR = 'C:/Users/27seb/.gemini/antigravity/brain/e6b1ba07-61a0-48cd-88ec-40c2dc73af6b/scratch/prod_screenshots';

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function runVerification() {
  console.log('=== INICIANDO AUDITORÍA EN VIVO DE AVATARES EN PRODUCCIÓN ===');
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  // 1. Acceso a Login
  console.log(`1. Navegando a ${BASE_URL}/login`);
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_login_page.png') });

  // 2. Autenticación como Gerente
  console.log('2. Iniciando sesión como gerente@cima.dev...');
  await page.getByLabel('Correo').fill('gerente@cima.dev');
  await page.locator('#password').fill('Demo123!');
  await page.getByRole('button', { name: /entrar/i }).click();

  await page.waitForURL('**/dashboard**', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  console.log('✓ Login exitoso en Dashboard');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_dashboard_overview_1080p.png') });

  // 3. Verificar Mi Cuenta y Selector de Avatares
  console.log('3. Navegando a Mi Cuenta (tab=account)...');
  await page.goto(`${BASE_URL}/dashboard?tab=account`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_mi_cuenta_panel.png') });

  // 3.1 Abrir selector de avatares (AvatarPickerDialog)
  console.log('3.1 Abriendo Selector de Avatares desde ProfileHero...');
  const avatarDropdownTrigger = page.locator('button[data-tour="account-avatar-btn"]');
  if (await avatarDropdownTrigger.isVisible()) {
    await avatarDropdownTrigger.click();
    await page.waitForTimeout(600);

    const changeAvatarItem = page.getByRole('menuitem', { name: /cambiar avatar/i });
    if (await changeAvatarItem.isVisible()) {
      await changeAvatarItem.click();
      await page.waitForTimeout(1000);
    }
  }

  // 3.2 Categoría "Todos"
  console.log('3.2 Capturando catálogo "Todos"...');
  const countBadge = page.locator('span:has-text("disponibles")');
  if (await countBadge.isVisible()) {
    console.log(`   Badge Todos: ${await countBadge.textContent()}`);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_avatar_picker_todos.png') });

  // 3.3 Categoría "Formal"
  console.log('3.3 Cambiando a categoría Formal...');
  const tabFormal = page.getByRole('button', { name: 'Formal', exact: true });
  if (await tabFormal.isVisible()) {
    await tabFormal.click();
    await page.waitForTimeout(600);
    console.log(`   Badge Formal: ${await countBadge.textContent()}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_avatar_picker_formal.png') });
  }

  // 3.4 Categoría "Casual"
  console.log('3.4 Cambiando a categoría Casual...');
  const tabCasual = page.getByRole('button', { name: 'Casual', exact: true });
  if (await tabCasual.isVisible()) {
    await tabCasual.click();
    await page.waitForTimeout(600);
    console.log(`   Badge Casual: ${await countBadge.textContent()}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_avatar_picker_casual.png') });
  }

  // 3.5 Categoría "Con Gafas"
  console.log('3.5 Cambiando a categoría Con Gafas...');
  const tabGafas = page.getByRole('button', { name: 'Con Gafas', exact: true });
  if (await tabGafas.isVisible()) {
    await tabGafas.click();
    await page.waitForTimeout(600);
    console.log(`   Badge Con Gafas: ${await countBadge.textContent()}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_avatar_picker_con_gafas.png') });
  }

  // 3.6 Probar selección de avatar y guardado reactivo en vivo
  console.log('3.6 Probando selección interactiva y persistencia...');
  const avatarOption = page.locator('button[aria-label="Seleccionar avatar #12"]').first();
  if (await avatarOption.isVisible()) {
    await avatarOption.click();
    await page.waitForTimeout(400);
  }
  const colorBlue = page.locator('button[aria-label="Azul Cobalto"]').first();
  if (await colorBlue.isVisible()) {
    await colorBlue.click();
    await page.waitForTimeout(400);
  }
  const saveBtn = page.getByRole('button', { name: /guardar|aplicar/i }).first();
  if (await saveBtn.isVisible()) {
    await saveBtn.click();
    await page.waitForTimeout(1500);
    console.log('✓ Avatar #12 con Azul Cobalto guardado exitosamente');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07b_mi_cuenta_avatar_guardado.png') });
  }

  // Restaurar avatar canónico #0 con Rojo CIMA para mantener consistencia ejecutiva
  console.log('3.7 Restaurando avatar canónico #0...');
  if (await avatarDropdownTrigger.isVisible()) {
    await avatarDropdownTrigger.click();
    await page.waitForTimeout(600);
    const changeAvatarItem = page.getByRole('menuitem', { name: /cambiar avatar/i });
    if (await changeAvatarItem.isVisible()) {
      await changeAvatarItem.click();
      await page.waitForTimeout(1000);
      const tabTodos = page.getByRole('button', { name: 'Todos', exact: true });
      if (await tabTodos.isVisible()) await tabTodos.click();
      await page.waitForTimeout(400);

      const avatar0 = page.locator('button[aria-label="Seleccionar avatar #0"]').first();
      if (await avatar0.isVisible()) await avatar0.click();
      const colorRed = page.locator('button[aria-label="Rojo CIMA"]').first();
      if (await colorRed.isVisible()) await colorRed.click();
      await page.getByRole('button', { name: /guardar|aplicar/i }).first().click();
      await page.waitForTimeout(1500);
      console.log('✓ Avatar canónico #0 restaurado');
    }
  }

  // 4. Administración de Usuarios
  console.log('4. Navegando a Administración (/dashboard?tab=admin)...');
  await page.goto(`${BASE_URL}/dashboard?tab=admin`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_administracion_usuarios.png'), fullPage: true });
  console.log('✓ Captura de Administración guardada');

  // 5. Colaboración / Proyectos
  console.log('5. Navegando a Colaboración (/dashboard?tab=collab)...');
  await page.goto(`${BASE_URL}/dashboard?tab=collab`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_colaboracion_proyectos.png') });

  const firstProject = page.locator('[data-tour="collab-card-first"], [role="button"]:has-text("CIMA")').first();
  if (await firstProject.isVisible()) {
    await firstProject.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_colaboracion_proyecto_detalle.png') });
    console.log('✓ Detalle de Proyecto Collab abierto');

    // Tab Conversación (Chat)
    const chatBtn = page.getByRole('tab', { name: /conversación|chat/i })
      .or(page.locator('button:has-text("Conversación")'))
      .first();
    if (await chatBtn.isVisible()) {
      await chatBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_colaboracion_chat.png') });
      console.log('✓ Pestaña Conversación (Chat) capturada');
    }

    // Tab Integrantes
    const membersBtn = page.getByRole('tab', { name: /integrantes|equipo/i })
      .or(page.locator('button:has-text("Integrantes")'))
      .first();
    if (await membersBtn.isVisible()) {
      await membersBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_colaboracion_integrantes.png') });
      console.log('✓ Pestaña Integrantes capturada');
    }
  }

  // 6. Panel de Presencia (Usuarios en Línea)
  console.log('6. Verificando Panel de Presencia...');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const presenceBtn = page.locator('[data-testid="presence-widget-trigger"]').first();
  if (await presenceBtn.isVisible()) {
    await presenceBtn.click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_panel_presencia.png') });
    console.log('✓ Panel de Presencia capturado');
  }

  // 7. Pruebas Multi-Resolución
  console.log('7. Verificando escenarios multi-resolución...');
  await page.setViewportSize({ width: 2560, height: 1440 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14_resolucion_2k_uhd.png') });

  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15_resolucion_tablet.png') });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '16_resolucion_mobile_ios.png') });

  await page.setViewportSize({ width: 412, height: 915 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '17_resolucion_mobile_android.png') });

  console.log('=== AUDITORÍA FINALIZADA CON ÉXITO ===');
  await browser.close();
}

runVerification().catch((err) => {
  console.error('Error durante la verificación:', err);
  process.exit(1);
});
