import { defineConfig, devices } from '@playwright/test'
import responsive from './brand.config'

export default defineConfig(responsive, {
  testDir: '.', testMatch: /(?:brand|tour|presence)\/.*\.spec\.ts$/, timeout: 45_000,
  projects: [...responsive.projects!, {
    name: 'desktop-ultrawide', testMatch: /presence\/.*\.spec\.ts$/,
    use: { ...devices['Desktop Chrome'], viewport: { width: 5120, height: 1440 } },
  }],
  outputDir: '../test-results/ui',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'reports/ui' }]],
})
