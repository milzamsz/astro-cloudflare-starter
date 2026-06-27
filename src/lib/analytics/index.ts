/**
 * Analytics adapter interface and providers.
 *
 * Supports: GTM (Google Tag Manager), Umami, disabled
 * Configured via CMS settings.yml → analyticsProvider, gtmId, umamiUrl, umamiId
 */

export type AnalyticsProvider = "none" | "gtm" | "umami";

export interface AnalyticsConfig {
  provider: AnalyticsProvider;
  gtmId?: string;
  umamiUrl?: string;
  umamiId?: string;
}

export interface AnalyticsEvent {
  name: string;
  data?: Record<string, string | number | boolean>;
}

// PII-free event taxonomy
export const EVENTS = {
  PAGE_VIEW: "page_view",
  CONTACT_SUBMIT: "contact_submit",
  SERVICE_VIEW: "service_view",
  CTA_CLICK: "cta_click",
  LOCALE_SWITCH: "locale_switch",
} as const;

/**
 * Initialize analytics based on configuration.
 * Call once on page load.
 */
export function initAnalytics(config: AnalyticsConfig): void {
  if (typeof window === "undefined") return;

  switch (config.provider) {
    case "gtm":
      initGTM(config.gtmId);
      break;
    case "umami":
      initUmami(config.umamiUrl, config.umamiId);
      break;
    default:
      break; // disabled
  }
}

/**
 * Track an analytics event.
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;

  try {
    if (window.dataLayer) {
      window.dataLayer.push({
        event: event.name,
        ...event.data,
      });
    }
    if (window.umami) {
      window.umami.track(event.name, event.data);
    }
  } catch {
    // Analytics failure should never break the page
  }
}

function initGTM(gtmId?: string): void {
  if (!gtmId) return;

  // Skip if already loaded
  if (document.querySelector(`script[data-gtm-id="${gtmId}"]`)) return;

  const script = document.createElement("script");
  script.setAttribute("data-gtm-id", gtmId);
  script.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmId}');
  `;
  document.head.appendChild(script);
}

function initUmami(umamiUrl?: string, umamiId?: string): void {
  if (!umamiUrl || !umamiId) return;

  // Skip if already loaded
  if (document.querySelector(`script[data-umami-id="${umamiId}"]`)) return;

  const script = document.createElement("script");
  script.setAttribute("data-umami-id", umamiId);
  script.async = true;
  script.defer = true;
  script.src = `${umamiUrl.replace(/\/$/, "")}/script.js`;
  script.setAttribute("data-website-id", umamiId);
  document.head.appendChild(script);
}
