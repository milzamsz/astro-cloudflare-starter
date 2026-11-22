/**
 * Fallback typing for `.astro` imports when type-checking `.ts` files with the
 * native TypeScript 7 compiler (`pnpm type-check:ts`). Astro's language tooling
 * (`astro check`, editors) resolves real component types and ignores this
 * wildcard, so it never weakens `.astro` type-checking.
 */
declare module "*.astro" {
  const Component: (props: Record<string, unknown>) => unknown;
  export default Component;
}
