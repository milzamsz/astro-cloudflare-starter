import { inlineScript } from "./csp";

/**
 * Applies the dark class before first paint (prevents a light flash).
 * Honors the main-site key first, then Starlight's key (so a choice made in
 * /docs carries over), then the OS preference.
 */
export const themeBootstrap = inlineScript(`(() => {
  try {
    const stored = localStorage.getItem("theme") || localStorage.getItem("starlight-theme");
    const dark =
      stored === "dark" ||
      ((!stored || stored === "auto") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
  } catch {
    // Storage can be blocked (privacy mode); keep the default theme.
  }
})();`);
