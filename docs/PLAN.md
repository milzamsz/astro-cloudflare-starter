# Modernization Plan — Latest Stack + Refinements

| | |
|---|---|
| **Status** | Approved — in progress |
| **Date** | 2026-11-17 |
| **Branch** | `claude/charming-cerf-pn50o6` |
| **Delivery** | One PR, one commit per phase, each phase green on `pnpm build` · `pnpm lint` · `pnpm test` |

---

## 1. Decisions (from the Q&A)

| Topic | Decision |
|---|---|
| Upgrade depth | **Bleeding edge** — newest majors everywhere, including **TypeScript 7** (with a compat strategy, §4) |
| Hosting | **Stay on Cloudflare Pages** — refresh config, fix the false "cron-triggered" claim |
| Runtime | **Node 26 LTS + pnpm 12** |
| i18n | **English-only, fix the docs** — keep the engine multi-locale-ready, stop promising `/id/` |
| Linting | **Oxlint + slim ESLint** (ESLint only for `.astro`), Stylelint without SCSS |
| Refinements | Native CSP · prune deps + drop React · consolidate duplicate components · Astro 7 idioms |
| CI / hygiene | Full lint + e2e in CI · SHA-pinned actions + Renovate · Lighthouse CI budgets · repo cleanup |

---

## 2. Baseline audit (current `main` @ `4511f54`)

**Works:** `pnpm install` ✅ · `pnpm build` ✅ (26 pages, Pagefind index) · `pnpm test` ✅ (35 tests)

**Broken / inconsistent:**

1. **`pnpm lint` fails** — `eslint-plugin-astro` preprocessing error in
   `src/components/layout/Analytics.astro` (`Cannot read properties of null (reading 'start')`),
   plus 12 warnings (unused vars, `no-console`). CI only runs a subset of lint, so this is hidden.
2. **Toolchain pins are stale and exact**: `packageManager: pnpm@8.15.0` (EOL), `engines.node: "24.0.0"`
   (exact — warns on any other Node), duplicated in `.tool-versions`, `wrangler.jsonc` `vars.PNPM_VERSION`,
   three workflows, `SETUP.md`, docs.
3. **i18n docs lie**: `AGENTS.md`, `.windsurfrules`, `SETUP.md`, `CHANGELOG.md` promise English + Indonesian
   (`/id/`, `src/pages/[locale]/`). Code has only `en`; no `[locale]` dir, no `id.json`.
   The locale list is also hard-coded in **5 places** (`astro.config.ts` ×3, `content.config.ts`, `i18n.config.ts`).
4. **`functions/api/cleanup.ts` claims to be "cron-triggered"** — Pages Functions cannot run on cron.
5. **Lint config debris**: legacy `.eslintrc.cjs` (ESLint 8, mentions "Sveltia CMS") alongside the flat config;
   `@typescript-eslint/eslint-plugin` + `@typescript-eslint/parser` duplicated by `typescript-eslint`;
   `stylelint-config-recommended-scss` with zero SCSS files.
6. **Unused dependencies**: `cva` (0 imports, pinned to a beta), `schema-dts` (0 imports).
7. **React for one island**: only `src/components/landing/FeatureTabs.tsx` uses React (≈150 KB of deps, a renderer, and JSX tsconfig).
8. **Duplicate / tier-less components**: `components/Hero.astro` (wrapper of `components/hero/Hero.astro`),
   `components/CTA.astro` (wrapper of `ui/marketing/CTA`), `layout/Logo.astro` vs `ui/marketing/Logo`,
   and `components/FAQ.astro`, `FeatureGrid.astro` living outside the Components → Sections → Pages tiers.
9. **Hand-rolled frontmatter parser** in `astro.config.ts` (regex YAML) duplicating what content collections already validate.
10. **CSP**: `script-src 'unsafe-inline'`; `frame-src` allows Google Maps but the contact page uses OpenStreetMap.
11. **CI gaps**: `check:kpis`, `validate:secrets`, unit tests and Playwright are never run in CI;
    `trufflehog@main` unpinned; `skills-verification.yml` only `cat`s a file that doesn't exist.
    **Three CI jobs are red on every PR** (seen on this one):
    - *Lint + Type Check* — the `Analytics.astro` error above.
    - *Dependency Review* — the job has no `actions/checkout`, so `.github/dependency-review-config.yml`
      is not on disk (`ENOENT`).
    - *Secret Scanning* — `trufflehog@main` now passes `--fail` itself; our `extra_args: --only-verified --fail`
      repeats it → `flag 'fail' cannot be repeated`. (Pinning would have prevented this.)
12. **Repo noise**: `blog-detail.png` / `blog-list.png` (~470 KB) at root; README says `cd astro-cloudflare`
    (repo is `astro-cloudflare-starter`).

---

## 3. Target versions

| Package | Now | Target | Notes |
|---|---|---|---|
| Node | 24.0.0 (exact) | **26 LTS** (`>=26`) | `.node-version` = `26`; Pages build image reads it |
| pnpm | 8.15.0 | **12.21** | settings move to `pnpm-workspace.yaml`; `onlyBuiltDependencies` for sharp/esbuild |
| astro | 7.0.9 | 7.4.12 | |
| @astrojs/mdx | 7.0.3 | **8.1.6** | major |
| @astrojs/starlight | 0.41.3 | **0.43.1** | check component-override API (SiteTitle) |
| @astrojs/sitemap | 3.7.3 | 3.7.5 | |
| @astrojs/rss | 4.0.19 | 4.0.19 | |
| @astrojs/check | 0.9.9 | 0.9.12 | peer TS ≤6 → runs on TS 6 compat (§4) |
| @astrojs/react, react, react-dom, @types/react* | 6.0.1 / 19.2 | **removed** | Phase 5 |
| tailwindcss, @tailwindcss/vite | 4.3.2 | 4.3.5 | |
| typescript | 6.0.3 | **7.0.2** (+ `@typescript/typescript6` 6.0.2 for tooling) | §4 |
| eslint | 10.7 | 10.15 | `.astro` only |
| oxlint (+ eslint-plugin-oxlint) | — | **1.94** | new |
| typescript-eslint | 8.64 | 8.73 | drop the two `@typescript-eslint/*` packages |
| eslint-plugin-astro / astro-eslint-parser | 3.0 | 3.2 | |
| stylelint | 17.14 | **18.0** | |
| stylelint-config-standard | 40 | **41** | drop `-recommended-scss` |
| prettier | 3.9.5 | 3.10.1 | |
| prettier-plugin-astro | 0.14.1 | **1.1.2** | major |
| prettier-plugin-tailwindcss | 0.8.0 | 0.8.1 | |
| vitest | 4.1.10 | **5.1.0** | major |
| @playwright/test | 1.61 | 1.65 | |
| pagefind | 1.5.2 | 1.6.0 | |
| zod | 4.4.3 | 4.6.7 | prefer `astro/zod` re-export |
| sharp | 0.35.3 | 0.35.5 | |
| astro-icon | 1.1.5 | 1.2.0 | |
| tailwind-merge | 3.6 | 3.7 | |
| wrangler | — | **4.164** (devDep) | pinned locally instead of `npx` |
| @lhci/cli | — | 0.16.1 | new |
| cva, schema-dts | beta / 2.0 | **removed** | unused |
| @types/node | 26.1 | 26.6 | matches Node 26 |

> Versions are what npm reports as `latest` today; exact patch numbers are re-resolved at implementation time.

---

## 4. TypeScript 7 strategy (the one risky item)

TS 7 is the native (Go) compiler. Its npm package exposes **only `unstable/*` APIs** — the classic
`ts.createProgram` API is gone. Tools built on that API cannot use it yet:

- `typescript-eslint` peer: `typescript >=4.8.4 <6.1.0`
- `@astrojs/check` / Volar language server peer: `typescript ^5 || ^6`

**Approach — dual compiler:**

```jsonc
// package.json (devDependencies)
"typescript": "^7.0.2",                                   // native tsc — fast type-check of .ts
"@typescript/typescript6": "^6.0.2"                        // classic API for tooling
// pnpm-workspace.yaml
overrides:
  "typescript-eslint>typescript": "npm:@typescript/typescript6@^6.0.2"
  "@astrojs/check>typescript": "npm:@typescript/typescript6@^6.0.2"
  "@astrojs/language-server>typescript": "npm:@typescript/typescript6@^6.0.2"
```

Scripts:

- `type-check:ts` → `tsc --noEmit -p tsconfig.json` (TS 7, all `.ts`/config files)
- `type-check:astro` → `astro check` (TS 6 API, `.astro` files)
- `type-check` → both

`tsconfig.json` changes required by TS 7: drop `baseUrl` (removed in 7), rewrite paths as
`"@/*": ["./src/*"]`, drop the React JSX settings (Phase 5).

**Spike first, then commit.** If the overrides do not resolve peers correctly under pnpm 12, or
`astro check` misbehaves: **fallback = `typescript@6.0.3` everywhere**, documented in this file and the
CHANGELOG, with a Renovate rule to retry TS 7 automatically when `@astrojs/check` widens its peer range.

---

## 5. Phases

Each phase = one commit. After each: `pnpm build && pnpm lint && pnpm test` (and `pnpm test:e2e` whenever a phase touches UI).

### Phase 1 — Toolchain: Node 26 + pnpm 12

- `package.json`: `packageManager: "pnpm@12.x"`, `engines: { node: ">=26", pnpm: ">=12" }`.
- `.node-version` → `26`; `.tool-versions` → `nodejs 26` + `pnpm 12`.
- New `pnpm-workspace.yaml` holding pnpm settings (`onlyBuiltDependencies: [sharp, esbuild, workerd]`, overrides).
- `wrangler.jsonc`: drop `vars.PNPM_VERSION` (Pages build image honours `packageManager` via corepack); bump `compatibility_date`.
- Regenerate `pnpm-lock.yaml` (lockfile v9+ format).
- Workflows: `node-version-file: .node-version`, `pnpm/action-setup` without hard-coded version (reads `packageManager`).

### Phase 2 — Dependency upgrades (bleeding edge)

- Bump everything in §3; apply the TS 7 strategy (§4) as a spike, keep or fall back.
- Handle breaking changes: MDX 8, Starlight 0.43 (component overrides, `social` shape), Vitest 5
  (config/alias API), prettier-plugin-astro 1.x, Stylelint 18 (rule renames).
- Add `wrangler` as a devDependency; scripts `cf:dev` (`wrangler pages dev dist`) and `cf:deploy`.

### Phase 3 — Linting: Oxlint + slim ESLint + Stylelint

- Add `oxlint` with `.oxlintrc.json` (correctness + suspicious + TS rules, `no-console: warn`
  except `scripts/` and `functions/`).
- Reduce `eslint.config.mjs` to `.astro` files only: `eslint-plugin-astro` + `eslint-plugin-oxlint`
  (turns off rules oxlint already covers) + prettier.
- `lint:js` → `oxlint && eslint "src/**/*.astro"`.
- Delete `.eslintrc.cjs`; remove `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`.
- Stylelint: `stylelint-config-standard` only, drop SCSS config; `at-rule-no-unknown` ignore list for
  Tailwind v4 (`@theme`, `@custom-variant`, `@utility`, `@apply`, `@reference`).
- **Fix the `Analytics.astro` parse error** (restructure the conditional fragments / inline-script `set:html`),
  and clear all current warnings so `pnpm lint` exits 0.

### Phase 4 — Astro 7 idioms + single source of truth for locales

- `import { z } from "astro/zod"` in `content.config.ts` (and anywhere else importing from `astro:content`).
- Derive locales everywhere from `src/config/i18n.config.ts`: `astro.config.ts` `i18n`, sitemap `i18n`,
  `content.config.ts` `localeSchema = z.enum(i18nConfig.locales)`.
- Remove the regex frontmatter parser + `contentValidationIntegration` from `astro.config.ts`;
  move `uid` / translation-key uniqueness checks into `src/lib/content-validation.ts` and run them
  from a unit test over `getCollection` data (fails CI instead of `console.warn`).
- Clean the unused-var warnings (`TagList.astro`, `BaseLayout.astro`, `content.config.ts`, …).

### Phase 5 — Prune deps / drop React

- Rewrite `FeatureTabs.tsx` → `src/components/landing/FeatureTabs.astro` using the WAI-ARIA tabs pattern
  (roving `tabindex`, arrow/Home/End keys, `aria-selected`, `aria-controls`) with a small bundled
  `<script>` (CSP-hashable, no `is:inline`). Works with JS off (first panel visible).
- Update `index.astro` and `SectionsShowcase.astro` usages (no more `client:visible`).
- Remove `@astrojs/react`, `react`, `react-dom`, `@types/react`, `@types/react-dom`, `cva`, `schema-dts`;
  drop `jsx`/`jsxImportSource` from `tsconfig.json` and `react()` from `astro.config.ts`.
- Add a Playwright test for keyboard navigation of the tabs.

### Phase 6 — Consolidate duplicate components (three tiers)

| Today | After |
|---|---|
| `components/Hero.astro` → wraps `components/hero/Hero.astro` | `components/sections/Hero.astro` (one component, variants in `hero.variants.ts`) |
| `components/CTA.astro` → wraps `ui/marketing/CTA` | `components/sections/CTA.astro` built on `ui/marketing/CTA` |
| `components/FAQ.astro`, `components/FeatureGrid.astro` | `components/sections/FAQ.astro`, `components/sections/FeatureGrid.astro` |
| `layout/Logo.astro` (mark + name) vs `ui/marketing/Logo` (mark only) | one `ui/marketing/Logo` with `showName` prop; header/footer use it |

- Update the barrel `src/components/sections/index.ts`, `src/registry.json`, `scripts/validate-registry.mjs`
  expectations, `system/globals/components.md` + `patterns.md`, and all page imports.
- No visual change intended — verify with before/after Playwright screenshots of `/`, `/about`, `/pricing`, `/services`, `/contact`.

### Phase 7 — Native CSP

- `astro.config.ts`: `security.csp` enabled (SHA-256) with directives for `img-src`, `font-src`, `connect-src`,
  `frame-src https://www.openstreetmap.org`; GA/GTM added via `scriptDirective.resources` **only when the env vars are set**.
- `public/_headers`: remove `script-src`/`style-src` (Astro emits them per page as hashes in a `<meta>`);
  keep header-only directives (`frame-ancestors 'none'`, `object-src`, `base-uri`, `form-action`) and the other security headers;
  replace the Google Maps `frame-src` with OpenStreetMap.
- Convert inline analytics/consent/theme scripts so they are hashable (no runtime-built strings that change per request — fine, site is static).
- Verify Starlight pages under CSP (theme script, Pagefind UI, expressive-code); add `<style>` hashes as needed.
- Playwright: fail any test on a `securitypolicyviolation` event.
- **Fallback**: if Starlight is incompatible, scope CSP to non-docs routes and document it.

### Phase 8 — Cloudflare Pages refresh

- `wrangler.jsonc`: current `compatibility_date`, keep `nodejs_compat`, keep `R2_MEDIA`; generate types with
  `wrangler types` (replaces ad-hoc `R2Bucket` globals) → `worker-configuration.d.ts` used by `functions/`.
- `functions/api/cleanup.ts`: remove the "cron-triggered" claim; accept `POST` only; constant-time bearer compare.
- Scheduling: add an **opt-in** GitHub Actions `schedule:` workflow (`cleanup.yml`, disabled by default via
  `if: vars.CLEANUP_ENABLED == 'true'`) that calls the endpoint with `CLEANUP_SECRET`. Document it.
- `release.yml`: `wrangler pages deploy` via local devDep; project name from `vars.CF_PAGES_PROJECT`.

### Phase 9 — CI/CD

- `ci.yml` jobs: **lint** (`pnpm lint` in full: oxlint, eslint, stylelint, type-check ×2, check:kpis, i18n, secrets) →
  **test** (vitest) → **build** (uploads `dist`) → **e2e** (Playwright on the built `dist`, `--trace off`, retry with trace on failure)
  → **lighthouse** (`@lhci/cli` against `dist`, `lighthouserc.json` budgets: perf ≥ 0.95, a11y = 1.0, SEO = 1.0, best-practices ≥ 0.95, on `/`, `/blog/`, `/docs/`).
- Pin every third-party action to a commit SHA (with `# vX.Y.Z` comment); `trufflehog` off `@main`.
- Fix the two broken jobs: add `actions/checkout` before `dependency-review-action`; drop the duplicate
  `--fail` from trufflehog `extra_args`. (These are small enough to land first, ahead of the other phases, if you prefer.)
- Replace `.github/dependabot.yml` with `renovate.json`: weekly schedule, groups (astro + integrations,
  tailwind, lint, test, types, cloudflare), automerge patch for devDeps, `pinDigests` for actions,
  a rule to retry TS 7 for tooling (if fallback taken). Keep `dependency-review` job.
- Remove `skills-verification.yml` (no-op) — or fold into `lint` if you want the check kept.
- Concurrency group per ref to cancel superseded runs.

### Phase 10 — Docs & repo hygiene

- `AGENTS.md`, `.windsurfrules`, `.cursor/rules/*.mdc`, `.github/copilot-instructions.md`: English-only reality,
  "how to add a locale" pointer, new lint/type-check commands, sections-tier paths, no React islands by default.
- `README.md` (fix `cd` dir, Node 26/pnpm 12, scripts table), `SETUP.md`, `CONTRIBUTING.md`, `SECURITY.md` (CSP note).
- Starlight docs: quick-start, project-structure, internationalization (add-a-locale guide replacing the
  `/id/` promise), deployment (Pages + cleanup scheduling), environment variables.
- Move `blog-detail.png` / `blog-list.png` → `docs/assets/` (or `src/assets/screenshots/`) and reference from README.
- `CHANGELOG.md` → `[Unreleased]` entry listing every breaking change (Node/pnpm, React removed, component paths, lint commands).
- Remove "Sveltia CMS" and pnpm 8 mentions; `bug_report.yml` version fields.

---

## 6. Verification checklist (Definition of Done)

- [ ] `pnpm install --frozen-lockfile` on Node 26 / pnpm 12, no engine warnings
- [ ] `pnpm build` — same page count (26), Pagefind index built, sitemap + RSS + `llms.txt` + OG images present
- [ ] `pnpm lint` exits 0 (oxlint, eslint, stylelint, both type-checks, `check:kpis`, i18n, secrets)
- [ ] `pnpm test` — all unit tests pass (incl. new content-validation test)
- [ ] `pnpm test:e2e` — existing + new tabs/CSP tests pass
- [ ] Lighthouse budgets met locally
- [ ] Dark mode verified on `/` and `/docs/` (screenshot pair)
- [ ] No hardcoded colors / palette utilities introduced (`check:kpis`)
- [ ] `wrangler pages dev dist` serves the site and `/api/cleanup` rejects unauthenticated calls

---

## 7. Risks & fallbacks

| Risk | Likelihood | Fallback |
|---|---|---|
| TS 7 overrides don't satisfy peers / `astro check` breaks | Medium | `typescript@6.0.3` everywhere; Renovate retries TS 7 |
| Native CSP conflicts with Starlight / expressive-code | Medium | Scope CSP to marketing routes; keep header CSP for docs |
| Starlight 0.43 / MDX 8 breaking changes | Low–Med | Follow upstream migration notes; pin previous minor if blocked |
| pnpm 12 blocks build scripts (sharp, esbuild) | Certain | `onlyBuiltDependencies` allow-list |
| Cloudflare Pages build image lacks Node 26 | Low | `NODE_VERSION` env var in Pages settings (documented) |
| Visual regressions from component consolidation | Low | Before/after screenshots per page in PR |
| Lighthouse flakiness in CI | Medium | 3 runs median, `warn` (not `error`) for perf, `error` for a11y/SEO |

---

## 8. Out of scope

- Migrating to Workers + Static Assets or adding `@astrojs/cloudflare` (decided: stay on Pages).
- Adding Indonesian or any second locale (decided: English-only, docs fixed).
- Visual redesign / new sections / new content.
- Biome, Tailwind config changes beyond version bumps.

---

## 9. Decisions on the open points (approved)

1. **`skills-verification.yml`** — **delete**. It always passes (the lock file doesn't exist) and runs twice per PR;
   `check:kpis` + `validate-registry` run in the full lint job instead.
2. **Cleanup scheduling** — **opt-in GitHub Actions schedule**, off unless repo variable `CLEANUP_ENABLED == 'true'`;
   endpoint stays `dry-run` unless `CLEANUP_MODE` is changed.
3. **Lighthouse** — **a11y = 1.0 and SEO = 1.0 are errors**; perf ≥ 0.95 and best-practices ≥ 0.95 are warnings;
   median of 3 runs.
4. **Renovate automerge** — **only patch updates of dev tooling** (lint/format/types/test) when CI is green;
   runtime deps, minors/majors and action digests are manual.
5. **Screenshots** — **move to `docs/assets/` as WebP** and reference them from the README.
6. **Ordering** — the two broken CI jobs (Dependency Review checkout, trufflehog `--fail`) are fixed first.
