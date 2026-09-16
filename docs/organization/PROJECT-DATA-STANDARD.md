# Estándar de información de proyectos

Este documento define la ficha única para cualquier proyecto publicado en el portafolio de Andris Peña. Su objetivo es que la tarjeta, la ficha, los filtros, el mapa y la comparativa consulten el mismo significado para cada dato.

No se debe completar una ausencia con una deducción. Cada campo usa uno de estos estados:

| Estado | Uso público |
| --- | --- |
| `documented` | El dato consta en una ficha, documento o evidencia entregada. |
| `pending` | Falta evidencia; la interfaz pública lo omite, lo deja vacío, muestra una raya o invita a consultar. |
| `varies` | Depende de fase, tipología o unidad; se publica con esa condición visible. |
| `not-applicable` | El campo fue revisado y no aplica al proyecto. |

## Grupos obligatorios

| Grupo | Campos normalizados | Uso en la experiencia |
| --- | --- | --- |
| Inversión y pagos | precio desde, reserva, plan de pago, ROI estimado, potencial de revalorización | filtros de presupuesto solo con `documented`; comparativa de compra. |
| Espacios | tipo, habitaciones, baños, metraje, parqueo, amueblado | tarjeta, ficha y comparativa. |
| Ubicación y entrega | ubicación, distancia a playa, distancia a aeropuerto, fecha, estado del proyecto | mapa, filtros por zona/entrega y comparativa. |
| Operación | renta vacacional, administración, eficiencia energética, mantenimiento, desarrollador, financiamiento, ideal para | decisión de inversión; no se promete nada sin evidencia. |
| Amenidades | smart home, tenis, golf, playa cercana, primera línea, playa artificial, pádel | filtros y matriz de amenidades. |

Los identificadores técnicos, estados y valores vigentes se encuentran en `app/src/content/project-information.ts`. El archivo contiene una entrada para cada campo y proyecto, incluso cuando su valor está pendiente. No añadir condicionales por nombre de proyecto a la interfaz: se agrega o actualiza el dato en esa fuente.

## Cobertura actual

| Proyecto | Cobertura documentada | Pendiente prioritario |
| --- | --- | --- |
| Melcon Paradise | tipología, metraje, reserva, pago de referencia, entrega, ubicación, distancia a PUJ y amenidades documentadas | precio vigente, baños, parqueos, operación de renta, gastos, desarrollador y financiamiento. |
| Terra Serena | precio desde, tipologías, metraje, reserva, pago, entrega, ubicación y distancias a playa/PUJ | baños, parqueos, operación de renta, gastos, desarrollador, financiamiento y amenidades adicionales. |
| The Beach at Punta Cana City Place | tipologías, reserva, planes, fase de entrega, ubicación, distancias, Crystal Lagoons®, renta/administración y amenidades principales | precio, metraje, baños, parqueos, gastos, desarrollador, financiamiento y condiciones específicas por unidad. |

## Regla para filtros y comparativa

- Un filtro solo devuelve coincidencias con valor `documented`; `pending` no equivale a “no”.
- Una comparativa usa checklist, raya, celda vacía o CTA “Consultar” para una ausencia; no muestra textos internos como “Por confirmar”. Para `varies`, muestra “Según fase/unidad” cuando esa condición ayude a decidir.
- La opción “Solo diferencias” compara el valor y también el estado. Dos campos pendientes no se presentan como una diferencia útil.
- Precios, fechas, disponibilidad, ROI y beneficios fiscales se vuelven a validar antes de una reserva o campaña.

## Datos necesarios para completar una ficha

Solicitar al desarrollador, por proyecto y por fase: lista de precios y vigencia, inventario, planos con baños/parqueos/metros, fecha de entrega, cuota de mantenimiento, desarrollador, financiamiento, política de renta y administración, condiciones fiscales, eficiencia energética y lista de amenidades verificable.

## Modelo de base de datos CMS

El mapa completo para convertir este estándar en un manejador de contenido está en `docs/data/PROJECT-CMS-DATABASE-MAP.md`. El esquema SQL base está en `docs/data/project-cms-schema.sql` y cubre proyectos, traducciones, fases, tipologías, precios, planes de pago, especificaciones comparables, amenidades, ubicaciones, media, contactos y fuentes de evidencia.

