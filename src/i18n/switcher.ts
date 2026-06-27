import type { Locale } from "../lib/site-config";
import { stripLocale, localePrefix } from "./routes";

/**
 * Known route map for equivalent content across locales.
 * Key: content path (no locale prefix). Maps to content pair.
 * Add entries here as new pages are created.
 */
const EQUIVALENT_ROUTES: Record<string, boolean> = {
  "/": true,
  "/about": true,
  "/services": true,
  "/pricing": true,
  "/blog": true,
  "/contact": true,
  "/privacy": true,
  "/terms": true,
};

/**
 * Resolve the equivalent localized path for a given current path
 * and target locale. Uses the translation key mapping to find
 * equivalent content items.
 *
 * Example: getEquivalentPath("/id/services", "en") → "/en/services"
 */
export function getEquivalentPath(
  currentPath: string,
  targetLocale: Locale,
): string {
  const contentPath = stripLocale(currentPath);
  const prefix = localePrefix(targetLocale);

  // If the route is known to have an equivalent, map it
  if (EQUIVALENT_ROUTES[contentPath]) {
    return `${prefix}${contentPath === "/" ? "" : contentPath}`;
  }

  // For blog posts and docs, try the content path directly
  // (translation key in frontmatter handles pairing)
  return `${prefix}${contentPath}`;
}

/**
 * Check if a route has equivalent content in both locales.
 */
export function hasEquivalent(path: string): boolean {
  const contentPath = stripLocale(path);
  return contentPath in EQUIVALENT_ROUTES;
}
