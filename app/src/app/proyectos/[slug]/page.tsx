import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProject } from "@/content/projects";
import { ExperienceProvider } from "@/components/experience-provider";
import { Shell } from "@/components/shell";
import { ProjectDetail } from "@/components/project-section";
import { ProjectMap } from "@/components/project-map";
import { PaymentCalculator } from "@/components/payment-calculator";
import { GuideSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  return {
    title: project ? `${project.name} · Vista Cana` : "Proyecto no encontrado",
  };
}
export default async function Detail({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  if (!getProject(slug)) notFound();
  const { lang } = await searchParams;
  const locale = lang === "en" || lang === "fr" ? lang : "es";
  return (
    <ExperienceProvider initialLocale={locale}>
      <Shell detail>
        <ProjectDetail />
        <ProjectMap />
        <PaymentCalculator />
        <GuideSection />
        <ContactSection />
      </Shell>
    </ExperienceProvider>
  );
}
