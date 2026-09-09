import { useState, type FormEvent } from "react";
import { CONTACT_ENDPOINT, EMAIL, WEB3FORMS_KEY } from "@/config/site";

type Status = "idle" | "sending" | "sent" | "error";

type Fields = { name: string; email: string; phone: string; message: string };

const EMPTY: Fields = { name: "", email: "", phone: "", message: "" };

const FIELDS = [
  { key: "name", label: "Name", type: "text", placeholder: "Jane Smith", required: true },
  { key: "email", label: "Email", type: "email", placeholder: "jane@example.com", required: true },
  { key: "phone", label: "Phone", type: "tel", placeholder: "+91 00000 00000", required: false },
] as const;

export default function ConnectPage() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Portfolio enquiry from ${fields.name}`,
          from_name: "Portfolio contact form",
          ...fields,
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
    <div className="connect-page" data-name="Connect">
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

                <button className="connect-submit" type="submit" disabled={status === "sending"}>
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
          </>
        )}
      </div>
    </div>
  );
}
