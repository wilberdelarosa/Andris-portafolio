"use client";
import Link from "next/link";
import {
  ExperienceProvider,
  useExperience,
} from "@/components/experience-provider";
import { Shell } from "@/components/shell";
function Missing() {
  const { t, locale } = useExperience();
  return (
    <Shell detail>
      <section className="not-found">
        <span>404 / ANDRIS PEÑA</span>
        <h1>{t.notFound}</h1>
        <p>{t.notFoundText}</p>
        <Link className="button button-primary" href={`/?lang=${locale}`}>
          {t.home}
        </Link>
      </section>
    </Shell>
  );
}
export default function NotFound() {
  return (
    <ExperienceProvider>
      <Missing />
    </ExperienceProvider>
  );
}
