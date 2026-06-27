/**
 * Image pipeline — R2-backed, preset-driven responsive images.
 *
 * Transformation presets define approved variants for public consumption.
 * Arbitrary transformation parameters are rejected (fail closed).
 *
 * Usage:
 *   import { presetUrl, type PresetName } from "../lib/images";
 *   <Img preset="hero" src="uploads/2026/06/photo.webp" alt="..." />
 */

export type PresetName = "hero" | "og" | "card" | "thumb" | "full";

export interface Preset {
  width: number;
  height: number;
  format: "webp" | "avif" | "jpeg";
  quality: number;
  /** Human-readable label for the preset (used in docs). */
  label: string;
}

/**
 * Approved transformation presets.
 * Only these named presets are accepted — no arbitrary parameters.
 */
export const PRESETS: Record<PresetName, Preset> = {
  hero: {
    width: 1920,
    height: 800,
    format: "webp",
    quality: 80,
    label: "Hero banner (1920×800)",
  },
  og: {
    width: 1200,
    height: 630,
    format: "webp",
    quality: 85,
    label: "Open Graph / social share (1200×630)",
  },
  card: {
    width: 600,
    height: 400,
    format: "webp",
    quality: 80,
    label: "Card / listing thumbnail (600×400)",
  },
  thumb: {
    width: 150,
    height: 150,
    format: "webp",
    quality: 70,
    label: "Thumbnail / avatar (150×150)",
  },
  full: {
    width: 0, // original width
    height: 0, // original height
    format: "webp",
    quality: 90,
    label: "Full resolution / no resize (original dimensions)",
  },
};

/**
 * All preset names as a typed array for runtime validation.
 */
export const PRESET_NAMES: PresetName[] = Object.keys(PRESETS) as PresetName[];

/**
 * Resolve a preset name to a transformed image URL.
 * Returns null for unknown presets (fail closed).
 *
 * URL pattern (Cloudflare Image Transformations):
 *   /cdn-cgi/image/width={w},height={h},format={fmt},quality={q}/{source}
 *
 * When using a custom asset domain, the pattern becomes:
 *   https://assets.example.com/cdn-cgi/image/.../uploads/...
 *
 * @param preset  Approved preset name
 * @param source  R2 object key (e.g. "uploads/2026/06/photo.webp")
 * @param baseUrl Asset domain base (from environment config)
 * @returns       Transformed URL or null if preset is unknown
 */
export function presetUrl(
  preset: PresetName,
  source: string,
  baseUrl: string = "/",
): string | null {
  const cfg = PRESETS[preset];
  if (!cfg) return null;

  const params = new URLSearchParams();
  if (cfg.width > 0) params.set("width", String(cfg.width));
  if (cfg.height > 0) params.set("height", String(cfg.height));
  params.set("format", cfg.format);
  params.set("quality", String(cfg.quality));

  const paramStr = params.toString();
  const sourcePath = source.startsWith("/") ? source : `/${source}`;

  return `${baseUrl.replace(/\/$/, "")}/cdn-cgi/image/${paramStr}${sourcePath}`;
}

/**
 * Generate a srcset string for responsive images.
 * Returns multiple preset URLs at different sizes.
 */
export function srcset(
  source: string,
  presets: PresetName[] = ["card", "hero"],
  baseUrl: string = "/",
): string {
  return presets
    .map((name) => {
      const url = presetUrl(name, source, baseUrl);
      if (!url) return null;
      const width = PRESETS[name].width;
      return width > 0 ? `${url} ${width}w` : url;
    })
    .filter(Boolean)
    .join(", ");
}

/**
 * Check if a given image URL is from an R2 source (not an external URL).
 */
export function isR2Url(url: string, assetDomain: string): boolean {
  try {
    const parsed = new URL(url, assetDomain);
    return parsed.hostname === new URL(assetDomain).hostname;
  } catch {
    return false;
  }
}
