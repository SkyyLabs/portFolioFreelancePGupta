import { useEffect, useRef, useState, type CSSProperties } from "react";

/** Width the Figma case-study canvases were designed at. */
export const DESIGN_WIDTH = 1280;

/**
 * Largest the canvas is allowed to grow.
 *
 * Past this the design stops reading as a page and starts reading as a
 * zoomed-in one: body copy outgrows a comfortable measure and the canvas no
 * longer matches the unscaled nav above it. Beyond 1.5x the canvas is centred
 * instead, so the leftover width becomes symmetric margin.
 */
const MAX_SCALE = 1.5;

type Options = {
  /**
   * Explicit canvas height, required only for generated components whose root
   * is `relative size-full` with absolutely-positioned children — those have no
   * intrinsic height and collapse to nothing without it. Components whose root
   * is a flex column size themselves and should omit this.
   */
  designHeight?: number;
};

/**
 * Fits a fixed-width case-study canvas to the viewport.
 *
 * The generated case-study components are absolutely positioned at a fixed
 * DESIGN_WIDTH, so they can only be made responsive by scaling the whole thing.
 * The canvas fills the viewport width up to MAX_SCALE and is centred above it —
 * anchored top-left and uncapped it would either leave a gutter down one side
 * or balloon to double size on a large monitor.
 *
 * `transform` doesn't affect layout flow, so the scaled canvas still occupies
 * its unscaled box in the document. Both the negative `marginBottom` and the
 * centring `marginLeft` compensate for that, and the height is measured rather
 * than hardcoded.
 *
 * Spread the returned `style` onto the scaled element and attach `ref` to it.
 */
export function useCanvasScale({ designHeight }: Options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(DESIGN_WIDTH);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scale = Math.min(viewportWidth / DESIGN_WIDTH, MAX_SCALE);
  const renderedWidth = DESIGN_WIDTH * scale;
  const sideMargin = Math.max(0, (viewportWidth - renderedWidth) / 2);

  const style: CSSProperties = {
    width: DESIGN_WIDTH,
    height: designHeight,
    transformOrigin: "top left",
    transform: scale === 1 ? undefined : `scale(${scale})`,
    marginBottom: scale === 1 ? undefined : height * scale - height,
    marginLeft: sideMargin || undefined,
  };

  return { ref, style };
}
