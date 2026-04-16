import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const apiDir = path.resolve(fileURLToPath(import.meta.url), '../../api');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: 'http://localhost:5173',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:3001/health',
      cwd: apiDir,
      reuseExistingServer: false,
      env: { PORT: '3001', DATABASE_URL: 'file:./test.db' },
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: false,
      env: { VITE_API_URL: 'http://localhost:3001' },
    },
  ],
});
