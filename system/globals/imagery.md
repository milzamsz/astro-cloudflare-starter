# Imagery

## Components

- Use Astro `Image`/`Picture` (or the project `Img` wrapper) for raster assets —
  never a raw `<img>` for content images (optimization, sizing, CLS).
- Icons: `astro-icon` with Lucide (`lucide:*`) and Simple Icons (`simple-icons:*`).
  Icons are inline SVG, currentColor-driven, sized in `rem`.

## Requirements

- **Every image needs a meaningful `alt`.** Decorative images use `alt=""` +
  `aria-hidden="true"`. `check:kpis` warns on missing `alt`.
- Provide explicit `width`/`height` (or aspect-ratio) to prevent layout shift.
- Prefer SVG/`woff2`; lazy-load below-the-fold media.
- Round corners with `--radius-lg`/`--radius-xl`; respect container width (no overflow).

## OG / social images

- Generated dynamically at `/og/[...slug]` from `src/lib/og.ts` using brand colors
  from `site.config.ts` (the one place literal color values belong for imagery).
