/** The five routes. There is no router — `App.tsx` swaps on this union. */
export type Page = "home" | "about" | "lister" | "mathzai" | "connect";

export const WORDMARK = "Pooja Singhal";

export const NAV_ITEMS = ["My Work", "About", "Resume", "Contact"] as const;

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
  connect: "Let's Connect",
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
export const CASE_STUDY_ANCHORS: ReadonlyArray<{ gapClass: string; page: Page }> = [
  { gapClass: "gap-[236px]", page: "lister" },
  { gapClass: "gap-[203px]", page: "mathzai" },
];
