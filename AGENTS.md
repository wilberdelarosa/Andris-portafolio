# Instrucciones para agentes que trabajen en este proyecto

Este proyecto está en fase de preparación. El objetivo del sitio es presentar a Andris Peña como agente inmobiliario y convertir visitas en conversaciones verificables.

## Lectura obligatoria antes de editar

1. `README.md`
2. `docs/design/SKILLS.md` y el catálogo de `docs/setup/SKILLS.md`.
3. `DESIGN_SYSTEM.md` y `docs/design/DESIGN.md`.
4. `docs/organization/CONTENT-STATUS.md`.
5. La carpeta del proyecto inmobiliario que se vaya a mostrar.

## Reglas de contenido

- Presenta el sitio únicamente como el portafolio independiente de **Andris Peña**. No menciones, muestres ni utilices “Leaf Glass”, “Leafglass” ni variaciones en interfaz, metadatos, SEO, textos, formularios, imágenes, enlaces o contenido generado.
- No inventes propiedades, precios, ubicaciones, disponibilidad, testimonios, números de contacto ni enlaces sociales.
- El único proyecto con ficha escrita actual es `ASSETS/projects/melcon-paradise`.
- `project-01-unidentified` y `project-03-unidentified` tienen renders, pero todavía requieren nombre y descripción aprobados.
- Mantén las capturas de `ASSETS/references/` fuera de la web pública. Son inspiración, no material de marca ni de proyectos.
- Revisa la licencia y procedencia antes de reutilizar archivos de `referencias-web/arcke` en un sitio publicado.

## Reglas de diseño y código

- Usa los tokens de `docs/design/DESIGN.md`; no inventes una nueva paleta en cada sección.
- Mantén HTML semántico, contraste WCAG AA, navegación por teclado y `prefers-reduced-motion`.
- Optimiza imágenes para web y conserva los originales de esta carpeta sin sobrescribirlos.
- Crea la aplicación dentro de `app/` y separa componentes, contenido y recursos generados.

## Habilidades obligatorias para el sitio

Antes de diseñar o implementar, lee `docs/design/SKILLS.md`, `docs/setup/SKILLS.md` y `DESIGN_SYSTEM.md`, y aplica la etapa correspondiente. Como mínimo, cada cambio de interfaz debe pasar por dirección visual, responsive, tipografía, accesibilidad y validación en navegador real.

- Diseño y UX: `design-taste-frontend`, `frontend-design`, `responsive-design`, `ui-design`, `better-typography`, `design-md`, `impeccable` y `ui-ux-pro-max`.
- Movimiento: `framer-motion` y `emilkowal-animations`; usa `gsap-framer-scroll-animation` o `animate-text` solo si el movimiento tiene una función clara.
- Verificación: `playwright` y `browser-use:browser` o `browser-automation`.
- Referencias: `site-cloner`, `mirror-public-website` y `imagegen` solo con permiso para el origen y sin copiar su identidad o contenido.

Cuando exista una app, no entregues un cambio sin ejecutar sus scripts de `lint`, `typecheck`, `test`, `build` y la verificación de navegador pertinente.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **Andris-portafolio** (2652 symbols, 5367 relationships, 178 execution flows).

> Index stale? Run `node .gitnexus/run.cjs analyze --index-only` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? Bootstrap with `npx`, `bunx`, or `pnpm dlx` — e.g. `bunx gitnexus@latest analyze` (npm 11 npx crash; #1939).

## Always Do

- **MUST run impact before editing.** Use `impact({target: "symbolName", direction: "upstream"})` or `node .gitnexus/run.cjs impact "symbolName" --direction upstream --repo .`; report callers, processes, and risk. Never substitute grep for graph analysis.
- **MUST analyze graph changes before committing.** Use `detect_changes({scope: "all"})` (MCP) or `node .gitnexus/run.cjs detect-changes --scope all --repo .` (CLI fallback). `partial: true` or `truncated: true` is not a clean check — a zero means unseen, not unaffected; re-run it. For regression review: `detect_changes({scope: "compare", base_ref: "main"})` or `node .gitnexus/run.cjs detect-changes --scope compare --base-ref "main" --repo .`.
- MUST warn on HIGH/CRITICAL `risk` pre-edit; never use `riskSharedAxes` to waive a HIGH/CRITICAL `risk` warning. Compare File/symbol: MCP File omits axes; Graph-RAG expands File.
- **MUST treat `risk: UNKNOWN` as unresolved, not as low.** An empty caller set is not evidence the symbol is unused — it can also mean the callers are not resolvable by the index (plain-object property access, dynamic dispatch, cross-language calls). `impact` pairs `UNKNOWN` with a `riskNote` saying so. Confirm with a text search before treating the symbol as safe to change or delete; do not proceed on the strength of a zero.
- **MUST use `query({search_query: "concept"})` for concepts/flows, `context({name: "symbolName"})` for a named symbol, or `impact` for blast radius, on read-only callers, dependencies, imports, or execution flow.** Graph first; text search only for empty/`UNKNOWN`/literals.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method before MCP/CLI impact analysis.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis, and never read `UNKNOWN` as an all-clear — it means the walk could not answer, which is the one verdict that requires confirming by other means.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit before MCP/CLI graph change analysis.

## Resources

| Resource | Use for |
| --- | --- |
| `gitnexus://repo/Andris-portafolio/context` | Codebase overview, check index freshness |
| `gitnexus://repo/Andris-portafolio/clusters` | All functional areas |
| `gitnexus://repo/Andris-portafolio/processes` | All execution flows |
| `gitnexus://repo/Andris-portafolio/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
| --- | --- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
