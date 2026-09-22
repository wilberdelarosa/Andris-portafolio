import Link from "next/link";
import Script from "next/script";
import { ExperienceProvider } from "@/components/experience-provider";
import { ProjectCatalog } from "@/components/project-catalog";
import { Shell } from "@/components/shell";
import { catalogCopy } from "@/content/catalog-copy";
import { getContentRepository } from "@/lib/cms/repository";
import { pageMetadata } from "@/lib/page-metadata";
import "@/components/project-catalog.css";

export async function generateMetadata() {
  const c = catalogCopy.es;
  const projects = await getContentRepository().listProjects();
  return {
    ...pageMetadata("es", c.title(projects.length).join(" ")),
    description: c.intro,
  };
}

export default async function ProjectsPage() {
  const locale = "es";
  const c = catalogCopy.es;
  // Se corre en build time (exportación estática) contra el proveedor activo
  // (Supabase si hay credenciales, si no el contenido estático de
  // src/content/projects.ts). El catálogo interactivo (ProjectCatalog) hace
  // su propia carga en cliente vía useProjects(); este listado solo alimenta
  // el JSON-LD para buscadores.
  const projects = await getContentRepository().listProjects();

  // Listado navegable para buscadores: describe el catalogo sin precios ni
  // disponibilidad, que son los datos todavia por confirmar.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: c.title(projects.length).join(" "),
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: new URL(`/proyectos/${project.slug}?lang=${locale}`, process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").href,
      name: project.name,
    })),
  };

  return (
    <ExperienceProvider>
      <Shell detail>
        <Script id="project-catalog-jsonld" type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </Script>
        <nav className="catalog-back" aria-label={c.backHome}>
          <Link href={`/?lang=${locale}`} prefetch={false}>{c.backHome}</Link>
        </nav>
        <ProjectCatalog />
      </Shell>
    </ExperienceProvider>
  );
}
