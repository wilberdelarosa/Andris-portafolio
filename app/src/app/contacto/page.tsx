import { ExperienceProvider } from "@/components/experience-provider";
import { Shell } from "@/components/shell";
import { ContactSection } from "@/components/contact-section";
import { RouteHeading } from "@/components/journey";
import { journeyCopy } from "@/content/journey-copy";
import { pageMetadata, parseLocale } from "@/lib/page-metadata";

type Props = { searchParams: Promise<{ lang?: string; proyecto?: string }> };
export async function generateMetadata({ searchParams }: Props) {
  const locale = parseLocale((await searchParams).lang);
  return { ...pageMetadata(locale), title: { absolute: `${journeyCopy[locale].contactPage} | Andris Peña` } };
}
export default async function ContactPage({ searchParams }: Props) {
  const query = await searchParams;
  const locale = parseLocale(query.lang);
  return <ExperienceProvider initialLocale={locale}><Shell>
    <RouteHeading kind="contactPage" />
    <ContactSection projectSlug={query.proyecto} />
    
  </Shell></ExperienceProvider>;
}
