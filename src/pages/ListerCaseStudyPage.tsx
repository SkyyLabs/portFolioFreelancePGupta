import ListerCaseStudy from "@/content/ListerCaseStudy";
import CaseStudySummary, { type SummaryEntry } from "@/components/CaseStudySummary";
import { useCanvasScale } from "@/hooks/useCanvasScale";

/**
 * The ListerCaseStudy root is `relative size-full` with absolutely positioned
 * children, so it has no intrinsic height and must be given one or the page
 * renders blank.
 *
 * This is the exact bottom of the lowest element. Anything larger shows as a
 * band of the root's #f2f8ff background below the closing section; anything
 * smaller clips it. Re-measure if the page content changes.
 */
const DESIGN_HEIGHT = 10347;

/** Every entry is stated somewhere in the case study; none is new information. */
const SUMMARY: readonly SummaryEntry[] = [
  { term: "Project", detail: "Lister — a web app for discovering, creating and sharing lists on any topic" },
  { term: "Role", detail: "Product designer — UX and UI, end to end" },
  { term: "Discipline", detail: "User research, information architecture, wireframing, prototyping, usability testing, responsive UI design" },
  { term: "Method", detail: "Low-fidelity wireframes turned into functional prototypes with Claude Code, then moderated usability sessions with five participants — a mix of known contacts and recruited strangers" },
  { term: "Flows tested", detail: "Searching for lists, duplicating, editing, and understanding ownership" },
  { term: "Design threads", detail: "Unifying the workflow, simplifying discovery, ensuring clarity and trust around edit versus view access, and rethinking the layout from the smallest screen upward" },
  { term: "Success measures", detail: "Task completion, feature discovery, habit formation" },
];

export default function ListerCaseStudyPage() {
  const { ref, style } = useCanvasScale({ designHeight: DESIGN_HEIGHT });

  return (
    <div className="case-study-root">
      {/* The visible title is set inside a product mockup, so it cannot serve as
          the page heading. This gives the page one real h1 without altering it. */}
      <h1 className="sr-only">Lister — private and public lists, simplified</h1>
      <CaseStudySummary title="Lister" entries={SUMMARY} />
      <div ref={ref} style={style}>
        <ListerCaseStudy />
      </div>
    </div>
  );
}
