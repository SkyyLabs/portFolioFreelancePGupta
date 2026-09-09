import MathzaiCaseStudyFinal from "@/imports/MathzaiCaseStudyFinal/index";
import CaseStudyCTA from "@/components/CaseStudyCTA";
import { useCanvasScale } from "@/hooks/useCanvasScale";

export default function MathzaiCaseStudyPage() {
  // No designHeight: this canvas's root is a flex column, so it sizes itself.
  const { ref, style } = useCanvasScale();

  return (
    <div className="case-study-root">
      <div ref={ref} style={style}>
        <MathzaiCaseStudyFinal />
        <CaseStudyCTA />
      </div>
    </div>
  );
}
