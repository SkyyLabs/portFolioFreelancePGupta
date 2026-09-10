import MathzaiCaseStudy from "@/content/MathzaiCaseStudy";
import CaseStudySummary, { type SummaryEntry } from "@/components/CaseStudySummary";
import CaseStudyCTA from "@/components/CaseStudyCTA";
import { useCanvasScale } from "@/hooks/useCanvasScale";

/** Every entry is stated somewhere in the case study; none is new information. */
const SUMMARY: readonly SummaryEntry[] = [
  { term: "Project", detail: "MathzAI — an AI maths tutoring web app for students from roughly class 8 through undergraduate" },
  { term: "Role", detail: "Product designer, sole designer on the project" },
  { term: "Team", detail: "Four people — founder, frontend, backend, and the designer" },
  { term: "Discipline", detail: "Competitive analysis, user research, usability testing, interaction design, design system, responsive UI design" },
  { term: "Core problem", detail: "The product's value is learning, but a student at 11pm wants to finish their homework. A direct answer teaches where the answer came from, not where the student's own reasoning broke down" },
  { term: "What testing surfaced", detail: "The three main features read as identical; \u201cSolution\u201d and \u201cFinal Answer\u201d were understood as one thing; the \u201cContinue\u201d button was stranded without context" },
  { term: "Outcome", detail: "Step-by-step choices in place of passive reading, feedback that names specifically what worked, and orientation carried by colour, breadcrumbs and a step counter" },
  { term: "Visual direction", detail: "Interesting without being childish, and trustworthy enough for corrections to be believed. Red and green were unavailable to the palette, both already meaning wrong and right. Roca for headings, Avenir Next for body" },
];

export default function MathzaiCaseStudyPage() {
  // No designHeight: this canvas's root is a flex column, so it sizes itself.
  const { ref, style } = useCanvasScale();

  return (
    <div className="case-study-root">
      <CaseStudySummary title="MathzAI" entries={SUMMARY} />
      <div ref={ref} style={style}>
        <MathzaiCaseStudy />
        <CaseStudyCTA />
      </div>
    </div>
  );
}
