import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProject } from "@/content/projects";
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
  const project = getProject(slug);
  return {
    title: project ? `${project.name} · ${project.location}` : "Proyecto no encontrado",
  };
}
export default async function Detail({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const { lang } = await searchParams;
  const locale = lang === "en" || lang === "fr" ? lang : "es";
  return (
    <ExperienceProvider initialLocale={locale}>
      <Shell detail>
        <ProjectDetail project={project} />
        <ProjectMap project={project} />
        <JourneyActions projectSlug={project.slug} />
      </Shell>
    </ExperienceProvider>
  );
}
