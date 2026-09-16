import { ExperienceProvider } from "@/components/experience-provider";
import { Shell } from "@/components/shell";
import { AboutSection } from "@/components/about-section";
import { RouteHeading } from "@/components/journey";
import { journeyCopy } from "@/content/journey-copy";
import { pageMetadata } from "@/lib/page-metadata";
import { GuideSection } from "@/components/about-section";
import { JourneyActions } from "@/components/journey";

export function generateMetadata() {
  return { ...pageMetadata("es"), title: { absolute: `${journeyCopy.es.aboutPage} | Andris Peña` } };
}
export default function AboutPage() {
  return <ExperienceProvider><Shell>
    <RouteHeading kind="aboutPage" />
    <AboutSection />
    <GuideSection />
        <JourneyActions />
  </Shell></ExperienceProvider>;
}
