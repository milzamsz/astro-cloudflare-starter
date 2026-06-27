import { test, expect } from "@playwright/test";

test.describe("navigation chrome", () => {
  test("homepage loads with nav links", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 30_000 });
    // Positive proof we're on this site, not a colliding dev server on 4321
    await expect(page.locator(".logo").first()).toHaveAttribute(
      "aria-label",
      "Astro Cloudflare",
      { timeout: 30_000 },
    );
    await expect(page.locator(".header__list a").first()).toBeVisible({
      timeout: 30_000,
    });
  });

  test("language switcher is present and links to the other locale", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const switcher = page.locator(".language-switcher").first();
    await expect(switcher).toBeVisible({ timeout: 30_000 });
    const href = await switcher.getAttribute("href");
    expect(href).toBeTruthy();
  });

  test("dark mode toggle flips the html dark class", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const toggle = page.locator("[data-theme-toggle]").first();
    await expect(toggle).toBeVisible({ timeout: 30_000 });
    const before = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    await toggle.click();
    const after = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(after).toBe(!before);
  });

  test("Ctrl+K opens the search modal", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 30_000 });
    await page.keyboard.press("Control+k");
    const dialog = page.locator("#search-modal").first();
    await expect(dialog).toBeVisible({ timeout: 30_000 });
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible({ timeout: 30_000 });
  });

  test("mobile menu toggle opens the panel", async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const toggle = page.locator("[data-menu-toggle]").first();
    await expect(toggle).toBeVisible({ timeout: 30_000 });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true", {
      timeout: 30_000,
    });
  });
});
