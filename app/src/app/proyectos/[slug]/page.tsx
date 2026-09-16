import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProject } from "@/content/projects";
import { getPublishedProjects } from "@/content/projects";
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
export function generateStaticParams() {
  return getPublishedProjects().map(({ slug }) => ({ slug }));
}
export default async function Detail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
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
