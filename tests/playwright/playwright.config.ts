import { defineConfig, devices } from '@playwright/test'
import { getFrontendUrl } from './helpers/e2e-env'

const FRONTEND_URL = getFrontendUrl()

export default defineConfig({
  testDir: './flows',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 15_000 },

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'reports/html' }],
    ['json', { outputFile: 'reports/results.json' }],
  ],

  use: {
    baseURL: FRONTEND_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
  },

  outputDir: '../test-results',

  projects: [
    {
      name: 'admin',
      testMatch: /admin\/.*\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'] },
      metadata: { role: 'admin' },
    },
    {
      name: 'worker',
      testMatch: /worker\/.*\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'] },
      metadata: { role: 'worker' },
    },
    {
      name: 'client',
      testMatch: /client\/.*\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'] },
      metadata: { role: 'client' },
    },
    {
      name: 'guest',
      testMatch: /guest\/.*\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'] },
      metadata: { role: 'guest' },
    },
  ],

  globalSetup: './global-setup.ts',
})
