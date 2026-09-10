/**
 * Every externally-facing value the site depends on.
 *
 * Kept in one module so contact details and third-party links can be changed
 * without reading component code. Nothing here is secret: the site is a static
 * bundle, so all of it ships to the browser.
 */

/**
 * Canonical origin, no trailing slash.
 *
 * Used to build absolute URLs for canonical links, Open Graph tags, the
 * sitemap and the JSON-LD graph — all of which must agree, or search engines
 * treat them as different pages.
 */
export const SITE_URL = "https://pooja-singhal-portfolio.vercel.app";

export const EMAIL = "pooja.guptavv@gmail.com";
export const LINKEDIN = "https://www.linkedin.com/in/pooja-singhal-65205121b/";
export const BEHANCE = "https://www.behance.net/poojagupta107";

/** Served from `public/`. */
export const RESUME_URL = "/resume.pdf";

/**
 * Web3Forms access key for the contact form — create one free at
 * https://web3forms.com (enter the destination inbox; no account needed).
 *
 * Public by design: it only authorises posting to the inbox it was issued for,
 * so it belongs in source rather than an env var. While empty, the form fails
 * into its error state, which points visitors at EMAIL instead.
 */
export const WEB3FORMS_KEY = "fadcf53e-9b36-4430-8c13-0ebbf865b6a9";

/**
 * Interactive prototype for the Lister case study ("Open the Prototype" button).
 * Opens in a new tab. While empty, the button is inert rather than sending
 * visitors to a dead link.
 */
export const PROTOTYPE_URL = "https://claude.ai/public/artifacts/a7ec3613-4a7d-41a2-8073-f920c1719a1a";

export const CONTACT_ENDPOINT = "https://api.web3forms.com/submit";
