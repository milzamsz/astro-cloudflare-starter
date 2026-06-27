# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Yes (template)  |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, report them privately via:

1. **GitHub Security Advisory** (preferred): Security tab → "Report a vulnerability"
2. **Email**: security@[your-domain].com (if configured)

We will acknowledge receipt within 48 hours and provide a status update within 5 business days.

## Security Measures in This Template

This is a static site, so the attack surface is small.

### Content Security Policy
- Enforced via `public/_headers` at the Cloudflare edge
- `frame-ancestors 'none'` prevents clickjacking
- `form-action 'self'` restricts form submissions
- Allows only configured analytics + the OpenStreetMap embed

### R2 cleanup worker
- The only Pages Function (`functions/api/cleanup.ts`) can modify R2 objects
- Guarded by a bearer token (`CLEANUP_SECRET`); returns 401 without it
- Remove it entirely if you don't use R2

### Secrets
- All secrets via Cloudflare Pages secrets or `.dev.vars` (gitignored)
- No secrets in code — enforced by `validate:secrets` and trufflehog in CI

### Dependency Security
- **Dependabot** weekly checks for vulnerable dependencies
- **Dependency Review** on every PR (fails on moderate+ severity)
- **Secret scanning** via trufflehog on every push

### Infrastructure
- **Cloudflare Pages** — DDoS protection, WAF, automatic TLS

## Scope

This policy applies to:
- The template codebase itself
- Generated projects using this template (adapt to your context)

This policy does NOT cover:
- User-deployed infrastructure (Cloudflare account settings, DNS, etc.)
- Third-party services — report to their security teams
