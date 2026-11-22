/**
 * Content-Security-Policy sources (used by `security.csp` in astro.config.ts).
 *
 * Third-party origins are only allowed when the matching feature is configured,
 * so a site without analytics ships the tightest policy. Header-only directives
 * (`frame-ancestors`, …) can't be set from a <meta> tag and live in public/_headers.
 */
import { readFileSync } from "node:fs";

const env = (name: string) => process.env[name]?.trim() || undefined;

/** Origin of the optional Umami script from src/content/settings.yml. */
function umamiOrigin(): string | undefined {
  try {
    const settings = readFileSync(new URL("../content/settings.yml", import.meta.url), "utf8");
    const url = settings.match(/^umamiUrl:\s*["']?([^"'\s]+)["']?\s*$/m)?.[1];
    return url ? new URL(url).origin : undefined;
  } catch {
    return undefined;
  }
}

const googleTag = Boolean(env("PUBLIC_GA_MEASUREMENT_ID") || env("PUBLIC_GTM_ID"));
const umami = umamiOrigin();

const scriptHosts = [
  googleTag && "https://www.googletagmanager.com",
  umami,
].filter((value): value is string => Boolean(value));

const connectHosts = [
  googleTag && "https://*.google-analytics.com",
  googleTag && "https://*.analytics.google.com",
  googleTag && "https://www.googletagmanager.com",
  umami,
].filter((value): value is string => Boolean(value));

export const cspSources = {
  scriptSources: [
    "'self'",
    // Pagefind search runs its index as WebAssembly.
    "'wasm-unsafe-eval'",
    ...scriptHosts,
  ],
  directives: [
    "default-src 'self'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    `connect-src ${["'self'", ...connectHosts].join(" ")}`,
    // Contact page: click-to-load Google Maps embed.
    "frame-src https://www.google.com https://maps.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ] as const,
};
