import { test, expect } from "@playwright/test";
import { SITE_CONFIG } from "../lib/site-config";

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

  // The switcher only renders when SITE_CONFIG.locales has another locale to
  // switch to (see LanguageSwitcher.astro and the i18n guide).
  const hasOtherLocale = SITE_CONFIG.locales.length > 1;

  test("language switcher matches the configured locales", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 30_000 });
    const switcher = page.locator(".language-switcher");
    if (!hasOtherLocale) {
      await expect(switcher).toHaveCount(0);
      return;
    }
    await expect(switcher.first()).toBeVisible({ timeout: 30_000 });
    const href = await switcher.first().getAttribute("href");
    expect(href).toBeTruthy();
    expect(href).not.toBe("#");
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
