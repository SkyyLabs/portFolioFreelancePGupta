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
export type RouteMeta = {
  title: string;
  description: string;
  /**
   * Open Graph type. `profile` on the pages that are about Pooja herself and
   * `article` on the case studies, so a shared link is categorised correctly
   * rather than all five reading as a generic website.
   */
  ogType: "website" | "profile" | "article";
  /** Comma-separated keywords. Google ignores these; Bing still reads them. */
  keywords: string;
};

export const ROUTE_META: Record<string, RouteMeta> = {
  [ROUTES.home]: {
    title: "Pooja Singhal — Product Designer (UX/UI) Portfolio",
    description:
      "Pooja Singhal is a product designer turning complexity into clarity. Former mathematics teacher. Case studies on MathzAI and Lister — UX, UI, and user research.",
    ogType: "profile",
    keywords:
      "Pooja Singhal, Pooja Singhal designer, Pooja Singhal portfolio, product designer, UX designer, UI designer, user research, design portfolio, India",
  },
  [ROUTES.about]: {
    title: "About Pooja Singhal — Product Designer",
    description:
      "About Pooja Singhal: from teaching mathematics to designing products, and how proofs, patterns and problem-solving shape the way she approaches design.",
    ogType: "profile",
    keywords:
      "Pooja Singhal, about Pooja Singhal, product designer background, mathematics teacher to designer, UX designer India",
  },
  [ROUTES.lister]: {
    title: "Lister Case Study — Pooja Singhal, Product Designer",
    description:
      "Pooja Singhal's UX and UI case study on Lister, an app for private and public lists — research, wireframes, usability testing with five participants, and responsive interface design.",
    ogType: "article",
    keywords:
      "Pooja Singhal, Lister case study, UX case study, usability testing, wireframing, prototyping, responsive design, product design portfolio",
  },
  [ROUTES.mathzai]: {
    title: "MathzAI Case Study — Pooja Singhal, Product Designer",
    description:
      "Pooja Singhal was sole designer on MathzAI, an AI maths tutor. Competitive analysis, user testing, and designing for learning rather than instant answers.",
    ogType: "article",
    keywords:
      "Pooja Singhal, MathzAI case study, AI product design, edtech design, UX research, competitive analysis, design system, product design portfolio",
  },
  [ROUTES.connect]: {
    title: "Contact Pooja Singhal — Product Designer",
    description:
      "Contact Pooja Singhal, product designer. Available for full-time roles and select contract projects. Replies within 48 hours.",
    ogType: "website",
    keywords:
      "Pooja Singhal, contact Pooja Singhal, hire product designer, UX designer available, freelance product designer",
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
