"use client";
import { useLayoutEffect, useState } from "react";
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
import { useProjects } from "./projects-provider";
import { journeyCopy } from "@/content/journey-copy";
import { EditorialTitle, DecorativeLayer } from "./premium-motion";
import { editorialAccents } from "@/content/editorial-accents";
import { contactCopy } from "@/content/contact-copy";
import { PrivacyNotice } from "./privacy-notice";
import {
  buildAlterEstateLeadPayload,
  getSafeLeadWebhookUrl,
  type ContactLeadInput,
} from "@/lib/lead-payload";
import { formatPhone, formatPhoneWithCaret } from "@/lib/phone-format";
import { createLead } from "@/lib/cms/lead-writer";
import { getPublicProjectName } from "@/lib/public-project-label";
import { CountryCombobox } from "./country-combobox";

type LeadDelivery =
  | { state: "idle" }
  | { state: "skipped" }
  | { state: "sending" }
  | { state: "sent"; reference?: string }
  | { state: "failed" };

export function ContactSection({ projectSlug = "" }: { projectSlug?: string }) {
  const { t, locale, hideProjectNames } = useExperience();
  const j = journeyCopy[locale];
  const c = contactCopy[locale];
  const { projects, loading: projectsLoading } = useProjects();
  const [selectedProject, setSelectedProject] = useState(projectSlug);
  const selectedProjectRecord = projects.find((item) => item.slug === selectedProject);
  const [summary, setSummary] = useState("");
  const [copied, setCopied] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [consent, setConsent] = useState(false);
  /*
   * Mascara de telefono. Es un campo controlado solo para poder reagrupar lo
   * tecleado; no valida ni bloquea nada, asi que pegar un numero completo,
   * escribir un prefijo europeo o dejarlo a medias sigue funcionando igual.
   */
  const [phone, setPhone] = useState("");
  const [delivery, setDelivery] = useState<LeadDelivery>({ state: "idle" });
  /**
   * `null` mientras no se ha intentado guardar. `false` avisa al visitante de
   * que su consulta no quedó registrada y conviene enviarla por WhatsApp.
   */
  const [leadStored, setLeadStored] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || advisor.email;
  const whatsapp =
    process.env.NEXT_PUBLIC_WHATSAPP?.replace(/\D/g, "") || advisor.whatsapp;
  const leadWebhookUrl = getSafeLeadWebhookUrl(
    process.env.NEXT_PUBLIC_LEAD_WEBHOOK_URL,
  );
  useLayoutEffect(() => {
    const selected = new URLSearchParams(location.search).get("proyecto");
    // A static page receives this selection only after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedProject(selected || projectSlug);
  }, [projectSlug]);
  const prepare = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (!form.reportValidity() || data.get("consent") !== "accepted") return;
    const selected = projects.find((item) => item.slug === selectedProject);
    const selectedProjectName = selected
      ? getPublicProjectName(selected, projects.findIndex((item) => item.slug === selected.slug), hideProjectNames, locale)
      : "";
    const lead: ContactLeadInput = {
      name: String(data.get("name")).trim(),
      email: String(data.get("email")).trim(),
      phone: String(data.get("phone")).trim(),
      country: String(data.get("country")).trim(),
      budget: String(data.get("budget") ?? "").trim(),
      timeframe: String(data.get("timeframe") ?? "").trim(),
      project: selectedProjectName,
      interest: String(data.get("interest") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      locale,
      pageUrl: window.location.href,
    };
    setCopied(false);
    setSummary(
      `Andris Peña | ${t.portfolio}\n\n${t.name}: ${lead.name}\n${t.email}: ${lead.email}\n${c.phone}: ${lead.phone}\n${c.country}: ${lead.country}\n${c.budget}: ${lead.budget}\n${c.timeframe}: ${lead.timeframe}\n${j.projectField}: ${lead.project || j.general}\n${t.interest}: ${lead.interest}\n${t.message}: ${lead.message || "—"}\n\n${c.consentRecord}`,
    );
    // El lead se registra unicamente en Supabase: es la bandeja que ve el
    // panel. Ya no hay copia en `localStorage`, que solo quedaba en el
    // navegador del visitante y por tanto nunca llegaba a nadie.
    //
    // Si la escritura falla no se silencia: se avisa en el resumen para que
    // la persona lo mande por WhatsApp, que es el canal que de verdad llega.
    const recordLead = (status: "prepared" | "sent" | "failed") => {
      // Sin `await`: el visitante no debe esperar a la red para ver su
      // resumen y poder seguir por WhatsApp.
      void createLead({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        country: lead.country,
        budget: lead.budget,
        timeframe: lead.timeframe,
        project: lead.project || String(j.general),
        interest: lead.interest,
        message: lead.message,
        locale,
        pageUrl: lead.pageUrl,
        channel: "summary" as const,
        status,
        projectId: projects.find((item) => item.slug === selectedProject)?.id,
      })
        .then(() => setLeadStored(true))
        .catch(() => setLeadStored(false));
    };
    if (!leadWebhookUrl) {
      recordLead("prepared");
      setDelivery({ state: "skipped" });
      return;
    }
    setSubmitting(true);
    setDelivery({ state: "sending" });
    try {
      const response = await fetch(leadWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildAlterEstateLeadPayload(lead)),
      });
      const result = (await response.json().catch(() => ({}))) as {
        leadId?: string | number;
        leadUid?: string;
        dealUid?: string;
        logId?: string | number;
      };
      if (!response.ok) throw new Error("Lead webhook failed");
      recordLead("sent");
      setDelivery({
        state: "sent",
        reference:
          result.dealUid ??
          result.leadUid ??
          (result.leadId ? String(result.leadId) : undefined) ??
          (result.logId ? String(result.logId) : undefined),
      });
    } catch {
      recordLead("failed");
      setDelivery({ state: "failed" });
    } finally {
      setSubmitting(false);
    }
  };
  const deliveryMessage =
    delivery.state === "sent" && delivery.reference
      ? `${c.leadStatus.sent} Ref. ${delivery.reference}`
      : delivery.state === "idle"
        ? ""
        : c.leadStatus[delivery.state];
  return (
    <section className="section contact-section" id="contacto">
      <DecorativeLayer/>
      <Reveal className="contact-copy">
        <EditorialTitle text={designCopy[locale].contactTitle} accent={editorialAccents[locale].contactPage}/>
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
              {c.phone}
              <input
                name="phone"
                type="tel"
                inputMode="tel"
                required
                minLength={7}
                maxLength={32}
                autoComplete="tel"
                placeholder="+1 809 000 0000"
                value={phone}
                onChange={(event) => {
                  const input = event.currentTarget;
                  const next = formatPhoneWithCaret(
                    input.value,
                    input.selectionStart ?? input.value.length,
                  );
                  // Se escribe primero en el DOM para poder recolocar el
                  // cursor en el mismo evento; React recibe el mismo valor,
                  // asi que no hay salto ni parpadeo.
                  input.value = next.value;
                  input.setSelectionRange(next.caret, next.caret);
                  setPhone(next.value);
                }}
                onBlur={(event) => {
                  const cleaned = formatPhone(event.currentTarget.value);
                  // Un "+" o un prefijo suelto no es un telefono: se limpia
                  // para que `required` siga avisando.
                  setPhone(/\d/.test(cleaned.replace(/^\+\d{1,3}$/, "")) ? cleaned : "");
                }}
              />
            </label>
          </div>
          <label>
            {j.projectField}
            <select
              name="project"
              value={selectedProjectRecord
                ? getPublicProjectName(selectedProjectRecord, projects.findIndex((item) => item.slug === selectedProjectRecord.slug), hideProjectNames, locale)
                : ""}
              disabled={projectsLoading}
              onChange={(event) => {
                const project = projects.find((item) =>
                  item.slug === event.target.value ||
                  getPublicProjectName(item, projects.findIndex((candidate) => candidate.slug === item.slug), hideProjectNames, locale) === event.target.value,
                );
                setSelectedProject(project?.slug ?? "");
              }}
            >
              <option value="">
                {projectsLoading
                  ? locale === "es"
                    ? "Cargando proyectos…"
                    : locale === "fr"
                      ? "Chargement des projets…"
                      : "Loading projects…"
                  : j.general}
              </option>
              {projects.map((project) => {
                const displayName = getPublicProjectName(project, projects.findIndex((item) => item.slug === project.slug), hideProjectNames, locale);
                return <option key={project.slug} value={displayName}>{displayName}</option>;
              })}
            </select>
          </label>
          <label>
            {t.interest}
            <select name="interest">
              {t.interests.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          {/*
            El cliente pidió que el formulario capture "lo preciso" y no dé
            lucha: solo nombre y teléfono son obligatorios, porque el canal
            real de respuesta es WhatsApp. Todo lo demás ayuda a preparar la
            conversación, pero no debe frenar el envío, así que vive aquí
            plegado y opcional.
          */}
          <details className="contact-more">
            <summary>{c.moreDetails}</summary>
            <div className="contact-more-body">
              <div className="form-row">
                <label>
                  {t.email}
                  <input
                    name="email"
                    type="email"
                    maxLength={254}
                    autoComplete="email"
                    placeholder={t.emailPlaceholder}
                  />
                </label>
                <label>
                  {c.country}
                  <CountryCombobox
                    locale={locale}
                    label={c.country}
                    placeholder={c.countryPlaceholder}
                    searchPlaceholder={c.countrySearchPlaceholder}
                    noResults={c.countryNoResults}
                  />
                </label>
              </div>
              <div className="form-row">
                <label>{c.budget}<select name="budget" defaultValue=""><option value="">{c.choose}</option>{c.budgets.map((value) => <option key={value}>{value}</option>)}</select></label>
                <label>{c.timeframe}<select name="timeframe" defaultValue=""><option value="">{c.choose}</option>{c.timeframes.map((value) => <option key={value}>{value}</option>)}</select></label>
              </div>
              <label>
                {t.message}
                <textarea
                  name="message"
                  rows={3}
                  maxLength={2000}
                  placeholder={t.messagePlaceholder}
                />
              </label>
            </div>
          </details>
          <label className="checkbox-label">
            <input type="checkbox" name="consent" value="accepted" required checked={consent} onChange={(event) => setConsent(event.target.checked)} />
            <span>
              {c.consent}{" "}
              <button
                type="button"
                className="inline-link"
                onClick={() => setPrivacy(true)}
              >
                {c.terms}
              </button>
            </span>
          </label>
          <p className="field-hint" id="contact-submit-hint">{c.requiredHint}</p>
          <button className="button button-primary form-submit" type="submit" disabled={!consent || submitting} aria-describedby="contact-submit-hint">
            {submitting ? c.leadStatus.sending : t.prepare}
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
        description={delivery.state === "sent" ? c.leadStatus.sent : t.preparedText}
      >
        {deliveryMessage && (
          <p
            className={`lead-delivery-status lead-delivery-status-${delivery.state}`}
            role={delivery.state === "failed" ? "alert" : "status"}
          >
            {deliveryMessage}
          </p>
        )}
        {leadStored === false && (
          <p className="lead-delivery-status lead-delivery-status-failed" role="alert">
            {c.storeFailed}
          </p>
        )}
        <div className="consultation-summary">
          <Check size={26} className="summary-check" />
          <pre>{summary}</pre>
        </div>
        
        {whatsapp && (
          <a
            className="button button-primary"
            style={{ width: "100%", height: "54px", marginBottom: "16px", fontSize: "16px", background: "#25D366", color: "#fff", borderColor: "#25D366" }}
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(summary)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsappLogo size={22} weight="fill" />
            {t.sendWhatsApp}
          </a>
        )}
        <div className="summary-actions">
          <button
            className="button button-outline"
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
            href={`mailto:${email}?subject=${encodeURIComponent("Consulta a Andris Peña")}&body=${encodeURIComponent(summary)}`}
          >
            <EnvelopeSimple size={20} />
            {t.sendEmail}
            <ArrowUpRight />
          </a>
        )}
        {!email && !whatsapp && <p className="field-hint">{t.noContact}</p>}
      </Modal>
      <Modal
        open={privacy}
        onOpenChange={setPrivacy}
        title={c.privacyTitle}
        description={c.privacySummary}
      >
        <PrivacyNotice />
      </Modal>
    </section>
  );
}
