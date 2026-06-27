/**
 * Media cleanup worker — Cloudflare cron-triggered Pages Function.
 *
 * Compares R2 bucket objects against a media manifest. Objects not in the
 * manifest and outside protected prefixes are eligible for cleanup.
 *
 * Modes (via CLEANUP_MODE env var):
 *   dry-run (default) — report only, no changes
 *   quarantine — move eligible objects to quarantine/YYYY-MM-DD/ prefix
 *   delete — permanently remove eligible objects
 *
 * Protected prefixes (never touched):
 *   og/, logos/, favicon/, uploads/
 *
 * Grace period: CLEANUP_GRACE_DAYS env var (default 30).
 * Objects created within the grace period are protected.
 */

export interface Env {
  R2_MEDIA: R2Bucket;
  CLEANUP_MODE?: string;     // "dry-run" | "quarantine" | "delete"
  CLEANUP_GRACE_DAYS?: string; // default "30"
  CLEANUP_SECRET?: string;   // shared secret required to invoke this endpoint
}

const PROTECTED_PREFIXES = ["og/", "logos/", "favicon/", "uploads/"];

interface CleanupReport {
  timestamp: string;
  mode: string;
  graceDays: number;
  objectsScanned: number;
  objectsEligible: number;
  objectsQuarantined: number;
  objectsDeleted: number;
  protectedPrefixes: string[];
  errors: string[];
  eligibleObjects: Array<{ key: string; size: number; lastModified: string }>;
}

export async function onRequest(context: { env: Env; request: Request }): Promise<Response> {
  const { env, request } = context;

  // This endpoint can quarantine/delete R2 objects, so it must never be public.
  // Require a bearer token matching CLEANUP_SECRET (set as a Cloudflare secret).
  const expected = env.CLEANUP_SECRET;
  const provided = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected || provided !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const mode = env.CLEANUP_MODE || "dry-run";
  const graceDays = parseInt(env.CLEANUP_GRACE_DAYS || "30", 10);
  const now = new Date();
  const cutoff = new Date(now.getTime() - graceDays * 24 * 60 * 60 * 1000);

  const report: CleanupReport = {
    timestamp: now.toISOString(),
    mode,
    graceDays,
    objectsScanned: 0,
    objectsEligible: 0,
    objectsQuarantined: 0,
    objectsDeleted: 0,
    protectedPrefixes: PROTECTED_PREFIXES,
    errors: [],
    eligibleObjects: [],
  };

  try {
    // Load manifest (generated at build time)
    let manifest: string[] = [];
    try {
      const manifestObj = await env.R2_MEDIA.get("media-manifest.json");
      if (manifestObj) {
        const manifestText = await manifestObj.text();
        manifest = JSON.parse(manifestText);
      }
    } catch {
      report.errors.push("Failed to load media manifest. Aborting cleanup.");
      return new Response(JSON.stringify(report, null, 2), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // List all objects in the bucket
    const manifestSet = new Set(manifest);
    let cursor: string | undefined;
    const datePrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    do {
      const listing = await env.R2_MEDIA.list({ cursor, limit: 1000 });
      cursor = listing.cursor;

      for (const object of listing.objects) {
        report.objectsScanned++;

        // Skip protected prefixes
        const isProtected = PROTECTED_PREFIXES.some((p) => object.key.startsWith(p));
        if (isProtected) continue;

        // Skip objects in the manifest (referenced by content)
        if (manifestSet.has(object.key)) continue;

        // Skip objects within grace period
        if (object.uploaded > cutoff) continue;

        // Skip already-quarantined objects
        if (object.key.startsWith("quarantine/")) continue;

        report.objectsEligible++;
        report.eligibleObjects.push({
          key: object.key,
          size: object.size,
          lastModified: object.uploaded.toISOString(),
        });

        if (mode === "quarantine") {
          const quarantineKey = `quarantine/${datePrefix}/${object.key}`;
          try {
            const obj = await env.R2_MEDIA.get(object.key);
            if (obj) {
              await env.R2_MEDIA.put(quarantineKey, obj.body, {
                httpMetadata: obj.httpMetadata,
                customMetadata: {
                  ...obj.customMetadata,
                  quarantinedAt: now.toISOString(),
                  originalKey: object.key,
                },
              });
              await env.R2_MEDIA.delete(object.key);
              report.objectsQuarantined++;
            }
          } catch (err) {
            report.errors.push(`Failed to quarantine ${object.key}: ${err}`);
          }
        } else if (mode === "delete") {
          try {
            await env.R2_MEDIA.delete(object.key);
            report.objectsDeleted++;
          } catch (err) {
            report.errors.push(`Failed to delete ${object.key}: ${err}`);
          }
        }
      }
    } while (cursor);

    // Store report in R2
    const reportKey = `reports/cleanup-${datePrefix}.json`;
    await env.R2_MEDIA.put(reportKey, JSON.stringify(report, null, 2), {
      httpMetadata: { contentType: "application/json" },
    });

    return new Response(JSON.stringify(report, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    report.errors.push(`Unexpected error: ${err}`);
    return new Response(JSON.stringify(report, null, 2), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
