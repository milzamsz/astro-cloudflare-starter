/**
 * Serialize data for an inline `<script type="application/ld+json">`.
 *
 * JSON.stringify leaves `<`, `>` and `&` as-is, so a value containing
 * `</script>` (e.g. a blog title) would close the script element and inject
 * HTML. Escaping them as < / > / & keeps the JSON identical once
 * parsed. U+2028/U+2029 are escaped for older JS parsers.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(new RegExp(String.fromCharCode(0x2028), "g"), "\\u2028")
    .replace(new RegExp(String.fromCharCode(0x2029), "g"), "\\u2029");
}
