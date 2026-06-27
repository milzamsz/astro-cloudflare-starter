import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "astro:content": new URL("./src/__tests__/__stubs__/astro-content.ts", import.meta.url).pathname,
    },
  },
  test: {
    include: ["src/__tests__/**/*.test.ts"],
    environment: "node",
  },
});
