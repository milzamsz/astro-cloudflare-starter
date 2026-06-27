# Effects

## Radius

`--radius-xs … --radius-2xl`, `--radius-full`. Cards/panels use `--radius-xl`/
`--radius-2xl`; pills/badges use `--radius-full`; inputs use `--radius-md`/`lg`.

## Shadows

Dark-mode-aware scale in `colors.css`:

- `--shadow-sm`: hairline lift (badges, subtle cards).
- `--shadow-md`: hover elevation, panels.
- `--shadow-lg`: prominent surfaces (final CTA band).

Shadows are neutral black at low opacity (heavier in dark mode). Prefer subtle
shadows + `--border` hairlines over heavy decoration.

## Backgrounds

- `.bg-grid`: faint grid that fades via a radial mask (hero signature). Lines
  derive from `--foreground`, so it tracks light/dark.
- `.bg-glow`: soft monochrome spotlight; pulses only when motion is allowed.

## Rules

- One consistent radius family per element type.
- Don't stack multiple heavy shadows; let borders carry structure.
- Decorative layers are `aria-hidden` and `pointer-events: none`.
