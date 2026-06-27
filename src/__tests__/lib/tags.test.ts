import { describe, it, expect } from "vitest";
import {
  countTags,
  sortTagsByCount,
  slugifyTag,
  filterByTag,
} from "../../lib/tags";

const entries = [
  { tags: ["astro", "cloudflare"] },
  { tags: ["astro", "tailwind"] },
  { tags: ["astro"] },
  { tags: [] },
];

describe("countTags", () => {
  it("counts tag occurrences", () => {
    expect(countTags(entries)).toEqual({
      astro: 3,
      cloudflare: 1,
      tailwind: 1,
    });
  });

  it("handles empty input", () => {
    expect(countTags([])).toEqual({});
  });
});

describe("sortTagsByCount", () => {
  it("sorts by count desc then name asc", () => {
    const sorted = sortTagsByCount({ astro: 3, tailwind: 1, cloudflare: 1 });
    expect(sorted[0]).toEqual({ tag: "astro", count: 3 });
    expect(sorted[1].tag.localeCompare(sorted[2].tag)).toBeLessThanOrEqual(0);
  });
});

describe("slugifyTag", () => {
  it("slugifies a tag", () => {
    expect(slugifyTag("Web Development")).toBe("web-development");
  });
});

describe("filterByTag", () => {
  it("filters entries by tag slug", () => {
    const filtered = filterByTag(entries, "astro");
    expect(filtered).toHaveLength(3);
  });

  it("returns empty when no match", () => {
    expect(filterByTag(entries, "nonexistent")).toHaveLength(0);
  });
});
