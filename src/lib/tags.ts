import { slugify } from "./utils";

export function countTags(entries: Array<{ tags?: string[] | null }>) {
  return entries.reduce<Record<string, number>>((counts, entry) => {
    for (const tag of entry.tags ?? []) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
    return counts;
  }, {});
}

export function sortTagsByCount(tagCounts: Record<string, number>) {
  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function slugifyTag(tag: string) {
  return slugify(tag);
}

export function filterByTag<T extends { tags?: string[] | null }>(
  entries: T[],
  tag: string,
) {
  return entries.filter((entry) =>
    (entry.tags ?? []).some(
      (entryTag) => slugifyTag(entryTag) === slugifyTag(tag),
    ),
  );
}
