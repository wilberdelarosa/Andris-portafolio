import { ExperienceProvider } from "@/components/experience-provider";
import { Shell } from "@/components/shell";
import { AboutSection } from "@/components/about-section";
import { RouteHeading } from "@/components/journey";
import { journeyCopy } from "@/content/journey-copy";
import { pageMetadata, parseLocale } from "@/lib/page-metadata";
import { GuideSection } from "@/components/about-section";
import { JourneyActions } from "@/components/journey";

type Props = { searchParams: Promise<{ lang?: string; proyecto?: string }> };
export async function generateMetadata({ searchParams }: Props) {
  const locale = parseLocale((await searchParams).lang);
  return { ...pageMetadata(locale), title: { absolute: `${journeyCopy[locale].aboutPage} | Andris Peña` } };
}
export default async function AboutPage({ searchParams }: Props) {
  const query = await searchParams;
  const locale = parseLocale(query.lang);
  return <ExperienceProvider initialLocale={locale}><Shell>
    <RouteHeading kind="aboutPage" />
    <AboutSection />
    <GuideSection />
        <JourneyActions />
  </Shell></ExperienceProvider>;
}
