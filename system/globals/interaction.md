# Interaction

Conventions for interactive elements (buttons, links, tabs, inputs).

## States (always define all that apply)

- **hover:** subtle elevation/color shift (`--primary-hover`, `--secondary-hover`).
- **active/pressed:** small scale or darker tone (`--primary-active`).
- **focus-visible:** `outline: 2px solid var(--ring); outline-offset: 2px;` — never remove.
- **disabled:** reduced opacity + `cursor: not-allowed`; not focusable.
- **selected (tabs/toggles):** filled `--primary` with `--primary-foreground`.

## Buttons

- Use the `Button` UI component (`variant: primary | secondary | …`).
- Primary = solid `--primary`; secondary = bordered/`--secondary`.
- Icon-only buttons require an `aria-label`.

## Links

- Inline prose links: `--primary` (which is foreground-toned in this monochrome
  system) with underline + `text-underline-offset`.
- Nav links: clear hover and `aria-current` for the active route.

## Motion

- Transitions are short (150–250ms) and ease-out.
- All non-essential motion must honor `prefers-reduced-motion: reduce`.
- Use the `data-animate` scroll-reveal utility (CSS-only) for entrance effects.

## Rules

- Every interactive element is keyboard reachable and has a visible focus ring.
- Don't introduce client JS for purely visual behavior; prefer CSS.
