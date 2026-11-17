# Setup & Deployment

## Prerequisites

- Node.js 26 LTS (pinned in `.node-version`; fnm/nvm/mise pick it up)
- pnpm 12 — run `corepack enable`; the exact version comes from `packageManager` in `package.json`
- A Cloudflare account (free tier works) — only needed to deploy

## Local development

```bash
corepack enable
pnpm install
cp .env.example .env   # optional; set SITE_URL for correct prod URLs
pnpm dev
```

Visit http://localhost:4321. English (the default locale) is served at `/`.
Locales are configured in `src/config/i18n.config.ts`.

## Build & check

```bash
pnpm build       # outputs static site to dist/
pnpm preview     # serve the production build locally
pnpm lint        # all static checks (what CI runs)
pnpm test        # unit tests
pnpm test:e2e    # Playwright e2e + CSP tests against dist/
pnpm lighthouse  # Lighthouse budgets against dist/
```

Playwright needs a browser: `pnpm exec playwright install chromium` (or point
`PW_CHROMIUM_PATH` at an existing Chromium). Lighthouse uses your local Chrome
(`CHROME_PATH` to override).

## Deploy to Cloudflare Pages

### Option A — Git integration (recommended)

1. Push the repo to GitHub.
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → connect the repo.
3. Build settings:
   - Build command: `pnpm build`
   - Output directory: `dist`
4. Environment variables: because the repo has a `wrangler.jsonc`, Pages manages
   plain variables from its `vars` (the dashboard only accepts secrets).
   `vars.PNPM_VERSION` = `12.21.0` is **required** — the build image otherwise uses
   an older pnpm that can't read the pnpm 12 lockfile. Add other build-time values
   there too:
   - `SITE_URL` = your production URL
   - Optional analytics: `PUBLIC_GA_MEASUREMENT_ID`, `PUBLIC_GTM_ID`
     (the CSP automatically allows Google's origins when these are set)
5. Every push to `main` deploys to production; pull requests get preview URLs.

The build image reads the Node version from `.node-version` and the pnpm version
from `vars.PNPM_VERSION` (it ignores `packageManager`). Pages applies the
**production branch's** `wrangler.jsonc`, so a `PNPM_VERSION` change takes effect
for all builds once it's merged to `main`. Renovate keeps it in sync with
`packageManager`.

### Option B — Wrangler CLI

```bash
pnpm build
pnpm cf:deploy --project-name=astro-cloudflare --branch=main
```

### Option C — Tag releases from GitHub Actions

`release.yml` runs lint, tests and a build on `v*` tags and deploys with wrangler.
It needs the `CF_API_TOKEN` and `CF_ACCOUNT_ID` secrets and, optionally, the
`CF_PAGES_PROJECT` and `SITE_URL` repository variables.

## R2 media (optional)

`wrangler.jsonc` defines an `R2_MEDIA` binding for storing larger media in
Cloudflare R2. Reference assets via their public R2 URL.

`POST /api/cleanup` (`functions/api/cleanup.ts`) prunes R2 objects that the
build's media manifest no longer references. It's guarded by a bearer token —
set `CLEANUP_SECRET` as a Cloudflare Pages secret and send
`Authorization: Bearer <secret>`. It stays in `dry-run` unless you set
`CLEANUP_MODE=quarantine` or `delete`, and aborts if the manifest is missing.

Pages Functions have no cron trigger; enable the weekly
`.github/workflows/cleanup.yml` by setting the `CLEANUP_ENABLED=true` repository
variable (plus `SITE_URL` and the `CLEANUP_SECRET` secret).

If you don't need R2, remove the `r2_buckets` binding from `wrangler.jsonc`,
delete `functions/api/cleanup.ts` and `.github/workflows/cleanup.yml`, and drop
the media-manifest `postbuild` step from `package.json`.

## CI

`.github/workflows/ci.yml` runs on every pull request: `pnpm lint`, unit tests,
build, Playwright e2e (including zero-CSP-violation checks), Lighthouse budgets
(accessibility and SEO must be 100), secret scanning and dependency review.
Renovate (`renovate.json`) opens grouped dependency updates every Monday — install
the [Renovate GitHub app](https://github.com/apps/renovate) on the repository to
enable it.
