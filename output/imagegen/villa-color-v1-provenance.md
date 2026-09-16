# Villa y palmas a color

Fecha: 13 de septiembre de 2026. Herramienta integrada `image_gen` (no CLI/API externo). Solicitud: villa con indicaciones y decoraciones más visibles y coloridas.

## Archivos

- Villa original: `ambient-villa-v1-original.png`, 1536 × 1024. Derivado: `app/public/derived/ambient-villa-v1.webp`, 377848 bytes, WebP calidad 88.
- Palmas original: `ambient-palm-color-v2-original.png`, 1536 × 1024 RGBA. Derivado: `app/public/derived/ambient-palm-color-v2.webp`, 1100 × 734, 302600 bytes, WebP calidad 86. Se conserva alfa.
- Los PNG generados permanecen además en la carpeta de generación de Codex. Los originales anteriores no se sobrescribieron.

Ambos recursos son ficticios y decorativos. La villa NO representa Melcon Paradise ni otra propiedad real, ni disponibilidad, ubicación o características de una oferta. El componente la identifica expresamente como imagen generada. Las indicaciones HTML señalan piscina, terraza y jardín visibles en la ilustración; no son afirmaciones comerciales.

## Prompt de villa (exacto)

Use case: stylized-concept. Generate a polished architectural visualization asset for an independent real estate advisor's website. One fictional contemporary tropical villa as a precise photoreal miniature diorama, high aerial three-quarter axonometric view, wide landscape 3:2. Entire property contained within frame with generous off-white warm ivory empty background margin. Architectural white travertine two-storey villa with terracotta pergola and amber wood detail in rear center/right of composition. Vivid turquoise rectangular swimming pool in foreground LEFT, coral terracotta outdoor terrace with cream loungers in foreground RIGHT, lush emerald palm garden and lush tropical foliage along rear and outer borders. Realistic rich natural colors, crystalline pool ripples, sharp crisp sun shadows, sophisticated warm Caribbean sunlight, physically convincing materials, editorial architecture model photography, not cartoon, not generic flat illustration. The villa and landscaping must occupy about 80 percent of the frame. Scene isolated on a warm ivory architectural presentation background with no sky horizon, no surrounding town. Clear pool/terrace/garden shapes so separate HTML annotation pointers can later be attached. NO TEXT, no labels, no numbers, no arrows, no logos, no watermark, no people. This is a fictional decorative concept, NOT a depiction of any real listed property. Produce one high-resolution image.

## Prompt de palmas (exacto)

Use case: stylized-concept. Asset type: transparent foreground decoration for a luxury Caribbean independent real estate portfolio. Generate a single botanical arrangement of 3 elegant arching palm fronds with lush emerald green and vivid turquoise-green highlights, small warm golden sunlit edges and tiny bougainvillea coral-pink blossoms nestled by base of the leaves. Real photographic botanical cutout, rich vibrant natural colors, very crisp detailed individual leaflets, not painted, no desaturation. Composition diagonal flowing from bottom right to upper left, ample empty negative space around silhouette; leaves visually distinct and elegant, not a dense jungle. Fully visible leaves with clean cutout edges. Genuine alpha TRANSPARENT background, no background of any color, no printed checkerboard, no floor, no cast shadow on background, no pot, no trunks, no text, no frame, no logos, no people. Landscape 3:2 composition. Intended as a decorative overlay with HTML blur/light layers added separately, do not blur the entire asset.

## Dirección de movimiento

Referencia técnica consultada: [Motion useScroll](https://motion.dev/docs/react-use-scroll). Scroll vinculado directamente a transformaciones, sin suavizado de Lenis ni muelle en la barra de lectura. El movimiento reducido conserva contenido estático. Imágenes optimizadas con FFmpeg sin modificar sus originales.
