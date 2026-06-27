# Typography

Tokens in `src/styles/tokens/typography.css`, mapped to Tailwind in `global.css`.

## Font families

| Token | Family | Use |
| --- | --- | --- |
| `--font-sans` | Manrope Variable | body text |
| `--font-heading` | Outfit Variable | headings |
| `--font-mono` | JetBrains Mono Variable | code |

Fonts are **self-hosted** via Fontsource (no CDN). Metric-adjusted fallback
`@font-face` rules prevent layout shift (CLS).

## Fluid type scale

`clamp()`-based, fluid between mobile and desktop:

`--text-xs` 12–14 · `--text-sm` 14–16 · `--text-base` 16–18 · `--text-lg` 18–20 ·
`--text-xl` 20–24 · `--text-2xl` 24–32 · `--text-3xl` 30–40 · `--text-4xl` 36–48 ·
`--text-5xl` 48–64.

Heading aliases: `--heading-h1`…`--heading-h6` map to the scale.

## Weights & rhythm

- Weights: `--font-weight-{light,normal,medium,semibold,bold,extrabold}`.
- Headings default to `--font-weight-semibold`, `--leading-tight`.
- Body uses `--leading-normal`; long-form prose uses `--leading-relaxed`.
- Letter-spacing tokens: `--tracking-tight` for large headings, default elsewhere.

## Rules

- Use heading elements semantically (one `h1` per page; never skip levels).
- Prose/long-form content is capped to a readable measure (~65–72ch).
- Prefer the scale tokens over arbitrary font sizes.
- Section eyebrows: uppercase, `--text-xs`, tracked, `--muted-foreground` or `--primary`.
