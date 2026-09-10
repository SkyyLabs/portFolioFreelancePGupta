import { useRef } from "react";
import Landing from "@/content/Landing";
import { useScrollReveal } from "@/hooks/useScrollReveal";

/**
 * The landing page's scrollable bands, in document order.
 *
 * The hero — child 1 — is deliberately excluded: it is above the fold on load,
 * so a scroll trigger would leave it blank until the reader moved. It gets
 * `.page-enter` on the root instead.
 *
 * These are the same `:nth-child` positions `CustomCursor` uses for its dark
 * sections and `App` uses for the work band, so a Figma re-export that changes
 * the section count has to be re-checked in all three places.
 */
const REVEAL_SELECTORS = ['[data-name="Landing portfolio"] > div:nth-child(n + 2)'] as const;

export default function HomePage() {
  const root = useRef<HTMLDivElement>(null);
  useScrollReveal(root, REVEAL_SELECTORS);

  return (
    <div ref={root} className="portfolio-root page-enter">
      <Landing />
    </div>
  );
}
