import { siteConfig } from "../config/site.config";

export async function GET() {
  const lines = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    `Sitemap: ${siteConfig.url}/sitemap-index.xml`,
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
