# Social preview image

`public/og.png` is the picture shown when the site is shared on LinkedIn,
WhatsApp, Slack, iMessage or X. It is referenced from
`.figma/make/site.json` → `openGraph.image` as an **absolute URL**; scrapers
ignore relative paths.

## Swapping it

Replace `public/og.png` and redeploy. Nothing in the code refers to the image's
contents, so any 1200×630 PNG works — no code change needed.

Requirements: **1200×630px**, PNG or JPG, under 5MB.

After swapping, previews stay stale because platforms cache aggressively.
Force a refresh:

- LinkedIn — <https://www.linkedin.com/post-inspector/>
- Facebook/WhatsApp — <https://developers.facebook.com/tools/debug/>
- X — <https://cards-dev.twitter.com/validator>

## Regenerating the current design

`docs/og-card.html` is the source of the shipped image: an HTML card using the
site's own tokens, screenshotted at 1200×630. Edit the copy there, then render
it with any headless browser at that viewport size, replacing `PORTRAIT_SRC`
with the portrait from `src/imports/LandingPortfolio/`.

It is kept as a document rather than a build step because the image changes
rarely and adding a browser dependency to the build for it is not worth it.

## Known limitation: one image for the whole site

Every route shares this image, title and description, because link scrapers do
not execute JavaScript — they read the served `index.html`. The per-route
metadata in `ROUTE_META` is applied by React at runtime, so it reaches browser
tabs, history and Google, but **not** social previews.

Giving each case study its own preview requires prerendering the five routes to
static HTML at build time (e.g. `vite-plugin-prerender` or `vite-ssg`). Worth
doing if case studies get shared individually.
