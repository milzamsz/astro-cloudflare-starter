import { i18nConfig, type Locale } from "../config/i18n.config";

// Locales are defined once in src/config/i18n.config.ts.
export type { Locale };

export const SITE_CONFIG = {
  url: "https://astro-cloudflare-starter.pages.dev",
  /** Default locale for fallback. */
  defaultLocale: i18nConfig.defaultLocale,
  /** Supported locales. */
  locales: i18nConfig.locales,
  /** Human-readable locale labels. */
  localeLabels: i18nConfig.localeLabels,
  /** Short locale codes for URL prefixes. */
  localePrefixes: Object.fromEntries(
    i18nConfig.locales.map((locale) => [locale, locale]),
  ) as Record<Locale, string>,
  /** Site name for metadata and JSON-LD. */
  name: "Astro Cloudflare",
  /** Short description for metadata. */
  description: "Marketing, blog, and docs starter — multilanguage-ready.",
} as const;
