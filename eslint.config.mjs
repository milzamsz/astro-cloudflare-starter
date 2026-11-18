/**
 * ESLint — only for `.astro` files.
 *
 * JS/TS linting is done by Oxlint (`.oxlintrc.json`), which is much faster.
 * ESLint stays for the Astro-specific rules (eslint-plugin-astro), and
 * eslint-plugin-oxlint turns off every rule Oxlint already checks so the two
 * never report the same problem twice.
 */
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { configs as astroConfigs } from "eslint-plugin-astro";
import oxlint from "eslint-plugin-oxlint";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default [
  { ignores: ["dist/", ".astro/", ".wrangler/", "node_modules/"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astroConfigs.recommended,
  {
    files: ["**/*.astro"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "no-console": "warn",
      "prefer-const": "error",
    },
  },
  ...oxlint.buildFromOxlintConfigFile("./.oxlintrc.json"),
  prettier,
];
