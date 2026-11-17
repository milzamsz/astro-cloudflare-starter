import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import { siteConfig } from "../config/site.config";
import { resolveRoute } from "../i18n/routes";
import { countTags, slugifyTag, sortTagsByCount } from "./tags";
import { calcReadingTime, slugify } from "./utils";
import type { Locale } from "./site-config";

export type BlogPost = CollectionEntry<"blog">;

function isDraft(post: BlogPost) {
  return Boolean(post.data.draft);
}

function shouldIncludeDrafts() {
  return !import.meta.env.PROD;
}

function sortPosts(posts: BlogPost[]) {
  return [...posts].sort(
    (a, b) =>
      new Date(b.data.publishDate).getTime() -
      new Date(a.data.publishDate).getTime(),
  );
}

export async function getAllPosts(locale?: Locale) {
  const posts = await getCollection("blog");
  return sortPosts(
    posts.filter(
      (post: BlogPost) =>
        (locale ? post.data.locale === locale : true) &&
        (shouldIncludeDrafts() || !isDraft(post)),
    ),
  );
}

export async function getFeaturedPosts(limit = 3, locale?: Locale) {
  const posts = await getAllPosts(locale);
  return posts.filter((post) => post.data.featured).slice(0, limit);
}

/** Posts whose tags match `tag` (compared by slug, so "Cloud Flare" ≡ "cloud-flare"). */
export async function getPostsByTag(tag: string, locale?: Locale) {
  const posts = await getAllPosts(locale);
  const target = slugifyTag(tag);
  return posts.filter((post) =>
    (post.data.tags ?? []).some(
      (postTag: string) => slugifyTag(postTag) === target,
    ),
  );
}

export async function getRelatedPosts(
  currentId: string,
  tags: string[],
  limit = 3,
  locale?: Locale,
) {
  const posts = await getAllPosts(locale);
  const normalizedTags = new Set(tags.map((tag) => slugify(tag)));

  return posts
    .filter((post) => post.id !== currentId)
    .map((post) => {
      const postTags = new Set(
        (post.data.tags ?? []).map((tag: string) => slugify(tag)),
      );
      const shared = [...normalizedTags].filter((tag) =>
        postTags.has(tag),
      ).length;
      return { post, shared };
    })
    .filter(({ shared }) => shared > 0)
    .sort(
      (a, b) =>
        b.shared - a.shared ||
        new Date(b.post.data.publishDate).getTime() -
          new Date(a.post.data.publishDate).getTime(),
    )
    .slice(0, limit)
    .map(({ post }) => post);
}

/** Every tag used by a (non-draft) post, most-used first. Not capped: each one gets a route. */
export async function getAllTags(locale?: Locale) {
  const posts = await getAllPosts(locale);
  return sortTagsByCount(
    countTags(posts.map((post) => ({ tags: post.data.tags }))),
  );
}

export async function getTopTags(
  limit = siteConfig.blog.tagCloudLimit,
  locale?: Locale,
) {
  return (await getAllTags(locale)).slice(0, limit);
}

export async function getPostsByLocale(locale: Locale) {
  return getAllPosts(locale);
}

export async function getPostBySlug(slug: string) {
  const posts = await getAllPosts();
  return posts.find((post) => post.id === slug);
}

export async function getPostByUid(uid: string) {
  const posts = await getAllPosts();
  return posts.find((post) => post.data.uid === uid || post.id === uid);
}

export function paginate<T>(posts: T[], page: number, perPage: number) {
  const currentPage = Math.max(1, page);
  const totalPages = Math.max(1, Math.ceil(posts.length / perPage));
  const start = (currentPage - 1) * perPage;
  const pagedPosts = posts.slice(start, start + perPage);

  return {
    posts: pagedPosts,
    currentPage,
    totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
}

/**
 * Split a listing into the featured post (shown on page 1 only) and the rest,
 * which is what the grid paginates over.
 */
export function splitFeatured(posts: BlogPost[]) {
  const featured = posts.find((post) => post.data.featured) ?? posts[0];
  const rest = featured ? posts.filter((post) => post.id !== featured.id) : [];
  return { featured, rest };
}

/**
 * Everything a blog listing route needs: the (optionally tag-filtered) posts,
 * split into featured + paginated rest, plus the alphabetical tag bar.
 */
export async function getBlogListing(locale: Locale, tag?: string) {
  const posts = tag
    ? await getPostsByTag(tag, locale)
    : await getAllPosts(locale);
  const { featured, rest } = splitFeatured(posts);
  const tags = (await getAllTags(locale))
    .map(({ tag: label }) => label)
    .sort((a, b) => a.localeCompare(b));
  return { posts, featured, rest, tags };
}

/** One entry per distinct tag slug, for tag-route getStaticPaths. */
export async function getTagSlugs(locale: Locale) {
  const bySlug = new Map<string, string>();
  for (const { tag } of await getAllTags(locale)) {
    const slug = slugifyTag(tag);
    if (slug && !bySlug.has(slug)) bySlug.set(slug, tag);
  }
  return [...bySlug].map(([slug, label]) => ({ slug, label }));
}

/**
 * Static URL of a blog listing page.
 *   blogListPath("en")                          → "/blog"
 *   blogListPath("en", { page: 2 })             → "/blog/page/2"
 *   blogListPath("en", { tag: "Astro" })        → "/blog/tag/astro"
 *   blogListPath("en", { tag: "astro", page: 3 }) → "/blog/tag/astro/page/3"
 */
export function blogListPath(
  locale: Locale,
  { tag, page = 1 }: { tag?: string; page?: number } = {},
) {
  const base = tag ? `/blog/tag/${slugifyTag(tag)}` : "/blog";
  return resolveRoute(locale, page > 1 ? `${base}/page/${page}` : base);
}

export { calcReadingTime };
