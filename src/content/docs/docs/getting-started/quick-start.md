---
title: Quick Start
description: Get the project running locally in minutes.
sidebar:
  order: 2
---

## Prerequisites

- **Node.js 26 LTS** (the repo pins it in `.node-version`; [fnm](https://github.com/Schniz/fnm) and [nvm](https://github.com/nvm-sh/nvm) pick it up)
- **pnpm 12** (`corepack enable` — the version comes from `packageManager` in `package.json`)
- **Cloudflare Account** (free tier works)

## Clone & Install

```bash
git clone https://github.com/milzamsz/astro-cloudflare-starter.git
cd astro-cloudflare-starter
pnpm install
```

## Environment Setup

```bash
cp .env.example .env
```

Most variables are optional for a static site. Set `SITE_URL` for correct
canonical/OG/sitemap URLs in production.

## Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:4321` — English is served at the root (`/`). The i18n
engine is ready for additional locales when you need them.

## Build for Production

```bash
pnpm build
```

The output is in `dist/` — ready for Cloudflare Pages deployment.

## Check your work

```bash
pnpm lint       # oxlint, eslint (.astro), stylelint, type-check (TS 7 + astro check), design KPIs
pnpm test       # unit tests (Vitest)
pnpm test:e2e   # end-to-end + CSP tests (Playwright, runs against the built site)
pnpm lighthouse # Lighthouse budgets against dist/
```
