// Test stub for `astro:content` — only `getCollection` is exercised by lib code,
// and the blog.test.ts suite does not call it. Returning an empty array keeps
// module loading happy without pulling in the Astro runtime.
export async function getCollection(): Promise<unknown[]> {
  return [];
}
