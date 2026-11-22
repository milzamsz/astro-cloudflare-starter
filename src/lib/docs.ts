/** Helpers for the docs layout; all copy and structure come from src/config/docs.config.ts. */
import { i18nConfig } from "../config/i18n.config";
import type { Locale } from "../config/i18n.config";
import { docsConfig } from "../config/docs.config";
import type { DocsGroup, DocsTab, Localized } from "../config/docs.config";

const { defaultLocale, locales } = i18nConfig;

/** Locale of a URL path: a leading non-default locale segment, else the default. */
export const docsLocaleOf = (pathname: string): Locale => {
  const first = pathname.split("/").filter(Boolean)[0];
  return (locales as readonly string[]).includes(first ?? "") && first !== defaultLocale
    ? (first as Locale)
    : defaultLocale;
};

/** Path without its locale prefix ("/id/docs/x/" -> "/docs/x/"). */
export const stripLocale = (pathname: string): string => {
  const locale = docsLocaleOf(pathname);
  return locale === defaultLocale ? pathname : pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "") || "/";
};

/** Prefix a /docs/... link for a locale; other links (e.g. /contact/) stay as they are. */
export const docsHref = (locale: Locale, href: string): string =>
  locale !== defaultLocale && href.startsWith("/docs") ? `/${locale}${href}` : href;

/** Pick the string for a locale, falling back to the default locale. */
export const l = (locale: Locale, value: Localized): string => value[locale] ?? value[defaultLocale];

export const docsUi = (locale: Locale) => docsConfig.ui[locale] ?? docsConfig.ui[defaultLocale];

export const groupIdOfPath = (pathname: string): string | undefined => stripLocale(pathname).split("/").filter(Boolean)[1];

export const groupById = (id: string | undefined): DocsGroup | undefined =>
  docsConfig.groups.find((g) => g.id === id);

/** The tab a path belongs to: the tab that lists its group, or its landing path, else the first tab. */
export const tabOfPath = (pathname: string): DocsTab => {
  const segment = groupIdOfPath(pathname);
  return (
    docsConfig.tabs.find((t) => t.landing !== undefined && t.landing === segment) ??
    docsConfig.tabs.find((t) => segment !== undefined && t.groups.includes(segment)) ??
    docsConfig.tabs[0]
  );
};

export const tabHref = (locale: Locale, tab: DocsTab): string => docsHref(locale, `/docs/${tab.landing ? `${tab.landing}/` : ""}`);
