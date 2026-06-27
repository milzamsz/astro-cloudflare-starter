# Accessibility

Target: WCAG 2.1 AA.

## Structure

- Semantic landmarks: `header`, `nav`, `main`, `footer`, `article`, `aside`.
- One `h1` per page; logical heading order, no skipped levels.
- Skip link to main content (`.skip-link`).

## Color & contrast

- Body text ≥ 4.5:1; large text/UI ≥ 3:1. The monochrome tokens are tuned to pass;
  re-check any new surface pairing.
- Never convey meaning by color alone (pair with text/icon).

## Keyboard & focus

- All interactive elements reachable and operable by keyboard.
- Visible focus ring everywhere (`:focus-visible` → `--ring`); never `outline: none`
  without a replacement.
- Manage focus for menus/modals; restore on close.

## Names & semantics

- Icon-only controls need `aria-label`.
- Images need `alt` (empty + `aria-hidden` for decorative).
- Use `aria-current` for active nav; `aria-expanded` for disclosures.

## Motion

- Honor `prefers-reduced-motion: reduce`; disable non-essential animation and
  marquee auto-scroll (wrap content instead).

## Verification

- `check:kpis` warns on missing `alt`; manually verify focus order, contrast, and
  reduced-motion on new components.
