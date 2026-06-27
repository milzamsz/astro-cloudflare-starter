import { test, expect } from "@playwright/test";

test.describe("blog listing + detail", () => {
  test("blog listing shows at least one post card", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/blog", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".blog-card").first()).toBeVisible({
      timeout: 30_000,
    });
  });

  test("clicking a blog card navigates to the post", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/blog", { waitUntil: "domcontentloaded" });
    const firstCardLink = page.locator(".blog-card__title a").first();
    await expect(firstCardLink).toBeVisible({ timeout: 30_000 });
    await firstCardLink.click();
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 30_000 });
  });

  test("blog detail page exposes share buttons", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/blog/welcome", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 30_000 });
    await expect(page.locator(".share-buttons button").first()).toBeVisible({
      timeout: 30_000,
    });
  });
});
