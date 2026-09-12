"use client";
import { useState } from "react";
import {
  Check,
  Copy,
  DownloadSimple,
  ArrowUpRight,
  EnvelopeSimple,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { useExperience } from "./experience-provider";
import { Modal, Reveal, downloadText } from "./ui";
import { designCopy } from "@/content/design-copy";
import { advisor } from "@/content/advisor";

export function ContactSection() {
  const { t, locale } = useExperience();
  const [summary, setSummary] = useState("");
  const [copied, setCopied] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || advisor.email;
  const whatsapp =
    process.env.NEXT_PUBLIC_WHATSAPP?.replace(/\D/g, "") || advisor.whatsapp;
  const prepare = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setCopied(false);
    setSummary(
      `Andris Peña | ${t.portfolio}\n\n${t.name}: ${String(data.get("name")).trim()}\n${t.email}: ${String(data.get("email")).trim()}\n${t.interest}: ${data.get("interest")}\n${t.message}: ${String(data.get("message")).trim() || "—"}`,
    );
  };
  return (
    <section className="section contact-section" id="contacto">
      <Reveal className="contact-copy">
        <h2>{designCopy[locale].contactTitle}</h2>
        <p>{t.contactIntro}</p>
        <div className="direct-contact">
          <p>{designCopy[locale].contactDirect}</p>
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsappLogo size={21} />
            {advisor.phone}
            <ArrowUpRight size={19} />
          </a>
          <a href={`mailto:${email}`}>
            <EnvelopeSimple size={20} />
            {email}
          </a>
        </div>
        <div className="contact-signoff">
          <span className="signature">Andris Peña</span>
          <span>{t.role}</span>
        </div>
      </Reveal>
      <Reveal className="contact-form-wrap">
        <form className="contact-form" onSubmit={prepare}>
          <div className="form-row">
            <label>
              {t.name}
              <input
                name="name"
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                placeholder={t.namePlaceholder}
              />
            </label>
            <label>
              {t.email}
              <input
                name="email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                placeholder={t.emailPlaceholder}
              />
            </label>
          </div>
          <label>
            {t.interest}
            <select name="interest">
              {t.interests.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            {t.message}
            <textarea
              name="message"
              rows={3}
              maxLength={2000}
              placeholder={t.messagePlaceholder}
            />
          </label>
          <label className="checkbox-label">
            <input type="checkbox" required />
            <span>
              {t.consent}{" "}
              <button
                type="button"
                className="inline-link"
                onClick={() => setPrivacy(true)}
              >
                {t.privacy}
              </button>
            </span>
          </label>
          <button className="button button-primary form-submit" type="submit">
            {t.prepare}
            <ArrowUpRight size={21} />
          </button>
        </form>
      </Reveal>
      <Modal
        open={Boolean(summary)}
        onOpenChange={(open) => {
          if (!open) setSummary("");
        }}
        title={t.prepared}
        description={t.preparedText}
      >
        <div className="consultation-summary">
          <Check size={26} className="summary-check" />
          <pre>{summary}</pre>
        </div>
        <div className="summary-actions">
          <button
            className="button button-primary"
            onClick={() => downloadText("consulta-andris-pena.txt", summary)}
          >
            <DownloadSimple size={18} />
            {t.download}
          </button>
          <button
            className="button button-outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(summary);
                setCopied(true);
              } catch {
                downloadText("consulta-andris-pena.txt", summary);
              }
            }}
          >
            <Copy size={18} />
            {copied ? t.copied : t.copy}
          </button>
        </div>
        {email && (
          <a
            className="contact-channel"
            href={`mailto:${email}?subject=${encodeURIComponent("Consulta · Andris Peña")}&body=${encodeURIComponent(summary)}`}
          >
            <EnvelopeSimple size={20} />
            {t.sendEmail}
            <ArrowUpRight />
          </a>
        )}
        {whatsapp && (
          <a
            className="contact-channel"
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(summary)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsappLogo size={20} />
            {t.sendWhatsApp}
            <ArrowUpRight />
          </a>
        )}
        {!email && !whatsapp && <p className="field-hint">{t.noContact}</p>}
      </Modal>
      <Modal
        open={privacy}
        onOpenChange={setPrivacy}
        title={t.privacy}
        description={t.privacyText}
      >
        <span />
      </Modal>
    </section>
  );
}
