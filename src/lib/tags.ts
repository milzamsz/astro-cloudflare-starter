import { slugify } from "./utils";

type TagList = string[] | null | undefined;

/** A plain `{ tags }` object or a content-collection entry (`{ data: { tags } }`). */
export type Taggable = { tags?: TagList } | { data: { tags?: TagList } };

export function getTags(entry: Taggable): string[] {
  const tags = "data" in entry ? entry.data.tags : entry.tags;
  return tags ?? [];
}

export function countTags(entries: Taggable[]) {
  return entries.reduce<Record<string, number>>((counts, entry) => {
    for (const tag of getTags(entry)) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
    return counts;
  }, {});
}

export function sortTagsByCount(tagCounts: Record<string, number>) {
  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .toSorted((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function slugifyTag(tag: string) {
  return slugify(tag);
}

export function filterByTag<T extends Taggable>(
  entries: T[],
  tag: string,
) {
  return entries.filter((entry) =>
    getTags(entry).some(
      (entryTag) => slugifyTag(entryTag) === slugifyTag(tag),
    ),
  );
}
