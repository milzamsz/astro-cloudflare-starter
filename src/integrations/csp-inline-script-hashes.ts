/**
 * Astro integration: add CSP hashes for third-party inline scripts.
 *
 * Astro's `security.csp` hashes every script it processes, but not
 * `is:inline` scripts rendered by integrations — notably Starlight's theme,
 * search-shortcut and sidebar bootstraps on /docs pages. After the build this
 * hook hashes those inline scripts and appends the hashes to the page's
 * `script-src` in the CSP <meta> tag. It only touches pages under the given
 * path prefixes, so the rest of the site relies on Astro's native hashing.
 */
import type { AstroIntegration } from "astro";
import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g;
const CSP_META = /(<meta http-equiv="content-security-policy" content=")([^"]*)(")/;
const NON_EXECUTABLE = /type="(?:application\/(?:ld\+)?json|text\/template)"/;

const sha256 = (code: string) => `'sha256-${createHash("sha256").update(code).digest("base64")}'`;

async function htmlFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(path)));
    else if (entry.name.endsWith(".html")) out.push(path);
  }
  return out;
}

/** Return the HTML with any missing inline-script hashes added to `script-src`. */
export function addInlineScriptHashes(html: string): { html: string; added: number } {
  const meta = html.match(CSP_META);
  if (!meta) return { html, added: 0 };

  const policy = meta[2];
  const missing = new Set<string>();
  for (const [, attrs, code] of html.matchAll(INLINE_SCRIPT)) {
    if (!code.trim() || NON_EXECUTABLE.test(attrs)) continue;
    const hash = sha256(code);
    if (!policy.includes(hash)) missing.add(hash);
  }
  if (missing.size === 0) return { html, added: 0 };

  const extra = [...missing].join(" ");
  const updated = /(^|;\s*)script-src /.test(policy)
    ? policy.replace(/((?:^|;\s*)script-src [^;]*)/, `$1 ${extra}`)
    : `${policy};script-src 'self' ${extra}`;
  return { html: html.replace(CSP_META, `$1${updated}$3`), added: missing.size };
}

export default function cspInlineScriptHashes(options: { paths: string[] }): AstroIntegration {
  return {
    name: "csp-inline-script-hashes",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        let pages = 0;
        let hashes = 0;
        for (const file of await htmlFiles(root)) {
          const route = `/${relative(root, file).split(sep).join("/")}`;
          if (!options.paths.some((prefix) => route.startsWith(prefix))) continue;
          const { html, added } = addInlineScriptHashes(await readFile(file, "utf8"));
          if (added === 0) continue;
          await writeFile(file, html);
          pages += 1;
          hashes += added;
        }
        logger.info(`added ${hashes} inline-script hash(es) to ${pages} page(s)`);
      },
    },
  };
}
