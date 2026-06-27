# Audit: SEO

Audit metadata and structured data across routes (both `en` and `id`).

Check:
- Every page sets a unique `<title>` and meta description (via the `SEO` component).
- Canonical URLs and `hreflang` alternates for both locales.
- OG/Twitter tags resolve; dynamic OG images at `/og/[...slug]` render.
- JSON-LD present where relevant (BlogPosting, FAQPage, Breadcrumbs).
- `sitemap-index.xml`, `rss.xml`, `robots.txt`, and `llms.txt` build correctly.
- Headings are descriptive; images have alt; links have text.

Output: missing/duplicate metadata as `route → issue → fix`.
