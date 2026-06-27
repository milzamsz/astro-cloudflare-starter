# Audit: accessibility (WCAG AA)

Read `system/globals/accessibility.md`, then audit the changed pages/components.

Check:
- Semantic landmarks (`header/nav/main/footer/article/aside`); one `h1`; logical
  heading order.
- Every interactive element is keyboard reachable with a visible `:focus-visible`
  ring; no `outline: none` without a replacement.
- Icon-only buttons have `aria-label`; images have meaningful `alt` (decorative =
  `alt=""` + `aria-hidden`).
- Color contrast ≥ 4.5:1 body / 3:1 large/UI; meaning never by color alone.
- `aria-current` on active nav; `aria-expanded` on disclosures; focus managed in
  menus/modals.
- `prefers-reduced-motion: reduce` honored.

Output: prioritized issues (blocker/major/minor) with `file:line` and fixes.
