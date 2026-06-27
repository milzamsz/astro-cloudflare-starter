/**
 * Sections tier — the page-level building blocks (Components → Sections → Pages).
 *
 * This barrel is the single import surface for sections. Existing blocks live in
 * `hero/`, `landing/`, and `ui/marketing/`; new sections live alongside this file.
 * Import sections from here:
 *
 *   import { Hero, Pricing, FAQ } from "@/components/sections";
 */

// Existing blocks (re-exported in place; no file moves)
export { default as Hero } from "../hero/Hero.astro";
export { default as FeatureTabs } from "../landing/FeatureTabs";
export { default as StackMarquee } from "../landing/StackMarquee.astro";
export { default as TechStack } from "../landing/TechStack.astro";
export { default as Credibility } from "../landing/Credibility.astro";
export { default as LighthouseScores } from "../landing/LighthouseScores.astro";
export { default as CTA } from "../ui/marketing/CTA/CTA.astro";
export { default as SocialProof } from "../ui/marketing/SocialProof/SocialProof.astro";
export { default as FeatureGrid } from "../FeatureGrid.astro";
export { default as FAQ } from "../FAQ.astro";

// New sections (this tier)
export { default as Newsletter } from "./Newsletter.astro";
export { default as Pricing } from "./Pricing.astro";
export { default as Team } from "./Team.astro";
export { default as Comparison } from "./Comparison.astro";
export { default as LogoCloud } from "./LogoCloud.astro";
