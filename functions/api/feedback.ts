/**
 * Docs feedback — Cloudflare Pages Function at POST /api/feedback.
 * Emails "Was this helpful?" votes through Resend. Needs:
 *   RESEND_API_KEY   Pages secret
 *   FEEDBACK_TO      recipient address (e.g. docs@example.com)
 *   FEEDBACK_FROM    optional sender on a Resend-verified domain
 * shortcut: email only, no storage or rate limit; move to KV/D1 if you want to query votes.
 */

export interface Env {
  RESEND_API_KEY?: string;
  FEEDBACK_TO?: string;
  FEEDBACK_FROM?: string;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const path = typeof data.path === 'string' ? data.path : '';
  const comment = typeof data.comment === 'string' ? data.comment.trim() : '';
  // /docs/... or /<locale>/docs/...
  if (!/^(\/[a-z]{2}(-[a-z]{2})?)?\/docs\/[a-z0-9\-/]*$/.test(path) || path.length > 200 || typeof data.helpful !== 'boolean') {
    return json(400, { error: 'invalid_fields' });
  }
  if (comment.length > 1000) return json(400, { error: 'comment_too_long' });

  if (!env.RESEND_API_KEY || !env.FEEDBACK_TO) {
    console.error('[feedback] RESEND_API_KEY or FEEDBACK_TO not set');
    return json(503, { error: 'not_configured' });
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.FEEDBACK_FROM ?? `Docs feedback <noreply@${new URL(request.url).hostname}>`,
        to: [env.FEEDBACK_TO],
        subject: `[docs] ${data.helpful ? 'helpful' : 'NOT helpful'}: ${path}`,
        text: `page: ${path}\nhelpful: ${data.helpful}\ncomment: ${comment || '-'}`,
      }),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
  } catch (error) {
    console.error('[feedback] send failed', error);
    return json(502, { error: 'send_failed' });
  }
  return json(200, { ok: true });
}
