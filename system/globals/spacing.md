# Spacing & Layout

Tokens in `src/styles/tokens/spacing.css`.

## Scale

Use the spacing scale (`--spacing-*`) and the legacy `--space-*` aliases that map
onto it (`xs`→8px, `sm`→12px, `md`→16px, `lg`→24px, `xl`→32px, `2xl`→48px,
`3xl`→80px). Prefer Tailwind spacing utilities where natural.

## Container

- `.container`: centered, `max-width: var(--container-max)`, horizontal padding
  `var(--container-px)`.
- Page padding scales with breakpoint: mobile `px-4`, tablet `px-6`, desktop `px-8`.
- Max content width ≈ `max-w-7xl`.

## Section rhythm

- Vertical section padding is consistent and generous; use `Section` component or
  the shared `.section-head` block for titles/eyebrows/leads.
- Group related elements with the spacing scale; avoid arbitrary pixel gaps.

## Rules

- No magic numbers — use tokens/utilities.
- Keep horizontal padding consistent across sections so content aligns to one grid.
- Cards: consistent internal padding (`--space-lg`+), consistent radius.
