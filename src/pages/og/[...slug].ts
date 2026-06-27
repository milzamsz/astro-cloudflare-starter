import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import { siteConfig } from "../../config/site.config";

type OgKind =
  | "home"
  | "page"
  | "blog"
  | "service"
  | "blog-list"
  | "services-list";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncate(value: string, limit = 110) {
  return value.length > limit
    ? `${value.slice(0, limit - 1).trimEnd()}…`
    : value;
}

function svgTemplate({
  kind,
  title,
  description,
  accent,
}: {
  kind: OgKind;
  title: string;
  description: string;
  accent: string;
}) {
  const altAccent =
    kind === "home"
      ? siteConfig.branding.colors.secondary
      : siteConfig.branding.colors.accent;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accent}" />
      <stop offset="100%" stop-color="${altAccent}" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <circle cx="980" cy="120" r="180" fill="rgba(255,255,255,0.08)" />
  <circle cx="1120" cy="540" r="220" fill="rgba(255,255,255,0.06)" />
  <circle cx="140" cy="530" r="190" fill="rgba(255,255,255,0.06)" />
  <text x="80" y="92" fill="rgba(255,255,255,0.82)" font-size="28" font-family="Inter, Arial, sans-serif" font-weight="700">${escapeXml(siteConfig.name)}</text>
  <text x="80" y="270" fill="#ffffff" font-size="64" font-family="Inter, Arial, sans-serif" font-weight="800">${escapeXml(title)}</text>
  <text x="80" y="350" fill="rgba(255,255,255,0.9)" font-size="30" font-family="Inter, Arial, sans-serif" font-weight="500">${escapeXml(truncate(description, 120))}</text>
  <text x="80" y="560" fill="rgba(255,255,255,0.72)" font-size="22" font-family="Inter, Arial, sans-serif">${escapeXml(siteConfig.url.replace(/^https?:\/\//, ""))}</text>
</svg>`;
}

function resolveMeta(kind: OgKind, locale: string, slug: string[]) {
  if (kind === "home") {
    return {
      title: siteConfig.name,
      description: siteConfig.description,
      accent: siteConfig.branding.colors.primary,
    };
  }

  if (kind === "blog-list") {
    return {
      title: "Blog",
      description:
        "Articles about web development and the modern stack.",
      accent: siteConfig.branding.colors.primary,
    };
  }

  if (kind === "services-list") {
    return {
      title: "Services",
      description: "Modern website development services.",
      accent: siteConfig.branding.colors.secondary,
    };
  }

  if (kind === "blog") {
    const post = BLOG_BY_ID[slug[1] ?? ""];
    return {
      title: post?.title ?? siteConfig.name,
      description: post?.description ?? siteConfig.description,
      accent: siteConfig.branding.colors.primary,
    };
  }

  if (kind === "service") {
    const service = SERVICE_BY_SLUG[slug[1] ?? ""];
    return {
      title: service?.title ?? siteConfig.name,
      description: service?.description ?? siteConfig.description,
      accent: siteConfig.branding.colors.secondary,
    };
  }

  if (kind === "page") {
    const page = PAGE_BY_LOCALE_AND_SLUG[`${slug[0] ?? ""}/${slug[1] ?? ""}`];
    return {
      title: page?.title ?? siteConfig.name,
      description: page?.description ?? siteConfig.description,
      accent: siteConfig.branding.colors.accent,
    };
  }

  return {
    title: siteConfig.name,
    description: siteConfig.description,
    accent: siteConfig.branding.colors.primary,
  };
}

const [BLOG, SERVICES, PAGES] = (await Promise.all([
  getCollection("blog"),
  getCollection("services"),
  getCollection("pages"),
])) as [
  CollectionEntry<"blog">[],
  CollectionEntry<"services">[],
  CollectionEntry<"pages">[],
];

const BLOG_BY_ID: Record<string, { title: string; description: string }> =
  Object.fromEntries(
    BLOG.filter((entry: CollectionEntry<"blog">) => !entry.data.draft).map(
      (entry: CollectionEntry<"blog">) => [
        entry.id,
        { title: entry.data.title, description: entry.data.description },
      ],
    ),
  );

const SERVICE_BY_SLUG: Record<string, { title: string; description: string }> =
  Object.fromEntries(
    SERVICES.map((entry: CollectionEntry<"services">) => [
      entry.data.slug,
      { title: entry.data.title, description: entry.data.description },
    ]),
  );

const PAGE_BY_LOCALE_AND_SLUG: Record<
  string,
  { title: string; description: string }
> = Object.fromEntries(
  PAGES.map((entry: CollectionEntry<"pages">) => [
    `${entry.data.locale}/${entry.data.slug}`,
    { title: entry.data.title, description: entry.data.description },
  ]),
);

export async function getStaticPaths() {
  const paths: Array<{
    params: { slug: string };
    props: { kind: OgKind; locale: string; slug: string[] };
  }> = [];

  const listKinds: OgKind[] = ["home", "blog-list", "services-list"];
  for (const locale of siteConfig.i18n.locales) {
    for (const kind of listKinds) {
      paths.push({
        params: { slug: `${kind}/${locale}` },
        props: { kind, locale, slug: [] },
      });
    }
  }

  for (const entry of BLOG.filter(
    (blog: CollectionEntry<"blog">) => !blog.data.draft,
  )) {
    paths.push({
      params: { slug: `blog/${entry.data.locale}/${entry.id}` },
      props: {
        kind: "blog",
        locale: entry.data.locale,
        slug: [entry.data.locale, entry.id],
      },
    });
  }

  for (const entry of SERVICES) {
    paths.push({
      params: { slug: `service/${entry.data.locale}/${entry.data.slug}` },
      props: {
        kind: "service",
        locale: entry.data.locale,
        slug: [entry.data.locale, entry.data.slug],
      },
    });
  }

  for (const entry of PAGES) {
    paths.push({
      params: { slug: `page/${entry.data.locale}/${entry.data.slug}` },
      props: {
        kind: "page",
        locale: entry.data.locale,
        slug: [entry.data.locale, entry.data.slug],
      },
    });
  }

  return paths;
}

export async function GET({
  props,
}: {
  props: { kind: OgKind; locale: string; slug: string[] };
}) {
  const meta = resolveMeta(props.kind, props.locale, props.slug);
  return new Response(
    svgTemplate({
      kind: props.kind,
      title: meta.title,
      description: meta.description,
      accent: meta.accent,
    }),
    {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
  );
}
