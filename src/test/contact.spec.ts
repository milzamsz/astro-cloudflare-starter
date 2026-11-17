import { test, expect } from "@playwright/test";

// The contact page is intentionally static (no form backend on Cloudflare
// Pages): it offers a mailto CTA, contact methods, and a click-to-load map.
test.describe("contact page", () => {
  test("contact page renders the mailto call to action", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    const cta = page.locator('.contact__intro a[href^="mailto:"]').first();
    await expect(cta).toBeVisible({ timeout: 30_000 });
    expect(await cta.getAttribute("href")).toMatch(/^mailto:\S+@\S+/);
  });

  test("contact page lists the contact methods", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".contact__method").first()).toBeVisible({
      timeout: 30_000,
    });
  });

  test("map facade swaps in the embed only on click", async ({ page }) => {
    test.setTimeout(60_000);
    // Never hit Google from tests; the swap is what we verify.
    await page.route("https://maps.google.com/**", (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: "" }),
    );
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    const facade = page.locator("[data-map-embed]");
    await expect(facade).toBeVisible({ timeout: 30_000 });
    await expect(page.locator(".contact__map-frame")).toHaveCount(0);
    await facade.click();
    await expect(page.locator(".contact__map-frame")).toBeVisible({
      timeout: 30_000,
    });
    await expect(facade).toHaveCount(0);
  });
});
