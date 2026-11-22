import { describe, expect, it } from "vitest";
import { consentAction, parseConsent } from "../../lib/consent";

describe("parseConsent", () => {
  it("accepts only known values", () => {
    expect(parseConsent("granted")).toBe("granted");
    expect(parseConsent("denied")).toBe("denied");
    expect(parseConsent("yes")).toBeNull();
    expect(parseConsent(null)).toBeNull();
  });
});

describe("consentAction", () => {
  it("loads immediately when consent isn't required", () => {
    expect(consentAction(false, null)).toBe("load");
    expect(consentAction(false, "denied")).toBe("load");
  });

  it("never loads before the visitor accepts when consent is required", () => {
    expect(consentAction(true, null)).toBe("ask");
    expect(consentAction(true, "denied")).toBe("skip");
    expect(consentAction(true, "granted")).toBe("load");
  });
});
