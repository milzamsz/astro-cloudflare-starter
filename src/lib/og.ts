import sharp from "sharp";
import { siteConfig } from "../config/site.config";

export interface BuildOGOptions {
  title: string;
  description?: string;
  siteName: string;
  bgColor?: string;
  textColor?: string;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncate(value: string, limit = 120) {
  return value.length > limit
    ? `${value.slice(0, limit - 1).trimEnd()}…`
    : value;
}

export function buildOGSVG({
  title,
  description = siteConfig.description,
  siteName,
  bgColor = siteConfig.branding.colors.primary,
  textColor = "#ffffff",
}: BuildOGOptions) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgColor}" />
      <stop offset="100%" stop-color="${siteConfig.branding.colors.secondary}" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <circle cx="980" cy="120" r="180" fill="rgba(255,255,255,0.08)" />
  <circle cx="1120" cy="540" r="220" fill="rgba(255,255,255,0.06)" />
  <text x="80" y="92" fill="rgba(255,255,255,0.82)" font-size="28" font-family="Inter, Arial, sans-serif" font-weight="700">${escapeXml(siteName)}</text>
  <text x="80" y="270" fill="${textColor}" font-size="64" font-family="Inter, Arial, sans-serif" font-weight="800">${escapeXml(title)}</text>
  <text x="80" y="350" fill="rgba(255,255,255,0.9)" font-size="30" font-family="Inter, Arial, sans-serif" font-weight="500">${escapeXml(truncate(description, 120))}</text>
  <text x="80" y="560" fill="rgba(255,255,255,0.72)" font-size="22" font-family="Inter, Arial, sans-serif">${escapeXml(siteConfig.url.replace(/^https?:\/\//, ""))}</text>
</svg>`;
}

export async function renderOGImage(svg: string) {
  return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function buildOGResponse(svg: string) {
  const png = await renderOGImage(svg);
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
