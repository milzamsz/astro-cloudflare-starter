import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import { siteConfig } from "../config/site.config";
import { countTags, filterByTag, sortTagsByCount } from "./tags";
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

export async function getPostsByTag(tag: string, locale?: Locale) {
  const posts = await getAllPosts(locale);
  return filterByTag(posts, tag);
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

export async function getAllTags(locale?: Locale) {
  const posts = await getAllPosts(locale);
  return sortTagsByCount(countTags(posts)).slice(
    0,
    siteConfig.blog.tagCloudLimit,
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

export { calcReadingTime };
