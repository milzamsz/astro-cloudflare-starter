/**
 * Stylelint — plain CSS + Tailwind CSS v4 at-rules.
 * (No SCSS in this project; design tokens live in src/styles/tokens/.)
 */
module.exports = {
  extends: ["stylelint-config-standard"],
  ignoreFiles: ["dist/**", ".astro/**", "node_modules/**"],
  rules: {
    "selector-class-pattern": null,
    "selector-id-pattern": null,
    "custom-property-pattern": null,
    "selector-pseudo-class-no-unknown": [true, { ignorePseudoClasses: ["global", "local"] }],
    "lightness-notation": null,
    "import-notation": null,
    "color-hex-length": "short",
    "alpha-value-notation": "percentage",
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "theme",
          "custom-variant",
          "variant",
          "utility",
          "apply",
          "reference",
          "source",
          "plugin",
          "config",
          "tailwind",
          "tailwindcss",
        ],
      },
    ],
    "at-rule-no-deprecated": [true, { ignoreAtRules: ["apply"] }],
    "function-no-unknown": [true, { ignoreFunctions: ["theme", "--alpha", "--spacing"] }],
    // Component CSS is ordered by source/feature, not by specificity.
    "no-descending-specificity": null,
  },
  overrides: [
    {
      // Token files group custom properties into several :root/.dark blocks on purpose.
      files: ["src/styles/tokens/**/*.css", "src/styles/starlight.css"],
      rules: { "no-duplicate-selectors": null },
    },
  ],
};
