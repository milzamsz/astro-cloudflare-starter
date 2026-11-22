export const heroVariantClasses = {
  centered: "hero hero--centered",
  split: "hero hero--split",
  minimal: "hero hero--minimal",
} as const;

export type HeroVariant = keyof typeof heroVariantClasses;
