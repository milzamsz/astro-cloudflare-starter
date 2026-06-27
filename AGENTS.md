## AI Development System

This repo is built to be operated by AI coding agents. Stay **on-system**.

**Read before editing UI/design:**

- `system/globals/` — canonical design knowledge (colors, typography, spacing,
  interaction, imagery, effects, responsiveness, accessibility, components,
  patterns). One source of truth for all design decisions; `components.md` +
  `patterns.md` unify the component library.
- `src/config/site.config.ts` — bring-your-own-brand input; translate it into
  tokens, never inline.
- `src/registry.json` — machine-readable catalog of components, sections, pages.

**Architecture (three tiers):** Components (`src/components/ui/**`) → Sections
(`src/components/sections/**`, barrel `src/components/sections/index.ts`) → Pages
(`src/pages/**`). Build pages by composing sections; build sections from components.

**Hard rules:**

- Colors/spacing/typography come from design tokens only. No hardcoded hex/rgb and
  no Tailwind palette utilities (`bg-blue-500`). Use semantic tokens
  (`bg-primary`, `text-foreground`, `var(--muted-foreground)`).
- Dark mode must keep working (class strategy). Never hand-invert colors.
- Preserve i18n (en default + `/id/`), Cloudflare Pages, SEO/OG/RSS/sitemap,
  Pagefind, and Starlight docs.
- New routes ship in both locales: `src/pages/x.astro` **and** `src/pages/[locale]/x.astro`.

**Verify before done:** `pnpm build`, `pnpm lint` (includes `pnpm check:kpis`),
`pnpm run lint:css`. `check:kpis` is the source of truth for design conventions and
fails CI on off-system edits.

**Portable self-audit prompts:** `system/prompts/` (usable in any chat tool).
