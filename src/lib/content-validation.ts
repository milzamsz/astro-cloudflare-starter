import { readdir, readFile } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { siteConfig } from "../config/site.config";

interface EntryWithId {
  id: string;
  data?: { locale?: string; uid?: string; slug?: string };
}

export function validateNoDuplicateSlugs(entries: EntryWithId[]) {
  const seen = new Map<string, string>();
  for (const entry of entries) {
    const existing = seen.get(entry.id);
    if (existing) {
      console.warn(
        `[content-validation] Duplicate slug detected: "${entry.id}" (${existing} and another entry)`,
      );
      continue;
    }
    seen.set(entry.id, entry.id);
  }
}

export function validateNoDuplicateUids(
  entries: Array<{ id: string; data?: { uid?: string } }>,
) {
  const seen = new Map<string, string>();
  for (const entry of entries) {
    const uid = entry.data?.uid;
    if (!uid) continue;
    const existing = seen.get(uid);
    if (existing) {
      console.warn(
        `[content-validation] Duplicate uid detected: "${uid}" (${existing} and ${entry.id})`,
      );
      continue;
    }
    seen.set(uid, entry.id);
  }
}

export function validateLocaleConsistency(
  entries: Array<{ id: string; data?: { locale?: string } }>,
  supportedLocales: string[],
) {
  for (const entry of entries) {
    const locale = entry.data?.locale;
    if (locale && !supportedLocales.includes(locale)) {
      console.warn(
        `[content-validation] Unsupported locale "${locale}" on entry "${entry.id}"`,
      );
    }
  }
}

async function collectFiles(dir: string, extensions: string[]) {
  const results: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectFiles(path, extensions)));
      continue;
    }

    if (extensions.includes(extname(entry.name))) {
      results.push(path);
    }
  }

  return results;
}

function parseFrontmatter(source: string) {
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  return match[1].split(/\r?\n/).reduce<Record<string, string>>((acc, line) => {
    const pair = line.match(/^\s*([A-Za-z0-9_-]+):\s*(.*)\s*$/);
    if (!pair) return acc;
    acc[pair[1]] = pair[2].replace(/^["']|["']$/g, "");
    return acc;
  }, {});
}

export async function runContentValidation() {
  const base = fileURLToPath(new URL("../content/", import.meta.url));
  const blogFiles = await collectFiles(join(base, "blog"), [".md", ".mdx"]);
  const serviceFiles = await collectFiles(join(base, "services"), [
    ".md",
    ".mdx",
  ]);
  const pageFiles = await collectFiles(join(base, "pages"), [".md"]);
  const faqFiles = await collectFiles(join(base, "faqs"), [".json"]);
  const stackFiles = await collectFiles(join(base, "stack"), [".md", ".mdx"]);

  const parseEntries = async (files: string[]) =>
    Promise.all(
      files.map(async (file) => {
        const source = await readFile(file, "utf8");
        const data = parseFrontmatter(source);
        return {
          id: basename(file).replace(/\.[^/.]+$/, ""),
          data,
        };
      }),
    );

  const [blog, services, pages, faqs, stack] = await Promise.all([
    parseEntries(blogFiles),
    parseEntries(serviceFiles),
    parseEntries(pageFiles),
    parseEntries(faqFiles),
    parseEntries(stackFiles),
  ]);

  validateNoDuplicateSlugs(blog);
  validateNoDuplicateSlugs(services);
  validateNoDuplicateSlugs(pages);
  validateNoDuplicateSlugs(faqs);
  validateNoDuplicateSlugs(stack);

  validateNoDuplicateUids(blog);

  validateLocaleConsistency(blog, [...siteConfig.i18n.locales]);
  validateLocaleConsistency(services, [...siteConfig.i18n.locales]);
  validateLocaleConsistency(pages, [...siteConfig.i18n.locales]);
  validateLocaleConsistency(faqs, [...siteConfig.i18n.locales]);

  return {
    blog: blog.length,
    services: services.length,
    pages: pages.length,
    faqs: faqs.length,
    stack: stack.length,
  };
}
