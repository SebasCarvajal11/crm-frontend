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
    {
      name: 'desktop-2k',
      testMatch: /guest\/07-responsive-viewports\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 2560, height: 1440 },
      },
      metadata: { role: 'guest', viewport: '2k' },
    },
    {
      name: 'desktop-1080p',
      testMatch: /guest\/07-responsive-viewports\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
      metadata: { role: 'guest', viewport: '1080p' },
    },
    {
      name: 'tablet-ipad',
      testMatch: /guest\/07-responsive-viewports\.spec\.ts$/,
      use: {
        ...devices['iPad Pro 11'],
      },
      metadata: { role: 'guest', viewport: 'tablet' },
    },
    {
      name: 'mobile-safari-ios',
      testMatch: /guest\/07-responsive-viewports\.spec\.ts$/,
      use: {
        ...devices['iPhone 14'],
      },
      metadata: { role: 'guest', viewport: 'mobile-ios' },
    },
    {
      name: 'mobile-chrome-android',
      testMatch: /guest\/07-responsive-viewports\.spec\.ts$/,
      use: {
        ...devices['Pixel 7'],
      },
      metadata: { role: 'guest', viewport: 'mobile-android' },
    },
  ],

  globalSetup: './global-setup.ts',
})
