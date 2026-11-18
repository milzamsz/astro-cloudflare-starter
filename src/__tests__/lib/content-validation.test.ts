import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import {
  findDuplicates,
  loadCollection,
  parseFrontmatter,
  validateCollection,
  type ContentEntry,
} from "../../lib/content-validation";

const CONTENT_DIR = fileURLToPath(new URL("../../content/", import.meta.url));
const COLLECTIONS = ["blog", "services", "pages", "faqs", "stack"];

describe("parseFrontmatter", () => {
  it("reads top-level scalar keys and strips quotes", () => {
    const source = '---\ntitle: "Hello"\nlocale: en\ntags:\n  - a\n---\nBody';
    expect(parseFrontmatter(source)).toEqual({ title: "Hello", locale: "en" });
  });

  it("returns an empty object without frontmatter", () => {
    expect(parseFrontmatter("# Just markdown")).toEqual({});
  });
});

describe("findDuplicates", () => {
  const entries: ContentEntry[] = [
    { id: "a", data: { uid: "x" } },
    { id: "b", data: { uid: "y" } },
    { id: "c", data: { uid: "x" } },
    { id: "d", data: {} },
  ];

  it("reports the second use of a key", () => {
    const issues = findDuplicates("blog", entries, (e) => e.data.uid as string | undefined, "uid");
    expect(issues).toEqual([{ collection: "blog", message: 'Duplicate uid "x" in "a" and "c"' }]);
  });
});

describe("validateCollection", () => {
  it("allows the same slug in different locales", () => {
    const entries: ContentEntry[] = [
      { id: "about", data: { slug: "about", locale: "en" } },
      { id: "id/about", data: { slug: "about", locale: "id" } },
    ];
    expect(validateCollection("pages", entries)).toEqual([]);
  });

  it("flags the same slug twice in one locale", () => {
    const entries: ContentEntry[] = [
      { id: "about", data: { slug: "about", locale: "en" } },
      { id: "about-2", data: { slug: "about", locale: "en" } },
    ];
    expect(validateCollection("pages", entries)).toHaveLength(1);
  });
});

describe("repository content", () => {
  it.each(COLLECTIONS)("%s has no duplicate ids, uids, slugs or translation keys", async (name) => {
    const entries = await loadCollection(`${CONTENT_DIR}${name}`);
    expect(entries.length).toBeGreaterThan(0);
    expect(validateCollection(name, entries)).toEqual([]);
  });
});
