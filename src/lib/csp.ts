import { createHash } from "node:crypto";

/**
 * A script that must stay inline (e.g. it has to run before first paint) plus
 * its CSP hash. Register the hash with `Astro.csp?.insertScriptHash(hash)` in a
 * layout's frontmatter (before <head> renders), then output the code with
 * `<script is:inline set:html={code} />` so the bytes match the hash exactly.
 */
export function inlineScript(code: string) {
  const hash = `sha256-${createHash("sha256").update(code).digest("base64")}` as const;
  return { code, hash };
}
