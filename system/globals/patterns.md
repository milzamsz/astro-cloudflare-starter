# Patterns

Reusable composition recipes that keep components visually unified. When a screen
needs one of these, **copy the pattern instead of inventing a variant** — that is
what stops the UI from drifting. All snippets use tokens only (see `colors.md`,
`spacing.md`, `effects.md`) and stay reduced-motion safe (see `interaction.md`).

## Icon badge

A token-bordered square/circle wrapping a single `Icon`. Used by `FeatureGrid`,
`ServiceCard`, and `ServiceLayout` for visual anchors.

```astro
<span class="icon-badge" aria-hidden="true">
  <Icon name="lucide:cloud" />
</span>
```

```css
.icon-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-full);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}
```

Rules: always `aria-hidden` (the adjacent heading carries meaning); never use a
chromatic background — tone comes from `--color-bg-secondary` + `--color-border`.

## Checklist row

A `lucide:check` icon plus a label, used for feature/benefit lists in
`ServiceCard`, the pricing cards, and `FeatureTabs` points.

```astro
<ul class="checklist">
  {items.map((item) => (
    <li><Icon name="lucide:check" /><span>{item}</span></li>
  ))}
</ul>
```

The check uses `--primary`/`--color-text-primary` (never green) so it stays on the
monochrome system. Icons are `flex-shrink: 0` and ~`1.0625rem`.

## Card scaffold

Compose the `Card` primitive (do not re-author a bordered box). Use the `header`
slot for media/badges, the body for content, and `hover` for the lift. Bottom-
align the CTA with `margin-top: auto` inside a flex column.

```astro
<Card hover class="my-card">
  <Fragment slot="header"><!-- media / icon badge --></Fragment>
  <div class="my-card__body"><!-- title, text, checklist, CTA --></div>
</Card>
```

Used by `BlogCard` and `ServiceCard`. Radius/border/shadow come from the `Card`
primitive — don't override them per-card.

## Inverted CTA band

The final call-to-action surface flips tone via `--surface-invert*` so it reads as
a deliberate "band" in both light and dark mode. Constrained width, optional
`eyebrow`, primary solid + secondary outline buttons.

```astro
<CTA
  eyebrow="Get started"
  title="Ready to build your site?"
  content="Explore the services or read the docs."
  primaryText="Explore services" primaryHref="/services"
  secondaryText="Read the docs" secondaryHref="/docs"
/>
```

Key tokens: `--surface-invert` (bg), `--surface-invert-foreground` (text),
`--surface-invert-border`. The inner is capped at `max-width: 60rem` and centered;
the texture layer is `aria-hidden`. Primary button = solid foreground-on-invert;
secondary = outline. Don't widen the band full-bleed.

## Pill / filter chips

Rounded-full chips for tag filters (blog) and metadata pills (price range). Active
state inverts to the primary tone.

```css
.chip {
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  padding: 0.3rem 0.75rem;
  font-size: 0.8125rem;
}
.chip[aria-current="true"] {
  background: var(--primary);
  color: var(--primary-foreground);
}
```

## Monochrome cover

Blog covers are generated deterministically from the slug so they are stable,
on-system, and need no asset pipeline. See `blog/BlogImageSVG.astro`.

- Hash the `slug` to seed an abstract pattern.
- Paint with tokens only (`var(--color-text-primary)`, `var(--color-bg-secondary)`,
  `currentColor`) — **never** inline hex or gradients with hue.
- No text inside the SVG (the card/article renders the title).

## Hover arrow affordance

Text links that lead somewhere get a trailing `&rarr;` that nudges on hover, with
the destination in a visually-hidden span for an accessible link name.

```astro
<a class="arrow-link" href={href}>
  Learn more
  <span class="sr-only"> — {title}</span>
  <span class="arrow-link__arrow" aria-hidden="true">&rarr;</span>
</a>
```

```css
.arrow-link__arrow { transition: transform 0.2s ease; }
:global(.card:hover) .arrow-link__arrow { transform: translateX(3px); }
@media (prefers-reduced-motion: reduce) {
  .arrow-link__arrow { transition: none; }
}
```

## Section head

Centered eyebrow + title + lead, capped width, used above section grids for
consistent rhythm. Class `section-head` (in `global.css`).

```astro
<header class="section-head">
  <p class="section-head__eyebrow">Why this stack</p>
  <h2 class="section-head__title">Built for performance and scale</h2>
  <p class="section-head__lead">Everything you need to ship a fast site.</p>
</header>
```

`max-width: 44rem`, `margin: 0 auto`, `text-align: center`. Eyebrow is uppercase
with letter-spacing; lead uses `--muted-foreground`.

## Motion & focus (always)

- Wrap every transition/animation in `@media (prefers-reduced-motion: reduce)`
  guards (see `interaction.md`).
- Never remove the focus ring — primitives ship `focus-visible` styling; custom
  interactive markup must add an equivalent ring using `--ring`.
- Decorative layers (textures, glows, grid) are `aria-hidden` and
  `pointer-events: none`.
