# Audit: responsiveness

Read `system/globals/responsiveness.md`. Audit layouts at 375, 768, 1024, 1440, 1920.

For each breakpoint, verify:
- no horizontal overflow,
- no overlapping or clipped content (watch code blocks, tables, marquees),
- grids collapse sensibly (1 → 2 → 3 columns),
- navigation collapses to an accessible menu below `lg`,
- line lengths stay readable; fluid `clamp()` type behaves.

Flag any fixed widths, missing `minmax(0, …)` in grids, or `min-width: 0` gaps that
cause overflow. Verify both `en` and `id` (text length differs).

Output: per-breakpoint findings with `file:line` and fixes.
