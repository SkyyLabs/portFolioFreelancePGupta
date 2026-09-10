# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Pooja Singhal portfolio: a freelance-built product designer portfolio site. React single-page app — hero/process/work/contact landing page, an About page, two long-form case studies (Lister, MathzAI), and a contact form. Client-side routed, no backend, no database. Page content originated as a Figma Make export and has been developed well beyond it since. The generated Figma output under `src/content/` is the design source of truth; everything else in `src/` is hand-written shell around it.

## Working in this repo

Bias toward caution over speed. For trivial tasks, use judgment.

**This is client work with a visual contract.** The approved designs are the Figma files they were exported from; PDF exports sit in `design/` locally but are **gitignored** (large binaries, not build inputs), so they may be absent in a fresh clone. Pixel fidelity to the design is the acceptance criterion, not code elegance. When a change would alter rendered layout, say so before making it.

**Think before coding.** State assumptions explicitly; if uncertain, ask. When multiple interpretations exist, present them — do not pick silently. Several invariants below (never edit `src/content/`, label-matched navigation, tokens-only styling) are load-bearing and easy to break silently — confirm rather than guess.

**Don't over-engineer.** Minimum change that solves the problem; abstract only on proven reuse. Two call sites is the bar for extracting a hook, not one. The generated components are machine output and `src/styles/_landing.css`-style files are a patch layer over them — do not "clean up" either.

**Verify visually.** This site is the designer's portfolio — it *is* the product being advertised, so a visual regression is a business problem, not a cosmetic one. Type-checking and builds both pass on pages that render wrong.

Any change must be checked in a real browser at phone (390px), tablet (820px) and laptop (1440px) on all five routes. For changes that are not *meant* to alter appearance — routing, refactors, dependency bumps — screenshot the deployed site first and pixel-diff against it afterwards; "it looks fine" is not evidence. Anything above roughly 0.05% differing pixels outside the nav band deserves investigation.

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

`tsc` reports ~12 pre-existing errors, **all in generated `src/content/`** (`Type 'string' is not assignable to type 'number'` on SVG props — Figma export bugs). It will never be clean here. Filter with `| grep -v "^src/content/"` and treat any remaining error as yours. Neither command catches visual regressions — see **Verify visually** above.

## Layout

```
design/          local-only Figma PDF exports (gitignored)
docs/            the original Figma import plan
public/          favicon.svg, resume.pdf
src/
├── main.tsx             entry; mounts App, imports styles/index.css
├── App.tsx              the router-less page switch + click delegation
├── components/          NavBar, CustomCursor
├── pages/               one wrapper per route
├── hooks/               useCanvasScale — fits a fixed-width canvas to the viewport
├── lib/                 clipboard helper
├── config/              site.ts (contact details, keys), navigation.ts (routes, metadata, labels)
├── styles/              index.css entry + `_`-prefixed partials
└── imports/             GENERATED Figma output — read-only
```

## Architecture

React 19 + Vite 8 + Tailwind CSS v4 (via `@tailwindcss/vite`, no config file) + `react-router-dom` 7 + TypeScript strict. `@` aliases to `src`.

### Two layers, treated differently

| Layer | Path | Rule |
| --- | --- | --- |
| **Generated** | `src/content/**` | Figma Make output, ~13k lines of absolutely-positioned JSX. Prefer fixing it from `src/styles/`; edit it directly only when there is no other way. |
| **Shell** | everything else in `src/` | Hand-written. Edit freely. |

The page-specific partials in `src/styles/` (`_landing.css`, `_about.css`, `_case-study.css`) are the patch layer: they reach into generated markup via `[data-name="…"]` and escaped Tailwind class selectors to fix layout the export got wrong. That is where generated-markup fixes belong — never in `src/content/`.

### Styling

**No hardcoded style values in hand-written code.** Components carry class names only; every colour, font stack, spacing step, radius, easing, and z-index comes from `src/styles/_tokens.css` as a CSS custom property. Adding a colour means adding a token.

`src/styles/index.css` is the only entry point — it holds the remote font `@import`s (which must come first in the final sheet), pulls in Tailwind, then imports each partial in dependency order. Partials never import each other.

The generated components under `src/content/` are exempt: they carry literal values inline because they are machine output.

Two exceptions to tokens-only, both deliberate: `_landing.css` retains literal Tailwind-escaped selectors (`.bg-\[\#ffee91\]`) because those are *class names in generated markup*, not values; and the responsive breakpoints (1200/900/640px) are repeated literals because plain CSS cannot tokenise media queries.

### Routing

`react-router-dom` with `BrowserRouter`. Every page has a real URL, so refresh,
back/forward, deep links and per-page search results all work:

| Route | Page |
| --- | --- |
| `/` | landing |
| `/about` | About |
| `/work/lister` | Lister case study |
| `/work/mathzai` | MathzAI case study |
| `/contact` | contact form |

Paths live in `ROUTES` in `config/navigation.ts`. **They are public URLs** — changing one breaks every link already shared and any search ranking it has earned. Unknown paths redirect to `/`.

`vercel.json` rewrites all paths to `index.html`. Without it every URL except `/` 404s on refresh. Vercel checks the filesystem first, so real assets still serve normally.

Each route sets its own `<title>`, description, `og:` tags and canonical URL from `ROUTE_META`. A single-page app otherwise shows one title everywhere, which makes search results and shared links indistinguishable.

Navigation arrives two ways:

1. **`NavBar`** — renders real `<a>` elements via `Link`. Anchors carry browser link styling, so `_navbar.css` resets `color` and `text-decoration`.
2. **A delegated click handler on the page container** — the only way to make the generated markup interactive. It reads `e.target.textContent` and matches against the labels in `config/navigation.ts`. To disambiguate the two identical "View Case Study" buttons, it walks up the DOM looking for a Tailwind gap class (`CASE_STUDY_ANCHORS`).

The second route is brittle by construction: changed copy in a re-export breaks navigation with no error. `config/navigation.ts` exists so there is one list to re-check.

### Case study scaling

Both case studies render a fixed 1280px-wide canvas and scale it to the viewport via `hooks/useCanvasScale.ts`. The canvas fills the viewport width up to `MAX_SCALE` (1.5×, so 1920px) and is **centred** above that, giving symmetric margins on very wide monitors.

Both bounds exist for a reason:
- **Uncapped**, a 1280px design renders at 2× on a 2560px monitor — body copy outgrows a comfortable measure and the canvas stops matching the unscaled nav above it.
- **Anchored top-left without filling**, it leaves a white gutter down one side (160px at 1440px, 640px at 1920px) that reads as a broken page.

Because `transform` doesn't affect layout flow, the hook compensates with a negative `marginBottom` (measured by `ResizeObserver`, not hardcoded) and a centring `marginLeft`.

Lister passes `designHeight`; MathzAI doesn't. That difference is load-bearing — see the note in `ListerCaseStudyPage.tsx`. **Do not "simplify" it away**; doing so renders that page blank at every viewport, and the build still passes.

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

- **Prefer fixing generated markup from `src/styles/` or the shell components.** The patch layer exists so a Figma re-export does not destroy the fix. Direct edits to `src/content/**` are allowed where nothing else will do — the typography spec pass, the WebP import rewrite and the hero's priority hints are all in there — but each one is a thing a re-export will silently revert, so keep them few and note them.
- **No hardcoded style values outside `_tokens.css`** (generated code excepted).
- **Never rename the `@font-face` aliases.** Generated JSX depends on the literal family strings.
- **Navigation is label-matched.** Changing button copy in a Figma frame breaks routing. Verify clicks after any re-import.
- **The Figma design is the contract.** Don't change spacing, colour, or type to taste.
- **The accent `#ffee91` is load-bearing** for button styling, active nav, and cursor detection. It lives in `--color-accent`, and as a literal in `CustomCursor.tsx` (`ACCENT_RGB`) because `getComputedStyle` returns `rgb()`.
- **Personal data lives in source** — see `config/site.ts`. Don't add more, don't log it, don't send it anywhere new.

## Known gaps

Real, unresolved — don't "discover" them again, and don't fix them unasked:

- **Images are not responsive.** The landing hero is 1122×1402 and the two work-card previews are ~2050×1350, all rendered far smaller. Lighthouse still reports `uses-responsive-images` as the largest remaining opportunity (~400 KiB). Fixing it means `srcset` in generated markup and a resize pass — a design-quality decision, not a mechanical one.
- **Performance is in the 60s–80s on emulated mobile**, not the 90+ the proposal names. Everything cheap has been done (see below); what is left is the point above.
- **The contact form has never been submitted end to end.** It emails the client, so it has deliberately not been exercised.
- **A local `dist` does not render identically to the deployed site** — 0.2–1.4% of pixels differ on `/`, `/work/lister` and `/work/mathzai`, in a few localised bands. Production against itself diffs at 0px, and a build of `dev` shows the same difference, so it is environmental rather than a regression. Unexplained.
- **`vite preview` is not a valid way to check routing.** It SPA-falls-back to `index.html`, so it serves the home markup at `/about` and throws a spurious React #418 hydration error. Use a static server that resolves `/about` to `dist/about/index.html`, the way Vercel's `cleanUrls` does.
- **Heavy automated traffic can trip a Vercel Security Checkpoint** on the production hostname, which returns 403 to everyone including Googlebot until it decays (roughly five minutes). Repeated Lighthouse runs are enough to trigger it. The deployment-specific URL keeps serving normally, so use that when testing in bulk.
- **The case studies' body sizes do not match the typography spec** — Lister carries 18/13/12/11 and MathzAI 20/18/15/14/10 against a spec that says 16. Snapping them reflows blocks composed around them in absolutely-positioned markup. See `docs/typography-spec.md`.

Closed since this list was written: `PROTOTYPE_URL` is set, the OG image exists,
the JS bundle is code-split, and the reorganisation is both visually verified
and pushed.

## Conventions

- **Styling:** class names in JSX, values from `_tokens.css`. Inline `style` only for genuinely dynamic values (the canvas transform in `useCanvasScale`, the cursor position).
- **Responsive:** breakpoints established at ≤1200px, ≤900px, ≤640px. Reuse them; don't introduce new ones.
- **Components:** default exports, one per file. Named exports for hooks, config, and helpers.
- **Strings:** use double quotes for text containing apostrophes (`"Let's Connect"`) — an unescaped apostrophe in a single-quoted string breaks the build. In JSX text, prefer `&rsquo;`.
- **Scope discipline:** small reviewable changes, preserve existing rendered output unless the change is the point, no new dependencies without clear reason.
- **Commits:** conventional, lowercase type, imperative, first line < 72 chars. Types: `feat` `fix` `refactor` `docs` `style` `chore` `build`.

## Branching

`main` is production. `dev` is the integration branch.

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

## Deployment

Hosted on Vercel, connected to the GitHub repo — deploys are automatic:

- push to `main` → production at **https://pooja-singhal-portfolio.vercel.app**
- open a PR → its own preview URL, posted as a PR comment

Nothing needs to be run by hand. `vercel deploy --prod` still works from a
local checkout as an escape hatch, but it bypasses git and should be a last
resort.

**Git LFS is load-bearing.** All 32 images and PDFs the site renders are stored
in LFS, so the project's **Git LFS setting must stay enabled** — with it off,
Vercel checks out pointer files and every image on the site breaks while the
build still succeeds. This failure is silent: typecheck and build both pass.
After any change to that setting, load a case study page and confirm the
screenshots render.

Verify a deploy the way the responsive check does — drive the deployed URL, not
localhost, since a local dev server reads real files from disk and cannot catch
an LFS regression.

## Config

No environment variables and no secrets. `vite.config.ts` is Figma Make's generated config — it wires React, Tailwind v4, the `@` alias, and four Figma dev-only plugins (site config from `.figma/make/site.json`, error-overlay replay, refresh-boundary fallback, story kit). Treat it as vendored: change it only for a deliberate reason.

Site metadata (title, description, favicon, OG image, robots, analytics) is set in `.figma/make/site.json`, not in `index.html`. Currently: title "Pooja Singhal — Product Designer", indexing enabled, favicon `public/favicon.svg`. No OG image yet.

**Figma Make round-trip:** this repo was originally laid out as Figma Make expects (app nested under `Current/Frame Development Plan/`). It has since been flattened to the repo root for normal tooling. `.figma/make/` is preserved, but a future re-export will not drop cleanly into this tree — regenerate in Figma Make and copy the changed files under `src/content/` across by hand. `src/content/` deliberately keeps Figma's own directory name to keep that copy straightforward.
