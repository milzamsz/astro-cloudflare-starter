---
title: Customization
description: Tailoring the starter to your needs.
sidebar:
  order: 3
---

## Branding

Update the site-wide identity in `src/config/site.config.ts` (name, description,
`url`, author, social links, OG image). This is the single source of truth for
canonical/OG/sitemap and `llms.txt`.

## Adding Pages

1. Create a Markdown file in `src/content/pages/`:

```markdown
---
title: My Page
slug: my-page
locale: id
description: A new page.
---
## Content here
```

2. Add it to the navigation in `src/content/navigation.yml`
3. Create the locale route in `src/pages/[locale]/` if it needs a unique layout

## Updating the Hero

The homepage Hero component lives in `src/components/Hero.astro` and pulls its data from the first section defined in `src/content/pages/index.md`.
