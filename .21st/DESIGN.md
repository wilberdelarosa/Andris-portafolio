<!-- Project design context synchronized from .21st/design.json. -->
# Project Design Context

Human-authored context for the latest user-directed hero and retained application structure. Validation results are documented separately; this context does not certify QA.

## Project

- Name: AndrisPortafolio
- Product: Independent real estate advisor portfolio
- Stack: Next.js 16, React 19, TypeScript, CSS, Motion, Radix Dialog, Leaflet
- Direction: white canvas, horizontal header, centered suit portrait, monumental serif name and luminous architectural atmosphere in the hero; sans hierarchy and structured project dossier throughout the remaining application.
- Modes: light, dark and system; Spanish, English and French.

## Sources

- Tokens: app/src/app/globals.css, DESIGN_SYSTEM.md, docs/design/DESIGN.md
- Components: app/src/components
- Assets: ASSETS, app/public/derived
- Instructions: AGENTS.md, docs/design/SKILLS.md, docs/setup/SKILLS.md

## System

- Preserve the brand palette: navy `#0B1F3A`, soft navy `#132E4A`, blue `#316692`, sand `#D8C8B4`, deep sand `#C8B79C`, warm surface `#F4F0E6`, raised surface `#FBF9F4`, muted text `#4E5A6B`.
- Primary surface: white `#FFFFFF`. Dark theme uses navy surfaces and light text.
- Plus Jakarta Sans is the primary face; section headings use weight 600. Cormorant Garamond 500 carries the monumental hero name and proposition, personal introduction and signature.
- Content max 1440px; responsive gutters; 8px control and 16px card radii.
- Desktop: horizontal header; suit portrait centered between concise text rails, ANDRIS behind it and PEÑA on the lower front plane. Mobile: a vertical name-and-portrait poster followed by the proposition and actions, with bottom navigation.
- The hero's atmospheric architecture is generated fictional editorial scenery, not a listed property. Its source and prompt are recorded in output/imagegen/hero-atmosphere-v3-provenance.md. Preserve the original image and the real transparent Andris portrait separately.
- Project dossier: confirmed facts, six-image gallery, location and dedicated detail page.
- Payment tool: clear inputs and navy result. Photo has loading, error and context-appropriate retry states.
- One principal entrance for name masks, portrait and architectural backdrop, with bounded depth from scroll and fine pointer; respect reduced motion and keep base content visible.

## Constraints

### Must

- Treat docs/design/DESIGN.md tokens as the source of truth
- Publish only verified content
- Build application inside app/
- Preserve original assets and optimize derivatives
- WCAG AA, keyboard navigation and reduced motion
- Support Spanish, English, French and light/dark preferences
- Responsive from 320px; PWA experience
- Palette and layout decisions below are authored from docs/design/DESIGN.md and override generic auto-detected context.

### Avoid

- Invented project names, locations, prices, contacts or credentials
- Publishing screenshots from ASSETS/references
- Unlicensed code or imagery from reference websites
- Unrelated brand names
- Unrequested paid 21st generation; the user-authorized imagegen hero background has separate provenance

## Decisions

- **andris-modern-personal-portfolio**: Independent advisor portfolio for Andris Peña. Predominantly white canvas; preserve the navy, blue and sand brand tokens. Use a compact horizontal header, original monogram and clear text identity. Control radius 8px, card radius 16px, content max 1440px. Theme preferences support light, dark and system. (User redesign request, DESIGN_SYSTEM.md and docs/design/DESIGN.md)
- **monumental-name-and-centered-portrait**: The latest user reference supersedes the previous split composition. A centered suit portrait separates ANDRIS behind it and PEÑA on the lower front plane; desktop text rails carry proposition and actions, while mobile uses a vertical poster. Plus Jakarta Sans retains the rest of the application's hierarchy. Cormorant Garamond 500 carries the hero name and proposition. Entrance and bounded depth motion preserve reduced-motion access. (Latest user-provided hero reference, hero.tsx and hero.module.css)
- **project-dossier-and-application-flows**: Publish only Melcon Paradise as a photography-and-facts dossier with a separate detail route, six-image gallery and confirmed map. Preserve the payment simulator with navy result, contact inquiry review, favorites, Spanish/English/French, mobile navigation and PWA. Photo exposes loading, error and context-appropriate retry states. (Verified project content and implemented components)
- **fictional-editorial-hero-atmosphere**: hero-atmosphere-v3.webp depicts fictional ivory and travertine architecture with palm shadows and a side opening toward the sea. It never represents Melcon Paradise or another listed property. The original and provenance are preserved. (output/imagegen/hero-atmosphere-v3-provenance.md)
