import { defineConfig, devices } from '@playwright/test'
import responsive from './brand.config'

const isFullMatrix = process.env.FULL_MATRIX === 'true'

const baseProjects = isFullMatrix
  ? [
      ...responsive.projects!,
      {
        name: 'desktop-ultrawide',
        testMatch: /presence\/.*\.spec\.ts$/,
        use: { ...devices['Desktop Chrome'], viewport: { width: 5120, height: 1440 } },
      },
    ]
  : [
      {
        name: 'desktop-1080p',
        use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
      },
      {
        name: 'mobile-chrome-android',
        use: { ...devices['Pixel 7'] },
      },
    ]

export default defineConfig(responsive, {
  testDir: '.',
  testMatch: /(?:brand|tour|presence)\/.*\.spec\.ts$/,
  timeout: 45_000,
  projects: baseProjects,
  outputDir: '../test-results/ui',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'reports/ui' }]],
})
