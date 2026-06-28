import { defineConfig, envField } from "astro/config";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import { readdir, readFile } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import { siteConfig } from "./src/config/site.config";

async function collectFiles(dir: string, extensions: string[]): Promise<string[]> {
  const results: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectFiles(path, extensions)));
      continue;
    }

    if (extensions.includes(extname(entry.name))) {
      results.push(path);
    }
  }

  return results;
}

function parseFrontmatter(source: string) {
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  return match[1].split(/\r?\n/).reduce<Record<string, string>>((acc, line) => {
    const pair = line.match(/^\s*([A-Za-z0-9_-]+):\s*(.*)\s*$/);
    if (!pair) return acc;
    acc[pair[1]] = pair[2].replace(/^["']|["']$/g, "");
    return acc;
  }, {});
}

function validateDuplicates(entries: Array<{ id: string; data?: { uid?: string; locale?: string } }>, supportedLocales: string[]) {
  const seenIds = new Set<string>();
  const seenUids = new Map<string, string>();

  for (const entry of entries) {
    if (seenIds.has(entry.id)) {
      console.warn(`[content-validation] Duplicate slug detected: "${entry.id}"`);
    } else {
      seenIds.add(entry.id);
    }

    const uid = entry.data?.uid;
    if (uid) {
      const previous = seenUids.get(uid);
      if (previous) {
        console.warn(`[content-validation] Duplicate uid detected: "${uid}" (${previous} and ${entry.id})`);
      } else {
        seenUids.set(uid, entry.id);
      }
    }

    const locale = entry.data?.locale;
    if (locale && !supportedLocales.includes(locale)) {
      console.warn(`[content-validation] Unsupported locale "${locale}" on entry "${entry.id}"`);
    }
  }
}

function contentValidationIntegration() {
  return {
    name: "content-validation",
    hooks: {
      "astro:build:start": async () => {
        const contentBase = join(process.cwd(), "src", "content");
        const collections = [
          { dir: join(contentBase, "blog"), extensions: [".md", ".mdx"] },
          { dir: join(contentBase, "services"), extensions: [".md", ".mdx"] },
          { dir: join(contentBase, "pages"), extensions: [".md"] },
          { dir: join(contentBase, "faqs"), extensions: [".json"] },
          { dir: join(contentBase, "stack"), extensions: [".md", ".mdx"] },
        ];

        const entries = await Promise.all(
          collections.map(async ({ dir, extensions }) =>
            Promise.all(
              (await collectFiles(dir, extensions)).map(async (file) => ({
                id: basename(file).replace(/\.[^/.]+$/, ""),
                data: parseFrontmatter(await readFile(file, "utf8")),
              })),
            ),
          ),
        );

        const supportedLocales = ["en"];
        for (const collection of entries) {
          validateDuplicates(collection, supportedLocales);
        }
      },
    },
  };
}

export default defineConfig({
  site: siteConfig.url,
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
    prefixDefaultLocale: false,
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  integrations: [
    starlight({
      title: siteConfig.name,
      customCss: ["./src/styles/starlight.css"],
      components: {
        SiteTitle: "./src/components/docs/SiteTitle.astro",
      },
      editLink: {
        baseUrl: "https://github.com/your-org/astro-cloudflare/edit/main",
      },
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/your-org/astro-cloudflare" },
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
    contentValidationIntegration(),
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: {
          en: "en-US",
        },
      },
    }),
    react(),
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