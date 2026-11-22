/**
 * Docs configuration — the single source of truth for the /docs layout.
 *
 * Layout (docs.tebar.app / docs.github.com style): a slim tab bar on top,
 * a sidebar with logo, search, the current tab's sections, language and theme,
 * and an "On this page" column. Everything below drives it:
 *
 *   tabs    top tabs; each lists the groups its sidebar shows
 *   groups  one folder per group in src/content/docs/docs/<id>/ (needs an
 *           index.mdx), shown as a card on /docs/ and as a sidebar section
 *   links   icon links at the bottom of the sidebar (e.g. app, website)
 *   ui      interface strings per locale (add a block when you add a locale)
 *
 * Keep this file erasable TypeScript (no enums): scripts/validate-docs.mjs imports it.
 */
import type { Locale } from "./i18n.config";

export type Localized = Record<Locale, string>;

export const docTypes = ["overview", "quickstart", "how-to", "tutorial", "reference"] as const;
export type DocType = (typeof docTypes)[number];

export interface DocsGroup {
  id: string;
  title: Localized;
  description: Localized;
  /** lucide icon name */
  icon: string;
  /** links shown on the group's card on /docs/ */
  popular: { label: Localized; href: string }[];
}

export interface DocsTab {
  id: string;
  label: Localized;
  /** group ids whose sections this tab's sidebar shows */
  groups: string[];
  /** path below /docs/ that the tab opens ("" = docs home) */
  landing?: string;
}

export interface DocsLink {
  /** lucide icon name */
  icon: string;
  label: Localized;
  href: string;
}

export const docsConfig = {
  /** Small badge next to the logo in the sidebar */
  badge: "Docs",
  tabs: [
    {
      id: "guide",
      label: { en: "Guide" },
      groups: ["getting-started", "guides", "deployment"],
    },
  ] as DocsTab[],
  groups: [
    {
      id: "getting-started",
      title: { en: "Get started" },
      description: { en: "What this starter provides and how to run your first build." },
      icon: "rocket",
      popular: [
        { label: { en: "Overview" }, href: "/docs/getting-started/overview/" },
        { label: { en: "Quick start" }, href: "/docs/getting-started/quick-start/" },
        { label: { en: "Project structure" }, href: "/docs/getting-started/project-structure/" },
      ],
    },
    {
      id: "guides",
      title: { en: "Guides" },
      description: { en: "Manage content, add languages and make the site yours." },
      icon: "book-open",
      popular: [
        { label: { en: "Content management" }, href: "/docs/guides/content-management/" },
        { label: { en: "Internationalization" }, href: "/docs/guides/internationalization/" },
        { label: { en: "Customization" }, href: "/docs/guides/customization/" },
      ],
    },
    {
      id: "deployment",
      title: { en: "Deployment" },
      description: { en: "Ship to Cloudflare Pages and configure environment variables." },
      icon: "cloud",
      popular: [
        { label: { en: "Cloudflare Pages" }, href: "/docs/deployment/cloudflare-pages/" },
        { label: { en: "Environment variables" }, href: "/docs/deployment/environment-variables/" },
      ],
    },
  ] satisfies DocsGroup[],
  links: [
    { icon: "globe", label: { en: "Website" }, href: "/" },
  ] satisfies DocsLink[],
  ui: {
    en: {
      docs: "Docs",
      homeTitle: "Documentation",
      homeTagline: "Guides for building, customizing and shipping your site.",
      search: "Search the docs",
      helpful: "Was this helpful?",
      yes: "Yes",
      no: "No",
      needHelp: "Still need help? Contact us",
      missing: "What was missing or wrong? (optional)",
      send: "Send",
      thanks: "Thanks for your feedback.",
      failed: "Could not send feedback. Please try again later.",
      all: "All",
      article: "Article",
      filterBy: "Filter by type",
      language: "Language",
      sections: "Sections",
      types: {
        overview: "Overview",
        quickstart: "Quickstart",
        "how-to": "How-to",
        tutorial: "Tutorial",
        reference: "Reference",
      },
    },
  } satisfies Record<Locale, DocsUi>,
  /** Where "Still need help?" and the feedback widget point */
  helpHref: "/contact/",
};

export interface DocsUi {
  docs: string;
  homeTitle: string;
  homeTagline: string;
  search: string;
  helpful: string;
  yes: string;
  no: string;
  needHelp: string;
  missing: string;
  send: string;
  thanks: string;
  failed: string;
  all: string;
  article: string;
  filterBy: string;
  language: string;
  sections: string;
  types: Record<DocType, string>;
}
