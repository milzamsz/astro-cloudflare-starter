---
title: Cloudflare Pages
description: Deploying to Cloudflare Pages and managing your live site.
intro: "Deploying to Cloudflare Pages and managing your live site."
type: how-to
sidebar:
  order: 1
---

## Automatic Deployments

Connect the repository in the Cloudflare dashboard (Workers & Pages → Create →
Pages) with build command `pnpm build` and output directory `dist`. Cloudflare
then builds every push. The build image reads Node from `.node-version`; set
the pnpm version from `vars.PNPM_VERSION` in `wrangler.jsonc` — with a Wrangler
config, Pages manages plain variables from that file (the dashboard only takes
secrets) and uses the production branch's copy. Keep it in sync with
`packageManager`; older pnpm versions can't read the pnpm 12 lockfile.

GitHub Actions (`ci.yml`) independently runs lint, type checks, unit tests, a
build, Playwright e2e/CSP tests, Lighthouse budgets and security scans on every
pull request. The `release.yml` workflow can deploy production from a version tag
instead (`v*`), using the `wrangler` version locked in `pnpm-lock.yaml`.

## Preview Deployments

Pull requests get automatic preview deployments, so you can review changes before merging to `main`.

## Manual Deployment

```bash
pnpm build

# Deploy via wrangler (devDependency)
pnpm cf:deploy --project-name=astro-cloudflare-starter --branch=main

# Preview the production build with Pages Functions locally
pnpm cf:dev

# Or via Cloudflare Dashboard
# Project: astro-cloudflare
```

## Required Secrets

Set these in your Cloudflare Pages dashboard or GitHub repository:

| Name | Where | Purpose |
| --- | --- | --- |
| `CF_API_TOKEN` | GitHub secret | Cloudflare API token (only for `release.yml` deploys) |
| `CF_ACCOUNT_ID` | GitHub secret | Your Cloudflare account ID |
| `CF_PAGES_PROJECT` | GitHub variable | Pages project name (default `astro-cloudflare-starter`) |
| `PNPM_VERSION` | `wrangler.jsonc` `vars` | `12.21.0` — must match `packageManager` |
| `SITE_URL` | GitHub variable + Pages env var | Canonical URL of your site |
| `CLEANUP_SECRET` | Pages secret (+ GitHub secret for the schedule) | Bearer token for the R2 cleanup endpoint |
| `CLEANUP_ENABLED` | GitHub variable | `true` turns on the weekly cleanup workflow |

## R2 Media (optional)

The `R2_MEDIA` binding in `wrangler.jsonc` connects to a Cloudflare R2 bucket for
larger media assets. `POST /api/cleanup` (`functions/api/cleanup.ts`) compares the
bucket with the build's `/media-manifest.json` and reports — or, with
`CLEANUP_MODE=quarantine|delete`, removes — unreferenced objects older than
`CLEANUP_GRACE_DAYS`. It aborts if the manifest can't be loaded.

Pages Functions have no cron trigger. To run it on a schedule, set the
`CLEANUP_ENABLED` repository variable to `true` (plus `SITE_URL` and the
`CLEANUP_SECRET` secret) to enable `.github/workflows/cleanup.yml`, or call it
yourself:

```bash
curl -X POST -H "Authorization: Bearer $CLEANUP_SECRET" https://your-site.example/api/cleanup
```

Remove the binding, the function and the workflow if you don't need R2. After
changing `wrangler.jsonc`, run `pnpm cf:types` to refresh the binding types.

## Branch Configuration

- **`main`** — Production builds
- **Feature branches** — Preview builds triggered from pull requests
