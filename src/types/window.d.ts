/* eslint-disable no-var */
/// <reference types="astro/client" />

interface Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  /** Pagefind UI constructor, loaded on demand from /pagefind/pagefind-ui.js */
  PagefindUI?: new (options: Record<string, unknown>) => unknown;
  umami?: {
    track: (
      event: string,
      data?: Record<string, string | number | boolean>,
    ) => void;
  };
}
