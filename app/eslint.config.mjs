import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    ".next-verify/**",
    ".next-validation/**",
    ".open-next/**",
    ".wrangler/**",
    "dist/**",
    "public/**",
    "next-env.d.ts",
  ]),
]);
