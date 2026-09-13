import { ExperienceProvider } from "@/components/experience-provider";
import { PaymentCalculator } from "@/components/payment-calculator";
import { RouteHeading } from "@/components/journey";
import { journeyCopy } from "@/content/journey-copy";
import { Shell } from "@/components/shell";
import { pageMetadata, parseLocale } from "@/lib/page-metadata";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = parseLocale((await searchParams).lang);
  return pageMetadata(locale, journeyCopy[locale].investmentPage);
}

export default async function CalculatorPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale = parseLocale((await searchParams).lang);
  return (
    <ExperienceProvider initialLocale={locale}>
      <Shell detail>
        <RouteHeading kind="investmentPage" />
        <PaymentCalculator />
      </Shell>
    </ExperienceProvider>
  );
}
