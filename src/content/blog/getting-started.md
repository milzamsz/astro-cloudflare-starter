---
title: "Getting Started with Astro + Cloudflare"
description: "A step-by-step guide to building a fast site with Astro and Cloudflare Pages."
locale: "en"
publishDate: 2026-06-25
draft: false
tags:
  - astro
  - tutorial
  - cloudflare
author: "Admin"
translationKey: "getting-started"
---

## Why This Stack?

Building a fast marketing website requires a combination of tools that work
well together. **Astro** provides the static site generation, **Markdown in Git**
keeps content versioned and reviewable, and **Cloudflare Pages** handles global
deployment.

## Setting Up Content Collections

Content collections are the backbone of your site. Define a schema in
`src/content.config.ts`:

```typescript
const blog = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/blog",
    generateId: ({ entry }) => entry.replace(/\.[^/.]+$/, ""),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    locale: z.enum(["en"]),
    publishDate: z.date(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    author: z.string().default("Admin"),
    translationKey: z.string().optional(),
  }),
});
```

## Creating Your First Post

Create a new Markdown file in `src/content/blog/`:

```markdown
---
title: "My First Post"
description: "A short description"
locale: "en"
publishDate: 2026-06-25
draft: false
tags:
  - tutorial
author: "Admin"
---

## Content Here

Write your post content using **Markdown**.
```

## Multilanguage-Ready

The starter is English-only by default, but the i18n engine is wired up. To add
a language, widen the `Locale` type, register the locale in the config files, add
a `src/i18n/<locale>.json` translations file, and create localized content. See
the Internationalization guide in the docs for the full walkthrough.

## Previewing Drafts

Draft posts are excluded from production builds. Set `draft: true` in the
frontmatter while you work, and remove it (or set `false`) when you're ready to
publish.

## Going Further

- Customize the [Tailwind CSS](https://tailwindcss.com) theme in `src/styles/global.css`
- Add new sections to pages via the page content collections
- Set up analytics with GTM or Umami via the site settings
