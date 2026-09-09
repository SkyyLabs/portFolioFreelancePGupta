import MathzaiCaseStudyFinal from "@/imports/MathzaiCaseStudyFinal/index";
import { useCanvasScale } from "@/hooks/useCanvasScale";

export default function MathzaiCaseStudyPage() {
  // Grows to fill wide viewports rather than leaving a gutter.
  const { ref, style } = useCanvasScale({ maxScale: Infinity });

  return (
    <div className="case-study-root">
      <div ref={ref} style={style}>
        <MathzaiCaseStudyFinal />
      </div>
    </div>
  );
}
