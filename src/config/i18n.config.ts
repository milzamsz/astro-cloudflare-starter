/**
 * I18n configuration — the single source of truth for locales.
 *
 * Everything else derives from this file: Astro's `i18n` routing and the
 * sitemap (astro.config.ts), the content `locale` schema (content.config.ts),
 * `SITE_CONFIG` / the `Locale` type (src/lib/site-config.ts) and `siteConfig.i18n`.
 *
 * To add a language (e.g. Indonesian):
 *   1. add it to `locales`, `localeLabels` and `localeTags` below
 *   2. create `src/i18n/<code>.json` (key parity is enforced by `pnpm validate:i18n`)
 *   3. add localized content (`locale: <code>` frontmatter) and `src/pages/[locale]/` routes
 * See the "Internationalization" guide in the docs for the full walkthrough.
 */

export const locales = ["en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export interface I18nConfig {
  /** Master switch to enable/disable i18n routing */
  enabled: boolean;
  /** Ordered list of supported locale codes */
  locales: readonly Locale[];
  /** Default locale code (must be in locales array) */
  defaultLocale: Locale;
  /** Human-readable names, used by the language switcher */
  localeLabels: Record<Locale, string>;
  /** BCP-47 tags for hreflang / sitemap (e.g. "en-US", "id-ID") */
  localeTags: Record<Locale, string>;
  /** Routing behavior options */
  routing: {
    /** Whether to prefix the default locale in URLs (e.g., /en/about vs /about) */
    prefixDefaultLocale: boolean;
  };
}

export const i18nConfig: I18nConfig = {
  enabled: true,
  locales,
  defaultLocale,
  localeLabels: {
    en: "English",
  },
  localeTags: {
    en: "en-US",
  },
  routing: {
    prefixDefaultLocale: false,
  },
};

export default i18nConfig;
