"use client";
import { useState } from "react";
import {
  ArrowCounterClockwise,
  Buildings,
  FilePdf,
  Info,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { designCopy } from "@/content/design-copy";
import { EditorialTitle } from "./premium-motion";
import { editorialAccents } from "@/content/editorial-accents";
import { calculatePayment } from "@/lib/payment";
import { downloadPaymentPdf } from "@/lib/payment-pdf";
import type { PropertyProject } from "@/content/projects";
import { localeTags } from "@/content/copy";
import { useExperience } from "./experience-provider";
import { useProjects } from "./projects-provider";
import { Reveal } from "./ui";
import { quotesStore } from "@/lib/cms/local-store";

const DEFAULTS = { price: "150000", months: "24", signing: "10", construction: "40" };

export function PaymentCalculator() {
  const { t, locale } = useExperience();
  const { projects, loading: projectsLoading } = useProjects();
  const [projectSlug, setProjectSlug] = useState("");
  const [planIndex, setPlanIndex] = useState(0);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [months, setMonths] = useState(DEFAULTS.months);
  const [signing, setSigning] = useState(DEFAULTS.signing);
  const [construction, setConstruction] = useState(DEFAULTS.construction);

  const project: PropertyProject | null =
    projects.find((item) => item.slug === projectSlug) ?? null;
  const plans = project?.paymentReference.plans ?? [];

  let plan: ReturnType<typeof calculatePayment> | null = null;
  try {
    if (
      [price, months, signing, construction].some(
        (value) => value.trim() === "",
      )
    )
      throw new Error("empty");
    plan = calculatePayment({
      price: Number(price),
      months: Number(months),
      signing: Number(signing),
      construction: Number(construction),
    });
  } catch {
    /* Inline error replaces the result for invalid input. */
  }

  const money = (amount: number) =>
    new Intl.NumberFormat(localeTags[locale], {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const applyPlan = (target: PropertyProject, index: number | null) => {
    const source =
      index !== null && target.paymentReference.plans?.[index]
        ? target.paymentReference.plans[index]
        : target.paymentReference;
    setSigning(String(source.signing));
    setConstruction(String(source.construction));
    if (index === null && target.price.status === "confirmed" && target.price.from) {
      setPrice(String(target.price.from));
    }
  };

  const selectProject = (slug: string) => {
    setProjectSlug(slug);
    setPlanIndex(0);
    const target = projects.find((item) => item.slug === slug);
    if (target) applyPlan(target, target.paymentReference.plans ? 0 : null);
  };

  const selectPlan = (index: number) => {
    setPlanIndex(index);
    if (project) applyPlan(project, index);
  };

  const reset = () => {
    setProjectSlug("");
    setPlanIndex(0);
    setPrice(DEFAULTS.price);
    setMonths(DEFAULTS.months);
    setSigning(DEFAULTS.signing);
    setConstruction(DEFAULTS.construction);
  };

  const download = () => {
    if (!plan) return;
    downloadPaymentPdf({
      locale,
      price: plan.total,
      signingPercent: Number(signing),
      constructionPercent: Number(construction),
      months: Number(months),
      plan,
      projectName: project?.name ?? null,
      reservationNote:
        project?.reservation.amount != null
          ? `${money(project.reservation.amount)}${
              project.reservation.note
                ? ` · ${project.reservation.note[locale]}`
                : ""
            }`
          : null,
    });
    quotesStore.add({
      locale,
      projectSlug: project?.slug ?? null,
      price: plan.total,
      signingPercent: Number(signing),
      constructionPercent: Number(construction),
      months: Number(months),
      monthly: plan.monthly,
      deliveryPercent: plan.deliveryPercent,
      format: "pdf",
    });
  };

  return (
    <section id="inversion" className="section calculator-section">
      <div className="section-heading"><EditorialTitle text={designCopy[locale].calcTitle} accent={editorialAccents[locale].calculator}/><p className="section-description">{t.calcIntro}</p></div>
      <Reveal className="calculator">
        <div className="calculator-controls">
          <div className="calculator-top">
            <p className="calculator-badge">{t.calcBadge}</p>
            <button className="text-button" onClick={reset}>
              <ArrowCounterClockwise size={16} />
              {t.reset}
            </button>
          </div>

          <label className="field-label" htmlFor="calc-project">
            {t.calcProject}
          </label>
          <div className="project-select">
            <Buildings size={18} aria-hidden="true" />
            <select
              id="calc-project"
              value={projectSlug}
              disabled={projectsLoading}
              onChange={(event) => selectProject(event.target.value)}
            >
              <option value="">
                {projectsLoading
                  ? locale === "es"
                    ? "Cargando proyectos…"
                    : locale === "fr"
                      ? "Chargement des projets…"
                      : "Loading projects…"
                  : t.calcProjectNone}
              </option>
              {projects.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {plans.length > 1 && (
            <div className="plan-chips" role="group" aria-label={t.calcPlan}>
              {plans.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  className={`plan-chip${index === planIndex ? " is-active" : ""}`}
                  onClick={() => selectPlan(index)}
                  aria-pressed={index === planIndex}
                >
                  {item.signing}/{item.construction}/{item.delivery}
                  {item.discount && (
                    <small>
                      −{item.discount} {t.calcPlanDiscount}
                    </small>
                  )}
                </button>
              ))}
            </div>
          )}

          {project && (
            <p className="preset-hint">
              {project.price.status === "confirmed" && project.price.from
                ? `${t.propertyValue}: ${money(project.price.from)}`
                : t.pricePending}
              {project.reservation.amount != null &&
                ` · ${t.reservationLabel}: ${money(project.reservation.amount)}`}
            </p>
          )}

          <label className="field-label" htmlFor="property-price">
            {t.propertyValue}
          </label>
          <div className="money-input">
            <span>US$</span>
            <input
              id="property-price"
              type="number"
              min="1"
              max="100000000"
              step="1000"
              inputMode="decimal"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              aria-describedby="calculator-note"
              aria-invalid={!plan}
            />
          </div>
          <p className="field-hint">{t.currency}</p>
          <div className="slider-heading">
            <label htmlFor="construction-months">{t.months}</label>
            <div>
              <input
                id="months-value"
                aria-label={t.months}
                type="number"
                min="1"
                max="120"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
              />
              <span>{t.monthsUnit}</span>
            </div>
          </div>
          <input
            className="range-input"
            id="construction-months"
            type="range"
            min="1"
            max="120"
            value={Number(months) || 1}
            onChange={(event) => setMonths(event.target.value)}
            style={
              {
                "--range-progress": `${Math.max(0, Math.min(100, ((Number(months) - 1) / 119) * 100))}%`,
              } as React.CSSProperties
            }
          />
          <div className="range-labels">
            <span>1 {t.monthsUnit}</span>
            <span>120 {t.monthsUnit}</span>
          </div>
          <div className="percentage-controls">
            <label>
              {t.signing}
              <span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={signing}
                  onChange={(event) => setSigning(event.target.value)}
                />
                %
              </span>
            </label>
            <label>
              {t.construction}
              <span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={construction}
                  onChange={(event) => setConstruction(event.target.value)}
                />
                %
              </span>
            </label>
          </div>
        </div>
        <div
          className="calculator-result"
          aria-live="polite"
          aria-atomic="true"
        >
          {plan ? (
            <>
              {project && <p className="result-project">{project.name}</p>}
              <div className="result-label">
                <span className="tiny-line" />
                {t.monthly}
              </div>
              <div className="monthly-amount">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={plan.monthly}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    style={{ display: "inline-block" }}
                  >
                    {money(plan.monthly)}
                  </motion.span>
                </AnimatePresence>
              </div>
              <p className="monthly-caption">
                {months} {t.monthsUnit} · {t.construction.toLowerCase()}
              </p>
              <div className="payment-bar" aria-hidden="true">
                <span style={{ width: `${signing}%` }} />
                <span style={{ width: `${construction}%` }} />
                <span style={{ width: `${plan.deliveryPercent}%` }} />
              </div>
              <div className="payment-breakdown">
                {[
                  [t.signing, signing, plan.signing],
                  [t.construction, construction, plan.construction],
                  [t.delivery, plan.deliveryPercent, plan.delivery],
                ].map(([label, percent, value], i) => (
                  <div key={String(label)}>
                    <span>
                      <i className={`payment-dot dot-${i}`} />
                      {label}
                      <small>{percent}%</small>
                    </span>
                    <strong>{money(Number(value))}</strong>
                  </div>
                ))}
              </div>
              <p className="rounding-note">
                {t.lastPayment}: {money(plan.lastMonthly)}
              </p>
              <button className="button button-sand" onClick={download}>
                <FilePdf size={19} />
                {t.downloadPdf}
              </button>
            </>
          ) : (
            <p role="alert" className="calculator-error">
              {t.calcError}
            </p>
          )}
        </div>
      </Reveal>
      <p className="calculator-note" id="calculator-note">
        <Info size={18} aria-hidden="true" />
        <span>{t.calcNote}</span>
      </p>
    </section>
  );
}
