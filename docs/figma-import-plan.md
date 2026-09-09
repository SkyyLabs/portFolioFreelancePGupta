# Plan: Implement Pooja Singhal Portfolio Landing Page

## Context
The user has imported a Figma design for a full portfolio landing page (`imports/index.tsx`). The design is for "Pooja Singhal" — a product designer. The goal is to render it faithfully in the app, preserving all UI elements: layout, typography, colors, images, and SVG icons. The app shell (`App.tsx`, `index.css`) is currently empty.

## Design Overview (4 sections)
1. **Hero (Frame25)** — White bg. Navbar (name + nav links) + hero area with large illustration image and headline text + two CTA buttons.
2. **Process (Frame51)** — Black bg. "Balancing UX with Business Realities" heading + 4-step process flow with icons, arrows, and labels. "Repeat!" annotation.
3. **Selected Work (Frame45)** — White bg. "Selected Work" heading + two project cards (MathzAI, Lister) with images and "View Case Study" buttons.
4. **Contact (Frame49)** — Black bg. "Tell me about your idea!" CTA + description + contact buttons (Copy Email, LinkedIn, Behance) + availability note with illustration.

## Fonts
The design uses three font families:
- **Caveat** (Bold, Regular) — Google Font. Available. Wire via `@import` in `index.css`.
- **Scala Pro** (Bold, Regular) — Local Adobe font. **Not available on server.** Use **Cormorant Garamond** (Google Font) as a visual substitute — a high-contrast old-style serif that matches Scala Pro's editorial feel.
- **Scala Sans Pro** (Bold, Regular) — Local Adobe font. **Not available on server.** Use **Raleway** (Google Font) as a visual substitute — a geometric humanist sans-serif matching the clean, modern style.

All three Google Font families will be imported via a single Google Fonts CSS2 `@import` at the top of `src/index.css`. Then CSS `@font-face` aliases will declare `Scala Pro` and `Scala Sans Pro` as aliases pointing to the substitutes so the imported component's font references (`font-['Scala_Pro:Bold',...]` etc.) resolve correctly via Tailwind's arbitrary font values.

Actually, a simpler approach: define CSS custom properties / Tailwind theme overrides so arbitrary font values resolve correctly. The cleanest approach is to add `@font-face` declarations with the exact `font-family` names used in the imported code ("Scala Sans Pro", "Scala Pro", "Scala Pro:Bold", etc.) pointing to the substituted Google Font weights.

## Implementation Steps

### Step 1 — Wire fonts in `src/index.css`
- Add Google Fonts CSS2 `@import` at the top:
  ```
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,700;1,700&family=Raleway:wght@400;700&display=swap');
  ```
- Add `@font-face` rules aliasing:
  - `Scala Pro` / `Scala Pro:Regular` → Cormorant Garamond 400
  - `Scala Pro:Bold` / `Scala Pro:Bold Italic` → Cormorant Garamond 700
  - `Scala Sans Pro` / `Scala Sans Pro:Regular` → Raleway 400
  - `Scala Sans Pro:Bold` → Raleway 700
  - `Caveat:Regular` → Caveat 400
  - `Caveat:Bold` → Caveat 700
- Set `font-family` default on `body` / `html`.

### Step 2 — Create `src/PortfolioPage.tsx`
A thin wrapper component that:
- Imports `LandingPortfolio` from `@/imports/index` (the generated component)
- Wraps it with `<div className="w-full min-h-screen">` for full-page layout
- Exports as default

### Step 3 — Update `src/App.tsx`
- Import and render `PortfolioPage` instead of the empty div
- Remove the placeholder content

### Step 4 — Copy image assets
The imported code references PNG files at relative paths inside `imports/`. Vite handles these automatically since the imports use ES module `import` statements — no manual copying needed. The `imports/` directory is already under `src/`.

## Files to Modify
| File | Change |
|---|---|
| `src/index.css` | Add Google Fonts `@import` + `@font-face` aliases |
| `src/App.tsx` | Render `PortfolioPage` |
| `src/PortfolioPage.tsx` | New file — wrapper around `imports/index.tsx` |

## Files NOT Modified
- `imports/index.tsx` — read-only, never edited
- `imports/svg-y8hbzf41ce.ts` — read-only

## Verification
1. Dev server is already running — preview panel should show the full 4-section portfolio page after changes.
2. Confirm all sections are visible: hero, process (black bg), selected work, contact (black bg).
3. Confirm images load (illustration, project screenshots, product images).
4. Confirm handwritten font (Caveat) appears in "Pooja Singhal" name and "Repeat!" label.
5. Confirm serif font (Cormorant) appears in large headings.
6. Confirm yellow accent color `#ffee91` appears on buttons and process step titles.
