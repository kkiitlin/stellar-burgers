import { defineConfig, devices } from '@playwright/test';

/* Адрес API, который приложение использует во время e2e-тестов.
   Он должен совпадать с URL запросов, записанных в HAR-файлах из `tests/hars`,
   поэтому передаётся dev-серверу явно и не зависит от локального `.env`. */
const BURGER_API_URL = 'https://norma.ffapi.ru/api';
const PORT = 4000;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Распознаём файлы тестов: обычные *.spec.* / *.test.* и наши *.pl.tsx */
  testMatch: ['**/*.pl.tsx', '**/*.@(spec|test).?(c|m)[jt]s?(x)'],
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: BASE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Тесты запускаются в одном браузере — Chromium */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Перед тестами Playwright сам поднимает dev-сервер (`npm run start`, порт 4000)
     и ждёт, пока он ответит. Если сервер уже запущен локально — переиспользует его. */
  webServer: {
    command: 'npm run start',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      BURGER_API_URL,
    },
  },
});
