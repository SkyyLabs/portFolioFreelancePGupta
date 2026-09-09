import { useEffect, useRef, useState, type CSSProperties } from "react";

/** Width the Figma case-study canvases were designed at. */
export const DESIGN_WIDTH = 1280;

type Options = {
  /**
   * Largest scale allowed. `1` pins the canvas to its design size and only ever
   * shrinks it; `Infinity` lets it grow to fill wide viewports.
   */
  maxScale: number;
  /**
   * Explicit canvas height, required only for generated components whose root
   * is `relative size-full` with absolutely-positioned children — those have no
   * intrinsic height and collapse to nothing without it. Components whose root
   * is a flex column size themselves and should omit this.
   */
  designHeight?: number;
};

/**
 * Fits a fixed-width Figma canvas to the viewport.
 *
 * The generated case-study components are absolutely positioned at a fixed
 * DESIGN_WIDTH, so they can only be made responsive by scaling the whole thing.
 * `transform` doesn't affect layout flow, so the scaled canvas still occupies
 * its unscaled height in the document — hence the compensating negative
 * `marginBottom`, which is measured rather than hardcoded.
 *
 * Spread the returned `style` onto the scaled element and attach `ref` to it.
 */
export function useCanvasScale({ maxScale, designHeight }: Options) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const update = () => setScale(Math.min(window.innerWidth / DESIGN_WIDTH, maxScale));
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, [maxScale]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const style: CSSProperties = {
    width: DESIGN_WIDTH,
    height: designHeight,
    transformOrigin: "top left",
    transform: scale === 1 ? undefined : `scale(${scale})`,
    marginBottom: scale === 1 ? undefined : height * scale - height,
  };

  return { ref, style };
}
