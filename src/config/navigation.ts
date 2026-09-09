export const WORDMARK = "Pooja Singhal";

/**
 * Every route in the site. Paths are public URLs — changing one breaks any
 * link already shared, so treat them as stable.
 */
export const ROUTES = {
  home: "/",
  about: "/about",
  lister: "/work/lister",
  mathzai: "/work/mathzai",
  connect: "/contact",
} as const;

export type RouteKey = keyof typeof ROUTES;

/**
 * Per-route document metadata.
 *
 * A single-page app keeps one `<title>` unless it is set on navigation, which
 * would leave every case study sharing the site-wide title in search results,
 * browser history and link previews. Each route owns its own.
 */
export const ROUTE_META: Record<string, { title: string; description: string }> = {
  [ROUTES.home]: {
    title: "Pooja Singhal — Product Designer",
    description:
      "Product designer turning complexity into clarity. Former mathematics teacher. Case studies on MathzAI and Lister — UX, UI, and user research.",
  },
  [ROUTES.about]: {
    title: "About — Pooja Singhal",
    description:
      "From teaching mathematics to designing products: how proofs, patterns and problem-solving shape the way I approach design.",
  },
  [ROUTES.lister]: {
    title: "Lister — Case Study | Pooja Singhal",
    description:
      "Designing Lister, a quick and intuitive app for private and public lists. UX and UI case study covering research, structure and interface design.",
  },
  [ROUTES.mathzai]: {
    title: "MathzAI — Case Study | Pooja Singhal",
    description:
      "Making maths feel less intimidating for students. Sole designer on MathzAI: competitive analysis, user testing and the design of an AI maths tutor.",
  },
  [ROUTES.connect]: {
    title: "Contact — Pooja Singhal",
    description:
      "Available for full-time roles and select contract projects. Tell me about your idea.",
  },
};

/** Nav items, in display order, with the route each one leads to. */
export const NAV_ITEMS = [
  { label: "My Work", to: ROUTES.home },
  { label: "About", to: ROUTES.about },
  { label: "Resume", to: null }, // opens the PDF rather than navigating
  { label: "Contact", to: ROUTES.connect },
] as const;

/**
 * Labels the generated Figma markup uses for its interactive elements.
 *
 * The generated components render plain text with no handlers, so `App.tsx`
 * delegates clicks and matches on the label. That makes these strings
 * load-bearing: if a Figma re-export changes the copy, navigation silently
 * stops working. Keeping them here means there is one list to re-check.
 */
export const LABELS = {
  about: "About",
  resume: "Resume",
  contact: "Contact",
  myWork: "My Work",
  wordmark: "Pooja Singhal",
  // The landing hero's two primary calls to action.
  seeMyWork: "See My Work",
  sayHello: "Say Hello",
  // Curly apostrophe (U+2019) — this is the character the export actually
  // emits. A straight quote here silently breaks the button.
  connect: "Let\u2019s Connect",
  prototype: "Open the Prototype",
  copyEmail: "Copy Email",
  linkedin: "LinkedIn",
  behance: "Behance",
  viewCaseStudy: "View Case Study",
} as const;

/**
 * The two "View Case Study" buttons are identical in text, so they're told
 * apart by a Tailwind gap class on an ancestor of each card.
 */
export const CASE_STUDY_ANCHORS: ReadonlyArray<{ gapClass: string; to: string }> = [
  { gapClass: "gap-[236px]", to: ROUTES.lister },
  { gapClass: "gap-[203px]", to: ROUTES.mathzai },
];
