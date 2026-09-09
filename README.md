# Pooja Singhal — Portfolio

Product designer portfolio: landing page, About, two long-form case studies (Lister, MathzAI), and a contact form. Static single-page React app; no backend.

## Stack

React 19 · Vite 8 · Tailwind CSS v4 · TypeScript

## Getting started

Toolchain is pinned in `.mise.toml` (Node 22, pnpm 10.34.3). Without `mise`, use `corepack pnpm@10.34.3` in place of `pnpm`.

```bash
pnpm install
pnpm dev        # http://localhost:8443
```

```bash
pnpm build      # production build to dist/
pnpm preview    # serve the build
pnpm format     # oxfmt
```

No test suite. Check with `pnpm exec tsc --noEmit` — note that generated files under `src/imports/` carry pre-existing type errors, so filter with `| grep -v "^src/imports/"`.

## Layout

```
design/      approved Figma exports — the visual contract
docs/        the original Figma import plan
public/      favicon, resume
src/
├── components/   NavBar, CustomCursor
├── pages/        one wrapper per route
├── hooks/        canvas scaling for the case studies
├── lib/          clipboard helper
├── config/       contact details, routes, generated-markup labels
├── styles/       index.css entry + `_`-prefixed partials; tokens in _tokens.css
└── imports/      GENERATED Figma output — read-only, never hand-edit
```

## Before you change anything

Read [CLAUDE.md](CLAUDE.md). It covers the two rules that are easy to break by accident: `src/imports/` is machine output that must never be hand-edited, and navigation works by matching the text labels in the generated markup.

## Setup still required

- `WEB3FORMS_KEY` in `src/config/site.ts` — contact form submissions fail until this is set ([web3forms.com](https://web3forms.com), free, no account).
- `PROTOTYPE_URL` in `src/config/site.ts` — the Lister "Open the Prototype" button is inert until a Figma prototype link is set.
- `openGraph.image` in `.figma/make/site.json` — shared links show no preview card without a 1200×630 image.
