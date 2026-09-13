import Link from "next/link";
import { ExperienceProvider } from "@/components/experience-provider";
import { ProjectCatalog } from "@/components/project-catalog";
import { Shell } from "@/components/shell";
import { catalogCopy } from "@/content/catalog-copy";
import { getPublishedProjects } from "@/content/projects";
import { pageMetadata, parseLocale } from "@/lib/page-metadata";
import "@/components/project-catalog.css";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = parseLocale((await searchParams).lang);
  const c = catalogCopy[locale];
  return {
    ...pageMetadata(locale, c.title.join(" ")),
    description: c.intro,
  };
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = parseLocale((await searchParams).lang);
  const c = catalogCopy[locale];

  // Listado navegable para buscadores: describe el catalogo sin precios ni
  // disponibilidad, que son los datos todavia por confirmar.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: c.title.join(" "),
    itemListElement: getPublishedProjects().map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: new URL(`/proyectos/${project.slug}?lang=${locale}`, process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").href,
      name: project.name,
    })),
  };

  return (
    <ExperienceProvider initialLocale={locale}>
      <Shell detail>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <nav className="catalog-back" aria-label={c.backHome}>
          <Link href={`/?lang=${locale}`}>{c.backHome}</Link>
        </nav>
        <ProjectCatalog />
      </Shell>
    </ExperienceProvider>
  );
}
