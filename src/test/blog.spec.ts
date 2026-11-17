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

test.describe("blog tag + pagination routes", () => {
  test("tag page only lists posts carrying that tag", async ({ page }) => {
    test.setTimeout(60_000);
    // seo-multilingual is the only post tagged "seo"; welcome and
    // getting-started are not, so they must be absent.
    const response = await page.goto("/blog/tag/seo", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(200);

    const cards = page.locator(".blog-card");
    await expect(cards.first()).toBeVisible({ timeout: 30_000 });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const tagLinks = cards.nth(i).locator(".blog-tags a");
      await expect(tagLinks.filter({ hasText: /^seo$/i })).toHaveCount(1);
    }

    await expect(
      page.locator('.blog-card__title a[href="/blog/seo-multilingual"]'),
    ).toHaveCount(1);
    await expect(
      page.locator('.blog-card__title a[href="/blog/welcome"]'),
    ).toHaveCount(0);
    await expect(
      page.locator('.blog-card__title a[href="/blog/getting-started"]'),
    ).toHaveCount(0);

    await expect(page.locator(".blog-list__count")).toContainText(
      `${count} article`,
    );
    await expect(
      page.locator('.blog-list__tags a[aria-current="page"]'),
    ).toHaveText(/seo/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/blog\/tag\/seo$/,
    );
  });

  test("tag links on cards point at static tag routes", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/blog", { waitUntil: "domcontentloaded" });
    const tagLink = page.locator(".blog-card .blog-tags a").first();
    await expect(tagLink).toBeVisible({ timeout: 30_000 });
    const href = await tagLink.getAttribute("href");
    expect(href).toMatch(/^\/blog\/tag\/[a-z0-9-]+$/);

    await tagLink.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator(".blog-card").first()).toBeVisible({
      timeout: 30_000,
    });
  });
});
