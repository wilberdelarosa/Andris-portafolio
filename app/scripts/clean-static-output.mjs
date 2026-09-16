import { rm } from "node:fs/promises";

await rm("out", { recursive: true, force: true });
