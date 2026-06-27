---
description: Three-tier architecture, i18n, and platform invariants
globs:
alwaysApply: true
---

# Architecture & invariants

**Three tiers:** Components (`src/components/ui/**`) → Sections
(`src/components/sections/**`) → Pages (`src/pages/**`). Compose pages from
sections; compose sections from components. Register new sections in
`src/components/sections/index.ts` and `src/registry.json`.

**i18n:** English is the default locale (no prefix); Indonesian is under `/id/`.
Every route must exist in **both** `src/pages/x.astro` and
`src/pages/[locale]/x.astro`. Use `t(locale, key)` and `resolveRoute(locale, path)`.

**Preserve (never break):** Git-based Markdown content collections, Cloudflare
Pages (+ optional R2), SEO (OG images, JSON-LD, sitemap, RSS, robots, llms.txt),
Pagefind search, Starlight docs.

**Rendering:** static Astro by default; React islands only where interaction truly
requires it (e.g. `FeatureTabs`), hydrated with the narrowest directive
(`client:visible` over `client:load` when possible).

**Verify:** `pnpm build` and `pnpm lint` (includes `check:kpis`) must pass; add both
locales when adding routes; check accessibility (`system/globals/accessibility.md`).
