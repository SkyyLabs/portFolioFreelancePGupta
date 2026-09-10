import { useRef } from "react";
import About from "@/content/About";
import { useScrollReveal } from "@/hooks/useScrollReveal";

/**
 * Every direct child of the About frame — the intro, the hairline rule, and
 * the closing section.
 */
const REVEAL_SELECTORS = ['[data-name="About"] > div'] as const;

export default function AboutPage() {
  const root = useRef<HTMLDivElement>(null);
  useScrollReveal(root, REVEAL_SELECTORS);

  return (
    <div ref={root} className="about-root page-enter">
      <About />
    </div>
  );
}
