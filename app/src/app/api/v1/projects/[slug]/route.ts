import { getProject, toPublicProject } from "@/content/projects";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const found = getProject(slug);
  if (!found)
    return Response.json(
      { error: { code: "PROJECT_NOT_FOUND" } },
      { status: 404 },
    );
  return Response.json(
    {
      data: toPublicProject(found),
      meta: { version: "1", commercialTerms: "confirmation-required" },
    },
    { headers: { "Cache-Control": "public, max-age=60" } },
  );
}
