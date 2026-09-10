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
 * Web3Forms access key for the contact form.
 *
 * **The key decides who receives the mail.** Web3Forms issues a key against one
 * inbox and describes it as an alias for that address; nothing in the request
 * body can redirect a submission elsewhere, which is what stops the service
 * being an open relay. Changing the recipient therefore means issuing a new
 * key, not editing this file's neighbours — `EMAIL` above is only what the page
 * displays and what the mailto links use.
 *
 * Issue one free at https://web3forms.com by entering the destination inbox;
 * no account is needed, and the key is mailed to that address. It must be
 * issued against EMAIL, so that enquiries reach Pooja rather than whoever
 * happened to set the form up.
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
