import { defineConfig } from '@playwright/test'
import responsive from './brand.config'

export default defineConfig(responsive, {
  testDir: '.', testMatch: /(?:brand|tour)\/.*\.spec\.ts$/, timeout: 180_000,
  outputDir: '../test-results/ui',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'reports/ui' }]],
})
