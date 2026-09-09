import { useEffect, useRef, useState } from "react";

/** Accent, as the browser reports it from `getComputedStyle`. */
const ACCENT_RGB = "rgb(255, 238, 145)";
const WHITE_RGB = "rgb(255, 255, 255)";

/** Dark sections of the landing page: the process band and the contact band. */
const DARK_SECTIONS = [
  '[data-name="Landing portfolio"] > div:nth-child(2)',
  '[data-name="Landing portfolio"] > div:nth-child(4)',
].join(", ");

/** True if `el` or any ancestor paints a light surface. */
function isOnLightSurface(el: HTMLElement) {
  for (let node: HTMLElement | null = el; node && node !== document.body; node = node.parentElement) {
    const bg = window.getComputedStyle(node).backgroundColor;
    if (bg === ACCENT_RGB || bg === WHITE_RGB) return true;
  }
  return false;
}

/**
 * Pointer-following dot that replaces the native cursor.
 *
 * The dot inverts over dark surfaces, so the variant is resolved per move from
 * the element under the pointer. Accent-filled buttons sit inside dark bands
 * but are light surfaces themselves, hence the ancestor walk.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [isAccent, setIsAccent] = useState(false);

  useEffect(() => {
    // Last known pointer position, in viewport coordinates. The dot is
    // position:fixed, so scrolling does not move it — but it does move a new
    // section underneath it, which is why scrolling has to re-resolve too.
    let x = -1;
    let y = -1;
    let queued = false;

    const resolve = () => {
      queued = false;
      if (x < 0) return; // pointer has not entered the page yet

      const el = document.elementFromPoint(x, y) as HTMLElement | null;
      if (!el) return;

      if (el.closest(".shared-nav-link")) return setIsAccent(true);
      if (isOnLightSurface(el)) return setIsAccent(false);
      setIsAccent(!!el.closest(DARK_SECTIONS));
    };

    // elementFromPoint plus an ancestor walk on every scroll event is far more
    // work than a frame needs; coalesce to one resolve per frame.
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(resolve);
    };

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
      schedule();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    // Route changes swap the whole page under a stationary pointer.
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div ref={dotRef} className="cursor-root">
      <div className={isAccent ? "cursor-dot cursor-dot--accent" : "cursor-dot"} />
    </div>
  );
}
