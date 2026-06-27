/**
 * I18n configuration — Internationalization settings
 * Source of truth for locale configuration
 */

export interface I18nConfig {
  /** Master switch to enable/disable i18n routing */
  enabled: boolean;
  /** Ordered list of supported locale codes */
  locales: string[];
  /** Default locale code (must be in locales array) */
  defaultLocale: string;
  /** Routing behavior options */
  routing: {
    /** Whether to prefix the default locale in URLs (e.g., /en/about vs /about) */
    prefixDefaultLocale: boolean;
  };
}

export const i18nConfig: I18nConfig = {
  enabled: true,
  locales: ["en"],
  defaultLocale: "en",
  routing: {
    prefixDefaultLocale: false,
  },
} as const;

export default i18nConfig;
