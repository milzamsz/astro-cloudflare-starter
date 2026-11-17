import { defineConfig, envField } from "astro/config";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import { siteConfig } from "./src/config/site.config";
import { i18nConfig } from "./src/config/i18n.config";

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
      },
      editLink: {
        baseUrl: "https://github.com/milzamsz/astro-cloudflare-starter/edit/main",
      },
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/milzamsz/astro-cloudflare-starter" },
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Overview", slug: "docs/getting-started/overview" },
            { label: "Quick Start", slug: "docs/getting-started/quick-start" },
            { label: "Project Structure", slug: "docs/getting-started/project-structure" },
          ],
        },
        {
          label: "Guides",
          items: [
            { label: "Content Management", slug: "docs/guides/content-management" },
            { label: "Internationalization", slug: "docs/guides/internationalization" },
            { label: "Customization", slug: "docs/guides/customization" },
            { label: "AI-assisted development", slug: "docs/guides/ai-assisted-development" },
          ],
        },
        {
          label: "Deployment",
          items: [
            { label: "Cloudflare Pages", slug: "docs/deployment/cloudflare-pages" },
            { label: "Environment Variables", slug: "docs/deployment/environment-variables" },
          ],
        },
      ],
    }),
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: i18nConfig.defaultLocale,
        locales: i18nConfig.localeTags,
      },
    }),
    icon(),
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
  },
});