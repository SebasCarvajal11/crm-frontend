import { defineConfig } from '@playwright/test'
import responsive from './brand.config'

export default defineConfig(responsive, {
  testDir: './tour', timeout: 180_000,
  outputDir: '../test-results/tour',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'reports/tour' }]],
})
