# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Pooja Singhal portfolio: a freelance-built product designer portfolio site. Single-page React app whose page content was exported from **Figma Make** — hero/process/work/contact landing page, an About page, two long-form case studies (Lister, MathzAI), and a contact form. No backend, no router, no database. The generated Figma output under `src/imports/` is the design source of truth; everything else in `src/` is hand-written shell around it.

## Working in this repo

Bias toward caution over speed. For trivial tasks, use judgment.

**This is client work with a visual contract.** The PDFs in `design/` are the approved designs — pixel fidelity to them is the acceptance criterion, not code elegance. When a change would alter rendered layout, say so before making it.

**Think before coding.** State assumptions explicitly; if uncertain, ask. When multiple interpretations exist, present them — do not pick silently. Several invariants below (never edit `src/imports/`, label-matched navigation, tokens-only styling) are load-bearing and easy to break silently — confirm rather than guess.

**Don't over-engineer.** Minimum change that solves the problem; abstract only on proven reuse. Two call sites is the bar for extracting a hook, not one. The generated components are machine output and `src/styles/_landing.css`-style files are a patch layer over them — do not "clean up" either.

**Verify visually.** Type-checking passes on things that render wrong. Any layout, font, spacing, or responsive change must be checked in the browser at desktop, tablet (≤900px), and mobile (≤640px) widths before being called done.

## Commands

Toolchain pinned in `.mise.toml`: Node 22, pnpm 10.34.3. Without `mise` installed, `corepack pnpm@10.34.3 <cmd>` runs the pinned version.

```bash
pnpm install     # node_modules is not committed
pnpm dev         # vite --host 0.0.0.0, port $PORT (default 8443)
pnpm build       # vite build
pnpm preview     # serve the production build
pnpm format      # oxfmt
```

There is no test suite and no lint step. The check sequence is:

```bash
pnpm exec tsc --noEmit   # strict mode
pnpm build
```

`tsc` reports ~12 pre-existing errors, **all in generated `src/imports/`** (`Type 'string' is not assignable to type 'number'` on SVG props — Figma export bugs). It will never be clean here. Filter with `| grep -v "^src/imports/"` and treat any remaining error as yours. Neither command catches visual regressions — see **Verify visually** above.

## Layout

```
design/          approved Figma exports — the visual contract
docs/            the original Figma import plan
public/          favicon.svg, resume.pdf
src/
├── main.tsx             entry; mounts App, imports styles/index.css
├── App.tsx              the router-less page switch + click delegation
├── components/          NavBar, CustomCursor
├── pages/               one wrapper per route
├── hooks/               useCanvasScale — fits a fixed-width canvas to the viewport
├── lib/                 clipboard helper
├── config/              site.ts (contact details, keys), navigation.ts (routes, labels)
├── styles/              index.css entry + `_`-prefixed partials
└── imports/             GENERATED Figma output — read-only
```

## Architecture

React 19 + Vite 8 + Tailwind CSS v4 (via `@tailwindcss/vite`, no config file) + TypeScript strict. `@` aliases to `src`.

### Two layers, treated differently

| Layer | Path | Rule |
| --- | --- | --- |
| **Generated** | `src/imports/**` | Figma Make output, ~13k lines of absolutely-positioned JSX. **Read-only.** Never hand-edit. |
| **Shell** | everything else in `src/` | Hand-written. Edit freely. |

The page-specific partials in `src/styles/` (`_landing.css`, `_about.css`, `_case-study.css`) are the patch layer: they reach into generated markup via `[data-name="…"]` and escaped Tailwind class selectors to fix layout the export got wrong. That is where generated-markup fixes belong — never in `src/imports/`.

### Styling

**No hardcoded style values in hand-written code.** Components carry class names only; every colour, font stack, spacing step, radius, easing, and z-index comes from `src/styles/_tokens.css` as a CSS custom property. Adding a colour means adding a token.

`src/styles/index.css` is the only entry point — it holds the remote font `@import`s (which must come first in the final sheet), pulls in Tailwind, then imports each partial in dependency order. Partials never import each other.

The generated components under `src/imports/` are exempt: they carry literal values inline because they are machine output.

Two exceptions to tokens-only, both deliberate: `_landing.css` retains literal Tailwind-escaped selectors (`.bg-\[\#ffee91\]`) because those are *class names in generated markup*, not values; and the responsive breakpoints (1200/900/640px) are repeated literals because plain CSS cannot tokenise media queries.

### Routing

No router. `App.tsx` holds `useState<Page>` and renders one of five components. Navigation arrives two ways:

1. **`NavBar`** — hand-written fixed header, calls `onNav(label)`.
2. **A delegated click handler on the page container** — the only way to make generated markup interactive. It reads `e.target.textContent` and matches against the labels in `config/navigation.ts`. To disambiguate the two identical "View Case Study" buttons, it walks up the DOM looking for a Tailwind gap class (`CASE_STUDY_ANCHORS`).

This is brittle by construction. Re-exporting from Figma with changed copy or spacing breaks navigation with no error. `config/navigation.ts` exists so there is one list to re-check after a re-import.

### Case study scaling

Both case studies render a fixed 1280px-wide canvas and scale it to the viewport via `hooks/useCanvasScale.ts`. Because `transform` doesn't affect layout flow, the hook compensates the document height with a negative `marginBottom` measured by `ResizeObserver` — no hardcoded page height.

The two pages differ in one deliberate way: Lister passes `maxScale: 1` (never grows past design size), MathzAI passes `maxScale: Infinity` (fills wide viewports). This asymmetry is inherited from the original code and has not been design-reviewed — if both should behave the same, that is a one-line change.

### Fonts

The designs use licensed Adobe fonts unavailable at runtime. `src/styles/_fonts.css` declares `@font-face` rules under the **exact family names the generated code references** (`'Scala Pro:Bold'`, `'Avenir Next:Demi Bold'`, `'Roca:Black'`…) pointing at free substitutes:

| Design font | Substitute |
| --- | --- |
| Scala Pro | Cormorant Garamond |
| Scala Sans Pro | Raleway |
| Roca | Nunito |
| Avenir / Avenir Next | Inter |
| Caveat, Geist, EB Garamond, Inter, Nunito | themselves (Google / Figma CDN) |

Never rename these aliases — the generated JSX references them literally via Tailwind arbitrary values. `_tokens.css` builds its font stacks on top of them.

### Custom cursor

`components/CustomCursor.tsx` hides the native cursor (via `_base.css` on the four page roots) and draws a dot that flips to the accent colour on dark surfaces. It runs `document.elementFromPoint` on every `mousemove`, then walks ancestors calling `getComputedStyle` to detect a light surface. Hot path — keep work per move minimal, and remember any new dark section needs adding to `DARK_SECTIONS`.

## Critical invariants (never break)

- **Never hand-edit `src/imports/**`.** Fix generated markup from `src/styles/` or from the shell components. Hand edits are silently destroyed by the next Figma re-export.
- **No hardcoded style values outside `_tokens.css`** (generated code excepted).
- **Never rename the `@font-face` aliases.** Generated JSX depends on the literal family strings.
- **Navigation is label-matched.** Changing button copy in a Figma frame breaks routing. Verify clicks after any re-import.
- **The design PDFs in `design/` are the contract.** Don't change spacing, colour, or type to taste.
- **The accent `#ffee91` is load-bearing** for button styling, active nav, and cursor detection. It lives in `--color-accent`, and as a literal in `CustomCursor.tsx` (`ACCENT_RGB`) because `getComputedStyle` returns `rgb()`.
- **Personal data lives in source** — see `config/site.ts`. Don't add more, don't log it, don't send it anywhere new.

## Known gaps

Real, unresolved — don't "discover" them again, and don't fix them unasked:

- **`PROTOTYPE_URL` in `config/site.ts` is empty.** The Lister case study's "Open the Prototype" button is inert until a Figma prototype share link is set.
- **No OG image.** `.figma/make/site.json` has no `openGraph.image`, so shared links show no preview card. Needs a purpose-made 1200×630 export from Figma.
- **The JS bundle is ~1.2 MB** (295 KB gzipped) because both 6000-line case studies are always in the main chunk. `React.lazy` on the two case study pages would fix it.
- **The reorganisation has not been visually verified.** Structure, typecheck, and build are confirmed; the rendered pages after the CSS split and component rewrite have not been eyeballed.
- The reorganisation commit has not been pushed; `main` is ahead of `origin/main` by one commit.

## Conventions

- **Styling:** class names in JSX, values from `_tokens.css`. Inline `style` only for genuinely dynamic values (the canvas transform in `useCanvasScale`, the cursor position).
- **Responsive:** breakpoints established at ≤1200px, ≤900px, ≤640px. Reuse them; don't introduce new ones.
- **Components:** default exports, one per file. Named exports for hooks, config, and helpers.
- **Strings:** use double quotes for text containing apostrophes (`"Let's Connect"`) — an unescaped apostrophe in a single-quoted string breaks the build. In JSX text, prefer `&rsquo;`.
- **Scope discipline:** small reviewable changes, preserve existing rendered output unless the change is the point, no new dependencies without clear reason.
- **Commits:** conventional, lowercase type, imperative, first line < 72 chars. Types: `feat` `fix` `refactor` `docs` `style` `chore` `build`.

## Branching

`main` is production. `dev` is the integration branch. Both currently point at
the same commit.

Work goes: **feature branch off `dev` → PR into `dev`**. Release by merging
`dev` into `main`. Never commit directly to `main`, and never open a PR
straight into `main` except for a release or a hotfix.

```bash
git switch dev && git pull
git switch -c feat/short-description
# … work, commit …
git push -u origin feat/short-description
gh pr create --base dev
```

Branch names follow the commit types: `feat/`, `fix/`, `refactor/`, `docs/`,
`chore/`.

## Config

No environment variables and no secrets. `vite.config.ts` is Figma Make's generated config — it wires React, Tailwind v4, the `@` alias, and four Figma dev-only plugins (site config from `.figma/make/site.json`, error-overlay replay, refresh-boundary fallback, story kit). Treat it as vendored: change it only for a deliberate reason.

Site metadata (title, description, favicon, OG image, robots, analytics) is set in `.figma/make/site.json`, not in `index.html`. Currently: title "Pooja Singhal — Product Designer", indexing enabled, favicon `public/favicon.svg`. No OG image yet.

**Figma Make round-trip:** this repo was originally laid out as Figma Make expects (app nested under `Current/Frame Development Plan/`). It has since been flattened to the repo root for normal tooling. `.figma/make/` is preserved, but a future re-export will not drop cleanly into this tree — regenerate in Figma Make and copy the changed files under `src/imports/` across by hand. `src/imports/` deliberately keeps Figma's own directory name to keep that copy straightforward.
