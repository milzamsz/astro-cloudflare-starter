import { afterEach, describe, expect, it, vi } from 'vitest';
import { onRequestPost } from '../../../functions/api/feedback';

const env = { RESEND_API_KEY: 'test-key', FEEDBACK_TO: 'docs@example.com' };

const call = (body: unknown, e: Record<string, string> = env) =>
  onRequestPost({
    request: new Request('http://x/api/feedback', {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
    env: e,
  });

const mockFetch = (status = 200) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status }));

afterEach(() => vi.restoreAllMocks());

describe('POST /api/feedback', () => {
  it('rejects bad input without sending', async () => {
    const fetch = mockFetch();
    expect((await call('nope')).status).toBe(400);
    expect((await call({ path: '/pricing', helpful: true })).status).toBe(400);
    expect((await call({ path: '/docs/x\nBcc: y', helpful: true })).status).toBe(400);
    expect((await call({ path: '/docs/x/', helpful: 'yes' })).status).toBe(400);
    expect((await call({ path: '/docs/x/', helpful: false, comment: 'x'.repeat(1001) })).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('returns 503 when the key or recipient is not configured', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetch = mockFetch();
    expect((await call({ path: '/docs/x/', helpful: true }, {})).status).toBe(503);
    expect((await call({ path: '/docs/x/', helpful: true }, { RESEND_API_KEY: 'k' })).status).toBe(503);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('emails default and localized pages to the configured recipient', async () => {
    const fetch = mockFetch();
    expect((await call({ path: '/docs/a/', helpful: false, comment: 'unclear' })).status).toBe(200);
    expect((await call({ path: '/id/docs/a/', helpful: true })).status).toBe(200);
    const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    const message = JSON.parse(init.body as string);
    expect(message.to).toEqual(['docs@example.com']);
    expect(message.subject).toBe('[docs] NOT helpful: /docs/a/');
    expect(message.text).toContain('comment: unclear');
  });

  it('returns 502 when Resend fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch(500);
    expect((await call({ path: '/docs/x/', helpful: true })).status).toBe(502);
  });
});
