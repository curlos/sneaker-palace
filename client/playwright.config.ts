import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Checkout tests do a real Stripe round-trip plus async order creation
   * afterward, on top of a full add-to-bag -> cart -> checkout flow -- the
   * default 30s budget leaves no room for that. */
  timeout: 60_000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Checkout tests load Stripe's own JS SDK from js.stripe.com and hit the
   * real Stripe test-mode API - genuine third-party network flakiness, not
   * something fixable here, so it gets one retry locally too. */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. Locally, cap workers rather than using
   * the full CPU core count - running all 3 browser projects at max
   * parallelism is what causes most of the local resource-contention
   * flakiness (see retries/timeout comments above). Override with
   * --workers=N for a specific run if you want more or less. */
  workers: process.env.CI ? 1 : 2,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* The default 5s assertion timeout is tight when all 3 browser projects
   * are competing for CPU during a full local run - operations that are
   * instant in isolation can occasionally take longer under that load. */
  expect: { timeout: 10_000 },
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run the backend and client dev servers before starting the tests */
  webServer: [
    {
      command: 'npm run devStart:local',
      cwd: '../server',
      url: 'http://localhost:8888',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npm run start',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
