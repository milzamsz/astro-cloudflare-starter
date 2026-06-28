---
title: Quick Start
description: Get the project running locally in minutes.
sidebar:
  order: 2
---

## Prerequisites

- **Node.js 24+** (use [fnm](https://github.com/Schniz/fnm) or [nvm](https://github.com/nvm-sh/nvm))
- **pnpm 8.15+** (`corepack enable && corepack prepare pnpm@8.15.0 --activate`)
- **Cloudflare Account** (free tier works)

## Clone & Install

```bash
git clone https://github.com/milzamsz/astro-cloudflare-starter.git
cd astro-cloudflare
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
