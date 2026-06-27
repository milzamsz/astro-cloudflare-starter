import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatDateShort,
  slugify,
  truncate,
  capitalize,
  groupBy,
  calcReadingTime,
} from "../../lib/utils";

describe("formatDate", () => {
  it("formats an English long date", () => {
    expect(formatDate(new Date("2025-01-15"), "en")).toBe("January 15, 2025");
  });

  it("formats an Indonesian long date", () => {
    expect(formatDate(new Date("2025-01-15"), "id-ID")).toBe("15 Januari 2025");
  });
});

describe("formatDateShort", () => {
  it("formats a short English date", () => {
    expect(formatDateShort(new Date("2025-01-15"), "en")).toBe("Jan 15, 2025");
  });
});

describe("slugify", () => {
  it("slugifies a plain string", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
  });

  it("strips accents and punctuation", () => {
    expect(slugify("Apa kabar?")).toBe("apa-kabar");
  });

  it("normalizes diacritics", () => {
    expect(slugify("café résumé")).toBe("cafe-resume");
  });
});

describe("truncate", () => {
  it("truncates a long string", () => {
    expect(truncate("Hello World", 5)).toBe("Hello…");
  });

  it("leaves a short string untouched", () => {
    expect(truncate("Hi", 10)).toBe("Hi");
  });
});

describe("capitalize", () => {
  it("capitalizes the first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("handles empty strings", () => {
    expect(capitalize("")).toBe("");
  });
});

describe("groupBy", () => {
  it("groups items by a key", () => {
    const items = [{ a: 1 }, { a: 2 }, { a: 1 }];
    const grouped = groupBy(items, "a");
    expect(grouped["1"]).toHaveLength(2);
    expect(grouped["2"]).toHaveLength(1);
  });
});

describe("calcReadingTime", () => {
  it("counts words and estimates minutes", () => {
    const result = calcReadingTime("word ".repeat(200).trim());
    expect(result.words).toBe(200);
    expect(result.minutes).toBe(1);
  });

  it("returns at least one minute for short content", () => {
    const result = calcReadingTime("hello world");
    expect(result.minutes).toBe(1);
    expect(result.words).toBe(2);
  });
});
