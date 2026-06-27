/**
 * Consent configuration — GDPR / cookie consent settings
 * Values should match the PUBLIC_CONSENT_ENABLED and PUBLIC_PRIVACY_POLICY_URL env vars
 */

export interface ConsentConfig {
  /** Master switch — enable/disable consent management UI */
  enabled: boolean;
  /** URL to privacy policy page */
  privacyPolicyUrl: string;
}

export const consentConfig: ConsentConfig = {
  enabled: false,
  privacyPolicyUrl: "/privacy",
} as const;

export default consentConfig;
