import type { CollectionEntry } from "astro:content";
import { resolveRoute } from "../i18n/routes";
import type { Locale } from "./site-config";

export type BlogLinkEntry = CollectionEntry<"blog">;
export type ServiceLinkEntry = CollectionEntry<"services">;

export function resolvePostByUid(uid: string, posts: BlogLinkEntry[]) {
  return posts.find((post) => post.data.uid === uid || post.id === uid);
}

export function buildPostHref(post: BlogLinkEntry, locale: Locale) {
  return resolveRoute(locale, `/blog/${post.id}`);
}

export function buildServiceHref(service: ServiceLinkEntry, locale: Locale) {
  return resolveRoute(locale, `/services/${service.data.slug}`);
}
