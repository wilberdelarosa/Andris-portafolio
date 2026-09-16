import { ExperienceProvider } from "@/components/experience-provider";
import { PaymentCalculator } from "@/components/payment-calculator";
import { RouteHeading } from "@/components/journey";
import { journeyCopy } from "@/content/journey-copy";
import { Shell } from "@/components/shell";
import { pageMetadata } from "@/lib/page-metadata";

export function generateMetadata() {
  return pageMetadata("es", journeyCopy.es.investmentPage);
}

export default function CalculatorPage() {
  return (
    <ExperienceProvider>
      <Shell detail>
        <RouteHeading kind="investmentPage" />
        <PaymentCalculator />
      </Shell>
    </ExperienceProvider>
  );
}
