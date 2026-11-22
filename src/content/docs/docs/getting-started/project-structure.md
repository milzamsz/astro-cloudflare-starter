---
title: Project Structure
description: How the project is organised and where to find key files.
intro: "How the project is organised and where to find key files."
type: reference
sidebar:
  order: 3
---

```
.
├── public/
│   ├── _headers             # Cloudflare Pages headers (frame-ancestors, caching)
│   └── favicon.svg
├── functions/
│   └── api/cleanup.ts       # Optional R2 media cleanup (POST, secret-guarded)
├── src/
│   ├── components/
│   │   ├── ui/              # Tier 1: primitives (Button, Card, Logo, …)
│   │   ├── sections/        # Tier 2: page sections (Hero, CTA, FAQ, Pricing, …)
│   │   └── landing/ blog/ … # Feature-specific blocks
│   ├── config/              # site.config, i18n.config (locales), csp.config, nav
│   ├── content/             # Content collections (blog, docs, pages, services, i18n)
│   ├── i18n/                # Translations + routing helpers (t, resolveRoute)
│   ├── integrations/        # Small Astro integrations (CSP hashes for Starlight)
│   ├── layouts/             # Base layout with SEO, analytics, navigation
│   ├── lib/                 # Shared libraries (SEO, schema, tags, content validation)
│   ├── pages/               # Tier 3: pages (+ 404, llms.txt, robots.txt, rss, og/)
│   ├── styles/              # Global CSS + design tokens
│   ├── test/                # Playwright e2e specs
│   ├── __tests__/           # Vitest unit tests
│   └── content.config.ts    # Content collection schemas
├── system/                  # Design knowledge base + AI self-audit prompts
├── .github/workflows/       # CI, release, scheduled R2 cleanup
├── astro.config.ts          # Astro + Starlight + CSP + integrations config
├── wrangler.jsonc           # Cloudflare Pages config (R2 binding, pnpm version)
├── lighthouserc.json        # Lighthouse CI budgets
├── renovate.json            # Dependency update policy
└── package.json
```

## Key Patterns

- **Locale routing**: locales are defined once in `src/config/i18n.config.ts`; default-locale routes live at the root; add `src/pages/[locale]/` routes when introducing more languages.
- **Three tiers**: pages compose sections, sections compose `ui/` components. `src/registry.json` catalogs all three.
- **No framework runtime**: interactivity is a bundled `<script>` / custom element, which keeps the hash-based CSP strict.
- **Content collections**: Markdown files in `src/content/` with a `locale` frontmatter field (English by default).
- **Content editing**: pure Git/Markdown — edit files and open a pull request.
