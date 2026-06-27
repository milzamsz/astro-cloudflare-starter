#!/usr/bin/env node
/**
 * check-kpis.mjs — single source of truth for design/quality conventions.
 *
 * AstroDeck-style guardrail: one command verifies the project stays "on system".
 * Errors fail the process (CI-friendly, exit 1); warnings are advisory (exit 0).
 *
 * Usage:
 *   node scripts/check-kpis.mjs            # scan the whole src tree
 *   node scripts/check-kpis.mjs <files...> # scan specific files (used by the hook)
 *   node scripts/check-kpis.mjs --quiet    # only print the summary
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(ROOT, "src");

const args = process.argv.slice(2);
const QUIET = args.includes("--quiet");
const fileArgs = args.filter((a) => !a.startsWith("--"));

const SCAN_EXT = new Set([".astro", ".tsx", ".ts", ".jsx", ".js", ".css"]);

// Files allowed to contain otherwise-flagged patterns (config, generators, SVG).
const ALLOWLIST = [
  "src/config/site.config.ts", // brand color hex source-of-truth
  "src/lib/og.ts", // OG image SVG generation needs literal colors
  "src/pages/og/", // OG endpoints render literal SVG
  "src/styles/tokens/", // token definitions
];

const TAILWIND_PALETTE =
  "(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)";
// e.g. bg-blue-500, text-red-600, hover:border-emerald-400/50
const HARDCODED_TW_COLOR = new RegExp(
  `(?:^|[\\s"'\`:({\\[])(?:bg|text|border|ring|from|via|to|fill|stroke|divide|outline|decoration|shadow|accent|caret|ring-offset)-${TAILWIND_PALETTE}-(?:50|100|200|300|400|500|600|700|800|900|950)\\b`,
);
const DEPRECATED_IMPORTS = [
  { pattern: /ViewTransitions/, label: "ViewTransitions (use ClientRouter)" },
  {
    pattern: /from\s+["']astro\/components\/ViewTransitions/,
    label: "astro ViewTransitions import (deprecated)",
  },
];

const errors = [];
const warnings = [];

function isAllowlisted(relPath) {
  const norm = relPath.split("\\").join("/");
  return ALLOWLIST.some((entry) => norm.startsWith(entry) || norm === entry);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === "dist" || name === ".astro")
        continue;
      walk(full, out);
    } else if (SCAN_EXT.has(extname(name))) {
      out.push(full);
    }
  }
  return out;
}

function getStyleBlocks(content) {
  const blocks = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(content))) blocks.push(m[1]);
  return blocks;
}

function lineOf(content, index) {
  return content.slice(0, index).split("\n").length;
}

function checkFile(full) {
  const relPath = relative(ROOT, full).split("\\").join("/");
  const ext = extname(full);
  const content = readFileSync(full, "utf8");
  const allowed = isAllowlisted(relPath);

  // 1. Hardcoded Tailwind palette utilities (ERROR) — off the token system.
  if (!allowed && (ext === ".astro" || ext === ".tsx" || ext === ".jsx")) {
    content.split("\n").forEach((line, i) => {
      if (HARDCODED_TW_COLOR.test(line)) {
        errors.push({
          rel: relPath,
          line: i + 1,
          msg: `hardcoded Tailwind color utility — use semantic tokens (text-foreground, bg-primary, …)`,
        });
      }
    });
  }

  // 2. Deprecated imports (ERROR).
  for (const { pattern, label } of DEPRECATED_IMPORTS) {
    const idx = content.search(pattern);
    if (idx !== -1 && !allowed) {
      errors.push({
        rel: relPath,
        line: lineOf(content, idx),
        msg: `deprecated: ${label}`,
      });
    }
  }

  // 3. Non-token hex colors inside <style> blocks (WARN) — prefer var(--token).
  if (!allowed && ext === ".astro") {
    for (const block of getStyleBlocks(content)) {
      const hexRe = /#[0-9a-fA-F]{3,8}\b/g;
      let m;
      while ((m = hexRe.exec(block))) {
        // ignore hex used only as a var() fallback: var(--x, #fff)
        const before = block.slice(Math.max(0, m.index - 40), m.index);
        if (/var\([^)]*,\s*$/.test(before)) continue;
        warnings.push({
          rel: relPath,
          line: 0,
          msg: `hex color "${m[0]}" in <style> — prefer a design token (var(--…))`,
        });
      }
    }
  }

  // 4. Inline style= attributes (WARN).
  if (!allowed && (ext === ".astro" || ext === ".tsx")) {
    const re = /\sstyle=("|'|\{)/g;
    let m;
    while ((m = re.exec(content))) {
      warnings.push({
        rel: relPath,
        line: lineOf(content, m.index),
        msg: `inline style= attribute — move to <style> with tokens`,
      });
    }
  }

  // 5. Images without alt (WARN).
  if (ext === ".astro") {
    const re = /<(?:img|Image|Picture)\b[^>]*>/g;
    let m;
    while ((m = re.exec(content))) {
      if (!/\balt\s*=/.test(m[0])) {
        warnings.push({
          rel: relPath,
          line: lineOf(content, m.index),
          msg: `<${m[0].match(/<(\w+)/)[1]}> missing alt attribute`,
        });
      }
    }
  }
}

// 6. Tailwind v4: no tailwind.config.* file should exist (ERROR).
for (const cfg of [
  "tailwind.config.js",
  "tailwind.config.cjs",
  "tailwind.config.mjs",
  "tailwind.config.ts",
]) {
  if (existsSync(join(ROOT, cfg))) {
    errors.push({
      rel: cfg,
      line: 0,
      msg: `Tailwind v4 uses the @theme block in global.css — remove ${cfg}`,
    });
  }
}

const targets =
  fileArgs.length > 0
    ? fileArgs
        .map((f) => (f.startsWith(ROOT) ? f : join(ROOT, f)))
        .filter((f) => existsSync(f) && SCAN_EXT.has(extname(f)))
    : walk(SRC);

for (const file of targets) checkFile(file);

function group(list) {
  const byFile = new Map();
  for (const item of list) {
    if (!byFile.has(item.rel)) byFile.set(item.rel, []);
    byFile.get(item.rel).push(item);
  }
  return byFile;
}

if (!QUIET && warnings.length) {
  console.log(`\n⚠  ${warnings.length} warning(s):`);
  for (const [file, items] of group(warnings)) {
    console.log(`  ${file}`);
    for (const it of items)
      console.log(`    ${it.line ? `:${it.line} ` : ""}${it.msg}`);
  }
}

if (errors.length) {
  console.log(`\n✖ ${errors.length} error(s):`);
  for (const [file, items] of group(errors)) {
    console.log(`  ${file}`);
    for (const it of items)
      console.log(`    ${it.line ? `:${it.line} ` : ""}${it.msg}`);
  }
  console.log(
    `\ncheck:kpis failed — ${errors.length} error(s), ${warnings.length} warning(s).`,
  );
  process.exit(1);
}

console.log(
  `\n✓ check:kpis passed — 0 errors, ${warnings.length} warning(s) across ${targets.length} file(s).`,
);
