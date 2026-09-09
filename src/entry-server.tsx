import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import App from "./App";

export { ROUTES, ROUTE_META } from "./config/navigation";

/** Renders one route to HTML at build time. See scripts/prerender.mjs. */
export function render(url: string) {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );
}
