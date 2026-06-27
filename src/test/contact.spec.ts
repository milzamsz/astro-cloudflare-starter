import { test, expect } from "@playwright/test";

test.describe("contact form", () => {
  test("contact page renders the form", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#contact-form")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator("#name")).toBeVisible({ timeout: 30_000 });
    await expect(page.locator("#email")).toBeVisible({ timeout: 30_000 });
    await expect(page.locator("#message")).toBeVisible({ timeout: 30_000 });
  });

  test("submitting empty leaves the success message hidden", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#submit-btn")).toBeVisible({ timeout: 30_000 });
    await page.locator("#submit-btn").click();
    await expect(page.locator("#form-success")).toBeHidden({ timeout: 30_000 });
  });

  test("filling the form keeps the submit button enabled", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#name")).toBeVisible({ timeout: 30_000 });
    await page.locator("#name").fill("Test User");
    await page.locator("#email").fill("test@example.com");
    await page
      .locator("#message")
      .fill("This is a test message long enough to pass validation.");
    await expect(page.locator("#submit-btn")).toBeEnabled({ timeout: 30_000 });
  });
});
