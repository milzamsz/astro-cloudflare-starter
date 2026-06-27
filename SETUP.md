# Setup & Deployment

## Prerequisites

- Node.js 24+
- pnpm 8.15+ (`corepack enable && corepack prepare pnpm@8.15.0 --activate`)
- A Cloudflare account (free tier works) — only needed to deploy

## Local development

```bash
pnpm install
cp .env.example .env   # optional; set SITE_URL for correct prod URLs
pnpm dev
```

Visit http://localhost:4321. Default locale is at `/` and `/id/`, English at `/en/`.

## Build

```bash
pnpm build     # outputs static site to dist/
pnpm preview   # serve the production build locally
```

## Deploy to Cloudflare Pages

### Option A — Git integration (recommended)

1. Push the repo to GitHub.
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → connect the repo.
3. Build settings:
   - Build command: `pnpm build`
   - Output directory: `dist`
4. Add environment variables (Settings → Environment variables):
   - `SITE_URL` = your production URL
   - Optional analytics: `PUBLIC_GA_MEASUREMENT_ID`, `PUBLIC_GTM_ID`
5. Every push to `main` deploys to production; pull requests get preview URLs.

### Option B — Wrangler CLI

```bash
pnpm build
npx wrangler pages deploy dist --project-name=astro-cloudflare --branch=main
```

## R2 media (optional)

`wrangler.jsonc` defines an `R2_MEDIA` binding for storing larger media in
Cloudflare R2. Reference assets via their public R2 URL.

The `functions/api/cleanup.ts` worker can prune orphaned R2 objects. It is
guarded by a bearer token — set `CLEANUP_SECRET` as a Cloudflare Pages secret and
send `Authorization: Bearer <secret>` when invoking it.

If you don't need R2, remove the `r2_buckets` binding from `wrangler.jsonc`,
delete `functions/api/cleanup.ts`, and drop the media-manifest postbuild step from
`package.json`.

## CI

`.github/workflows/ci.yml` runs lint, type-check, i18n validation, secret
scanning, dependency review, and a build on every PR. `release.yml` deploys on
version tags.
