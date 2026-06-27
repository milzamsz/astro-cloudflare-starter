---
title: Content Management
description: How to manage content with Git and Markdown.
sidebar:
  order: 1
---

This template is fully Git-based: all content lives as Markdown/JSON files in
`src/content`. Edit the files in your editor (or directly on GitHub) and open a
pull request — Cloudflare Pages rebuilds on merge.

## Content Collections

| Collection | Description | Files |
| --- | --- | --- |
| **Pages** | Marketing pages (about, contact, pricing…) | `src/content/pages/*.md` |
| **Services** | Service offerings with pricing | `src/content/services/*.md` |
| **Blog** | Articles and news posts | `src/content/blog/*.md` |
| **Docs** | Documentation pages | `src/content/docs/**` (Starlight) |

Collection schemas are defined in `src/content.config.ts` (or `src/content/config.ts`),
so frontmatter is type-checked at build time.

## Locale Convention

The starter is English-only by default, so each entry uses a plain `<slug>.md`
file (e.g. `about.md`) with `locale: "en"` in its frontmatter.

The `locale` frontmatter field determines which language the content belongs to.
When you add another language, create a locale-suffixed copy (e.g. `about.id.md`
with `locale: "id"`). See the [Internationalization guide](/docs/guides/internationalization/).

## Editing Workflow

1. Create or edit a Markdown file under `src/content`.
2. Run `pnpm dev` to preview locally.
3. Commit and open a pull request.
4. Merging to `main` triggers a Cloudflare Pages production deploy.

## Media

Images can live in `src/assets` (optimized by Astro) or in the Cloudflare R2
bucket for larger files. Reference R2 assets via their public URL.
