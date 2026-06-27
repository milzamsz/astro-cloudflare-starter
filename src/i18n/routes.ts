import type { Locale } from "../lib/site-config";
import { SITE_CONFIG } from "../lib/site-config";

/**
 * Get the URL prefix for a given locale.
 * With prefixDefaultLocale: true, all locales get a prefix.
 */
export function localePrefix(locale: Locale): string {
  // When prefixDefaultLocale is false, the default locale has no prefix
  if (locale === SITE_CONFIG.defaultLocale) return "";
  return `/${locale}`;
}

/**
 * Resolve a full localized route path.
 * Example: resolveRoute("en", "/services") → "/services"
 *          resolveRoute("id", "/services") → "/id/services"
 */
export function resolveRoute(locale: Locale, path: string): string {
  const prefix = localePrefix(locale);
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${prefix}${normalized}`;
}

/**
 * Strip locale prefix from a path to get the content key.
 * Example: stripLocale("/en/services") → "/services"
 */
export function stripLocale(path: string): string {
  for (const loc of SITE_CONFIG.locales) {
    const prefix = localePrefix(loc);
    if (path === prefix || path === `${prefix}/`) return "/";
    if (path.startsWith(`${prefix}/`)) {
      return path.slice(prefix.length) || "/";
    }
  }
  return path;
}

/**
 * Detect locale from a path. Falls back to defaultLocale.
 */
export function detectLocale(path: string): Locale {
  for (const loc of SITE_CONFIG.locales) {
    const prefix = localePrefix(loc);
    if (path === prefix || path.startsWith(`${prefix}/`)) return loc;
  }
  return SITE_CONFIG.defaultLocale;
}
