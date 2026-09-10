import { prerenderToNodeStream } from "react-dom/static";
import { StaticRouter } from "react-router-dom";
import App from "./App";

export { ROUTES, ROUTE_META } from "./config/navigation";
export { structuredDataFor } from "./config/structured-data";
export { SITE_URL } from "./config/site";

/**
 * Renders one route to HTML at build time. See scripts/prerender.mjs.
 *
 * This uses `prerenderToNodeStream` rather than `renderToString` because the
 * two case study pages are `React.lazy`. `renderToString` cannot wait for a
 * suspended component — it emits the Suspense fallback and moves on, which
 * would ship both case studies as empty HTML and undo the crawlable content
 * work. `prerenderToNodeStream` resolves only once every boundary has settled,
 * so the markup it returns is complete.
 */
export async function render(url: string): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );

  const chunks: Buffer[] = [];
  for await (const chunk of prelude) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}
