# Audit: dark mode

Read `system/globals/colors.md`. Verify dark mode parity (class strategy, `.dark`).

Check:
- No component hand-inverts colors; all colors come from tokens that swap under `.dark`.
- Inverted surfaces (e.g. CTA band using `--surface-invert*`) keep correct contrast
  in BOTH modes — never white text on a light band.
- Borders, cards, inputs, badges, focus rings, and shadows read correctly in dark.
- Any hardcoded light backgrounds (e.g. status alerts) also work in dark or use tokens.

Method: toggle `.dark` on `<html>` (or `--color-scheme=dark`) and review each section.

Output: list of dark-mode contrast/parity issues with `file:line` and token fixes.
