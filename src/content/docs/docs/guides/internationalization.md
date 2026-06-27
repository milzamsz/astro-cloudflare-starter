---
title: Internationalization
description: Multilanguage-ready i18n engine and how to add new locales.
sidebar:
  order: 2
---

The starter ships **English-only** out of the box, but the i18n engine is fully
wired so you can add languages without re-architecting anything.

## How It Works

The i18n system is built on three layers:

1. **Astro's built-in i18n** — locale routing configured in `astro.config.ts`
2. **Content collection locale fields** — each content entry declares its `locale`
3. **Translation files** — UI strings live in `src/i18n/<locale>.json`

The single source of truth for active locales is `src/config/i18n.config.ts`
(mirrored in `src/lib/site-config.ts` and `astro.config.ts`).

## UI Translations

UI strings live in `src/i18n/en.json` and are read through the `t()` helper:

```astro
---
import { t } from "../i18n/ui";
const locale = (Astro.currentLocale || "en") as "en";
---
<p>{t(locale, "nav.home")}</p>
```

`t()` falls back to the key itself when a string is missing, so dev builds fail
loudly when a translation is absent.

## Adding a New Locale

1. **Widen the type** in `src/lib/site-config.ts`:

   ```typescript
   export type Locale = "en" | "id";
   ```

2. **Register the locale** in the config files:

   ```typescript
   // src/lib/site-config.ts
   locales: ["en", "id"] as const,
   localeLabels: { en: "English", id: "Indonesia" } as const,
   localePrefixes: { en: "en", id: "id" } as const,
   ```

   ```typescript
   // src/config/i18n.config.ts  → locales: ["en", "id"]
   // astro.config.ts            → i18n.locales + sitemap.i18n.locales
   ```

3. **Add a translations file** `src/i18n/id.json` and register it in
   `src/i18n/ui.ts`:

   ```typescript
   import id from "./id.json";
   export const translations = { en, id };
   ```

4. **Add localized content** by setting the `locale` frontmatter on a copy of
   each entry (e.g. `about.md` for `en`, `about.id.md` for `id`), and extend the
   `locale` enum in `src/content.config.ts`.

5. **Add prefixed routes** under `src/pages/[locale]/` for the non-default
   locales (the default locale is served at the root with no prefix).

Once a second locale is registered, the header language switcher shows up
automatically.
