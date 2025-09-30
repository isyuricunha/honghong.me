import { defineConfig, devices } from '@playwright/test'

const CI = !!process.env.CI

const baseURL = 'http://localhost:3000'

export default defineConfig({
  testDir: './src/tests/e2e',
  fullyParallel: !CI,
  forbidOnly: CI,
  retries: CI ? 2 : 1,
  workers: CI ? 1 : '50%',
  reporter: 'html',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  expect: { timeout: 5000 },
  projects: [
    { name: 'setup', testMatch: '**/*.setup.ts', teardown: 'teardown' },
    { name: 'authenticated', testMatch: 'authenticated/**/*.test.ts', dependencies: ['setup'] },
    { name: 'unauthenticated', testMatch: 'unauthenticated/**/*.test.ts', dependencies: ['setup'] },
    { name: 'teardown', testMatch: '**/*.teardown.ts' },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './src/tests/e2e/.auth/user.json',
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write']
        }
      },
      dependencies: ['setup']
    }
  ],
  webServer: {
    command: CI ? 'pnpm start' : 'pnpm dev',
    url: baseURL,
    reuseExistingServer: !CI
  }
})
