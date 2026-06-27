import rss from "@astrojs/rss";
import { getCollection, type CollectionEntry } from "astro:content";
import { siteConfig } from "../config/site.config";

export async function GET() {
  const posts: CollectionEntry<"blog">[] = await getCollection("blog");
  const publishedPosts = posts
    .filter(
      (post: CollectionEntry<"blog">) =>
        post.data.locale === siteConfig.i18n.defaultLocale && !post.data.draft,
    )
    .sort(
      (a: CollectionEntry<"blog">, b: CollectionEntry<"blog">) =>
        new Date(b.data.publishDate).getTime() -
        new Date(a.data.publishDate).getTime(),
    );

  return rss({
    title: siteConfig.name,
    description: siteConfig.description,
    site: siteConfig.url,
    items: publishedPosts.map((post: CollectionEntry<"blog">) => ({
      title: post.data.title,
      description: post.data.description,
      link: `/blog/${post.id}`,
      pubDate: post.data.publishDate,
      categories: post.data.tags ?? [],
      author: post.data.author,
      customData: post.data.featured ? "<featured>true</featured>" : "",
    })),
    customData: `<language>${siteConfig.i18n.defaultLocale}</language>`,
  });
}
