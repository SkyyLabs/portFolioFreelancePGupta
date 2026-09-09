import ListerCaseStudy from "@/content/ListerCaseStudy";
import { useCanvasScale } from "@/hooks/useCanvasScale";

/**
 * The generated CaseStudy4 root is `relative size-full` with absolutely
 * positioned children, so it has no intrinsic height and must be given one or
 * the page renders blank. Update this if the Figma frame's height changes.
 */
const DESIGN_HEIGHT = 10400;

export default function ListerCaseStudyPage() {
  const { ref, style } = useCanvasScale({ designHeight: DESIGN_HEIGHT });

  return (
    <div className="case-study-root">
      {/* The visible title is set inside a product mockup, so it cannot serve as
          the page heading. This gives the page one real h1 without altering it. */}
      <h1 className="sr-only">Lister — private and public lists, simplified</h1>
      <div ref={ref} style={style}>
        <ListerCaseStudy />
      </div>
    </div>
  );
}
