# Self-audit prompts

Portable prompts you can paste into any AI chat (Cursor, Claude, Copilot, ChatGPT)
to audit this project against its conventions. They reference the canonical
knowledge base in `system/globals/` and the `check:kpis` script.

These are **design/quality** audits — distinct from the workflow prompts in
`.agentkanban/prompts/`.

| File | Audits |
| --- | --- |
| `tokens.md` | Hardcoded colors / off-token usage |
| `accessibility.md` | WCAG AA, keyboard, focus, alt, landmarks |
| `responsive.md` | 375–1920 layout integrity |
| `darkmode.md` | Dark-mode parity & contrast |
| `performance.md` | Islands, assets, Lighthouse |
| `seo.md` | Metadata, OG, sitemap, structured data |
