import { siteConfig } from "../config/site.config";
import type { Locale } from "./site-config";
import { localePrefix, stripLocale } from "../i18n/routes";

export interface SeoMeta {
  title: string;
  description: string;
  locale: Locale;
  path: string;
  image?: string;
}

/**
 * Generate the canonical URL for a given locale and path.
 * Handles Astro i18n prefix routing (prefixDefaultLocale: false).
 */
export function canonicalUrl(locale: Locale, path: string): string {
  const prefix = localePrefix(locale);
  const normalized = path.replace(/\/$/, "");
  return `${siteConfig.url}${prefix}${normalized || ""}`;
}

/**
 * Generate hreflang link elements for the current page across all locales.
 * Handles Astro i18n prefix routing.
 */
export function hreflangLinks(path: string): Array<{
  rel: string;
  href: string;
  hreflang: string;
}> {
  // Strip locale prefix to get the content path
  const contentPath = stripLocale(path);

  return siteConfig.i18n.locales.map((loc) => ({
    rel: "alternate",
    href: canonicalUrl(loc as Locale, contentPath),
    hreflang: loc,
  }));
}

/**
 * Build a minimal JSON-LD structured data object.
 */
export function jsonLdWebSite(meta: SeoMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: meta.locale,
  };
}

/**
 * Generate Open Graph and Twitter meta tags.
 * Now includes og:image and og:image:secure_url, og:image:width, og:image:height
 * when an image URL is provided.
 */
export function ogMeta(meta: SeoMeta) {
  const url = canonicalUrl(meta.locale, meta.path);
  const imageUrl =
    meta.image ||
    (meta.path
      ? canonicalUrl(meta.locale, meta.path.replace(/^\//, "/"))
      : undefined);

  const base: Record<string, string> = {
    "og:title": meta.title,
    "og:description": meta.description,
    "og:url": url,
    "og:locale": meta.locale,
    "og:site_name": siteConfig.name,
    "og:type": "website",
    "twitter:card": "summary_large_image",
    "twitter:title": meta.title,
    "twitter:description": meta.description,
  };

  if (imageUrl) {
    // For CloudFlare Pages, og:image is the transformed URL from the R2 bucket.
    // og:image:secure_url = same as og:url (canonical) when accessible over HTTPS.
    // og:image:width/height come from the preset.
    base["og:image"] = imageUrl;
    base["og:image:secure_url"] = imageUrl;
    base["og:image:width"] = "1200"; // Default to hero preset size
    base["og:image:height"] = "630";
  }

  return base;
}

/**
 * JSON-LD Organization schema (site-wide).
 */
export function jsonLdOrganization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };
}

/**
 * JSON-LD Service schema (service detail pages).
 */
export function jsonLdService(service: {
  name: string;
  description: string;
  locale: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    url: service.url,
    inLanguage: service.locale,
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
    },
  };
}

/**
 * JSON-LD FAQ schema (FAQ sections).
 */
export function jsonLdFAQ(
  questions: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

/**
 * JSON-LD Breadcrumb schema.
 */
export function jsonLdBreadcrumb(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildPageTitle(
  title: string,
  siteName: string = siteConfig.name,
) {
  const suffix = ` | ${siteName}`;
  const limit = 60;
  const trimmed = title.trim();
  if (`${trimmed}${suffix}`.length <= limit) {
    return `${trimmed}${suffix}`;
  }

  const maxTitleLength = Math.max(1, limit - suffix.length);
  return `${trimmed.slice(0, maxTitleLength - 1).trimEnd()}…${suffix}`;
}

export function buildOpenGraphMeta(meta: SeoMeta) {
  return ogMeta({
    ...meta,
    title: buildPageTitle(meta.title),
  });
}
