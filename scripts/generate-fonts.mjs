/**
 * Regenerates `src/styles/_fonts.css`.
 *
 * The design calls for licensed Adobe faces that cannot be served at runtime,
 * so every family name the generated Figma markup references is declared as an
 * `@font-face` alias pointing at a free substitute. The alias names are
 * load-bearing: the markup names them literally in Tailwind arbitrary values
 * (`font-['Scala_Pro:Bold',sans-serif]`), so they must never be renamed.
 *
 * Two things this file exists to get right, both of which were wrong before:
 *
 * 1. **One file per weight, not a variable font.** Google's `css2` API serves a
 *    single variable file whatever the user agent claims. Pointed at by an
 *    `@font-face`, browsers rendered that file's *default* instance rather than
 *    the requested weight — so `Roca:Black` painted as Nunito ExtraLight and
 *    `Scala Sans Pro:Bold` as Raleway Thin. The older v1 API still returns a
 *    distinct file per requested weight, which has no instance to get wrong.
 *
 * 2. **Weight pinned as a range.** Each alias encodes its own weight in its
 *    name, but the generated markup often leaves `font-weight` at 400. A
 *    `font-weight: 700 700` descriptor clamps any requested weight onto the
 *    one this face actually is, so `Roca:Black` is black no matter what the
 *    element asks for.
 *
 * Run by hand after changing the table below:
 *
 *   node scripts/generate-fonts.mjs
 */
import fs from "node:fs";

const OUT = "src/styles/_fonts.css";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * Google's *v1* stylesheet API, which returns a distinct file per requested
 * weight. The v2 (`css2`) API now hands back one variable file whatever the
 * user agent claims, and an `@font-face` pointing at a variable file renders
 * its default instance — which is how `Scala Pro:Bold` ended up painting as
 * Cormorant Garamond Light and `Roca:Black` as Nunito ExtraLight.
 */
const API = "https://fonts.googleapis.com/css";

/** Weight word in an alias name -> CSS weight. */
const WEIGHTS = {
  Thin: 100,
  ExtraLight: 200,
  Light: 300,
  Regular: 400,
  Roman: 400,
  Book: 400,
  Medium: 500,
  "Demi Bold": 600,
  SemiBold: 600,
  Bold: 700,
  Heavy: 800,
  ExtraBold: 800,
  Black: 900,
};

/**
 * Alias family -> the Google family that stands in for it.
 *
 * The four substitutions at the top are the design's licensed faces. The rest
 * are families the export already used by their real names.
 */
const SUBSTITUTE = {
  "Scala Pro": "Cormorant Garamond",
  "Scala Sans Pro": "Raleway",
  Roca: "Nunito",
  "Avenir Next": "Inter",
  Avenir: "Inter",
  Caveat: "Caveat",
  "DM Serif Display": "DM Serif Display",
  "Open Sans": "Open Sans",
  "EB Garamond": "EB Garamond",
  Inter: "Inter",
  Nunito: "Nunito",
  Geist: "Inter",
  "Public Sans": "Public Sans",
  "Source Sans Pro": "Source Sans 3",
  "Source Serif Pro": "Source Serif 4",
  "Source Serif 4": "Source Serif 4",
};

/** Weights each Google family actually publishes, for clamping. */
const AVAILABLE = {
  "Cormorant Garamond": [300, 400, 500, 600, 700],
  Raleway: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  Nunito: [200, 300, 400, 500, 600, 700, 800, 900, 1000],
  Inter: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  Caveat: [400, 500, 600, 700],
  "DM Serif Display": [400],
  "Open Sans": [300, 400, 500, 600, 700, 800],
  "EB Garamond": [400, 500, 600, 700, 800],
  "Public Sans": [100, 200, 300, 400, 500, 600, 700, 800, 900],
  "Source Sans 3": [200, 300, 400, 500, 600, 700, 800, 900],
  "Source Serif 4": [200, 300, 400, 500, 600, 700, 800, 900],
};

/** Families that publish no italic, so an italic alias must use the upright. */
const NO_ITALIC = new Set(["Public Sans"]);

/** Every alias the generated markup references. Order is cosmetic only. */
const ALIASES = [
  "Scala Pro",
  "Scala Pro:Regular",
  "Scala Pro:Bold",
  "Scala Pro:Bold Italic",
  "Scala Sans Pro",
  "Scala Sans Pro:Regular",
  "Scala Sans Pro:Bold",
  "Roca:Regular",
  "Roca:Bold",
  "Roca:Black",
  "Avenir Next:Regular",
  "Avenir Next:Medium",
  "Avenir Next:Demi Bold",
  "Avenir Next:Bold",
  "Avenir Next:Bold Italic",
  "Avenir Next:Demi Bold Italic",
  "Avenir:Roman",
  "Avenir:Medium",
  "Avenir:Heavy",
  "Avenir:Black",
  "Caveat:Regular",
  "Caveat:Bold",
  "DM Serif Display:Regular",
  "DM Serif Display:Italic",
  "Open Sans:Regular",
  "Open Sans:SemiBold",
  "Open Sans:Bold",
  "EB Garamond:ExtraBold",
  "Geist:Regular",
  "Geist:Bold",
  "Inter:Regular",
  "Inter:Bold",
  "Nunito:Medium",
  "Public Sans:SemiBold",
  "Public Sans:ExtraBold",
  "Source Sans Pro:Regular",
  "Source Sans Pro:SemiBold",
  "Source Sans Pro:Bold",
  "Source Serif Pro:SemiBold",
  "Source Serif 4:ExtraBold",
  "Source Serif 4:ExtraBold Italic",
];

/** Split "Avenir Next:Demi Bold Italic" into family, weight and style. */
function parse(alias) {
  const [family, suffix = "Regular"] = alias.split(":");
  const italic = / Italic$/.test(suffix) || suffix === "Italic";
  const word = suffix.replace(/ ?Italic$/, "").trim() || "Regular";
  const weight = WEIGHTS[word];
  if (weight === undefined) throw new Error(`unknown weight word "${word}" in ${alias}`);
  return { family, weight, italic };
}

/** Nearest published weight, so a family that stops at 700 is not asked for 900. */
function clamp(googleFamily, weight) {
  const list = AVAILABLE[googleFamily];
  if (!list) throw new Error(`no weight table for ${googleFamily}`);
  return list.reduce((a, b) => (Math.abs(b - weight) < Math.abs(a - weight) ? b : a));
}

// Collect what needs fetching, then request each family once.
const wanted = new Map();
const resolved = new Map();

for (const alias of ALIASES) {
  const { family, weight, italic } = parse(alias);
  const google = SUBSTITUTE[family];
  if (!google) throw new Error(`no substitute mapped for ${family}`);
  const wantItalic = italic && !NO_ITALIC.has(google);
  const w = clamp(google, weight);
  if (!wanted.has(google)) wanted.set(google, new Set());
  wanted.get(google).add(`${w}|${wantItalic ? 1 : 0}`);
}

for (const [google, specs] of wanted) {
  const list = [...specs].map((s) => s.split("|"));
  // v1 spells a weight as `700` and an italic as `700italic`.
  const value = list
    .map(([w, i]) => `${w}${i === "1" ? "italic" : ""}`)
    .sort()
    .join(",");
  const url = `${API}?family=${google.replace(/ /g, "+")}:${value}&display=swap`;

  const css = await (await fetch(url, { headers: { "User-Agent": UA } })).text();
  const faces = [
    ...css.matchAll(
      /font-style:\s*(\w+);\s*font-weight:\s*(\d+);[\s\S]*?src:\s*url\((https:[^)]+\.woff2)\)/g,
    ),
  ];
  if (!faces.length) throw new Error(`no woff2 returned for ${google} (${url})`);
  for (const m of faces) {
    resolved.set(`${google}|${m[2]}|${m[1] === "italic" ? 1 : 0}`, m[3]);
  }
  const got = [...new Set(faces.map((m) => `${m[2]}${m[1] === "italic" ? "i" : ""}`))];
  console.log(`${google.padEnd(20)} requested ${value.padEnd(28)} got ${got.join(",")}`);
}

const blocks = [];
for (const alias of ALIASES) {
  const { family, weight, italic } = parse(alias);
  const google = SUBSTITUTE[family];
  const wantItalic = italic && !NO_ITALIC.has(google);
  const w = clamp(google, weight);
  const key = `${google}|${w}|${wantItalic ? 1 : 0}`;
  const src = resolved.get(key) ?? resolved.get(`${google}|${w}|0`);
  if (!src) throw new Error(`unresolved: ${alias} -> ${key}`);

  blocks.push(
    `@font-face {\n` +
      `  font-family: '${alias}';\n` +
      `  font-style: ${wantItalic ? "italic" : "normal"};\n` +
      `  /* Pinned two ways. The markup often leaves font-weight at 400 while the\n` +
      `     alias name says otherwise, so the range clamps whatever is asked for\n` +
      `     onto the one weight this face is. And because Google serves a single\n` +
      `     variable file per family — the same URL for every weight — the range\n` +
      `     alone is not enough: without the axis pinned, the browser renders the\n` +
      `     file's default instance, which is the lightest cut. */\n` +
      `  font-weight: ${w} ${w};\n` +
      `  font-variation-settings: 'wght' ${w};\n` +
      `  font-display: swap;\n` +
      `  src: url(${src}) format('woff2');\n` +
      `}`,
  );
}

const header = `/**
 * Font aliases — GENERATED by \`scripts/generate-fonts.mjs\`. Do not hand-edit.
 *
 * The design uses licensed Adobe faces that cannot be served at runtime, so
 * every family name the generated Figma markup references is declared here and
 * pointed at a free substitute:
 *
 *   Scala Pro       -> Cormorant Garamond
 *   Scala Sans Pro  -> Raleway
 *   Roca            -> Nunito
 *   Avenir / Next   -> Inter
 *   Geist           -> Inter
 *   Source Sans Pro -> Source Sans 3
 *   Source Serif    -> Source Serif 4
 *   everything else -> itself
 *
 * **Never rename an alias.** The generated JSX names them literally in Tailwind
 * arbitrary values, so a rename silently drops the face.
 *
 * Every \`src\` is a *static* instance rather than a variable font, and every
 * \`font-weight\` is a pinned range. Both matter: with a variable file and a
 * single weight descriptor, browsers render the file's default instance, which
 * had \`Roca:Black\` painting as Nunito ExtraLight and \`Scala Sans Pro:Bold\` as
 * Raleway Thin.
 */
`;

fs.writeFileSync(OUT, `${header}\n${blocks.join("\n")}\n`);
console.log(`\nwrote ${blocks.length} faces to ${OUT}`);
