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

Pages Functions secrets (only the R2 cleanup worker) go in `.dev.vars`:

```ini
CLEANUP_SECRET=dev-cleanup-secret-change-me
```

## Production

Configure variables via **Cloudflare Dashboard > Pages > your-project >
Settings > Environment variables**. Add `CLEANUP_SECRET` as an encrypted secret.

## Secrets Validation

The `validate:secrets` script scans the repo for accidentally committed secrets:

```bash
pnpm run validate:secrets
```

It runs during CI and fails the build if a likely secret is detected.
