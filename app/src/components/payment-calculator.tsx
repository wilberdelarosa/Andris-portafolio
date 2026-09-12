"use client";
import { useState } from "react";
import {
  ArrowCounterClockwise,
  DownloadSimple,
  Info,
} from "@phosphor-icons/react";
import { designCopy } from "@/content/design-copy";
import { calculatePayment } from "@/lib/payment";
import { localeTags } from "@/content/copy";
import { useExperience } from "./experience-provider";
import { SectionTitle, Reveal, downloadText } from "./ui";

export function PaymentCalculator() {
  const { t, locale } = useExperience();
  const [price, setPrice] = useState("150000");
  const [months, setMonths] = useState("24");
  const [signing, setSigning] = useState("10");
  const [construction, setConstruction] = useState("40");
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
  const reset = () => {
    setPrice("150000");
    setMonths("24");
    setSigning("10");
    setConstruction("40");
  };
  const download = () => {
    if (!plan) return;
    downloadText(
      "andris-pena-escenario.txt",
      `Andris Peña | ${t.calcBadge}\n\n${t.propertyValue}: ${money(plan.total)}\n${t.signing} (${signing}%): ${money(plan.signing)}\n${t.construction} (${construction}%): ${money(plan.construction)}\n${t.months}: ${months}\n${t.monthly}: ${money(plan.monthly)}\n${t.lastPayment}: ${money(plan.lastMonthly)}\n${t.delivery} (${plan.deliveryPercent}%): ${money(plan.delivery)}\n\n${t.calcNote}`,
    );
  };
  return (
    <section id="inversion" className="section calculator-section">
      <SectionTitle
        title={designCopy[locale].calcTitle}
        description={t.calcIntro}
      />
      <Reveal className="calculator">
        <div className="calculator-controls">
          <div className="calculator-top">
            <p className="calculator-badge">{t.calcBadge}</p>
            <button className="text-button" onClick={reset}>
              <ArrowCounterClockwise size={16} />
              {t.reset}
            </button>
          </div>
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
              <div className="result-label">
                <span className="tiny-line" />
                {t.monthly}
              </div>
              <div className="monthly-amount">{money(plan.monthly)}</div>
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
                <DownloadSimple size={19} />
                {t.downloadPlan}
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
