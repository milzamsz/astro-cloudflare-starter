---
title: Environment Variables
description: Environment configuration for local dev and production.
sidebar:
  order: 2
---

This is a static site, so most variables are optional. See `.env.example` for the
full list.

## Local Development

Copy `.env.example` to `.env` for build-time variables:

```ini
# Public production URL (canonical/OG/sitemap)
SITE_URL=http://localhost:4321

# Optional analytics
PUBLIC_GA_MEASUREMENT_ID=
PUBLIC_GTM_ID=
```

Analytics IDs are read at **build time**: when set, the generated Content
Security Policy also allows Google's script and collection origins
(`src/config/csp.config.ts`). Rebuild after changing them.

Pages Functions secrets (only the R2 cleanup function) go in `.dev.vars`, which
`pnpm cf:dev` loads:

```ini
# Any local value; send it as `Authorization: Bearer <value>`.
CLEANUP_SECRET=
CLEANUP_MODE=dry-run
```

## Production

Configure variables via **Cloudflare Dashboard > Pages > your-project >
Settings > Environment variables**. Add `CLEANUP_SECRET` as an encrypted secret.

GitHub Actions use repository **variables** (`SITE_URL`, `CF_PAGES_PROJECT`,
`CLEANUP_ENABLED`) and **secrets** (`CF_API_TOKEN`, `CF_ACCOUNT_ID`,
`CLEANUP_SECRET`) — see [Cloudflare Pages](/docs/deployment/cloudflare-pages/).

## Secrets Validation

The `validate:secrets` script scans the repo for accidentally committed secrets:

```bash
pnpm run validate:secrets
```

It runs during CI and fails the build if a likely secret is detected.
