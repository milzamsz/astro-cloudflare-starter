# Audit: performance

Read `system/globals/imagery.md` and `effects.md`. Target Lighthouse ≥ 95 (aim 100).

Check:
- React islands are minimal and hydrated with the narrowest directive
  (`client:visible`/`client:idle` over `client:load`); static Astro elsewhere.
- Images use Astro `Image`/`Picture` with explicit dimensions; below-the-fold lazy;
  modern formats; no raw content `<img>`.
- Fonts self-hosted with metric-adjusted fallbacks (no CLS); no render-blocking CDNs.
- No layout shift from late-loading media or webfonts.
- Animations are CSS-only and reduced-motion-safe.
- Prefetch enabled; avoid shipping unused JS.

Output: ranked opportunities with estimated impact and `file:line`.
