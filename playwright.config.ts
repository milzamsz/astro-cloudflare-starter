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
    video: process.env.CI ? "retain-on-failure" : "off",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Optional: reuse a pre-installed Chromium (containers, CI images).
        launchOptions: process.env.PW_CHROMIUM_PATH
          ? { executablePath: process.env.PW_CHROMIUM_PATH }
          : {},
      },
    },
  ],
  webServer: {
    // --ignore-lock: a one-off foreground server (Astro 7.4 otherwise
    // auto-backgrounds `astro preview` when it detects an AI agent).
    command: "pnpm exec astro preview --port 4399 --host 127.0.0.1 --ignore-lock",
    url: "http://127.0.0.1:4399",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
