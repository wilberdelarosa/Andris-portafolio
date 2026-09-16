import { cp, mkdir, rm } from "node:fs/promises";

const exportDirectory = process.env.NEXT_DIST_DIR ?? "out";

await rm("dist", { recursive: true, force: true });
await cp(exportDirectory, "dist", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
await cp(".openai/hosting.json", "dist/.openai/hosting.json");
