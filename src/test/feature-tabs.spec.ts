import { test, expect } from "@playwright/test";

test.describe("feature tabs (homepage)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  test("first panel is visible, others hidden", async ({ page }) => {
    const tabs = page.locator("feature-tabs").first().getByRole("tab");
    await expect(tabs).toHaveCount(3);
    await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
    const panels = page.locator("feature-tabs").first().locator('[role="tabpanel"]');
    await expect(panels.nth(0)).toBeVisible();
    await expect(panels.nth(1)).toBeHidden();
  });

  test("click selects a tab and shows its panel", async ({ page }) => {
    const root = page.locator("feature-tabs").first();
    await root.getByRole("tab").nth(1).click();
    await expect(root.getByRole("tab").nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(root.getByRole("tab").nth(0)).toHaveAttribute("aria-selected", "false");
    await expect(root.locator('[role="tabpanel"]').nth(1)).toBeVisible();
    await expect(root.locator('[role="tabpanel"]').nth(0)).toBeHidden();
  });

  test("arrow keys, Home and End move focus and selection", async ({ page }) => {
    const root = page.locator("feature-tabs").first();
    const tabs = root.getByRole("tab");
    await tabs.nth(0).focus();

    await page.keyboard.press("ArrowRight");
    await expect(tabs.nth(1)).toBeFocused();
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("End");
    await expect(tabs.nth(2)).toBeFocused();

    await page.keyboard.press("ArrowRight"); // wraps to first
    await expect(tabs.nth(0)).toBeFocused();

    await page.keyboard.press("ArrowLeft"); // wraps to last
    await expect(tabs.nth(2)).toBeFocused();

    await page.keyboard.press("Home");
    await expect(tabs.nth(0)).toBeFocused();
    await expect(root.locator('[role="tabpanel"]').nth(0)).toBeVisible();
  });

  test("only the selected tab is in the tab order", async ({ page }) => {
    const tabs = page.locator("feature-tabs").first().getByRole("tab");
    await expect(tabs.nth(0)).toHaveAttribute("tabindex", "0");
    await expect(tabs.nth(1)).toHaveAttribute("tabindex", "-1");
  });
});
