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
    const onMove = (e: MouseEvent) => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }

      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (!el) return;

      if (el.closest(".shared-nav-link")) return setIsAccent(true);
      if (isOnLightSurface(el)) return setIsAccent(false);
      setIsAccent(!!el.closest(DARK_SECTIONS));
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={dotRef} className="cursor-root">
      <div className={isAccent ? "cursor-dot cursor-dot--accent" : "cursor-dot"} />
    </div>
  );
}
