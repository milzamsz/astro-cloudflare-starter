## AI Development System

This repo is built to be operated by AI coding agents. Stay **on-system**.

**Read before editing UI/design:**

- `system/globals/` — canonical design knowledge (colors, typography, spacing,
  interaction, imagery, effects, responsiveness, accessibility, components,
  patterns). One source of truth for all design decisions; `components.md` +
  `patterns.md` unify the component library.
- `src/config/site.config.ts` — bring-your-own-brand input; translate it into
  tokens, never inline.
- `src/config/i18n.config.ts` — the only place locales are defined.
- `src/registry.json` — machine-readable catalog of components, sections, pages.

**Architecture (three tiers):** Components (`src/components/ui/**`) → Sections
(`src/components/sections/**`, barrel `src/components/sections/index.ts`) → Pages
(`src/pages/**`). Build pages by composing sections; build sections from components.
Register new components/sections in `src/registry.json`.

**Stack:** Astro 7 (static output), Tailwind CSS v4, Starlight docs, Node 26 LTS,
pnpm 12, TypeScript 7 (`typescript-native`) with the TS 6 compat API for tooling,
Oxlint + ESLint (`.astro` only), Vitest 5, Playwright, Cloudflare Pages.

**Hard rules:**

- Colors/spacing/typography come from design tokens only. No hardcoded hex/rgb and
  no Tailwind palette utilities (`bg-blue-500`). Use semantic tokens
  (`bg-primary`, `text-foreground`, `var(--muted-foreground)`). A `style` attribute
  may only set CSS custom properties (`style={{ "--x": value }}`).
- Dark mode must keep working (class strategy). Never hand-invert colors.
- No UI-framework runtime. Interactivity = a bundled `<script>` or custom element
  (see `src/components/landing/FeatureTabs.astro`).
- CSP stays strict: no inline event handlers, no `is:inline` scripts unless they
  must run before paint (then register the hash, see `src/lib/csp.ts`). Third-party
  origins go in `src/config/csp.config.ts`.
- Preserve i18n routing (English default at `/`, ready for more locales — see the
  Internationalization guide), Cloudflare Pages, SEO/OG/RSS/sitemap/llms.txt,
  Pagefind, and Starlight docs.
- Links go through `resolveRoute(locale, path)`; UI copy through `t(locale, key)`.
  When a second locale is added, every route also needs `src/pages/[locale]/x.astro`.

**Verify before done:** `pnpm build`, `pnpm lint` (oxlint + eslint + stylelint +
type-check + `check:kpis` + i18n/registry/secrets validation), `pnpm test`, and
`pnpm test:e2e` for UI changes. `check:kpis` is the source of truth for design
conventions and fails CI on off-system edits.

**Portable self-audit prompts:** `system/prompts/` (usable in any chat tool).
