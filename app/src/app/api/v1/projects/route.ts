import { getPublishedProjects, toPublicProject } from "@/content/projects";
export function GET() {
  const projects = getPublishedProjects().map(toPublicProject);
  return Response.json(
    {
      data: projects,
      meta: {
        total: projects.length,
        version: "1",
        commercialTerms: "confirmation-required",
      },
    },
    { headers: { "Cache-Control": "public, max-age=60" } },
  );
}
