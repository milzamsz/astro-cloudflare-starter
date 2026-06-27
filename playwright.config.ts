import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/test",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://127.0.0.1:4399",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm exec astro preview --port 4399 --host 127.0.0.1",
    url: "http://127.0.0.1:4399",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
