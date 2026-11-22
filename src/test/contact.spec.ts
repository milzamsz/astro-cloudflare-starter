import { test, expect } from "@playwright/test";

// The contact page is static: a mailto call-to-action plus a click-to-load map.
test.describe("contact page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
  });

  test("shows a mailto call-to-action", async ({ page }) => {
    const cta = page.locator('a[href^="mailto:"]').first();
    await expect(cta).toBeVisible();
    expect(await cta.getAttribute("href")).toMatch(/^mailto:.+@.+/);
  });

  test("map loads only after the facade is clicked", async ({ page }) => {
    const facade = page.locator("[data-map-embed]");
    await expect(facade).toBeVisible();
    await expect(page.locator("iframe.contact__map-frame")).toHaveCount(0);

    await facade.click();
    const iframe = page.locator("iframe.contact__map-frame");
    await expect(iframe).toHaveCount(1);
    expect(await iframe.getAttribute("src")).toContain("output=embed");
  });
});
