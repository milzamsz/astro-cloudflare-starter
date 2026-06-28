# Contributing

We welcome contributions! This guide explains how to contribute to this template effectively.

## Code of Conduct

Be respectful, constructive, and inclusive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).

## Getting Started

1. **Fork** the repository
2. **Clone** your fork
3. **Install** dependencies: `pnpm install`
4. **Run** the dev server: `pnpm dev`

## Development Workflow

### Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production — always deployable |
| `feat/*` | Feature branches |
| `fix/*` | Bug fixes |
| `chore/*` | Maintenance, dependencies, docs |

### Making Changes

1. Create a branch from `main`: `git checkout -b feat/my-feature`
2. Make your changes
3. Run validation locally:
   ```bash
   pnpm run lint        # ESLint + Stylelint + type-check + validations
   pnpm run validate:i18n  # Translation consistency
   pnpm run build       # Production build
   ```
4. Commit using conventional commits (see below)
5. Push and open a PR against `main`

### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `chore:` — Maintenance, dependencies
- `docs:` — Documentation changes
- `refactor:` — Code restructuring
- `style:` — Formatting, lint fixes (no logic change)
- `test:` — Adding or fixing tests
- `perf:` — Performance improvement
- `ci:` — CI/CD changes
- `i18n:` — Translation updates

### PR Requirements

- ✅ All CI checks pass (lint, type-check, build, validation)
- ✅ At least one reviewer has approved
- ✅ No security vulnerabilities introduced
- ✅ No secrets committed
- ✅ Documentation updated if changing public API or setup steps

## Release Process

1. Changes accumulate on `main`
2. When ready for release, update `CHANGELOG.md`
3. Tag the release: `git tag -a v1.0.0 -m "v1.0.0"`
4. Push the tag: `git push origin v1.0.0`
5. CI automatically builds, deploys, and creates a GitHub Release

## Need Help?

- Check `SETUP.md` for environment setup and deployment
- Read the in-app docs at `/docs`
- Open a [discussion](https://github.com/milzamsz/astro-cloudflare-starter/discussions)