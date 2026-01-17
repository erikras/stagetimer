import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests',
  use: {
    baseURL: 'http://localhost:4173',
  },
  webServer: {
    command: 'npm run dev -- --host --port 4173',
    port: 4173,
    timeout: 60_000,
    reuseExistingServer: true,
  },
})
