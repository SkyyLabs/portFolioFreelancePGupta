import { EMAIL } from "@/config/site";

const FEEDBACK = "Copied!";
const FEEDBACK_MS = 1800;

/**
 * Copies the contact email and flashes confirmation on the button label.
 *
 * Uses `execCommand` rather than the Clipboard API: the site is embedded in a
 * sandboxed iframe during Figma Make preview, where the Clipboard API is
 * blocked.
 */
export function copyEmailToClipboard(button: HTMLElement) {
  const scratch = document.createElement("textarea");
  scratch.value = EMAIL;
  scratch.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(scratch);
  scratch.select();
  document.execCommand("copy");
  document.body.removeChild(scratch);

  const label = button.querySelector("p") ?? (button.tagName === "P" ? button : null);
  if (!label) return;

  const original = label.textContent;
  label.textContent = FEEDBACK;
  setTimeout(() => {
    label.textContent = original;
  }, FEEDBACK_MS);
}
