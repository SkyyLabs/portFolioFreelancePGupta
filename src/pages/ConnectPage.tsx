import { useRef, useState, type FormEvent } from "react";
import { CONTACT_ENDPOINT, EMAIL, WEB3FORMS_KEY } from "@/config/site";
import { FAQ } from "@/config/structured-data";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type Status = "idle" | "sending" | "sent" | "error";

type Fields = { name: string; email: string; phone: string; message: string };

const EMPTY: Fields = { name: "", email: "", phone: "", message: "" };

/**
 * Heading, then the form card. The success state is not revealed: it replaces
 * the form after a submit, long past any scroll trigger.
 */
const REVEAL_SELECTORS = [".connect-title", ".connect-card", ".connect-faq"] as const;

const FIELDS = [
  { key: "name", label: "Name", type: "text", placeholder: "Jane Smith", required: false },
  { key: "email", label: "Email", type: "email", placeholder: "jane@example.com", required: true },
  { key: "phone", label: "Phone", type: "tel", placeholder: "+91 00000 00000", required: false },
] as const;

export default function ConnectPage() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");

  // Honeypot. A person never sees this, so a true value means a bot.
  const [botcheck, setBotcheck] = useState(false);

  const root = useRef<HTMLDivElement>(null);
  useScrollReveal(root, REVEAL_SELECTORS);

  // Email and message are compulsory; the button stays disabled until both
  // carry something more than whitespace.
  const canSubmit = fields.email.trim() !== "" && fields.message.trim() !== "";

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || status === "sending") return;
    setStatus("sending");

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          // Name is optional, so fall back rather than sending a subject that
          // trails off into nothing.
          subject: fields.name.trim()
            ? `Portfolio enquiry from ${fields.name.trim()}`
            : "Portfolio enquiry",
          from_name: "Pooja Singhal portfolio",
          // Without this, hitting reply answers Web3Forms rather than the
          // person who wrote in.
          replyto: fields.email.trim(),
          ...fields,
          botcheck,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message ?? "Submission failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div ref={root} className="connect-page page-enter" data-name="Connect">
      <div className="connect-body">
        {status === "sent" ? (
          <div className="connect-success">
            <div className="connect-success-mark">✦</div>
            <h2 className="connect-success-title">Message sent!</h2>
            <p className="connect-success-body">
              Thanks for reaching out. I&rsquo;ll get back to you within 48 hours.
            </p>
          </div>
        ) : (
          <>
            <h1 className="connect-title">Let&rsquo;s Get In Touch.</h1>

            <form className="connect-form" onSubmit={handleSubmit}>
              <div className="connect-card">
                {FIELDS.map(({ key, label, type, placeholder, required }) => (
                  <div className="connect-field" key={key}>
                    <label className="connect-label" htmlFor={key}>
                      {label}
                    </label>
                    <input
                      id={key}
                      className="connect-input"
                      type={type}
                      placeholder={placeholder}
                      required={required}
                      value={fields[key]}
                      onChange={set(key)}
                    />
                  </div>
                ))}

                <div className="connect-field">
                  <label className="connect-label" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    className="connect-input"
                    rows={2}
                    required
                    placeholder="Let me know what you have in mind."
                    value={fields.message}
                    onChange={set("message")}
                  />
                </div>

                {/* Web3Forms discards any submission with this set. It is
                    hidden from people and from assistive technology, so only a
                    script filling every field will trip it. */}
                <input
                  type="checkbox"
                  name="botcheck"
                  className="connect-botcheck"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  checked={botcheck}
                  onChange={(e) => setBotcheck(e.target.checked)}
                />

                <button
                  className="connect-submit"
                  type="submit"
                  disabled={!canSubmit || status === "sending"}
                >
                  <span>{status === "sending" ? "Sending…" : "Send Message"}</span>
                  <span className="connect-submit-arrow">→</span>
                </button>

                {status === "error" && (
                  <p className="connect-error" role="alert">
                    Something went wrong. Please email{" "}
                    <a href={`mailto:${EMAIL}`}>{EMAIL}</a> directly.
                  </p>
                )}
              </div>
            </form>

            {/*
              These answers back the `FAQPage` block in `structured-data.ts`.
              Both read from the same `FAQ` constant on purpose: structured data
              whose answers are not visible on the page is a manual-action risk,
              so the two cannot be allowed to drift apart.
            */}
            <section className="connect-faq" aria-labelledby="faq-heading">
              <h2 className="connect-faq-title" id="faq-heading">
                Frequently asked
              </h2>
              <dl className="connect-faq-list">
                {FAQ.map(({ q, a }) => (
                  <div className="connect-faq-item" key={q}>
                    <dt className="connect-faq-q">{q}</dt>
                    <dd className="connect-faq-a">{a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
