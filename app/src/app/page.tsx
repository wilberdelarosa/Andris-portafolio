import { ExperienceProvider } from "@/components/experience-provider";
import { Shell } from "@/components/shell";
import { Hero } from "@/components/hero";
import { ProjectSection } from "@/components/project-section";
import { ProjectMap } from "@/components/project-map";
import { AboutSection, GuideSection } from "@/components/about-section";
import { PaymentCalculator } from "@/components/payment-calculator";
import { ContactSection } from "@/components/contact-section";
import { pageMetadata, parseLocale } from "@/lib/page-metadata";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  return pageMetadata(parseLocale((await searchParams).lang));
}
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = lang === "en" || lang === "fr" ? lang : "es";
  return (
    <ExperienceProvider initialLocale={locale}>
      <Shell>
        <Hero />
        <ProjectSection />
        <ProjectMap />
        <AboutSection />
        <PaymentCalculator />
        <GuideSection />
        <ContactSection />
      </Shell>
    </ExperienceProvider>
  );
}
