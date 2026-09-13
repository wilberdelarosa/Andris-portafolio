import { ExperienceProvider } from "@/components/experience-provider";
import { MapExplorer } from "@/components/map-explorer";
import { Shell } from "@/components/shell";
import { mapExplorerCopy } from "@/content/map-copy";
import { pageMetadata, parseLocale } from "@/lib/page-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; proyecto?: string }>;
}) {
  const locale = parseLocale((await searchParams).lang);
  const c = mapExplorerCopy[locale];
  return {
    ...pageMetadata(locale, c.title),
    description: c.intro,
  };
}

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; proyecto?: string }>;
}) {
  const query = await searchParams;
  const locale = parseLocale(query.lang);

  return (
    <ExperienceProvider initialLocale={locale}>
      {/* `bare` retira el pie y el margen inferior: aqui el mapa llena la pagina. */}
      <Shell detail bare>
        <h1 className="sr-only">{mapExplorerCopy[locale].title}</h1>
        <MapExplorer initialSlug={query.proyecto} />
      </Shell>
    </ExperienceProvider>
  );
}
