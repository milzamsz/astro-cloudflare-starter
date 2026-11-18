import { test, expect, type Page } from "@playwright/test";

/**
 * Every page must render without Content-Security-Policy violations.
 * (Astro emits the CSP as a <meta> tag, so `astro preview` enforces it.)
 */
const PAGES = [
  "/",
  "/about/",
  "/blog/",
  "/blog/welcome/",
  "/services/",
  "/services/web-development/",
  "/pricing/",
  "/contact/",
  "/privacy/",
  "/sections/",
  "/pages/",
  "/docs/",
  "/docs/getting-started/quick-start/",
  "/404.html",
];

async function collectViolations(page: Page) {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /Content Security Policy/i.test(message.text())) {
      violations.push(message.text());
    }
  });
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      console.error(
        `Content Security Policy violation: ${event.violatedDirective} blocked ${event.blockedURI || "inline"}`,
      );
    });
  });
  return violations;
}

test.describe("content security policy", () => {
  for (const path of PAGES) {
    test(`no CSP violations on ${path}`, async ({ page }) => {
      const violations = await collectViolations(page);
      await page.goto(path, { waitUntil: "networkidle" });
      await expect(page.locator('meta[http-equiv="content-security-policy"]')).toHaveCount(1);
      expect(violations).toEqual([]);
    });
  }

  test("search (Pagefind WebAssembly) works under CSP", async ({ page }) => {
    const violations = await collectViolations(page);
    await page.goto("/", { waitUntil: "networkidle" });
    await page.keyboard.press("Control+k");
    const input = page.locator("#search-modal input").first();
    await expect(input).toBeVisible();
    await input.fill("astro");
    await expect(page.locator("#search-modal .pagefind-ui__result").first()).toBeVisible();
    expect(violations).toEqual([]);
  });

  test("docs search (Starlight) works under CSP", async ({ page }) => {
    const violations = await collectViolations(page);
    await page.goto("/docs/", { waitUntil: "networkidle" });
    await page.locator("button[data-open-modal]").first().click();
    const input = page.locator("site-search dialog input").first();
    await expect(input).toBeVisible();
    await input.fill("deploy");
    await expect(page.locator("site-search .pagefind-ui__result").first()).toBeVisible();
    expect(violations).toEqual([]);
  });

  test("contact map iframe is allowed by frame-src", async ({ page }) => {
    const violations = await collectViolations(page);
    await page.goto("/contact/", { waitUntil: "networkidle" });
    await page.locator("[data-map-embed]").click();
    await expect(page.locator("iframe.contact__map-frame")).toHaveCount(1);
    await page.waitForTimeout(500);
    expect(violations.filter((v) => v.includes("frame-src"))).toEqual([]);
  });
});
