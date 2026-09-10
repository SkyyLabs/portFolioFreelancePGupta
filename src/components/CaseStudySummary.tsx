/**
 * A screen-reader-only fact sheet for a case study.
 *
 * The case studies are ~6,000 lines of absolutely positioned markup where the
 * key facts — role, team, timeline, method, outcome — are scattered across the
 * layout rather than stated together anywhere. That reads fine visually and
 * badly to anything summarising the page: a screen reader, a search engine, or
 * an AI crawler building an answer about this designer's experience.
 *
 * A definition list gives those facts one machine-readable home. It is hidden
 * with `.sr-only`, not `display: none`, so it stays in the accessibility tree
 * and in the prerendered HTML while changing nothing on screen.
 */
export type SummaryEntry = { term: string; detail: string };

export default function CaseStudySummary({
  title,
  entries,
}: {
  title: string;
  entries: readonly SummaryEntry[];
}) {
  return (
    <section className="sr-only" aria-label={`${title} — project summary`}>
      <h2>{title} — project summary</h2>
      <dl>
        {entries.map(({ term, detail }) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
