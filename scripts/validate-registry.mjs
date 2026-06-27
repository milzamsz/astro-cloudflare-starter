#!/usr/bin/env node
/**
 * validate-registry.mjs — ensures src/registry.json stays in sync with the code:
 * every section/page path must exist and carry the required fields.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const registry = JSON.parse(
  readFileSync(join(ROOT, "src/registry.json"), "utf8"),
);

const errors = [];

function checkEntry(entry, kind, requiredFields) {
  for (const field of requiredFields) {
    if (entry[field] === undefined)
      errors.push(`${kind} "${entry.name ?? "?"}" missing field "${field}"`);
  }
  if (entry.path && !existsSync(join(ROOT, entry.path))) {
    errors.push(`${kind} "${entry.name}" path not found: ${entry.path}`);
  }
}

for (const section of registry.sections ?? [])
  checkEntry(section, "section", ["name", "tier", "path", "props"]);
for (const page of registry.pages ?? [])
  checkEntry(page, "page", ["name", "path"]);

if (errors.length) {
  console.log(`\u2716 registry.json invalid:\n  ${errors.join("\n  ")}`);
  process.exit(1);
}

console.log(
  `\u2713 registry.json valid \u2014 ${registry.sections.length} sections, ${registry.pages.length} pages.`,
);
