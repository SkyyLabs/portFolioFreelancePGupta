import { lazy, Suspense, useEffect, useRef } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

import NavBar from "@/components/NavBar";
import CustomCursor from "@/components/CustomCursor";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import ConnectPage from "@/pages/ConnectPage";

/**
 * The two case studies are ~6,000 lines of generated markup each and together
 * account for most of the JS bundle. Loading them eagerly meant every visitor
 * to the landing page downloaded both — Lighthouse measured 181 KiB of unused
 * JavaScript there, competing for bandwidth with the resources that actually
 * paint the page.
 *
 * Splitting them out relies on `entry-server.tsx` using `prerenderToNodeStream`
 * rather than `renderToString`: only the former waits for a suspended
 * component, so the prerendered HTML still contains the full case study.
 */
const ListerCaseStudyPage = lazy(() => import("@/pages/ListerCaseStudyPage"));
const MathzaiCaseStudyPage = lazy(() => import("@/pages/MathzaiCaseStudyPage"));
import { CASE_STUDY_ANCHORS, LABELS, ROUTES, ROUTE_META } from "@/config/navigation";
import { BEHANCE, LINKEDIN, PROTOTYPE_URL, RESUME_URL } from "@/config/site";
import { copyEmailToClipboard } from "@/lib/clipboard";

/** The "Selected Work" band of the generated landing page. */
const WORK_SECTION = '[data-name="Landing portfolio"] > div:nth-child(3)';

const scrollToWork = () =>
  document.querySelector(WORK_SECTION)?.scrollIntoView({ behavior: "smooth" });

const openExternal = (url: string) => window.open(url, "_blank", "noopener");

/** Upserts a `<meta>` tag, keyed by the attribute that identifies it. */
function setMetaTag(keyAttr: "name" | "property", key: string, content: string) {
  const selector = `meta[${keyAttr}="${key}"]`;
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(keyAttr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = href;
}

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const pendingScrollToWork = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  // Give every route its own title, description and canonical URL, so search
  // results, browser history and shared links describe the page you are on
  // rather than the site as a whole.
  useEffect(() => {
    // Normalise a trailing slash so "/about/" resolves like "/about"; without
    // this the lookup misses and every such URL falls back to the home title.
    const key = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
    const meta = ROUTE_META[key] ?? ROUTE_META[ROUTES.home];
    document.title = meta.title;
    setMetaTag("name", "description", meta.description);
    setMetaTag("property", "og:title", meta.title);
    setMetaTag("property", "og:description", meta.description);
    setCanonical(window.location.origin + pathname);
  }, [pathname]);

  // Arriving home from another route can carry a pending scroll to the work
  // section; wait a tick for the page to mount before scrolling.
  useEffect(() => {
    if (pathname !== ROUTES.home || !pendingScrollToWork.current) return;
    pendingScrollToWork.current = false;
    const timer = setTimeout(scrollToWork, 80);
    return () => clearTimeout(timer);
  }, [pathname]);

  const goToWork = () => {
    if (pathname === ROUTES.home) return scrollToWork();
    pendingScrollToWork.current = true;
    navigate(ROUTES.home);
  };

  /** Shared by the NavBar and by clicks delegated from generated markup. */
  const handleNav = (label: string) => {
    switch (true) {
      case label === "home" || label.startsWith(LABELS.wordmark):
        return navigate(ROUTES.home);
      case label === LABELS.about:
        return navigate(ROUTES.about);
      case label === LABELS.contact ||
        label.startsWith(LABELS.connect) ||
        label === LABELS.sayHello:
        return navigate(ROUTES.connect);
      case label === LABELS.resume:
        return openExternal(RESUME_URL);
      case label === LABELS.seeMyWork || label.startsWith(LABELS.myWork):
        return goToWork();
      case label === LABELS.linkedin:
        return openExternal(LINKEDIN);
      case label === LABELS.behance:
        return openExternal(BEHANCE);
      case label.startsWith(LABELS.prototype):
        return PROTOTYPE_URL ? openExternal(PROTOTYPE_URL) : undefined;
    }
  };

  const openCaseStudy = (el: HTMLElement) => {
    for (let node: HTMLElement | null = el; node; node = node.parentElement) {
      if (typeof node.className !== "string") continue;
      const match = CASE_STUDY_ANCHORS.find((a) => node!.className.includes(a.gapClass));
      if (match) return navigate(match.to);
    }
  };

  /**
   * The generated Figma components render inert text, so interactivity is
   * delegated from their container and resolved by label. See
   * `config/navigation.ts` — these strings are load-bearing.
   */
  const handleGeneratedClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.target as HTMLElement;
    const label = el.textContent?.trim();
    if (!label) return;

    if (label === LABELS.copyEmail) return copyEmailToClipboard(el);
    if (label === LABELS.viewCaseStudy) return openCaseStudy(el);
    handleNav(label);
  };

  return (
    <>
      <CustomCursor />
      <NavBar onNav={handleNav} />
      <div className="shared-nav-offset" onClick={handleGeneratedClick}>
        {/* No fallback: the case study markup is already in the prerendered
            HTML, so a spinner here would replace real content with nothing. */}
        <Suspense fallback={null}>
          <Routes>
            <Route path={ROUTES.home} element={<HomePage />} />
            <Route path={ROUTES.about} element={<AboutPage />} />
            <Route path={ROUTES.lister} element={<ListerCaseStudyPage />} />
            <Route path={ROUTES.mathzai} element={<MathzaiCaseStudyPage />} />
            <Route path={ROUTES.connect} element={<ConnectPage />} />
            {/* Unknown URL — send visitors home rather than showing nothing. */}
            <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
          </Routes>
        </Suspense>
      </div>
    </>
  );
}
