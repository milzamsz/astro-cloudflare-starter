/**
 * Analytics consent decisions (pure, unit-tested).
 *
 * When consent is required (PUBLIC_CONSENT_ENABLED=true), analytics loads only
 * after the visitor accepts. The choice is stored in localStorage under
 * CONSENT_STORAGE_KEY; clearing site data shows the banner again.
 */
export const CONSENT_STORAGE_KEY = "analytics-consent";

export type ConsentChoice = "granted" | "denied";

export function parseConsent(value: string | null | undefined): ConsentChoice | null {
  return value === "granted" || value === "denied" ? value : null;
}

/** What the page should do on load. */
export function consentAction(
  consentRequired: boolean,
  stored: ConsentChoice | null,
): "load" | "ask" | "skip" {
  if (!consentRequired) return "load";
  if (stored === "granted") return "load";
  if (stored === "denied") return "skip";
  return "ask";
}
