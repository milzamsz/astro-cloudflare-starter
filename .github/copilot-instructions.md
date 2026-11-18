# Copilot instructions

This project is an AI-operable Astro starter. Follow the canonical conventions —
do not improvise design or architecture.

## Read first

- `system/globals/` — design knowledge base (colors, typography, spacing,
  interaction, imagery, effects, responsiveness, accessibility, components,
  patterns). `components.md` catalogs the library; `patterns.md` has the reusable
  composition recipes.
- `src/registry.json` — components/sections/pages catalog.

## Rules

- **Design tokens only.** No hardcoded hex/rgb; no Tailwind palette classes
  (`bg-blue-500`). Use semantic tokens (`bg-primary`, `text-foreground`,
  `var(--muted-foreground)`). Palette is monochrome OKLCH.
- **Dark mode** uses the `.dark` class; never hand-invert colors.
- **Three tiers:** Components → Sections (`src/components/sections`) → Pages.
- **i18n:** English default at `/`; locales live only in
  `src/config/i18n.config.ts`. Use `t(locale, key)` / `resolveRoute(locale, path)`.
  With a second locale, every route also needs `src/pages/[locale]/x.astro`.
- **No UI-framework runtime;** interactivity is a bundled `<script>` or custom
  element. **CSP is hash-based:** no inline handlers, third-party origins only in
  `src/config/csp.config.ts`.
- **Preserve:** Git-based Markdown content, Cloudflare Pages, SEO/OG/RSS/
  sitemap/llms.txt, Pagefind, Starlight docs.

## Verify

Run `pnpm lint` (includes `pnpm check:kpis`), `pnpm test` and `pnpm build` before
finishing (`pnpm test:e2e` for UI changes).
`check:kpis` is the source of truth and fails on off-system edits.
