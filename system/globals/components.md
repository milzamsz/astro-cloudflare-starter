# Components

The component library, organized as three tiers. This is the human-readable
companion to `src/registry.json` (machine-readable). **Read this before adding or
editing any UI** so new work reuses existing primitives instead of inventing
markup. Reusable composition recipes live in `patterns.md`.

## Architecture

```
Components (src/components/ui/**)  →  Sections  →  Pages (src/pages/**)
```

- **Components** — tier-1 primitives. Generic, presentational, no business logic.
  Import from the barrel: `import { Button, Card, Badge } from "@/components/ui"`.
- **Sections** — tier-2 page blocks composed from primitives + content. Import
  from the barrel: `import { Hero, Pricing, FAQ } from "@/components/sections"`.
- **Pages** — tier-3 routes that arrange sections and wire content collections.
- **Feature components** — collection-specific blocks (`blog/`, `services/`) that
  sit between tiers; they compose primitives but are bound to one content type.

**When adding:** put generic, reusable UI in `ui/**` and export it from the
barrel. Put a page block in `sections/` (export from `sections/index.ts`). Keep
collection-bound UI in its feature folder (`blog/`, `services/`). Never duplicate
a primitive — extend or compose the existing one.

## Primitives (`src/components/ui/**`)

All take a `class` prop merged via `cn`, use tokens only, and expose variants
instead of one-off styling.

| Component | Path | Key props / variants | Notes |
| --- | --- | --- | --- |
| Button | `ui/form/Button/Button.astro` | `variant` (primary\|secondary\|ghost\|destructive\|link), `size` (sm\|md\|lg), `href`, `type`, `loading` | Renders `<a>` when `href`, else `<button>`. Pill radius, focus-ring built in. |
| Icon | `ui/primitives/Icon/Icon.astro` | `name` (e.g. `lucide:check`), `size`, `color`, `decorative` | Wraps `astro-icon`; `decorative` toggles `aria-hidden`. |
| Badge | `ui/data-display/Badge/Badge.astro` | `variant` (default\|outline\|secondary\|destructive), `size` (sm\|md) | Inline pill, `--radius-full`. |
| Alert | `ui/feedback/Alert/Alert.astro` | `variant`, `dismissible` | Status messaging; uses functional status tokens. |
| Card | `ui/data-display/Card/Card.astro` | `hover` | Scaffold with `header` / default / `footer` slots. See card pattern. |
| Avatar | `ui/data-display/Avatar/Avatar.astro` | `name`, `src`, `alt`, `size` (sm\|md\|lg) | Falls back to initials. |
| AvatarGroup | `ui/data-display/AvatarGroup/AvatarGroup.astro` | `items`, `max` | Overlapping stack with `+N` overflow. |
| Table | `ui/data-display/Table/Table.astro` | `class` | Slot wrapper for responsive tables. |
| Skeleton | `ui/data-display/Skeleton/Skeleton.astro` | `width`, `height`, `rounded` | Loading placeholder. |
| Pagination | `ui/data-display/Pagination/Pagination.astro` | `currentPage`, `totalPages`, `basePath`, `query`, `locale` | i18n-aware route building. |
| Prose | `ui/content/Prose/Prose.astro` | `as`, `size` (sm\|md\|lg) | Long-form rich-text wrapper. |
| Container | `ui/layout/Container/Container.astro` | `size` (sm\|md\|lg\|xl\|full) | Max-width wrapper. |
| Section | `ui/layout/Section/Section.astro` | `spacing` (sm\|md\|lg\|xl) | Vertical rhythm wrapper. |
| Grid | `ui/layout/Grid/Grid.astro` | `cols` (2\|3\|4), `gap` (sm\|md\|lg\|xl) | Responsive grid. |
| Input | `ui/form/Input/Input.astro` | `id`, `name`, `label`, `type`, `required`, `helperText`, `errorText` | Labelled field with validation text. |
| Select | `ui/form/Select/Select.astro` | `id`, `name`, `options`, `label`, `required` | Labelled select. |
| Textarea | `ui/form/Textarea/Textarea.astro` | `id`, `name`, `rows`, `label`, `required` | Labelled multiline field. |
| Checkbox | `ui/form/Checkbox/Checkbox.astro` | `id`, `name`, `label`, `checked` | — |
| Switch | `ui/form/Switch/Switch.astro` | `id`, `name`, `label`, `checked` | Toggle. |
| Logo (marketing) | `ui/marketing/Logo/Logo.astro` | `href` | Wordmark/monogram from `site.config`. |

## Sections (`src/components/sections` barrel)

Page-level blocks. Most are `i18nAware` (accept/derive `locale`).

| Section | Path | Props |
| --- | --- | --- |
| Hero | `hero/Hero.astro` | `variant`, `size`, `eyebrow`, `headline`/`title`, `subheadline`/`content`, `primaryCta`, `secondaryCta`, `locale`; `image` slot |
| FeatureTabs (React) | `landing/FeatureTabs.tsx` | `tabs[]` (`id`, `icon`, `heading`, `description`, `points?`, `visual`) |
| FeatureGrid | `FeatureGrid.astro` | `title`, `features[]`, `columns` (2\|3\|4) |
| FAQ | `FAQ.astro` | `title`, `items` |
| CTA | `ui/marketing/CTA/CTA.astro` | `eyebrow`, `title`, `content`, `primaryText`/`primaryHref`, `secondaryText`/`secondaryHref`, `centered` |
| SocialProof | `ui/marketing/SocialProof/SocialProof.astro` | `title`, `items` |
| Pricing | `sections/Pricing.astro` | `title`, `description`, `plans` |
| Newsletter | `sections/Newsletter.astro` | `title`, `description`, `placeholder`, `buttonLabel`, `action` |
| Team | `sections/Team.astro` | `title`, `description`, `members` |
| Comparison | `sections/Comparison.astro` | `title`, `description`, `columns`, `rows` |
| LogoCloud | `sections/LogoCloud.astro` | `title`, `logos` |
| StackMarquee | `landing/StackMarquee.astro` | `items`, `pauseOnHover` |
| TechStack | `landing/TechStack.astro` | `items` |
| Credibility | `landing/Credibility.astro` | `stats`, `testimonials`, `logos` |
| LighthouseScores | `landing/LighthouseScores.astro` | `scores` |

## Feature components

Collection-bound blocks. Compose primitives + the patterns in `patterns.md`.

| Component | Path | Props | Notes |
| --- | --- | --- | --- |
| BlogCard | `blog/BlogCard.astro` | `post`, `variant` (grid\|list), `locale`, `headingLevel` | Card scaffold + monochrome cover. |
| ArticleHero | `blog/ArticleHero.astro` | `post`, `locale` | Editorial post header + full-width banner. |
| RelatedPosts | `blog/RelatedPosts.astro` | `currentPost`, `allPosts`, `limit`, `locale` | Grid of BlogCards. |
| ShareButtons | `blog/ShareButtons.astro` | `url`, `title`, `locale` | Native share + copy-link feedback + socials. |
| BlogImageSVG | `blog/BlogImageSVG.astro` | `slug`, `title` | Deterministic monochrome cover (no inline color). |
| TagList | `blog/TagList.astro` | `tags`, `basePath`, `locale` | Tag pills. |
| TableOfContents | `blog/TableOfContents.astro` | `headings`, `layout` (inline\|sidebar), `maxDepth`, `minHeadings` | — |
| ServiceCard | `services/ServiceCard.astro` | `service`, `locale`, `headingLevel` | Icon badge + price pill + checklist. |

## Rules

- **Tokens only.** No raw hex/rgb or palette utilities in components (see
  `colors.md`). All color/spacing/radius comes from tokens.
- **Reuse before authoring.** Compose `Card`, `Button`, `Icon`, `Section`,
  `Grid` rather than re-implementing them. New shared UI goes in `ui/**` and the
  barrel.
- **Class merging via `cn`.** Every primitive accepts `class` and merges it.
- **Keep islands minimal.** Only `FeatureTabs` is a React island; prefer `.astro`
  unless interactivity requires a client framework.
- **Decorative layers** (textures, glows, grids) are `aria-hidden` and
  `pointer-events: none`.
- **Keep `src/registry.json` in sync** when you add/rename a component or change
  its props.
