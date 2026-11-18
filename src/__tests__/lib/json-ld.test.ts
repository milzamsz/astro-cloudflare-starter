import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "../../lib/json-ld";

describe("serializeJsonLd", () => {
  it("cannot close the surrounding script element", () => {
    const out = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(out).not.toContain("</script");
    expect(out).not.toContain("<");
  });

  it("round-trips to the same data", () => {
    const data = { name: "A & B <c> \u2028 d", n: 1 };
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });
});
