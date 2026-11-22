/// <reference types="astro/client" />
/// <reference path="../node_modules/@astrojs/starlight/dist/global.d.ts" />

// Starlight ships no types for its virtual component modules; declare them for our overrides.
declare module "virtual:starlight/components/*" {
  const component: import("astro/runtime/server/index.js").AstroComponentFactory;
  export default component;
}
