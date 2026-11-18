import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { addInlineScriptHashes } from "../../integrations/csp-inline-script-hashes";

const hash = (code: string) => `'sha256-${createHash("sha256").update(code).digest("base64")}'`;
const page = (policy: string, body: string) =>
  `<html><head><meta http-equiv="content-security-policy" content="${policy}"></head><body>${body}</body></html>`;

describe("addInlineScriptHashes", () => {
  it("appends hashes of unhashed inline scripts to script-src", () => {
    const code = "console.log(1)";
    const { html, added } = addInlineScriptHashes(
      page("default-src 'self'; script-src 'self'", `<script>${code}</script>`),
    );
    expect(added).toBe(1);
    expect(html).toContain(`script-src 'self' ${hash(code)}`);
  });

  it("skips scripts that are already allowed, external, or JSON", () => {
    const code = "run()";
    const input = page(
      `script-src 'self' ${hash(code)}`,
      `<script>${code}</script><script src="/a.js"></script><script type="application/ld+json">{"a":1}</script>`,
    );
    expect(addInlineScriptHashes(input)).toEqual({ html: input, added: 0 });
  });

  it("leaves pages without a CSP meta tag untouched", () => {
    const input = "<html><body><script>x()</script></body></html>";
    expect(addInlineScriptHashes(input)).toEqual({ html: input, added: 0 });
  });
});
