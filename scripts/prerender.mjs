/**
 * Prerenders every route to static HTML.
 *
 * The site is a client-rendered SPA, so without this step every URL serves an
 * empty `<div id="root">`. Crawlers that do not execute JavaScript — Bing, and
 * every social link scraper — index a blank page, and per-route titles set at
 * runtime by React never reach them.
 *
 * This renders each route with react-dom/server and writes the markup into a
 * copy of dist/index.html, along with that route's title, description, Open
 * Graph tags and canonical URL. React hydrates over it on load.
 *
 * Run after both `vite build` and `vite build --ssr` — see package.json.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const { render, ROUTES, ROUTE_META, structuredDataFor, SITE_URL } = await import(
  path.join(root, "dist-ssr", "entry-server.js")
);

const SITE = SITE_URL;
const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");

const escape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Replace the content of a meta tag already emitted into the template. */
function setMeta(html, attr, key, value) {
  const re = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`);
  return re.test(html)
    ? html.replace(re, `$1${escape(value)}$2`)
    : html.replace("</head>", `  <meta ${attr}="${key}" content="${escape(value)}">\n  </head>`);
}

/**
 * The template's JSON-LD, matched so it can be swapped for the per-route graph.
 *
 * It stays in `index.html` for the dev server, which does not run this script.
 */
const FALLBACK_LD = /<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g;

let count = 0;
for (const route of Object.values(ROUTES)) {
  const meta = ROUTE_META[route];
  if (!meta) {
    console.warn(`prerender: no ROUTE_META for ${route}, skipping`);
    continue;
  }

  const appHtml = await render(route);

  let html = template
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(meta.title)}</title>`);

  html = setMeta(html, "name", "description", meta.description);
  html = setMeta(html, "property", "og:title", meta.title);
  html = setMeta(html, "property", "og:description", meta.description);
  html = setMeta(html, "property", "og:url", SITE + route);
  html = html.replace(
    "</head>",
    `  <link rel="canonical" href="${SITE}${route}">\n  </head>`,
  );

  // Replace the template's fallback graph with this route's own. Without this
  // every page ships every block — the contact page claiming to be a case
  // study, and each route asserting it is the Person's mainEntityOfPage.
  html = html.replace(FALLBACK_LD, "");
  const ld = structuredDataFor(route);
  if (ld) {
    html = html.replace(
      "</head>",
      `  <script type="application/ld+json">${ld}</script>\n  </head>`,
    );
  } else {
    console.warn(`prerender: no structured data for ${route}`);
  }

  const outDir = route === "/" ? dist : path.join(dist, route);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html);

  const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
  console.log(`prerendered ${route.padEnd(15)} ${kb.padStart(5)} KB`);
  count++;
}

console.log(`prerendered ${count} routes`);
