# Auditoría visual y derivados de Andris Peña

Revisión: 12 de septiembre de 2026. Se leyeron `AGENTS.md`, `README.md`, `DESIGN.md`, `CONTENT-STATUS.md` y la descripción de Melcon Paradise antes de generar derivados.

## Cobertura y evidencias

Se decodificaron e inspeccionaron visualmente **las 80 imágenes que existen actualmente en `ASSETS/`**, agrupadas en siete hojas de contacto. Esta cifra actual difiere del inventario histórico de 81 imágenes del README. El inventario verificable incluye nombre, dimensiones, modo de color, transparencia, peso y SHA-256 por archivo en [inventory.json](asset-contact-sheets/inventory.json). Los originales permanecen intactos.

| Grupo | Cantidad | Evidencia visual |
| --- | ---: | --- |
| Logos y paletas | 14 | [01-brand.jpg](asset-contact-sheets/01-brand.jpg) |
| Retratos y composiciones | 7 | [02-broker.jpg](asset-contact-sheets/02-broker.jpg) |
| Melcon Paradise | 15 | [03-melcon.jpg](asset-contact-sheets/03-melcon.jpg) |
| Proyecto 01 sin ficha aprobada | 16 | [04-unidentified-01.jpg](asset-contact-sheets/04-unidentified-01.jpg) |
| Proyecto 03 sin ficha aprobada | 12 | [05-unidentified-03.jpg](asset-contact-sheets/05-unidentified-03.jpg) |
| Inspiración web | 13 | [06-references-web.jpg](asset-contact-sheets/06-references-web.jpg) |
| Inspiración PWA y captura de ubicaciones | 3 | [07-references-pwa-location.jpg](asset-contact-sheets/07-references-pwa-location.jpg) |

## Selección y composición recomendada

El recorte en traje `andris-suit-cutout.png` ofrece la presentación más formal, un borde transparente aprovechable y buena separación frente a superficies claras. La imagen en camisa blanca tiene una expresión más cercana y sirve para el apartado de asesoría. Se preservó la identidad del asesor: no se generaron ni retocaron sus rasgos.

Una composición editorial puede colocar el nombre grande detrás del retrato, animando las palabras y el retrato con entradas breves. El retrato debe conservar cabeza y manos; para una columna lateral estrecha, resulta adecuado cortar visualmente desde la parte inferior mediante CSS. La alternativa móvil debe contener una sola propuesta y una acción principal, sin reproducir una columna de escritorio comprimida.

El jardín de Melcon al atardecer es el hero recomendado del proyecto: su perspectiva central y el río artificial explican mejor el lugar que una fotografía genérica. Piscina, jardín diurno y sala complementan la galería. El plano aéreo aporta contexto al detalle del proyecto. No se añadieron construcciones, vegetación, amenidades o vistas inexistentes.

El fondo resort entregado puede servir únicamente como composición editorial del asesor; no hay evidencia de que represente Melcon Paradise ni otro proyecto comercial. No debe usarse como una fotografía verificable de una propiedad. No fue necesario generar material adicional.

## Observaciones de cada grupo

### Marca: 14 archivos

Los números corresponden al orden de la hoja de contacto y al inventario JSON.

1. Logo completo principal: AP dorado, nombre y subtítulo navy; elegido para la marca completa y para un recorte técnico del wordmark.
2. Logo alternativo: monograma dorado, textos blancos; adecuado sobre fondos oscuros.
3. Wordmark: el nombre de archivo dice «navy», pero el contenido es **blanco**. Se exportó con nombre de salida corregido.
4. Monograma dorado: útil en piezas grandes; no se extrapoló su color a nuevos tokens.
5. Monograma navy: elegido para navegación sobre superficies claras.
6. Monograma blanco: elegido para superficies oscuras.
7. Icono de aplicación: AP dorado sobre un cuadrado navy con un margen exterior claro. El archivo es RGB, sin transparencia. Para el set PWA se conserva este lenguaje de marca colocando el monograma dorado original 04 sobre el navy documentado, con márgenes técnicos adecuados a cada propósito.
8. Logo que se llama «dorado sobre oscuro»: contiene textos navy; el nombre no garantiza el color visible.
9. Logo alternativo ligero: dorado claro y texto blanco; menor contraste sobre crema.
10. Monograma y wordmark alternativos blancos; aptos para fondo oscuro.
11. Referencia JPEG del logo sobre blanco; se prefirieron los PNG transparentes.
12. Paleta azul/navy/beige: confirma el azul `#316692` y navy `#0B1F3A`.
13. Paleta ampliada navy/beige: confirma superficies claras, arena y variantes navy ya documentadas.
14. Paleta navy/beige cálido: confirma la combinación principal `#0B1F3A` / `#F4F0E6`.

Los PNG de logos contienen píxeles de muy baja opacidad fuera de su área útil. El recorte técnico calcula límites con alfa mayor que 100 y añade 12 píxeles de margen; no altera las formas internas del logo. Los originales se conservan completos.

### Asesor: 7 archivos

1. Costa vertical: fondo decorativo disponible; no constituye una ubicación de proyecto confirmada.
2. Asesor integrado en resort: composición horizontal terminada, pero acopla persona y fondo; menos flexible para responsive y animación por capas.
3. Fondo resort sin persona: permite composición por capas y degradados CSS; procedencia comercial del lugar no confirmada.
4. Retrato de costa 01: camisa blanca y brazos cruzados, encuadre 3:4, seleccionado como foto contextual.
5. Retrato de costa 02: variante más vertical; redundante para la primera versión.
6. Recorte en traje: principal para el hero, transparencia preservada.
7. Recorte en camisa blanca: alternativa para asesoría/perfil, transparencia preservada.

### Melcon Paradise: 15 archivos

Todos son renders aportados. Su publicación debe identificarlos como representaciones del proyecto, sin atribuirles un estado de obra o disponibilidad.

1. Vista aérea del conjunto, acceso y estacionamiento: contexto del masterplan.
2. Jardín y río al atardecer: hero principal, composición paisajística cálida.
3. Fachada y balcones de un bloque: detalle de arquitectura exterior.
4. Jardín y río diurnos: variedad de iluminación para la galería.
5. Perspectiva longitudinal de jardines: profundidad del área interior.
6. Paseo de agua hacia amenidades: alternativa de hero o transición visual.
7. Vista aérea desde el lateral: organización y escala de los bloques.
8. Piscina y pérgola: amenidad destacada.
9. Sala y comedor con tonos neutros: render interior vertical.
10. Sala con sofá verde: atmósfera de interior alternativa.
11. Cocina y comedor: distribución interior.
12. Dormitorio con cabecera de madera: dormitorio principal.
13. Sala y cocina: segunda distribución interior.
14. Dormitorio cálido: variante interior.
15. Piscina diurna con tumbonas: amenidad y escala humana.

### Proyecto 01: 16 archivos, excluidos de `public/`

Se observan, en orden: parque de mascotas; jardín central; piscina con recorrido peatonal; piscina desde otro ángulo; balcón hacia piscina; vía interna; parque infantil; vista aérea; acceso; cocina/sala; sala; cocina con isla; sala compacta; dormitorio; baño; vialidad con árbol floral. La captura de ubicaciones relaciona visualmente estos renders con «Terra Serena · Punta Cana», pero la carpeta sigue sin descripción aprobada. No se exportó ningún render de este grupo para la web.

### Proyecto 03: 12 archivos, excluidos de `public/`

Se observan, en orden: laguna amplia frente a edificios; piscina al atardecer; piscina con terrazas; vista desde balcón; fachada frontal con piscina; pérgola amueblada; sala hacia terraza; cocina/comedor; sala; comedor; dormitorio; segunda copia de la vista de balcón. El conjunto presenta una identidad visual distinta a Melcon. No se infirió un nombre a partir del aspecto de los renders ni se exportó material de este grupo.

### Inspiración web: 13 archivos, excluidos de `public/`

1. Portafolio personal oscuro con retrato recortado y jerarquía tipográfica grande.
2. Tienda deportiva editorial con hero de tenis y tarjetas de productos.
3. Moda sobre fondo claro, persona central y texto alrededor del recorte.
4. Aplicación inmobiliaria crema: foto protagonista, ficha, favoritos y barra inferior.
5. Aplicación de hoteles: galería, ficha, filtros y acción inferior persistente.
6. Captura de distintas pantallas móviles y una web de nutrición; aporta densidad móvil y agrupación visual.
7. Otra referencia de listado móvil de propiedades con tarjetas de imagen.
8. Referencia «STYLE»: palabra muy grande detrás del perfil de una persona; es el patrón más directo para la petición del nombre animado.
9. Composición editorial de moda, retrato grande y rejilla de contenidos secundarios.
10. Arquitectura en crema con serif editorial, hero panorámico y bloques de imágenes.
11. Tienda de ciclismo con hero de objeto recortado y mucho espacio claro.
12. Tienda de moda violeta: fotografía protagonista y tarjetas; su paleta no corresponde a la marca.
13. Anuncio de servicios digitales naranja: composición promocional, de menor afinidad con el carácter inmobiliario premium.

Se extrajeron principios de composición; las capturas, textos, marcas y fotografías de terceros no se copiaron al sitio.

### Referencias PWA y ubicaciones: 3 archivos

La captura de ubicaciones muestra dos tarjetas identificadas y un tercer enlace sin etiqueta. Se leyó a resolución original. Los enlaces visibles son evidencia para investigar ubicación, no coordenadas aprobadas por sí mismos:

- Terra Serena: `https://maps.app.goo.gl/6AVZ98JtS5XG9Yhy7?g_st=iw`.
- Melcon Paradise: `https://maps.app.goo.gl/htoJVFhZERHas7Kw7?g_st=iw`.
- Enlace sin nombre visible: `https://maps.app.goo.gl/fFaGb7cYhyBHwNJY8?g_st=iw`.

REF01 y REF02 muestran una app inmobiliaria con superficies blancas, acentos azules, tarjetas de inmuebles, navegación inferior y mapa/listado. Son útiles como guía de jerarquía táctil y de transición entre lista y mapa; no proporcionan información factual de Andris.

## Derivados y reproducción

Se generaron **33 derivados, 3.35 MiB en total**, en `app/public/derived/`. La aplicación debe cargar galerías bajo demanda; el total no implica descargarlos todos al inicio. WebP conserva la transparencia de recortes y logos. Los renders mantienen la proporción y no se ampliaron por encima del original. Las variantes pequeñas tienen un máximo de 640 píxeles. Los iconos PWA son PNG.

Los iconos reutilizan el monograma dorado original, sin recrearlo, centrado sobre `#0B1F3A`. La marca ocupa como máximo el 68% del icono ordinario y el 56% del icono maskable. Ese cuadrado central del 56% cabe íntegramente dentro del círculo de seguridad del 80% de diámetro, conservando el monograma con máscaras circulares o redondeadas. `apple-touch-icon.png` tiene 180 × 180 píxeles.

El mapa exacto fuente → salida, con dimensiones, bytes, coordenadas de recorte y caja de alfa, está en [derivatives.json](asset-contact-sheets/derivatives.json). Para regenerar se usa `python docs/design/prepare_assets.py`; para el inventario y hojas de contacto, `python docs/design/audit_assets.py`.

Rutas principales disponibles para componentes:

| Derivado público | Dimensiones | Uso |
| --- | --- | --- |
| `/derived/andris-suit.webp` | 910 × 1478 | Hero por capas |
| `/derived/andris-white-shirt.webp` | 794 × 1519 | Perfil/asesoría |
| `/derived/andris-coast.webp` | 800 × 1067 | Foto contextual |
| `/derived/resort-backdrop.webp` | 1672 × 941 | Fondo editorial sin atribución a proyecto |
| `/derived/coast-backdrop.webp` | 800 × 1200 | Fondo editorial costero |
| `/derived/logo-full.webp` | 520 × 368 | Marca completa |
| `/derived/logo-navy.webp` | 246 × 256 | Monograma sobre claro |
| `/derived/logo-white.webp` | 256 × 255 | Monograma sobre oscuro |
| `/derived/wordmark-navy.webp` | 650 × 150 | Nombre original sobre claro |
| `/derived/wordmark-white.webp` | 650 × 135 | Nombre original sobre oscuro |
| `/derived/icon-192.png` | 192 × 192 | Icono PWA |
| `/derived/icon-512.png` | 512 × 512 | Icono PWA |
| `/derived/apple-touch-icon.png` | 180 × 180 | Icono iOS |
| `/derived/icon-maskable-512.png` | 512 × 512 | Icono PWA maskable |
| `/derived/melcon-hero.webp` | 1183 × 785 | Jardines al atardecer |
| `/derived/melcon-masterplan.webp` | 1175 × 783 | Masterplan |
| `/derived/melcon-facade.webp` | 1165 × 785 | Fachada |
| `/derived/melcon-gardens.webp` | 1169 × 783 | Jardines diurnos |
| `/derived/melcon-river.webp` | 1173 × 781 | Río artificial |
| `/derived/melcon-promenade.webp` | 1177 × 786 | Paseo hacia amenidades |
| `/derived/melcon-aerial.webp` | 1178 × 787 | Aérea lateral |
| `/derived/melcon-pool.webp` | 1164 × 787 | Piscina y pérgola |
| `/derived/melcon-living.webp` | 1169 × 1185 | Sala/comedor |
| `/derived/melcon-lounge.webp` | 1183 × 1174 | Sala verde |
| `/derived/melcon-kitchen.webp` | 1166 × 1176 | Cocina/comedor |
| `/derived/melcon-bedroom.webp` | 1173 × 1177 | Dormitorio |
| `/derived/melcon-interior.webp` | 1167 × 1183 | Sala/cocina |
| `/derived/melcon-suite.webp` | 1181 × 1177 | Dormitorio cálido |
| `/derived/melcon-poolside.webp` | 1180 × 786 | Piscina diurna |
| `/derived/melcon-hero-small.webp` | 640 × 425 | Tarjeta/preview |
| `/derived/melcon-gardens-small.webp` | 640 × 429 | Tarjeta/preview |
| `/derived/melcon-pool-small.webp` | 640 × 433 | Tarjeta/preview |
| `/derived/melcon-living-small.webp` | 631 × 640 | Tarjeta/preview |

El retrato principal, el hero de Melcon, el wordmark y el icono maskable se abrieron nuevamente después de exportar para verificar su aspecto. La verificación de integridad comprueba los SHA-256 de todos los originales, la decodificación de los 33 derivados, la geometría del círculo seguro maskable y la exclusión de referencias/proyectos sin identificar.
