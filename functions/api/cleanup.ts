/**
 * R2 media cleanup — Cloudflare Pages Function at POST /api/cleanup.
 *
 * Compares the objects in the R2_MEDIA bucket with the media manifest that the
 * build writes to /media-manifest.json (scripts/generate-media-manifest.cjs).
 * Objects not referenced by content, outside protected prefixes and older than
 * the grace period are eligible.
 *
 * Pages Functions have no cron trigger. Invoke this endpoint on demand, or use
 * the opt-in scheduled GitHub Action (.github/workflows/cleanup.yml).
 *
 * Modes (CLEANUP_MODE):
 *   dry-run (default) — report only, no changes
 *   quarantine        — move eligible objects to quarantine/YYYY-MM-DD/
 *   delete            — permanently remove eligible objects
 *
 * Auth: `Authorization: Bearer <CLEANUP_SECRET>` (set as an encrypted secret,
 * at least 32 characters — e.g. `openssl rand -hex 32`; shorter secrets are
 * rejected because the endpoint isn't rate limited).
 * Safety: the run aborts if the manifest can't be loaded, so an empty or
 * missing manifest never makes every object eligible.
 */

interface CleanupEnv {
  R2_MEDIA: R2Bucket;
  /** Static assets of this Pages deployment (built-in binding). */
  ASSETS: Fetcher;
  CLEANUP_MODE?: string;
  CLEANUP_GRACE_DAYS?: string;
  CLEANUP_SECRET?: string;
}

type Mode = "dry-run" | "quarantine" | "delete";

const MANIFEST_PATH = "/media-manifest.json";
/** The endpoint has no rate limiting, so require a secret that can't be guessed. */
const MIN_SECRET_LENGTH = 32;
const PROTECTED_PREFIXES = ["og/", "logos/", "favicon/", "uploads/", "quarantine/", "reports/"];

interface CleanupReport {
  timestamp: string;
  mode: Mode;
  graceDays: number;
  manifestEntries: number;
  objectsScanned: number;
  objectsEligible: number;
  objectsQuarantined: number;
  objectsDeleted: number;
  protectedPrefixes: string[];
  errors: string[];
  eligibleObjects: Array<{ key: string; size: number; lastModified: string }>;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

/** Constant-time comparison of the bearer token and the configured secret. */
function isAuthorized(request: Request, secret: string | undefined): boolean {
  if (!secret || secret.length < MIN_SECRET_LENGTH) return false;
  const provided = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const encoder = new TextEncoder();
  const a = encoder.encode(provided);
  const b = encoder.encode(secret);
  if (a.byteLength !== b.byteLength) return false;
  return crypto.subtle.timingSafeEqual(a, b);
}

function parseMode(value: string | undefined): Mode {
  return value === "quarantine" || value === "delete" ? value : "dry-run";
}

async function loadManifest(env: CleanupEnv, request: Request): Promise<Set<string>> {
  const response = await env.ASSETS.fetch(new URL(MANIFEST_PATH, request.url));
  if (!response.ok) throw new Error(`manifest request failed (${response.status})`);
  const entries: unknown = await response.json();
  if (!Array.isArray(entries)) throw new Error("manifest is not an array");
  return new Set(entries.filter((entry): entry is string => typeof entry === "string"));
}

export const onRequestPost: PagesFunction<CleanupEnv> = async ({ env, request }) => {
  // This endpoint can quarantine/delete R2 objects, so it must never be public.
  if (!isAuthorized(request, env.CLEANUP_SECRET)) {
    return json({ error: "Unauthorized" }, 401);
  }

  const mode = parseMode(env.CLEANUP_MODE);
  const graceDays = Math.max(0, Number.parseInt(env.CLEANUP_GRACE_DAYS || "30", 10) || 30);
  const now = new Date();
  const cutoff = new Date(now.getTime() - graceDays * 24 * 60 * 60 * 1000);
  const datePrefix = now.toISOString().slice(0, 10);

  const report: CleanupReport = {
    timestamp: now.toISOString(),
    mode,
    graceDays,
    manifestEntries: 0,
    objectsScanned: 0,
    objectsEligible: 0,
    objectsQuarantined: 0,
    objectsDeleted: 0,
    protectedPrefixes: PROTECTED_PREFIXES,
    errors: [],
    eligibleObjects: [],
  };

  let manifest: Set<string>;
  try {
    manifest = await loadManifest(env, request);
    report.manifestEntries = manifest.size;
  } catch (err) {
    report.errors.push(`Could not load ${MANIFEST_PATH}: ${err}. Aborting — nothing was changed.`);
    return json(report, 503);
  }

  try {
    let cursor: string | undefined;
    let truncated = true;

    while (truncated) {
      const listing = await env.R2_MEDIA.list({ cursor, limit: 1000 });
      truncated = listing.truncated;
      cursor = listing.truncated ? listing.cursor : undefined;

      for (const object of listing.objects) {
        report.objectsScanned++;

        if (PROTECTED_PREFIXES.some((prefix) => object.key.startsWith(prefix))) continue;
        if (manifest.has(object.key)) continue;
        if (object.uploaded > cutoff) continue;

        report.objectsEligible++;
        report.eligibleObjects.push({
          key: object.key,
          size: object.size,
          lastModified: object.uploaded.toISOString(),
        });

        try {
          if (mode === "quarantine") {
            const original = await env.R2_MEDIA.get(object.key);
            if (!original) continue;
            await env.R2_MEDIA.put(`quarantine/${datePrefix}/${object.key}`, original.body, {
              httpMetadata: original.httpMetadata,
              customMetadata: {
                ...original.customMetadata,
                quarantinedAt: now.toISOString(),
                originalKey: object.key,
              },
            });
            await env.R2_MEDIA.delete(object.key);
            report.objectsQuarantined++;
          } else if (mode === "delete") {
            await env.R2_MEDIA.delete(object.key);
            report.objectsDeleted++;
          }
        } catch (err) {
          report.errors.push(`Failed to ${mode} ${object.key}: ${err}`);
        }
      }
    }

    await env.R2_MEDIA.put(`reports/cleanup-${datePrefix}.json`, JSON.stringify(report, null, 2), {
      httpMetadata: { contentType: "application/json" },
    });
    return json(report);
  } catch (err) {
    report.errors.push(`Unexpected error: ${err}`);
    return json(report, 500);
  }
};

/** Any other method: tell callers to POST (and never run the cleanup). */
export const onRequest: PagesFunction<CleanupEnv> = async () =>
  new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
