# Colors

Single source of truth for color. Tokens are defined in
`src/styles/tokens/colors.css` and exposed to Tailwind via the `@theme` block in
`src/styles/global.css`. **Never hardcode colors** (no `#hex`, no `bg-blue-500`).
Always use a semantic token.

## System

- **Model:** OKLCH (`oklch(L C H)`), perceptually uniform.
- **Palette:** monochrome/neutral. Chroma is `0` for all surfaces and `primary`
  so the UI stays calm and AI edits cannot drift off-system.
- **Dark mode:** class strategy (`.dark` on `<html>`). Every semantic token has a
  light and dark value; components reference the token, never a mode-specific color.

## Semantic tokens

| Token | Use |
| --- | --- |
| `--background` / `--foreground` | page surface / primary text |
| `--card` / `--card-foreground` | raised surfaces, panels |
| `--popover` / `--popover-foreground` | overlays, menus |
| `--primary` / `--primary-foreground` | primary actions, emphasis (near-black ↔ near-white) |
| `--secondary` / `--secondary-foreground` | secondary surfaces/buttons |
| `--accent` / `--accent-foreground` | subtle highlights |
| `--muted` / `--muted-foreground` | muted surfaces / secondary text |
| `--border` | hairlines, dividers, card borders |
| `--ring` | focus ring |
| `--surface-invert` / `--surface-invert-foreground` / `--surface-invert-border` | inverted band (e.g. final CTA) that flips tone in each mode |

## Functional status (the only chromatic tokens)

`--destructive`, `--success`, `--warning`, `--info` (+ `-foreground`). Use **only**
for genuine status meaning (errors, validation, score gauges) — never as decoration.

## Usage

```css
/* in a component <style> */
color: var(--foreground);
background: var(--card);
border: 1px solid var(--border);
```

```astro
<!-- Tailwind utilities map to the same tokens -->
<div class="bg-card text-foreground border border-border">…</div>
<!-- arbitrary value when no utility exists -->
<span class="text-[color:var(--muted-foreground)]">…</span>
```

## Rules

- No raw hex/rgb/hsl in components. Hex is allowed only in token files,
  `site.config.ts` (brand source), and OG image generation.
- Don't invert colors manually for dark mode — swap is automatic via tokens.
- `check:kpis` flags hardcoded Tailwind palette utilities as errors.
