import { beforeAll, describe, expect, it } from "vitest";
import { timingSafeEqual } from "node:crypto";
import { onRequest, onRequestPost } from "../../../functions/api/cleanup";

// Workers expose crypto.subtle.timingSafeEqual; Node does not.
beforeAll(() => {
  const subtle = globalThis.crypto.subtle as SubtleCrypto & {
    timingSafeEqual?: (a: ArrayBufferView, b: ArrayBufferView) => boolean;
  };
  subtle.timingSafeEqual ??= (a, b) =>
    timingSafeEqual(new Uint8Array(a.buffer), new Uint8Array(b.buffer));
});

const DAY = 24 * 60 * 60 * 1000;
const SECRET = "test-secret";

/** Minimal in-memory stand-in for an R2 bucket. */
function memoryBucket(objects: Record<string, number>) {
  const store = new Map(
    Object.entries(objects).map(([key, ageDays]) => [
      key,
      { key, size: 1, uploaded: new Date(Date.now() - ageDays * DAY), body: "x" },
    ]),
  );
  return {
    store,
    async list() {
      return { objects: [...store.values()], truncated: false };
    },
    async get(key: string) {
      const object = store.get(key);
      return object ? { body: object.body, httpMetadata: {}, customMetadata: {} } : null;
    },
    async put(key: string, body: string) {
      store.set(key, { key, size: 1, uploaded: new Date(), body });
    },
    async delete(key: string) {
      store.delete(key);
    },
  };
}

function run(options: {
  manifest?: string[] | null;
  mode?: string;
  auth?: string | null;
  objects?: Record<string, number>;
}) {
  const bucket = memoryBucket(
    options.objects ?? {
      "images/used.jpg": 90,
      "images/orphan-old.jpg": 90,
      "images/orphan-new.jpg": 1,
      "uploads/keep.jpg": 90,
    },
  );
  const manifest = options.manifest === undefined ? ["images/used.jpg"] : options.manifest;
  const env = {
    R2_MEDIA: bucket,
    ASSETS: {
      fetch: async () =>
        manifest === null
          ? new Response("Not found", { status: 404 })
          : Response.json(manifest),
    },
    CLEANUP_SECRET: SECRET,
    CLEANUP_MODE: options.mode,
  };
  const headers: Record<string, string> =
    options.auth === null ? {} : { Authorization: `Bearer ${options.auth ?? SECRET}` };
  const request = new Request("https://example.com/api/cleanup", { method: "POST", headers });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = (onRequestPost as any)({ env, request });
  return { bucket, response: response as Promise<Response> };
}

describe("POST /api/cleanup", () => {
  it("rejects missing or wrong secrets", async () => {
    expect((await run({ auth: null }).response).status).toBe(401);
    expect((await run({ auth: "wrong" }).response).status).toBe(401);
  });

  it("aborts without changes when the manifest is missing", async () => {
    const { bucket, response } = run({ manifest: null, mode: "delete" });
    const res = await response;
    expect(res.status).toBe(503);
    expect(bucket.store.has("images/orphan-old.jpg")).toBe(true);
  });

  it("dry-run reports only old, unreferenced, unprotected objects", async () => {
    const { bucket, response } = run({});
    const report = await (await response).json();
    expect(report.mode).toBe("dry-run");
    expect(report.eligibleObjects.map((o: { key: string }) => o.key)).toEqual([
      "images/orphan-old.jpg",
    ]);
    expect(bucket.store.has("images/orphan-old.jpg")).toBe(true);
  });

  it("delete removes eligible objects and keeps everything else", async () => {
    const { bucket, response } = run({ mode: "delete" });
    const report = await (await response).json();
    expect(report.objectsDeleted).toBe(1);
    expect(bucket.store.has("images/orphan-old.jpg")).toBe(false);
    expect(bucket.store.has("images/used.jpg")).toBe(true);
    expect(bucket.store.has("images/orphan-new.jpg")).toBe(true);
    expect(bucket.store.has("uploads/keep.jpg")).toBe(true);
  });

  it("quarantine moves eligible objects under quarantine/", async () => {
    const { bucket, response } = run({ mode: "quarantine" });
    const report = await (await response).json();
    expect(report.objectsQuarantined).toBe(1);
    expect(bucket.store.has("images/orphan-old.jpg")).toBe(false);
    expect([...bucket.store.keys()].some((k) => k.startsWith("quarantine/"))).toBe(true);
  });

  it("never treats its own reports as orphans", async () => {
    const { bucket, response } = run({ mode: "delete", objects: { "reports/old.json": 90 } });
    expect((await (await response).json()).objectsEligible).toBe(0);
    expect(bucket.store.has("reports/old.json")).toBe(true);
  });
});

describe("other methods", () => {
  it("return 405", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await (onRequest as any)({});
    expect(res.status).toBe(405);
  });
});
