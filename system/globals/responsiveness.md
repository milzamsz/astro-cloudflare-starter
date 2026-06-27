# Responsiveness

## Breakpoints

Defined in the `@theme` block: `480`, `sm 640`, `md 768`, `lg 1024`, `xl 1280`,
`2xl 1536`. Use Tailwind responsive prefixes (`md:`, `lg:`) or `clamp()`.

## Required test sizes

375 · 768 · 1024 · 1440 · 1920. At every size there must be:

- no horizontal overflow,
- no overlapping or clipped content,
- no fixed widths that break small screens,
- legible line lengths.

## Patterns

- Mobile-first; layer enhancements upward.
- Grids: 1 col (mobile) → 2 (tablet) → 3 (desktop) for card sets.
- Fluid type/space via `clamp()` reduces breakpoint churn.
- Navigation collapses to an accessible menu button below `lg`.
- Sticky sidebars (e.g. blog TOC) reset to static single-column on mobile.

## Rules

- Use `minmax(0, 1fr)` in grids so children can shrink (prevents code-block overflow).
- Verify both `en` and `id` locales (text length differs).
