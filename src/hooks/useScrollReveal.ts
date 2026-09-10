import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * `useLayoutEffect` warns when React renders on the server, and there is no
 * layout to read there anyway. `scripts/prerender.mjs` renders every route
 * through `react-dom/server`, so the swap is not hypothetical.
 */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Reveal once and stop watching — no re-hiding when the reader scrolls back up. */
const OBSERVER_OPTIONS: IntersectionObserverInit = {
  // Start the transition slightly before the element reaches the fold, so it
  // has finished by the time the element is properly in view.
  rootMargin: "0px 0px -12% 0px",
  // Any intersection at all. A threshold above zero never fires for an element
  // of zero height — the About page's hairline rule is exactly that — because
  // its intersection ratio can never exceed 0.
  threshold: 0,
};

/**
 * True for an element the reader can never see, so there is nothing to reveal.
 *
 * The generated markup carries duplicate nav frames that the page stylesheets
 * hide. An `IntersectionObserver` never reports a hidden element as
 * intersecting, so hiding one here would leave it stuck at `opacity: 0`
 * forever — invisible either way, but it would keep a stale class on the node.
 */
function hasNoLayoutBox(el: HTMLElement) {
  const { width, height } = el.getBoundingClientRect();
  return width === 0 && height === 0;
}

/**
 * Fades and lifts elements into place as they scroll into view.
 *
 * The hidden state is applied here rather than in the markup on purpose: the
 * site is prerendered, so an `opacity: 0` baked into the HTML would leave every
 * section invisible to a reader without JavaScript, and to any crawler that
 * renders but never scrolls. Applying it in a layout effect — after hydration
 * but before the browser paints — keeps the static HTML fully visible while
 * still avoiding a flash of un-hidden content.
 *
 * Elements are matched by selector rather than wrapped in a component because
 * the page sections come from generated markup that `CustomCursor` and `App`
 * address by `:nth-child`. A wrapper there would silently break the cursor's
 * dark-surface detection and the "See My Work" scroll.
 *
 * @param containerRef Scope for the selectors; nothing outside it is touched.
 * @param selectors One selector per group. Matches within a group are
 *   staggered in document order.
 */
export function useScrollReveal(
  containerRef: React.RefObject<HTMLElement | null>,
  selectors: readonly string[],
) {
  // Selector arrays are declared at module scope by every call site today, but
  // comparing by content rather than identity keeps an inline array from
  // tearing the observer down on each render.
  const key = selectors.join("|");
  const selectorsRef = useRef(selectors);
  selectorsRef.current = selectors;

  useIsomorphicLayoutEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    // Respect the reader's motion preference: nothing is hidden, so nothing is
    // left waiting on a transition to become visible.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("reveal--in");
        observer.unobserve(entry.target);
      }
    }, OBSERVER_OPTIONS);

    const revealed: HTMLElement[] = [];

    for (const selector of selectorsRef.current) {
      root.querySelectorAll<HTMLElement>(selector).forEach((el, i) => {
        if (hasNoLayoutBox(el)) return;
        el.classList.add("reveal");
        if (i > 0) el.style.setProperty("--reveal-index", String(i));
        observer.observe(el);
        revealed.push(el);
      });
    }

    return () => {
      observer.disconnect();
      // A route change unmounts these nodes, but re-running against the same
      // page would otherwise leave them stuck mid-transition.
      for (const el of revealed) {
        el.classList.remove("reveal", "reveal--in");
        el.style.removeProperty("--reveal-index");
      }
    };
  }, [containerRef, key]);
}
