"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calculator,
  ChatCenteredText,
  Compass,
  Plus,
} from "@phosphor-icons/react";
import { useRef, useState, type PointerEvent } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useExperience } from "./experience-provider";
import { designCopy } from "@/content/design-copy";
import styles from "./about-section.module.css";

export function AboutSection() {
  const { t, locale } = useExperience();
  const d = designCopy[locale];
  const section = useRef<HTMLElement>(null);
  const stageInView = useInView(section, { amount: 0.3, once: true });
  const reduced = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const portraitX = useSpring(pointerX, { stiffness: 72, damping: 22 });
  const portraitY = useSpring(pointerY, { stiffness: 72, damping: 22 });
  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start end", "end start"],
  });
  const sceneY = useTransform(scrollYProgress, [0, 1], [34, -34]);
  const portraitScrollY = useTransform(scrollYProgress, [0, 1], [26, -30]);
  const monogramY = useTransform(scrollYProgress, [0, 1], [-18, 22]);
  const aboutBody = t.aboutText.replace(/^[^.]+\.\s*/, "");
  const [activeStep, setActiveStep] = useState(0);
  const active = t.steps[activeStep];
  const stepLabels =
    locale === "es"
      ? { step: "Paso", of: "de", previous: "Paso anterior", next: "Siguiente paso", action: ["Hablemos", "Explorar proyectos", "Abrir calculadora", "Preparar consulta"] }
      : locale === "fr"
        ? { step: "Étape", of: "sur", previous: "Étape précédente", next: "Étape suivante", action: ["Parlons-en", "Explorer les projets", "Ouvrir le simulateur", "Préparer ma demande"] }
        : { step: "Step", of: "of", previous: "Previous step", next: "Next step", action: ["Let’s talk", "Explore projects", "Open calculator", "Prepare inquiry"] };
  const stepLinks = ["#contacto", "#proyectos", `/calculadora?lang=${locale}`, "#contacto"];
  const stepIcons = [ChatCenteredText, Compass, Calculator, ArrowUpRight];

  function followPointer(event: PointerEvent<HTMLElement>) {
    if (
      reduced ||
      event.pointerType !== "mouse" ||
      !window.matchMedia("(min-width: 900px) and (pointer: fine)").matches
    ) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 26);
    pointerY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 16);
  }

  return (
    <>
      <section
        className={`section ${styles.about}`}
        id="sobre-mi"
        aria-labelledby="about-title"
        ref={section}
      >
        <motion.div
          className={`${styles.stage} ${stageInView ? styles.stageInView : ""}`}
          onPointerMove={followPointer}
          onPointerLeave={() => {
            pointerX.set(0);
            pointerY.set(0);
          }}
        >
          <motion.div
            className={styles.scene}
            style={{ y: reduced ? 0 : sceneY }}
            aria-hidden="true"
          >
            <Image
              src="/derived/hero-atmosphere-v3.webp"
              alt=""
              fill
              sizes="(max-width: 760px) 100vw, 52vw"
              className={styles.sceneImage}
            />
          </motion.div>
          <div className={styles.sceneVeil} aria-hidden="true" />
          <div className={styles.arch} aria-hidden="true" />
          <motion.div
            className={styles.monogramDepth}
            style={{ y: reduced ? 0 : monogramY }}
            aria-hidden="true"
          >
            <p className={styles.monogram}>ANDRIS</p>
          </motion.div>
          <div className={styles.stageMeta}>
            <span>{t.role}</span>
            <span aria-hidden="true" />
            <span>Punta Cana, RD</span>
          </div>
          <motion.div
            className={styles.portraitDepth}
            style={{ y: reduced ? 0 : portraitScrollY }}
            aria-hidden="true"
          >
            <motion.div
              className={styles.portraitPointer}
              style={{ x: reduced ? 0 : portraitX, y: reduced ? 0 : portraitY }}
            >
              <div className={styles.portraitLift}>
                <Image
                  src="/derived/andris-white-shirt.webp"
                  alt=""
                  fill
                  unoptimized
                  sizes="(max-width: 520px) 310px, (max-width: 900px) 410px, 530px"
                  className={styles.portrait}
                />
              </div>
            </motion.div>
          </motion.div>
          <div className={styles.stageSignature} aria-hidden="true">
            <span>AP</span>
            <span>PERSONAL</span>
          </div>
        </motion.div>

        <div className={styles.copy}>
          <h2 id="about-title">{d.aboutTitle}</h2>
          <p className={styles.intro}>{d.aboutIntro}</p>
          <p className={styles.body}>{aboutBody}</p>
          <a className={styles.cta} href="#contacto">
            <span>{t.aboutCTA}</span>
            <span className={styles.ctaArrow}>
              <ArrowUpRight size={21} aria-hidden="true" />
            </span>
          </a>
        </div>
      </section>
      <section
        className="section process-section"
        aria-labelledby="process-title"
      >
        <div className="process-heading">
          <div className="section-heading">
            <span className="process-eyebrow">{t.processLabel}</span>
            <h2 id="process-title">{d.processTitle}</h2>
          </div>
          <p className="process-count" aria-live="polite">
            <strong>0{activeStep + 1}</strong> / 04
          </p>
        </div>
        <ol className="process-list" aria-label={t.processLabel}>
          {t.steps.map((step, index) => (
            <li className="process-step" key={step.title}>
              <button
                className={activeStep === index ? "is-active" : ""}
                type="button"
                onClick={() => setActiveStep(index)}
                aria-pressed={activeStep === index}
              >
                <span className="step-number" aria-hidden="true">0{index + 1}</span>
                <span className="step-icon" aria-hidden="true">
                  {(() => {
                    const Icon = stepIcons[index];
                    return <Icon size={20} />;
                  })()}
                </span>
                <span className="step-title">{step.title}</span>
                <span className="step-summary">{step.text}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="process-spotlight" aria-live="polite">
          <div className="process-spotlight-index" aria-hidden="true">
            <span>0{activeStep + 1}</span>
            <i />
            <small>04</small>
          </div>
          <div className="process-spotlight-copy">
            <span>{stepLabels.step} {activeStep + 1} {stepLabels.of} 4</span>
            <h3>{active.title}</h3>
            <p>{active.text}</p>
          </div>
          <div className="process-spotlight-actions">
            <a className="button button-primary" href={stepLinks[activeStep]}>
              {stepLabels.action[activeStep]}
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <div className="process-navigation" aria-label={t.processLabel}>
              <button type="button" onClick={() => setActiveStep((activeStep + 3) % 4)} aria-label={stepLabels.previous}>
                <ArrowLeft size={19} />
              </button>
              <button type="button" onClick={() => setActiveStep((activeStep + 1) % 4)} aria-label={stepLabels.next}>
                <ArrowRight size={19} />
              </button>
            </div>
          </div>
        </div>
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
