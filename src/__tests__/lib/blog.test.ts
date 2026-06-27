import { describe, it, expect } from "vitest";
import { paginate } from "../../lib/blog";

describe("paginate", () => {
  const items = [1, 2, 3, 4, 5, 6, 7];

  it("returns the first page slice", () => {
    const result = paginate(items, 1, 3);
    expect(result.posts).toEqual([1, 2, 3]);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(3);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrev).toBe(false);
  });

  it("returns a middle page with prev + next", () => {
    const result = paginate(items, 2, 3);
    expect(result.posts).toEqual([4, 5, 6]);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrev).toBe(true);
  });

  it("returns the last page without next", () => {
    const result = paginate(items, 3, 3);
    expect(result.posts).toEqual([7]);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrev).toBe(true);
  });

  it("clamps a page below 1 to page 1", () => {
    const result = paginate(items, 0, 3);
    expect(result.currentPage).toBe(1);
  });

  it("handles an empty list", () => {
    const result = paginate([], 1, 3);
    expect(result.posts).toEqual([]);
    expect(result.totalPages).toBe(1);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrev).toBe(false);
  });
});
