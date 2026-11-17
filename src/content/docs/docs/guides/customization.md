---
title: Customization
description: Tailoring the starter to your needs.
sidebar:
  order: 3
---

## Branding

Update the site-wide identity in `src/config/site.config.ts` (name, description,
`url`, author, social links, OG image). This is the single source of truth for
canonical/OG/sitemap and `llms.txt`.

## Adding Pages

1. Create a Markdown file in `src/content/pages/`:

```markdown
---
title: My Page
slug: my-page
locale: en
description: A new page.
---
## Content here
```

2. Create the route `src/pages/my-page.astro` — copy `src/pages/privacy.astro`
   (it loads the entry by `slug` + `locale` and renders it), or compose sections
   from `src/components/sections` for a marketing page.
3. Add it to the navigation in `src/config/nav.config.ts` and add the label key to
   `src/i18n/en.json`.
4. Register the page in `src/registry.json` (`pnpm validate:registry` checks it).
5. With more than one locale, also add `src/pages/[locale]/my-page.astro`.

## Updating the Hero

The homepage uses the `Hero` section (`src/components/sections/Hero.astro`).
Its copy comes from the `hero.*` keys in `src/i18n/en.json`; variants and sizes
are defined in `src/components/sections/hero.variants.ts`.

## Design tokens

Colors, spacing and typography are CSS custom properties in
`src/styles/tokens/`. Change the brand there (or via `branding` in
`site.config.ts`) — components only use semantic tokens such as
`var(--primary)` or `bg-primary`, and `pnpm check:kpis` rejects hardcoded colors.

## Interactivity

There is no UI-framework runtime. Add behavior with a `<script>` in the component
(Astro bundles and hashes it for the CSP) or a small custom element — see
`src/components/landing/FeatureTabs.astro` for an accessible example.

## Third-party scripts and embeds

The Content Security Policy only allows origins listed in
`src/config/csp.config.ts`. Add a new analytics provider, font CDN or iframe
source there; `pnpm test:e2e` fails if a page triggers a CSP violation.
