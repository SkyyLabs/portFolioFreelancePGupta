import CaseStudy4 from "@/imports/CaseStudy4/index";
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
      <div ref={ref} style={style}>
        <CaseStudy4 />
      </div>
    </div>
  );
}
