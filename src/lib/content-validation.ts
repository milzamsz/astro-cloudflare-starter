/**
 * Cross-entry content checks that a per-entry Zod schema can't express.
 *
 * Per-field rules (required fields, `locale` ∈ configured locales, uid format)
 * live in src/content.config.ts and fail the build. This module adds the
 * uniqueness rules across entries and is run by
 * src/__tests__/lib/content-validation.test.ts, so a duplicate fails CI.
 */
import { readdir, readFile } from "node:fs/promises";
import { basename, extname, join, relative } from "node:path";

export interface ContentEntry {
  /** Collection-relative id, e.g. "getting-started" */
  id: string;
  data: Record<string, unknown>;
}

export interface ContentIssue {
  collection: string;
  message: string;
}

type KeyFn = (entry: ContentEntry) => string | undefined;

const str = (value: unknown) => (typeof value === "string" && value ? value : undefined);

/** Report every entry whose key was already used by an earlier entry. */
export function findDuplicates(
  collection: string,
  entries: ContentEntry[],
  key: KeyFn,
  label: string,
): ContentIssue[] {
  const seen = new Map<string, string>();
  const issues: ContentIssue[] = [];
  for (const entry of entries) {
    const value = key(entry);
    if (value === undefined) continue;
    const first = seen.get(value);
    if (first) {
      issues.push({
        collection,
        message: `Duplicate ${label} "${value}" in "${first}" and "${entry.id}"`,
      });
    } else {
      seen.set(value, entry.id);
    }
  }
  return issues;
}

/** All uniqueness rules for one collection. */
export function validateCollection(collection: string, entries: ContentEntry[]): ContentIssue[] {
  const locale = (entry: ContentEntry) => str(entry.data.locale) ?? "";
  const scoped = (field: string): KeyFn => (entry) => {
    const value = str(entry.data[field]);
    return value && `${locale(entry)}:${value}`;
  };

  return [
    ...findDuplicates(collection, entries, (entry) => entry.id, "id"),
    ...findDuplicates(collection, entries, (entry) => str(entry.data.uid), "uid"),
    ...findDuplicates(collection, entries, scoped("slug"), "slug (per locale)"),
    ...findDuplicates(collection, entries, scoped("translationKey"), "translationKey (per locale)"),
  ];
}

/**
 * Minimal frontmatter reader for top-level scalar keys (`key: value`).
 * Enough for the identifiers checked here; full parsing is Astro's job.
 */
export function parseFrontmatter(source: string): Record<string, string> {
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*?)\s*$/);
    if (pair && pair[2]) data[pair[1]] = pair[2].replace(/^["']|["']$/g, "");
  }
  return data;
}

async function collectFiles(dir: string, extensions: string[]): Promise<string[]> {
  const results: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) results.push(...(await collectFiles(path, extensions)));
    else if (extensions.includes(extname(entry.name))) results.push(path);
  }
  return results;
}

/** Load the entries of a file-based collection directory from disk. */
export async function loadCollection(dir: string): Promise<ContentEntry[]> {
  const files = await collectFiles(dir, [".md", ".mdx", ".json"]);
  return Promise.all(
    files.map(async (file) => {
      const source = await readFile(file, "utf8");
      const data = extname(file) === ".json" ? JSON.parse(source) : parseFrontmatter(source);
      const id = relative(dir, file).replace(basename(file), basename(file, extname(file)));
      return { id, data };
    }),
  );
}
