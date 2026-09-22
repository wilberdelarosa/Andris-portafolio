import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getContentRepository } from "@/lib/cms/repository";
import { fromApiProjectDetail } from "@/lib/cms/mappers";
import { ExperienceProvider } from "@/components/experience-provider";
import { Shell } from "@/components/shell";
import { ProjectDetail } from "@/components/project-section";
import { ProjectMap } from "@/components/project-map";
import { JourneyActions } from "@/components/journey";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getContentRepository().getProject(slug);
  return {
    title: project ? `${project.name} · ${project.location}` : "Proyecto no encontrado",
  };
}
export async function generateStaticParams() {
  // Corre en build time contra el proveedor activo (Supabase o estático);
  // enumera los slugs reales para que la exportación estática genere cada
  // ficha. Si Supabase no responde, el build debe fallar de forma visible
  // en vez de publicar un catálogo vacío — no se atrapa el error aquí.
  const projects = await getContentRepository().listProjects();
  return projects.map(({ slug }) => ({ slug }));
}
export default async function Detail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const apiProject = await getContentRepository().getProject(slug);
  if (!apiProject) notFound();
  const project = fromApiProjectDetail(apiProject);
  return (
    <ExperienceProvider>
      <Shell detail>
        <ProjectDetail project={project} />
        <ProjectMap project={project} />
        <JourneyActions projectSlug={project.slug} />
      </Shell>
    </ExperienceProvider>
  );
}
