import { ExperienceProvider } from "@/components/experience-provider";
import { Shell } from "@/components/shell";
import { Hero } from "@/components/hero";
import { ProjectSection } from "@/components/project-section";
import { HomeMap, AdvisorPreview, JourneyActions } from "@/components/journey";
import { pageMetadata } from "@/lib/page-metadata";
export function generateMetadata() {
  return pageMetadata("es");
}
export default function Home() {
  return (
    <ExperienceProvider>
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
