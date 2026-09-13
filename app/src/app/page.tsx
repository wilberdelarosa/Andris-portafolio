import { ExperienceProvider } from "@/components/experience-provider";
import { Shell } from "@/components/shell";
import { Hero } from "@/components/hero";
import { ProjectSection } from "@/components/project-section";
import { HomeMap, AdvisorPreview, JourneyActions } from "@/components/journey";
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
        <HomeMap />
        <AdvisorPreview />
        <JourneyActions />
      </Shell>
    </ExperienceProvider>
  );
}
