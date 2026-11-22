#!/usr/bin/env node
/**
 * validate-docs.mjs — keeps /docs consistent with src/config/docs.config.ts:
 * every article has intro + type and lives in a configured group folder, every
 * group has an index.mdx, every tab lists known groups, and internal /docs links
 * resolve to an article or group page.
 * (Imports the TypeScript config directly; needs Node >= 22.18 type stripping.)
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const { docsConfig, docTypes } = await import("../src/config/docs.config.ts");
const { i18nConfig } = await import("../src/config/i18n.config.ts");

const groups = docsConfig.groups.map((g) => g.id);
const errors = [];

const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
      )
    : [];

// Content roots: default locale in docs/, others in <locale>/docs/.
const roots = i18nConfig.locales.map((code) => ({
  code,
  dir: join(ROOT, "src/content/docs", code === i18nConfig.defaultLocale ? "" : code, "docs"),
  prefix: code === i18nConfig.defaultLocale ? "" : `/${code}`,
}));

for (const tab of docsConfig.tabs) {
  for (const g of tab.groups) {
    if (!groups.includes(g)) errors.push(`tab "${tab.id}" lists unknown group "${g}"`);
  }
}

const urls = new Set();
const files = [];
for (const { dir, prefix } of roots) {
  for (const f of walk(dir).filter((p) => /\.mdx?$/.test(p))) {
    files.push({ f, dir });
    const rel = relative(dir, f).replace(/\.mdx?$/, "").replace(/\/index$/, "");
    urls.add(`${prefix}/docs/${rel}`);
  }
  urls.add(`${prefix}/docs`);
  for (const g of groups) urls.add(`${prefix}/docs/${g}`);
}
// Static pages under src/pages/**/docs (e.g. generated sections) count as valid link targets.
for (const f of walk(join(ROOT, "src/pages")).filter((p) => /\/docs\/.*\.astro$/.test(p) && !p.includes("["))) {
  const rel = relative(join(ROOT, "src/pages"), f).replace(/\.astro$/, "").replace(/\/?index$/, "");
  urls.add(`/${rel}`);
}

for (const { f, dir } of files) {
  const rel = relative(ROOT, f);
  const src = readFileSync(f, "utf8");
  const fm = src.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  const group = relative(dir, f).split("/")[0];
  if (!groups.includes(group)) errors.push(`${rel}: folder "${group}" is not a group in docs.config.ts`);
  if (!/^intro: .+/m.test(fm)) errors.push(`${rel}: missing intro`);
  const type = fm.match(/^type: (.+)$/m)?.[1];
  if (!type || !docTypes.includes(type)) errors.push(`${rel}: missing or invalid type`);
  for (const m of src.matchAll(/\]\((\/(?:[a-z]{2}\/)?docs[^)#\s]*)/g)) {
    const url = m[1].replace(/\/$/, "");
    if (!urls.has(url)) errors.push(`${rel}: broken link ${m[1]}`);
  }
}
for (const g of groups) {
  for (const { dir } of roots) {
    if (!existsSync(join(dir, g, "index.mdx")))
      errors.push(`group "${g}" has no index.mdx in ${relative(ROOT, dir)}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`docs OK: ${files.length} articles, ${groups.length} groups, ${docsConfig.tabs.length} tab(s)`);
