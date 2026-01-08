import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const baseURL = process.env.BASE_URL ?? 'https://tmdb-discover.surge.sh';
const headlessEnv = process.env.HEADLESS ?? 'true';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts', // Match all test files in subdirectories
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  retries: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'reports/html' }],
    ['json', { outputFile: 'reports/results.json' }],
  ],
  use: {
    baseURL,
    headless: headlessEnv.toLowerCase() !== 'false',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    viewport: { width: 1280, height: 720 },
  },
  // Configurable browser matrix via env var: BROWSERS=chromium|webkit|all
  projects: (() => {
    const browsers = (process.env.BROWSERS ?? 'chromium').toLowerCase();
    if (browsers === 'all') {
      return [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      ];
    }
    if (browsers === 'webkit') {
      return [ { name: 'webkit', use: { ...devices['Desktop Safari'] } } ];
    }
    // default: chromium only (optimizes total cases and runtime)
    return [ { name: 'chromium', use: { ...devices['Desktop Chrome'] } } ];
  })(),
});
