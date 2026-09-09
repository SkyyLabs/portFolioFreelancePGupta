import CaseStudy4 from "@/imports/CaseStudy4/index";
import { useCanvasScale } from "@/hooks/useCanvasScale";

export default function ListerCaseStudyPage() {
  // Never scales past its design size — wide viewports get the canvas at 1:1.
  const { ref, style } = useCanvasScale({ maxScale: 1 });

  return (
    <div className="case-study-root">
      <div ref={ref} style={style}>
        <CaseStudy4 />
      </div>
    </div>
  );
}
