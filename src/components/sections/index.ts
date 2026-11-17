/**
 * Sections tier — the page-level building blocks (Components → Sections → Pages).
 *
 * This barrel is the single import surface for sections. Sections live in this
 * folder; the landing-page blocks in `landing/` are re-exported here too.
 *
 *   import { Hero, Pricing, FAQ } from "@/components/sections";
 */

export { default as Hero } from "./Hero.astro";
export * from "./hero.variants";
export { default as CTA } from "./CTA.astro";
export { default as FAQ } from "./FAQ.astro";
export { default as FeatureGrid } from "./FeatureGrid.astro";
export { default as FeatureTabs } from "../landing/FeatureTabs.astro";
export { default as StackMarquee } from "../landing/StackMarquee.astro";
export { default as TechStack } from "../landing/TechStack.astro";
export { default as Credibility } from "../landing/Credibility.astro";
export { default as LighthouseScores } from "../landing/LighthouseScores.astro";
export { default as SocialProof } from "../ui/marketing/SocialProof/SocialProof.astro";

export { default as Newsletter } from "./Newsletter.astro";
export { default as Pricing } from "./Pricing.astro";
export { default as Team } from "./Team.astro";
export { default as Comparison } from "./Comparison.astro";
export { default as LogoCloud } from "./LogoCloud.astro";
