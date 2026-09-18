import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, ".env") });

export const authFile = "playwright/.auth/admin.json";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Auth/signup tests write to the shared prisma/dev.db via better-sqlite3, which
     doesn't handle concurrent writes from multiple workers — run tests serially. */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Auth flows have a real ~1.2s toast delay before redirecting plus server-side
     password hashing, which can push default 5s assertion waits over the edge
     on webkit. */
  expect: {
    timeout: 10000,
  },
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    /* Most specs (home/login/signup) exercise the logged-out flow itself,
       so the default projects stay unauthenticated. Admin-only specs live
       under e2e/admin/ and run via the chromium-admin project below. */
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: "**/admin/**",
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testIgnore: "**/admin/**",
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testIgnore: "**/admin/**",
    },

    {
      name: "chromium-admin",
      use: { ...devices["Desktop Chrome"], storageState: authFile },
      testMatch: "**/admin/**",
      dependencies: ["setup"],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
