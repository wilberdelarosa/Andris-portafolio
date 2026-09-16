import { ExperienceProvider } from "@/components/experience-provider";
import { Shell } from "@/components/shell";
import { ContactSection } from "@/components/contact-section";
import { RouteHeading } from "@/components/journey";
import { journeyCopy } from "@/content/journey-copy";
import { pageMetadata } from "@/lib/page-metadata";

export function generateMetadata() {
  return { ...pageMetadata("es"), title: { absolute: `${journeyCopy.es.contactPage} | Andris Peña` } };
}
export default function ContactPage() {
  return <ExperienceProvider><Shell>
    <RouteHeading kind="contactPage" />
    <ContactSection />
    
  </Shell></ExperienceProvider>;
}
