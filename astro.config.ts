import { defineConfig, envField } from "astro/config";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import { siteConfig } from "./src/config/site.config";
import { i18nConfig } from "./src/config/i18n.config";
import { cspSources } from "./src/config/csp.config";
import cspInlineScriptHashes from "./src/integrations/csp-inline-script-hashes";
import { docsConfig } from "./src/config/docs.config";

export default defineConfig({
  site: siteConfig.url,
  i18n: {
    defaultLocale: i18nConfig.defaultLocale,
    locales: [...i18nConfig.locales],
    routing: {
      prefixDefaultLocale: i18nConfig.routing.prefixDefaultLocale,
    },
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  integrations: [
    starlight({
      title: siteConfig.name,
      // The site ships its own branded 404 (src/pages/404.astro).
      disable404Route: true,
      customCss: ["./src/styles/starlight.css"],
      components: {
        SiteTitle: "./src/components/docs/SiteTitle.astro",
        Header: "./src/components/docs/Header.astro",
        PageTitle: "./src/components/docs/PageTitle.astro",
        Sidebar: "./src/components/docs/Sidebar.astro",
        Footer: "./src/components/docs/Footer.astro",
      },
      editLink: {
        baseUrl: "https://github.com/milzamsz/astro-cloudflare-starter/edit/main",
      },
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/milzamsz/astro-cloudflare-starter" },
      ],
      // One section per docs group (src/config/docs.config.ts); the Sidebar override
      // shows only the current tab's sections. Entries come from each group's folder.
      sidebar: docsConfig.groups.map((g) => ({
        label: g.title[i18nConfig.defaultLocale],
        collapsed: false,
        translations: Object.fromEntries(Object.entries(g.title).filter(([code]) => code !== i18nConfig.defaultLocale)),
        items: [{ autogenerate: { directory: `docs/${g.id}` } }],
      })),
    }),
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: i18nConfig.defaultLocale,
        locales: i18nConfig.localeTags,
      },
    }),
    icon(),
    // Starlight renders a few is:inline bootstraps that Astro's CSP doesn't hash.
    cspInlineScriptHashes({
      paths: ["/docs/", ...i18nConfig.locales.filter((code) => code !== i18nConfig.defaultLocale).map((code) => `/${code}/docs/`)],
    }),
  ],
  env: {
    schema: {
      SITE_URL: envField.string({ context: "server", access: "public", default: "http://localhost:4321" }),
      GOOGLE_SITE_VERIFICATION: envField.string({ context: "server", access: "public", optional: true }),
      BING_SITE_VERIFICATION: envField.string({ context: "server", access: "public", optional: true }),
      PUBLIC_GA_MEASUREMENT_ID: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_GTM_ID: envField.string({ context: "client", access: "public", optional: true }),
      PUBLIC_CONSENT_ENABLED: envField.boolean({ context: "client", access: "public", optional: true, default: false }),
      PUBLIC_PRIVACY_POLICY_URL: envField.string({ context: "client", access: "public", optional: true }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    format: "directory",
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
  image: {
    layout: "constrained",
  },
  security: {
    checkOrigin: true,
    // Hash-based CSP: Astro emits a <meta http-equiv="content-security-policy">
    // per page with SHA-256 hashes of every inline script/style it renders.
    // Header-only directives (frame-ancestors, …) stay in public/_headers.
    csp: {
      algorithm: "SHA-256",
      directives: cspSources.directives,
      scriptDirective: { resources: cspSources.scriptSources },
      styleDirective: {
        resources: [
          { resource: "'self'", kind: "element" },
          // Inline style *attributes* only: Starlight, expressive-code and
          // Shiki set CSS variables via style="". <style> elements stay
          // hash-locked. (Astro still prints a generic "Shiki + CSP" warning
          // at build; it's expected with this setup.)
          { resource: "'unsafe-inline'", kind: "attribute" },
        ],
      },
    },
  },
});