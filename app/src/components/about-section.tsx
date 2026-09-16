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
  AnimatePresence,
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
import { Rise } from "./motion-text";
import styles from "./about-section.module.css";
import { EditorialTitle, Magnetic } from "./premium-motion";
import { editorialAccents } from "@/content/editorial-accents";

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
  const planY = useTransform(scrollYProgress, [0, 1], [22, -20]);
  const palmY = useTransform(scrollYProgress, [0, 1], [-14, 16]);
  const aboutBody = t.aboutText.replace(/^[^.]+\.\s*/, "");
  const [activeStep, setActiveStep] = useState(0);
  const active = t.steps[activeStep];
  const stepLabels =
    locale === "es"
      ? { step: "Paso", of: "de", previous: "Paso anterior", next: "Siguiente paso", action: ["Hablemos", "Explorar proyectos", "Abrir calculadora", "Preparar consulta"] }
      : locale === "fr"
        ? { step: "Étape", of: "sur", previous: "Étape précédente", next: "Étape suivante", action: ["Parlons-en", "Explorer les projets", "Ouvrir le simulateur", "Préparer ma demande"] }
        : { step: "Step", of: "of", previous: "Previous step", next: "Next step", action: ["Let’s talk", "Explore projects", "Open calculator", "Prepare inquiry"] };
  const stepLinks = [`/contacto?lang=${locale}`, `/proyectos?lang=${locale}`, `/calculadora?lang=${locale}`, `/contacto?lang=${locale}`];
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
          <motion.div
            className={styles.sitePlan}
            style={{ y: reduced ? 0 : planY }}
            aria-hidden="true"
          >
            <Image
              src="/derived/ambient-site-plan-v1.webp"
              alt=""
              fill
              unoptimized
              loading="eager"
              sizes="(max-width: 820px) 100vw, 60vw"
              className={styles.sitePlanImage}
            />
          </motion.div>
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
          <motion.div
            className={styles.palmOverlay}
            style={{ y: reduced ? 0 : palmY }}
            aria-hidden="true"
          >
            <Image
              src="/derived/ambient-palm-overlay-v1.webp"
              alt=""
              fill
              unoptimized
              loading="eager"
              sizes="(max-width: 820px) 0px, 56vw"
              className={styles.palmImage}
            />
          </motion.div>
          <div className={styles.stageSignature} aria-hidden="true">
            <span>AP</span>
            <span>PERSONAL</span>
          </div>
        </motion.div>

        {/*
          Secuencia de entrada: el titular sube linea a linea, la firma se
          escribe despues y el cuerpo llega al final. Cada pieza espera a la
          anterior para que se lea como una presentacion, no como un bloque.
        */}
        <div className={styles.copy}>
          <EditorialTitle id="about-title" text={d.aboutTitle} accent={editorialAccents[locale].aboutPage}/>
          <p className={styles.intro}>{d.aboutIntro}</p>
          <Rise as="p" className={styles.body} delay={0.1}>
            {aboutBody}
          </Rise>
          <Rise delay={0.18}>
            <a className={styles.cta} href={`/contacto?lang=${locale}`}>
              <span>{t.aboutCTA}</span>
              <span className={styles.ctaArrow}>
                <ArrowUpRight size={21} aria-hidden="true" />
              </span>
            </a>
          </Rise>
        </div>
      </section>
      <section
        className="section process-section"
        aria-labelledby="process-title"
      >
        <div className="process-heading">
          <div className="section-heading">
            <EditorialTitle id="process-title" text={d.processTitle} accent={editorialAccents[locale].process}/>
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
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeStep}
              className="process-spotlight-copy"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: reduced ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <span>{stepLabels.step} {activeStep + 1} {stepLabels.of} 4</span>
              <h3>{active.title}</h3>
              <p>{active.text}</p>
            </motion.div>
          </AnimatePresence>
          <div className="process-spotlight-actions">
            <Magnetic strength={0.2}>
              <a className="button button-primary" href={stepLinks[activeStep]}>
                {stepLabels.action[activeStep]}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </Magnetic>
            <div className="process-navigation" aria-label={t.processLabel}>
              <Magnetic strength={0.25}>
                <button type="button" onClick={() => setActiveStep((activeStep + 3) % 4)} aria-label={stepLabels.previous}>
                  <ArrowLeft size={19} />
                </button>
              </Magnetic>
              <Magnetic strength={0.25}>
                <button type="button" onClick={() => setActiveStep((activeStep + 1) % 4)} aria-label={stepLabels.next}>
                  <ArrowRight size={19} />
                </button>
              </Magnetic>
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
        <EditorialTitle id="guide-title" text={d.guideTitle} accent={editorialAccents[locale].guide}/>
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
