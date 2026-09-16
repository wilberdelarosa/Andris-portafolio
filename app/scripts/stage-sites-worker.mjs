import { cp, mkdir, rename, rm } from "node:fs/promises";

const output = "dist";
const worker = `${output}/server`;

await rm(output, { recursive: true, force: true });
await mkdir(worker, { recursive: true });
await cp(".open-next", worker, { recursive: true });
await rename(`${worker}/worker.js`, `${worker}/index.js`);
await mkdir(`${output}/.openai`, { recursive: true });
await cp(".openai/hosting.json", `${output}/.openai/hosting.json`);
