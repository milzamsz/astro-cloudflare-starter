#!/usr/bin/env node
/**
 * guard-conventions.mjs — Cursor afterFileEdit hook (warn mode).
 *
 * Runs the KPI checker against the just-edited file and, if anything is
 * off-system (hardcoded colors, deprecated imports, inline styles, …), feeds
 * the findings back to the agent as additional context. Fails open: it never
 * blocks an edit, matching the repo's `warn` enforcement mode. Promote to a
 * blocking `preToolUse` hook once the codebase is consistently clean.
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { extname } from "node:path";

const SCAN_EXT = new Set([".astro", ".tsx", ".ts", ".jsx", ".js", ".css"]);

let input;
try {
  input = readFileSync(0, "utf8");
} catch {
  input = "";
}

let payload;
try {
  payload = JSON.parse(input || "{}");
} catch {
  payload = {};
}

const filePath =
  payload.file_path ||
  payload.filePath ||
  payload.path ||
  payload?.input?.file_path ||
  payload?.input?.path ||
  "";

function done(obj) {
  process.stdout.write(JSON.stringify(obj || {}));
  process.exit(0);
}

if (!filePath || !SCAN_EXT.has(extname(filePath))) done({});

const result = spawnSync(
  "node",
  ["scripts/check-kpis.mjs", filePath, "--quiet"],
  { encoding: "utf8" },
);

const out = `${result.stdout || ""}${result.stderr || ""}`.trim();

// Re-run without --quiet to surface warnings too when there is anything to say.
if (result.status !== 0) {
  const verbose = spawnSync("node", ["scripts/check-kpis.mjs", filePath], {
    encoding: "utf8",
  });
  done({
    additional_context: `Convention guard flagged off-system patterns in ${filePath}:\n${(verbose.stdout || out).trim()}\nFix these to keep the project on-system (semantic tokens, no hardcoded colors).`,
  });
}

done({});
