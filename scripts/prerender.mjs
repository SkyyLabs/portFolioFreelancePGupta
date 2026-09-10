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

const { render, ROUTES, ROUTE_META, structuredDataFor, SITE_URL, EMAIL, LINKEDIN, BEHANCE } =
  await import(path.join(root, "dist-ssr", "entry-server.js"));

const SITE = SITE_URL;
const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");

const escape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const OG_IMAGE = `${SITE}/og.png`;
const OG_IMAGE_ALT = "Pooja Singhal — product designer portfolio";
const SITE_NAME = "Pooja Singhal — Product Designer";

/**
 * The full head for one route.
 *
 * Everything a crawler or a link scraper reads is emitted here rather than
 * left to the runtime effect in `App.tsx`. Google renders JavaScript, but Bing
 * and every social scraper do not, so a tag that only exists after hydration
 * effectively does not exist for them.
 */
function headFor(route, meta) {
  const url = SITE + route;
  const tags = [
    ["meta", { name: "description", content: meta.description }],
    ["meta", { name: "keywords", content: meta.keywords }],
    ["meta", { name: "author", content: "Pooja Singhal" }],
    // max-image-preview:large is what allows a large thumbnail in results;
    // the snippet limits stop Google truncating the description to a stub.
    [
      "meta",
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
    ],
    ["meta", { name: "googlebot", content: "index, follow" }],
    ["meta", { name: "theme-color", content: "#ffee91" }],

    ["meta", { property: "og:type", content: meta.ogType }],
    ["meta", { property: "og:site_name", content: SITE_NAME }],
    ["meta", { property: "og:locale", content: "en_US" }],
    ["meta", { property: "og:title", content: meta.title }],
    ["meta", { property: "og:description", content: meta.description }],
    ["meta", { property: "og:url", content: url }],
    ["meta", { property: "og:image", content: OG_IMAGE }],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
    ["meta", { property: "og:image:alt", content: OG_IMAGE_ALT }],

    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:title", content: meta.title }],
    ["meta", { name: "twitter:description", content: meta.description }],
    ["meta", { name: "twitter:image", content: OG_IMAGE }],
    ["meta", { name: "twitter:image:alt", content: OG_IMAGE_ALT }],

    ["link", { rel: "canonical", href: url }],
    // rel="me" ties the site to the profiles it claims as the same person —
    // the signal that separates one Pooja Singhal from another.
    ["link", { rel: "me", href: LINKEDIN }],
    ["link", { rel: "me", href: BEHANCE }],
    ["link", { rel: "me", href: `mailto:${EMAIL}` }],
    ["link", { rel: "sitemap", type: "application/xml", href: "/sitemap.xml" }],
  ];

  if (meta.ogType === "profile") {
    tags.push(["meta", { property: "profile:first_name", content: "Pooja" }]);
    tags.push(["meta", { property: "profile:last_name", content: "Singhal" }]);
  }

  return tags
    .map(
      ([tag, attrs]) =>
        `    <${tag} ` +
        Object.entries(attrs)
          .map(([k, v]) => `${k}="${escape(String(v))}"`)
          .join(" ") +
        ">",
    )
    .join("\n");
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

  // A missing <title> is invisible in a build log and catastrophic in search
  // results — it has happened once already, when an unrelated edit sliced the
  // tag out of the template.
  if (!/<title>[^<]*<\/title>/.test(template)) {
    throw new Error("prerender: index.html has no <title> tag to replace");
  }

  let html = template
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(meta.title)}</title>`)
    // Drop the template's own tags; this route emits its own below.
    //
    // The Figma Vite plugin injects a description and a set of og:/twitter:
    // tags from `.figma/make/site.json`, which are site-wide and so wrong on
    // four of the five routes. Leaving them in place is worse than harmless:
    // scrapers generally honour the *first* occurrence of a property, so the
    // stale site-wide title would win over the per-route one.
    .replace(FALLBACK_LD, "")
    .replace(/\s*<meta name="description"[^>]*>/g, "")
    .replace(/\s*<meta (?:property|name)="(?:og|twitter|profile):[^"]*"[^>]*>/g, "");

  const ld = structuredDataFor(route);
  if (!ld) console.warn(`prerender: no structured data for ${route}`);

  html = html.replace(
    "</head>",
    `${headFor(route, meta)}\n` +
      (ld ? `    <script type="application/ld+json">${ld}</script>\n` : "") +
      "  </head>",
  );

  const outDir = route === "/" ? dist : path.join(dist, route);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html);

  const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
  console.log(`prerendered ${route.padEnd(15)} ${kb.padStart(5)} KB`);
  count++;
}

console.log(`prerendered ${count} routes`);
