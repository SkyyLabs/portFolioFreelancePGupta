/**
 * Converts the case-study and landing PNGs to WebP, in place.
 *
 * The site shipped roughly 14 MB of PNGs. The landing hero alone was 2.7 MB and
 * measured as the Largest Contentful Paint element at 20.7 s on emulated
 * mobile; Lighthouse put `modern-image-formats` at a 12.5 s opportunity.
 *
 * This is a one-off, run by hand — not a build step. The WebP files are
 * committed alongside the source they replace, so the build stays a plain
 * `vite build` with no image pipeline and no new dependency. The PNGs remain
 * recoverable from git history.
 *
 * Requires `cwebp` (Homebrew: `brew install webp`).
 *
 *   node scripts/optimize-images.mjs           # convert and rewrite imports
 *   node scripts/optimize-images.mjs --dry-run # report only
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(root, "src", "content");
const dryRun = process.argv.includes("--dry-run");

/**
 * 85 rather than the usual 82. These are pencil illustrations on white — soft
 * graphite gradients are exactly where WebP's chroma handling shows first, and
 * this is a designer's portfolio, so a visible artefact costs more than the
 * few KB the higher quality adds.
 */
const QUALITY = 85;

const pngs = [];
for (const dir of fs.readdirSync(contentDir)) {
  const full = path.join(contentDir, dir);
  if (!fs.statSync(full).isDirectory()) continue;
  for (const file of fs.readdirSync(full)) {
    if (file.endsWith(".png")) pngs.push(path.join(full, file));
  }
}

let before = 0;
let after = 0;

for (const png of pngs) {
  const webp = png.replace(/\.png$/, ".webp");
  const inSize = fs.statSync(png).size;
  before += inSize;

  if (dryRun) {
    console.log(`would convert ${path.relative(root, png)} (${(inSize / 1024).toFixed(0)} KB)`);
    continue;
  }

  execFileSync("cwebp", ["-q", String(QUALITY), "-quiet", png, "-o", webp]);
  const outSize = fs.statSync(webp).size;
  after += outSize;

  // Only keep the WebP if it actually wins. A couple of the small flat-colour
  // assets compress better as PNG, and shipping a larger file would be silly.
  if (outSize >= inSize) {
    fs.unlinkSync(webp);
    after -= outSize;
    after += inSize;
    console.log(`kept  ${path.relative(root, png)} — PNG already smaller`);
    continue;
  }

  fs.unlinkSync(png);
  const pct = (100 - (outSize / inSize) * 100).toFixed(0);
  console.log(
    `${path.relative(root, webp).padEnd(70)} ${(inSize / 1024).toFixed(0)} KB -> ${(outSize / 1024).toFixed(0)} KB  (-${pct}%)`,
  );
}

if (dryRun) process.exit(0);

// Point the generated components at whatever survived.
for (const dir of fs.readdirSync(contentDir)) {
  const index = path.join(contentDir, dir, "index.tsx");
  if (!fs.existsSync(index)) continue;
  const src = fs.readFileSync(index, "utf8");
  const next = src.replace(/from "\.\/([0-9a-f]{40})\.png"/g, (whole, hash) =>
    fs.existsSync(path.join(contentDir, dir, `${hash}.webp`))
      ? `from "./${hash}.webp"`
      : whole,
  );
  if (next !== src) {
    fs.writeFileSync(index, next);
    console.log(`rewrote imports in src/content/${dir}/index.tsx`);
  }
}

console.log(
  `\ntotal ${(before / 1024 / 1024).toFixed(1)} MB -> ${(after / 1024 / 1024).toFixed(1)} MB`,
);
