import { BEHANCE, EMAIL, LINKEDIN, SITE_URL } from "@/config/site";
import { ROUTES } from "@/config/navigation";

/**
 * Schema.org JSON-LD, per route.
 *
 * These blocks used to live as four literal `<script>` tags in `index.html`,
 * which meant `scripts/prerender.mjs` copied all four onto every page: the
 * contact page claimed to be a case study, and every route asserted it was the
 * `Person`'s `mainEntityOfPage`. Generating them per route fixes that and
 * keeps the graph next to the copy it describes.
 *
 * Search engines and AI crawlers both read this. Two rules follow from that:
 * every claim here must also be visible on the page — Google discounts
 * structured data that contradicts the rendered content, and outright
 * penalises FAQ markup whose answers are not on screen — and nothing may be
 * invented, since this is a real person's professional record.
 */

const PERSON_ID = `${SITE_URL}/#pooja`;
const SITE_ID = `${SITE_URL}/#website`;

/** Referenced from every graph rather than repeated, so the entity stays one thing. */
const PERSON_REF = { "@type": "Person", "@id": PERSON_ID } as const;

const PERSON = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: "Pooja Singhal",
  url: `${SITE_URL}/`,
  image: `${SITE_URL}/og.png`,
  jobTitle: "Product Designer",
  description:
    "Product designer turning complexity into clarity. Former mathematics teacher, now designing digital products with a focus on UX, UI and user research.",
  email: `mailto:${EMAIL}`,
  knowsAbout: [
    "Product Design",
    "UX Design",
    "UI Design",
    "User Research",
    "Usability Testing",
    "Design Systems",
    "Prototyping",
    "Responsive Design",
    "Information Architecture",
  ],
  sameAs: [LINKEDIN, BEHANCE],
};

/**
 * The About page adds the experience and credential signals — the "experience"
 * and "expertise" half of E-E-A-T. Every one of these is stated on that page:
 * the mathematics teaching background, and the reasoning it carries into
 * design work.
 */
const PERSON_DETAILED = {
  ...PERSON,
  hasOccupation: [
    {
      "@type": "Occupation",
      name: "Product Designer",
      occupationalCategory: "27-1024.00",
      skills: "UX design, UI design, user research, usability testing, prototyping",
    },
    {
      "@type": "Occupation",
      name: "Mathematics Teacher",
      occupationalCategory: "25-2031.00",
      skills: "Mathematics instruction, analytical reasoning, problem decomposition",
    },
  ],
  knowsLanguage: [{ "@type": "Language", name: "English" }],
};

const WEBSITE = {
  "@type": "WebSite",
  "@id": SITE_ID,
  name: "Pooja Singhal — Product Designer",
  url: `${SITE_URL}/`,
  author: PERSON_REF,
  publisher: PERSON_REF,
  inLanguage: "en",
};

/** One case study's entry in the graph, plus the trail that locates it. */
function caseStudy(opts: {
  route: string;
  name: string;
  headline: string;
  about: string;
  keywords: string[];
  datePublished: string;
}) {
  const url = SITE_URL + opts.route;
  return [
    {
      "@type": ["Article", "CreativeWork"],
      "@id": `${url}#casestudy`,
      name: opts.name,
      headline: opts.headline,
      url,
      author: PERSON_REF,
      creator: PERSON_REF,
      publisher: PERSON_REF,
      about: opts.about,
      genre: "UX/UI case study",
      keywords: opts.keywords.join(", "),
      datePublished: opts.datePublished,
      inLanguage: "en",
      isPartOf: { "@id": SITE_ID },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Work", item: `${SITE_URL}/#work` },
        { "@type": "ListItem", position: 3, name: opts.name, item: url },
      ],
    },
  ];
}

/**
 * Questions a hiring manager or prospective client actually asks.
 *
 * Every answer below is also rendered on the contact page — see the `FAQ`
 * constant it shares. Structured data whose answers are not visible is a
 * manual-action risk, not merely wasted markup.
 */
export const FAQ: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "Is Pooja Singhal available for work?",
    a: "Yes. She is available for full-time product design roles and takes on a small number of contract projects alongside them.",
  },
  {
    q: "What does Pooja Singhal do?",
    a: "She is a product designer working across UX and UI — user research, information architecture, interaction design, interface design and usability testing. She designs end to end, from problem framing through to a tested, responsive interface.",
  },
  {
    q: "What is her background?",
    a: "She taught mathematics before moving into product design. Years of working through proofs and complex problems trained her to break down uncertainty, identify relationships and reason systematically — the same approach she brings to analysing a design problem before solving it.",
  },
  {
    q: "What has she worked on?",
    a: "Two case studies are published in full. MathzAI is an AI maths tutoring product where she was the sole designer on a team of four. Lister is a list-making and sharing app, taken from low-fidelity wireframes through functional prototypes and moderated usability testing with five participants.",
  },
  {
    q: "How does she approach a project?",
    a: "Understand the business and its goals, research and analyse the problem space, prototype with AI, then design, validate and refine — repeating as the work demands. The framework flexes per project rather than being applied rigidly.",
  },
  {
    q: "How can I get in touch?",
    a: `Email ${EMAIL}, or use the contact form on this page. She replies within 48 hours.`,
  },
];

const GRAPHS: Record<string, object[]> = {
  [ROUTES.home]: [
    PERSON,
    WEBSITE,
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#profilepage`,
      url: `${SITE_URL}/`,
      mainEntity: PERSON_REF,
      isPartOf: { "@id": SITE_ID },
      inLanguage: "en",
    },
  ],

  [ROUTES.about]: [
    PERSON_DETAILED,
    {
      "@type": "AboutPage",
      url: SITE_URL + ROUTES.about,
      name: "About — Pooja Singhal",
      mainEntity: PERSON_REF,
      isPartOf: { "@id": SITE_ID },
      inLanguage: "en",
    },
  ],

  [ROUTES.lister]: caseStudy({
    route: ROUTES.lister,
    name: "Lister",
    headline: "Lister — private and public lists, simplified",
    about: "List-making and sharing web app",
    keywords: [
      "UX case study",
      "UI design",
      "usability testing",
      "wireframing",
      "prototyping",
      "responsive design",
      "list app",
    ],
    datePublished: "2026-09-09",
  }),

  [ROUTES.mathzai]: caseStudy({
    route: ROUTES.mathzai,
    name: "MathzAI",
    headline: "MathzAI — making maths feel less intimidating for students",
    about: "AI maths tutoring web app",
    keywords: [
      "UX case study",
      "AI product design",
      "edtech",
      "competitive analysis",
      "user testing",
      "design system",
      "maths tutoring",
    ],
    datePublished: "2026-09-09",
  }),

  [ROUTES.connect]: [
    {
      "@type": "ContactPage",
      url: SITE_URL + ROUTES.connect,
      name: "Contact — Pooja Singhal",
      mainEntity: PERSON_REF,
      isPartOf: { "@id": SITE_ID },
      inLanguage: "en",
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}${ROUTES.connect}#faq`,
      mainEntity: FAQ.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ],
};

/**
 * The JSON-LD for one route, as a single `@graph` document.
 *
 * One script tag rather than several lets the nodes reference each other by
 * `@id`, so the `Person` is one entity across the site instead of a fresh
 * unnamed one on every page.
 */
export function structuredDataFor(route: string): string | null {
  const graph = GRAPHS[route];
  if (!graph) return null;
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}
