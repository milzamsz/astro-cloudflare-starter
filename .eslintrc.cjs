/* eslint-config-prettier */

/**
 * ESLint configuration for Astro + Sveltia CMS + Cloudflare Pages template
 * Converted to ESLint v8.x-compatible CommonJS format for ESLint 8.57.1
 * Supports both .js, .jsx, .ts, .tsx files in src/
 */

/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  ignorePatterns: ['dist/', '.astro/', '**/*.d.ts', 'functions/'],
  parserOptions: {
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'prefer-const': 'error',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-namespace': 'error',
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
  },
}