import { describe, it, expect } from "vitest";
import { t, translations } from "../../i18n/ui";

describe("t()", () => {
  it("returns the English string for a known key", () => {
    expect(t("en", "nav.home")).toBe("Home");
  });

  it("returns the key as fallback when missing", () => {
    expect(t("en", "nonexistent.key")).toBe("nonexistent.key");
  });

  it("exposes the active locale dictionary", () => {
    expect(translations.en).toBeDefined();
    expect(Object.keys(translations.en ?? {}).length).toBeGreaterThan(0);
  });
});
