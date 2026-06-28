# Astro Cloudflare Starter

A production-ready marketing + blog + docs site built with **Astro 7** and **Cloudflare Pages**. English-first and multilanguage-ready. Content is managed with Git and Markdown — no CMS, no database.

## Features

- English-first with a multilanguage-ready i18n engine (prefix-based routing)
- Marketing pages, blog, and Starlight-powered docs with full-text search
- Light/dark theming with a monochrome OKLCH design system
- SEO defaults: canonical, hreflang, JSON-LD, Open Graph, sitemap, RSS, dynamic `llms.txt`
- Optional Cloudflare R2 media storage + a secret-guarded cleanup worker
- Static output — fast on the Cloudflare CDN, cheap to host

## Quick Start

```bash
git clone https://github.com/milzamsz/astro-cloudflare-starter.git
cd astro-cloudflare
pnpm install
pnpm dev
```

Open **http://localhost:4321**.

## Make it yours

After clicking **Use this template**, update these:

- [ ] `src/config/site.config.ts` — `url`, `name`, `description`, `author`, `email`, social links, OG image. Single source of truth (canonical/OG/sitemap/`llms.txt`; `astro.config.ts` reads `url`).
- [ ] `src/config/nav.config.ts` — footer GitHub/social URLs.
- [ ] `astro.config.ts` — Starlight `editLink.baseUrl` and the GitHub social link.
- [ ] `wrangler.jsonc` — project `name` and the R2 bucket name (or remove the R2 binding if unused).
- [ ] `public/favicon.svg`, logos, and the default OG image.
- [ ] `.env.example` → `.env`; set `SITE_URL`. Set `CLEANUP_SECRET` as a Cloudflare secret only if you use the R2 cleanup worker.
- [ ] Content in `src/content/` (blog, services, pages, docs, settings).
- [ ] `LICENSE` copyright holder and `CHANGELOG.md`.

> Tip: update `src/config/site.config.ts` (name, author, email, social links, URL) to make this template yours.

## Documentation

| Document | Purpose |
|----------|---------|
| [SETUP.md](SETUP.md) | Setup and Cloudflare Pages deployment |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Development workflow and conventions |
| [SECURITY.md](SECURITY.md) | Reporting vulnerabilities |
| [CHANGELOG.md](CHANGELOG.md) | Release notes |
| `/docs` (Starlight) | In-app guides: getting started, content, i18n, deployment |

## Scripts

```bash
pnpm dev        # start dev server
pnpm build      # production build to dist/
pnpm preview    # preview the production build
pnpm lint       # eslint + stylelint + type-check + validations
pnpm test       # unit tests (vitest)
pnpm test:e2e   # end-to-end tests (playwright)
```

## Content model

All content lives in `src/content` as Markdown/JSON and is type-checked via content
collection schemas. Each entry uses `<slug>.md` with a `locale` frontmatter field
(English by default). To add a language, see `docs/guides/internationalization`.
Edit files and open a pull request — Cloudflare Pages rebuilds on merge.

## Deployment

Connect the repo to Cloudflare Pages (build command `pnpm build`, output `dist`), or
deploy manually with `npx wrangler pages deploy dist`. See [SETUP.md](SETUP.md).

## License

[MIT](LICENSE)
