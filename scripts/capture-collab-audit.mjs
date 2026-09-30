import { chromium } from '@playwright/test';
import path from 'path';

const BASE_URL = 'http://155.248.207.47';
const OUTPUT_DIR = 'C:\\Users\\27seb\\.gemini\\antigravity\\brain\\d481fac6-ea68-4fd8-9d6c-e1c78bddb448\\screenshots';
const PROJECT_ID = '8e2143d1-27e2-405f-ac70-89f5f498b287';

const VIEWPORTS = [
  { name: '2k_uhd', width: 2560, height: 1440 },
  { name: 'desktop_1080p', width: 1920, height: 1080 },
  { name: 'tablet_820p', width: 820, height: 1180 },
  { name: 'mobile_390p', width: 390, height: 844 },
];

const TABS = ['board', 'chat', 'brief', 'contract', 'change-requests', 'members'];

async function run() {
  console.log('Iniciando navegador Playwright...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  console.log(`Navegando a ${BASE_URL}/login...`);
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

  console.log('Iniciando sesión...');
  await page.locator('input[type="email"]').fill('gerente@cima.dev');
  await page.locator('input[type="password"]').fill('Demo123!');
  await page.getByRole('button', { name: /Entrar/i }).click();

  await page.waitForURL('**/dashboard**', { timeout: 20000 });
  await page.waitForLoadState('networkidle');
  console.log('Sesión iniciada con éxito en Dashboard.');

  for (const vp of VIEWPORTS) {
    console.log(`\n--- Capturando viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(500);

    for (const tab of TABS) {
      const url = `${BASE_URL}/dashboard?tab=collab&project_id=${PROJECT_ID}&workspace_tab=${tab}`;
      console.log(`  Capturando tab: ${tab}...`);
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000); // Esperar renderizado y microanimaciones

      const filename = path.join(OUTPUT_DIR, `${vp.name}_${tab}.png`);
      await page.screenshot({ path: filename, fullPage: false });
      console.log(`  ✓ Guardado: ${filename}`);
    }
  }

  await browser.close();
  console.log('\nCaptura de auditoría completada con éxito.');
}

run().catch((err) => {
  console.error('Error durante la captura:', err);
  process.exit(1);
});
