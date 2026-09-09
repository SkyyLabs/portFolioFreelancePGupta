import { Link } from "react-router-dom";
import { ROUTES } from "@/config/navigation";

/**
 * Closing "Let's Connect" band for a case study.
 *
 * The Lister export ships its own version of this section; MathzAI's does not,
 * so this reproduces it for that page. It renders inside the scaled canvas, so
 * it is laid out at the 1280px design width and scales with everything else.
 *
 * Unlike the generated markup, this is a real `Link` — it does not depend on
 * `App.tsx` matching its label text.
 */
export default function CaseStudyCTA() {
  return (
    <section className="case-study-cta">
      <h2 className="case-study-cta-title">LETS TALK DESIGN !</h2>
      <p className="case-study-cta-body">
        Static screens only tell half the story. Whether you want to walk through the
        thinking behind this project, discuss design strategies, tell me about your
        project or just say hello and connect&mdash;I&rsquo;d love to hear from you.
      </p>
      <Link className="case-study-cta-button" to={ROUTES.connect}>
        Let&rsquo;s Connect &rarr;
      </Link>
    </section>
  );
}
