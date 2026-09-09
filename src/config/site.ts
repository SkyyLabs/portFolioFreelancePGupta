/**
 * Every externally-facing value the site depends on.
 *
 * Kept in one module so contact details and third-party links can be changed
 * without reading component code. Nothing here is secret: the site is a static
 * bundle, so all of it ships to the browser.
 */

export const EMAIL = "pooja.guptavv@gmail.com";
export const LINKEDIN = "https://www.linkedin.com/in/pooja-singhal-65205121b/";
export const BEHANCE = "https://www.behance.net/poojagupta107";

/** Served from `public/`. */
export const RESUME_URL = "/resume.pdf";

/**
 * Web3Forms access key for the contact form — create one free at
 * https://web3forms.com (enter the destination inbox; no account needed).
 *
 * Public by design: it only authorises posting to the inbox it was issued for.
 * While empty, the form fails into its error state, which points visitors at
 * EMAIL instead.
 */
export const WEB3FORMS_KEY = "";

/**
 * Figma prototype for the Lister case study ("Open the Prototype" button).
 * Share > Anyone with the link > Can view.
 *
 * While empty, the button is inert rather than sending visitors to a dead link.
 */
export const PROTOTYPE_URL = "";

export const CONTACT_ENDPOINT = "https://api.web3forms.com/submit";
