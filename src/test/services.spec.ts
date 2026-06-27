import { test, expect } from "@playwright/test";

test.describe("services listing + detail", () => {
  test("services listing shows at least one card", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/services", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".service-card").first()).toBeVisible({
      timeout: 30_000,
    });
  });

  test("clicking a service card navigates to the detail", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/services", { waitUntil: "domcontentloaded" });
    const firstLink = page.locator(".service-card__title a").first();
    await expect(firstLink).toBeVisible({ timeout: 30_000 });
    await firstLink.click();
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 30_000 });
  });
});
