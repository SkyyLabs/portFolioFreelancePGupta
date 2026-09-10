# Portfolio — Typography Spec

Three sections, each with its own type pairing. Sizes are in px (desktop).

---

## 1. Landing / About / Contact

**Pairing:** Scala Pro (display) + Scala Sans Pro (text)

| Role | Font | Weight | Size |
|---|---|---|---|
| H1 — landing, first fold only | Scala Pro | Bold (700) | 50 |
| H2 — landing, first fold only | Scala Sans Pro | Regular (400) | 20 |
| H1 — all other sections | Scala Pro | Bold (700) | 40 |
| H2 | Scala Pro | Bold (700) | 30 |
| H3 | Scala Sans Pro | Bold (700) | 18 |
| Body | Scala Sans Pro | Regular (400) / Demi Bold (600) | 15 |
| Accent — landing only | Caveat | Bold (700) | 35 |

The first fold of the landing page uses its own larger H1/H2 pair. Every other page in this group uses the 40/30 pair.

Caveat is a handwriting accent used only on the landing page — not a heading level.

---

## 2. MathzAI Case Study

**Pairing:** Roca (display) + Avenir Next (text)

| Role | Font | Weight | Size |
|---|---|---|---|
| H1 | Roca | Black (900) | 45 |
| H2 | Roca | Black (900) | 36 |
| H3 | Avenir Next | Bold (700) | 24 |
| Body | Avenir Next | Regular (400) / Demi Bold (600) | 16 |

---

## 3. Lister Case Study

**Pairing:** DM Serif Display (display) + Open Sans (text)

| Role | Font | Weight | Size |
|---|---|---|---|
| H1 | DM Serif Display | Regular (400) | 40 |
| H2 | Open Sans | Semi Bold (600) | 30 |
| H3 | Open Sans | Bold (700) | 20 |
| Body | Open Sans | Regular (400) / Demi Bold (600) | 16 |


---

## Implementation notes

Applied to the site. The `@font-face` aliases in `src/styles/_fonts.css` map each
family name above to a free substitute (Scala Pro → Cormorant Garamond, Scala
Sans Pro → Raleway, Roca → Nunito, Avenir Next → Inter); the licensed originals
are not available at runtime.

**Each section now uses only its own pairing.** Previously Lister carried Public
Sans, Source Sans Pro and Source Serif, and MathzAI carried EB Garamond, Geist,
Inter and Nunito. Those were moved onto the pairing for their section.

**All four previously documented deviations are now closed:**

| Where | Was | Now |
| --- | --- | --- |
| Landing process steps | Scala Pro Regular 25 | H3 — Scala Sans Pro Bold 18 |
| MathzAI "Project Snapshot" | Roca Black 28 | H2 — Roca Black 36 |
| MathzAI "Competitive Analysis" | Roca Bold 30 | H2 — Roca Black 36 |
| Landing first-fold H2 | Raleway 20 | Scala Sans Pro Regular 20 |

The last of those is a rename only. Raleway *is* the Scala Sans Pro substitute
declared in `_fonts.css`, so naming the alias the spec names changes nothing on
screen; it just stops the markup contradicting the spec.

Hero H1 sizes were brought to spec earlier: MathzAI 60→45, Lister 50→40,
Contact 51→40, landing section heading 45→40.

## What this spec does not cover

The table above assigns a font and size to each *heading and body role*. The
generated case-study markup also contains a long tail of intermediate sizes —
Lister body copy at 18, 13, 12 and 11; MathzAI at 20, 18, 15, 14 and 10 — plus
several hundred sub-10px labels.

Those sub-10px values are **type inside the embedded UI mockups**: miniature
product screens drawn as vector JSX. They are artwork, not typography roles,
and snapping them to a body size would destroy the mockups.

The intermediate body sizes are a real gap, but closing them is a design
decision rather than a mechanical one: the case-study layouts are
absolutely-positioned at fixed widths, so changing a body size reflows a block
that was composed around it. Raise it as a design pass if the hierarchy reads
inconsistently.
