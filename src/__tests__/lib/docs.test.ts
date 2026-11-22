import { describe, expect, it } from 'vitest';
import { docsHref, docsLocaleOf, groupIdOfPath, stripLocale, tabOfPath } from '../../lib/docs';

describe('docs helpers', () => {
  it('detects the locale from the path (default locale has no prefix)', () => {
    expect(docsLocaleOf('/docs/guides/customization/')).toBe('en');
    expect(docsLocaleOf('/en/docs/')).toBe('en');
  });

  it('leaves default-locale paths and links untouched', () => {
    expect(stripLocale('/docs/guides/')).toBe('/docs/guides/');
    expect(docsHref('en', '/docs/guides/')).toBe('/docs/guides/');
    expect(docsHref('en', '/contact/')).toBe('/contact/');
  });

  it('finds the group and tab of a path', () => {
    expect(groupIdOfPath('/docs/deployment/cloudflare-pages/')).toBe('deployment');
    expect(tabOfPath('/docs/deployment/cloudflare-pages/').id).toBe('guide');
    expect(tabOfPath('/docs/').id).toBe('guide');
  });
});
