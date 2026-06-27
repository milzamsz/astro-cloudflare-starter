/**
 * Stylelint configuration for Astro + Tailwind CSS v4
 * Compatible with stylelint 15.x and stylelint-config-prettier 9.x
 */

module.exports = {
  ignoreFiles: ['dist/', '.astro/', 'node_modules/', '**/*.ts', '**/*.astro', '**/*.md', '**/*.yml', '**/*.json', '**/*.js', '**/*.cjs'],
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recommended-scss',
  ],
  rules: {
    'selector-class-pattern': null,
    'selector-id-pattern': null,
    'custom-property-pattern': null,
    'selector-pseudo-class-no-unknown': [true, {
      ignorePseudoClasses: ['global', 'local'],
    }],
    'lightness-notation': null,
    'import-notation': null,
    'color-hex-length': 'short',
    'alpha-value-notation': 'percentage',
    'scss/at-rule-no-unknown': [true, {
      ignoreAtRules: ['theme', 'custom-variant', 'utility', 'import', 'tailwindcss'],
    }],
  },
}