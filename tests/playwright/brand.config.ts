import { defineConfig, devices } from '@playwright/test'
import { fileURLToPath } from 'node:url'

const baseURL = 'http://127.0.0.1:4175'

export default defineConfig({
  testDir: './brand',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  outputDir: '../test-results/brand',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'reports/brand' }]],
  use: { baseURL, locale: 'es-CO', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: {
    cwd: fileURLToPath(new URL('../../', import.meta.url)),
    command: 'pnpm exec vite preview --host 127.0.0.1 --port 4175 --strictPort',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'desktop-4k', use: { ...devices['Desktop Chrome'], viewport: { width: 3840, height: 2160 } } },
    { name: 'desktop-2k', use: { ...devices['Desktop Chrome'], viewport: { width: 2560, height: 1440 } } },
    { name: 'desktop-1080p', use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } } },
    { name: 'tablet-ipad', use: { ...devices['iPad Pro 11'] } },
    { name: 'mobile-safari-ios', use: { ...devices['iPhone 14'] } },
    { name: 'mobile-chrome-android', use: { ...devices['Pixel 7'] } },
  ],
})
