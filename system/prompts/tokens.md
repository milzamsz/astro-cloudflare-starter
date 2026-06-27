# Audit: design tokens

Audit this repository for off-system color/spacing/typography usage.

1. Read `system/globals/colors.md`, `spacing.md`, `typography.md`, `effects.md`.
2. Search `src/components/**` and `src/pages/**` for:
   - hardcoded hex/rgb/hsl colors in `<style>` blocks (allowed only as `var(--x, #fallback)`),
   - Tailwind palette utilities (`bg-blue-500`, `text-red-600`, …),
   - magic-number spacing/radius instead of scale tokens,
   - inline `style=` attributes.
3. Run `node scripts/check-kpis.mjs` and reconcile findings.
4. For each violation: propose the exact semantic token replacement
   (`bg-primary`, `text-foreground`, `var(--muted-foreground)`, `--space-*`, `--radius-*`).
5. Confirm dark mode still resolves (tokens swap under `.dark`).

Output: a table of `file:line → issue → fix`, then the patch.
