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

The single source of truth for active locales is `src/config/i18n.config.ts`.
Astro's routing, the sitemap, the content `locale` enum, `SITE_CONFIG` and the
`Locale` type are all derived from it.

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

1. **Register the locale** in `src/config/i18n.config.ts`:

   ```typescript
   export const locales = ["en", "id"] as const;
   // …
   localeLabels: { en: "English", id: "Bahasa Indonesia" },
   localeTags: { en: "en-US", id: "id-ID" },
   ```

   That's the only config change: the `Locale` type, Astro's `i18n` routing, the
   sitemap hreflang tags and the content `locale` schema all follow.

2. **Add a translations file** `src/i18n/id.json` and register it in
   `src/i18n/ui.ts`:

   ```typescript
   import id from "./id.json";
   export const translations = { en, id };
   ```

   `pnpm validate:i18n` fails until every key from `en.json` exists in `id.json`.

3. **Add localized content** by setting `locale: id` on a copy of each entry
   (e.g. `about.md` for `en`, `about.id.md` for `id`). The content-validation test
   catches duplicate slugs or translation keys within a locale.

4. **Add prefixed routes** under `src/pages/[locale]/` for the non-default
   locales (the default locale is served at the root with no prefix), and use
   `resolveRoute(locale, path)` for every internal link.

5. **Optional:** translate Starlight's UI by adding `src/content/i18n/id.json`
   and configuring `locales` in the Starlight integration.

Once a second locale is registered, the header language switcher shows up
automatically.
