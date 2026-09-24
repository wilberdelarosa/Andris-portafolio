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

This project is indexed by GitNexus as **AndrisPortafolio** (2408 symbols, 3833 relationships, 145 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/AndrisPortafolio/context` | Codebase overview, check index freshness |
| `gitnexus://repo/AndrisPortafolio/clusters` | All functional areas |
| `gitnexus://repo/AndrisPortafolio/processes` | All execution flows |
| `gitnexus://repo/AndrisPortafolio/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
