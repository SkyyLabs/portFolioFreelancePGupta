import { useState, useEffect, useRef } from "react";

import NavBar from "@/components/NavBar";
import CustomCursor from "@/components/CustomCursor";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import ListerCaseStudyPage from "@/pages/ListerCaseStudyPage";
import MathzaiCaseStudyPage from "@/pages/MathzaiCaseStudyPage";
import ConnectPage from "@/pages/ConnectPage";
import { CASE_STUDY_ANCHORS, LABELS, type Page } from "@/config/navigation";
import { BEHANCE, LINKEDIN, PROTOTYPE_URL, RESUME_URL } from "@/config/site";
import { copyEmailToClipboard } from "@/lib/clipboard";

/** The "Selected Work" band of the generated landing page. */
const WORK_SECTION = '[data-name="Landing portfolio"] > div:nth-child(3)';

const scrollToWork = () =>
  document.querySelector(WORK_SECTION)?.scrollIntoView({ behavior: "smooth" });

const openExternal = (url: string) => window.open(url, "_blank", "noopener");

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const pendingScrollToWork = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [page]);

  // Navigating home from another page can carry a pending scroll to the work
  // section; wait a tick for the new page to mount before scrolling.
  useEffect(() => {
    if (page !== "home" || !pendingScrollToWork.current) return;
    pendingScrollToWork.current = false;
    const timer = setTimeout(scrollToWork, 80);
    return () => clearTimeout(timer);
  }, [page]);

  const goToWork = () => {
    if (page === "home") return scrollToWork();
    pendingScrollToWork.current = true;
    setPage("home");
  };

  /** Shared by the NavBar and by clicks delegated from generated markup. */
  const handleNav = (label: string) => {
    switch (true) {
      case label === "home" || label.startsWith(LABELS.wordmark):
        return setPage("home");
      case label === LABELS.about:
        return setPage("about");
      case label === LABELS.contact || label.startsWith(LABELS.connect):
        return setPage("connect");
      case label === LABELS.resume:
        return openExternal(RESUME_URL);
      case label.startsWith(LABELS.myWork):
        return goToWork();
      case label === LABELS.linkedin:
        return openExternal(LINKEDIN);
      case label === LABELS.behance:
        return openExternal(BEHANCE);
      case label.startsWith(LABELS.prototype):
        return PROTOTYPE_URL ? openExternal(PROTOTYPE_URL) : undefined;
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

  const openCaseStudy = (el: HTMLElement) => {
    for (let node: HTMLElement | null = el; node; node = node.parentElement) {
      if (typeof node.className !== "string") continue;
      const match = CASE_STUDY_ANCHORS.find((a) => node!.className.includes(a.gapClass));
      if (match) return setPage(match.page);
    }
  };

  return (
    <>
      <CustomCursor />
      <NavBar onNav={handleNav} activePage={page} />
      <div className="shared-nav-offset" onClick={handleGeneratedClick}>
        {page === "home" && <HomePage />}
        {page === "about" && <AboutPage />}
        {page === "lister" && <ListerCaseStudyPage />}
        {page === "mathzai" && <MathzaiCaseStudyPage />}
        {page === "connect" && <ConnectPage />}
      </div>
    </>
  );
}
