import { defineConfig, devices } from '@playwright/test'
import responsive from './brand.config'

export interface ProjectEnv {
  FULL_MATRIX?: string
}

export function resolveUiProjects(env: ProjectEnv = process.env) {
  if (env.FULL_MATRIX === 'true') {
    return [
      ...responsive.projects!,
      {
        name: 'desktop-ultrawide',
        testMatch: /presence\/.*\.spec\.ts$/,
        use: { ...devices['Desktop Chrome'], viewport: { width: 5120, height: 1440 } },
      },
    ]
  }

  return [
    {
      name: 'desktop-1080p',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'mobile-chrome-android',
      use: { ...devices['Pixel 7'] },
    },
  ]
}

const { projects: _brandProjects, ...baseConfig } = responsive

export default defineConfig({
  ...baseConfig,
  testDir: '.',
  testMatch: /(?:brand|tour|presence)\/.*\.spec\.ts$/,
  timeout: 45_000,
  projects: resolveUiProjects(),
  outputDir: '../test-results/ui',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'reports/ui' }]],
})
