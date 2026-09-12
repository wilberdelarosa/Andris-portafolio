"use client";
import Image from "next/image";
import { ArrowUpRight, Plus } from "@phosphor-icons/react";
import { useExperience } from "./experience-provider";
import { Reveal } from "./ui";
import { designCopy } from "@/content/design-copy";

export function AboutSection() {
  const { t, locale } = useExperience();
  const d = designCopy[locale];
  const aboutBody = t.aboutText.replace(/^[^.]+\.\s*/, "");

  return (
    <>
      <section className="section about-section" id="sobre-mi">
        <Reveal className="about-visual">
          <Image
            src="/derived/andris-coast.webp"
            alt="Andris Peña"
            unoptimized
            fill
            sizes="(max-width: 780px) 100vw, 45vw"
          />
        </Reveal>
        <div className="about-copy">
          <h2>{d.aboutTitle}</h2>
          <p className="about-intro">{d.aboutIntro}</p>
          <p className="about-body">{aboutBody}</p>
          <a className="text-link" href="#contacto">
            {t.aboutCTA}
            <ArrowUpRight size={21} aria-hidden="true" />
          </a>
        </div>
      </section>
      <section
        className="section process-section"
        aria-labelledby="process-title"
      >
        <div className="section-heading">
          <h2 id="process-title">{d.processTitle}</h2>
        </div>
        <ol className="process-list">
          {t.steps.map((step, index) => (
            <li className="process-step" key={step.title}>
              <span className="step-number" aria-hidden="true">
                0{index + 1}
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

export function GuideSection() {
  const { t, locale } = useExperience();
  const d = designCopy[locale];

  return (
    <section className="section guide-section" aria-labelledby="guide-title">
      <div className="section-heading">
        <h2 id="guide-title">{d.guideTitle}</h2>
      </div>
      <div className="faq-list">
        {t.faqs.map((faq) => (
          <details key={faq.q} name="investor-guide">
            <summary>
              <span>{faq.q}</span>
              <Plus size={22} aria-hidden="true" />
            </summary>
            <p>{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
