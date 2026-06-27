/* eslint-disable no-var */
/// <reference types="astro/client" />

interface Window {
  dataLayer?: Record<string, unknown>[];
  umami?: {
    track: (
      event: string,
      data?: Record<string, string | number | boolean>,
    ) => void;
  };
}
