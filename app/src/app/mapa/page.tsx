import { ExperienceProvider } from "@/components/experience-provider";
import { MapExplorer } from "@/components/map-explorer";
import { Shell } from "@/components/shell";
import { mapExplorerCopy } from "@/content/map-copy";
import { pageMetadata } from "@/lib/page-metadata";

export function generateMetadata() {
  const c = mapExplorerCopy.es;
  return {
    ...pageMetadata("es", c.title),
    description: c.intro,
  };
}

export default function MapPage() {
  return (
    <ExperienceProvider>
      {/* `bare` retira el pie y el margen inferior: aqui el mapa llena la pagina. */}
      <Shell detail bare>
        <h1 className="sr-only">{mapExplorerCopy.es.title}</h1>
        <MapExplorer />
      </Shell>
    </ExperienceProvider>
  );
}
