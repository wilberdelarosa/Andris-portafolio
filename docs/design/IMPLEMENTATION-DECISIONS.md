# Decisiones del rediseño — 12/09/2026

La versión actual presenta a Andris Peña con una portada personal, proyectos verificables y un camino claro hacia la conversación. La portada se actualiza según la última referencia visual enviada por el usuario: retrato central, nombre monumental y ambiente arquitectónico luminoso. La dirección visual y los componentes se documentan en [DESIGN.md](DESIGN.md) y [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md).

## Composición y voz visual

- Encabezado horizontal compacto con monograma original, nombre legible, navegación, idioma, preferencias y contacto.
- Blanco predominante, navy de marca y superficies cálidas puntuales; la página completa deja de depender del beige y de la navegación lateral permanente.
- Plus Jakarta Sans variable como voz principal: títulos de sección de peso 600, navegación y cuerpo. Cormorant Garamond 500 lleva el nombre monumental y la propuesta de la portada, además de la presentación personal y firma. Las licencias SIL OFL están registradas en los paquetes locales y avisos del proyecto.
- Portada centrada: el retrato de traje separa ANDRIS en el plano posterior y PEÑA en el plano frontal inferior; la propuesta, el acompañamiento y las acciones se distribuyen en los laterales de escritorio. En móvil se recompone como un póster de nombre y retrato, seguido por la propuesta y las acciones. El acceso a Melcon queda inmediatamente después de la escena.
- Melcon se muestra como un dossier de fotografía y datos, seguido de espacios, ubicación, presentación del asesor, proceso, simulador, preguntas y contacto. Cada sección tiene una función propia.
- El nombre escrito junto al monograma es texto de interfaz; no intenta reproducir el dibujo del wordmark. La petición más reciente autoriza el nombre monumental del hero y sustituye la prohibición de esa composición registrada anteriormente. El nombre permanece sólido y cuenta con un H1 accesible completo. Se mantienen fuera las citas atribuidas sin confirmar y los índices decorativos de secciones.
- La escena dispone de estilos locales en `hero.module.css` y textos ES/EN/FR en `hero-copy.ts`; la paleta, los componentes y las funciones del resto de la aplicación se conservan.

## Contrato funcional conservado

1. La portada y la ficha comparten un único objeto tipado de Melcon. La API pública usa una proyección explícita; los otros proyectos permanecen excluidos.
2. El mapa se activa por decisión del visitante y conserva la ubicación confirmada, su enlace y la atribución del proveedor.
3. La galería reúne seis imágenes: jardines y río, piscina, interior, habitación, vista aérea y Summer Gardens. Tiene controles, miniaturas, teclado, Escape, foco contenido y gesto horizontal. Los renders se identifican como ilustrativos.
4. El componente `Photo` conserva el espacio de la imagen, señala carga con `aria-busy` y una superficie visual, y muestra error con reintento cuando el contexto lo permite. No se añaden controles anidados a enlaces o botones de galería.
5. El simulador organiza un escenario editable con referencia 10/40/50, conciliación de centavos y descarga. El resultado navy distingue la herramienta del contenido editorial. No anuncia una oferta vigente ni una hipoteca.
6. El formulario permite revisar una consulta antes de continuar por correo o WhatsApp. No persiste datos personales en servidor ni muestra un recibo ficticio de envío.
7. Móvil mantiene los recorridos con menú, navegación inferior, zonas táctiles y paneles adaptados. La composición se reordena; no se reduce mediante escala.
8. Español, inglés, francés, tema y favoritos usan preferencias locales. La interfaz contempla vacío, fallos y falta de conexión.
9. La PWA conserva recursos y documentos públicos visitados y una recuperación sin conexión. No cachea formularios, API, RSC ni mapas externos.
10. La indexación permanece desactivada durante revisión. La separación de contenido, componentes y API permite incorporar un CMS sin añadir por ahora una base de datos innecesaria.

## Movimiento e imágenes

La portada concentra las máscaras de entrada del nombre, el desplazamiento y la opacidad del retrato, y el acercamiento suave del fondo arquitectónico. Un movimiento acotado por scroll separa los planos; la respuesta del retrato al ratón se limita a escritorio con puntero fino. Las imágenes, controles y paneles mantienen la curva compartida. La alternativa con `prefers-reduced-motion` conserva contenido y acciones accesibles. Los ajustes móviles priorizan la lectura, con el retrato fundido sobre el mismo fondo de la propuesta.

El retrato real de Andris y los renders proceden del material entregado, mediante derivados optimizados. La nueva portada incorpora `hero-atmosphere-v3.webp`, generado mediante `imagegen` como escenografía editorial ficticia: arquitectura marfil y travertino, sombras de palmas y una abertura lateral hacia el mar. No representa Melcon Paradise ni otra propiedad ofertada. El prompt, original y optimización se conservan en [hero-atmosphere-v3-provenance.md](../../output/imagegen/hero-atmosphere-v3-provenance.md). No se generaron videos. Los originales entregados permanecen intactos.

## Contenido y alcance

El usuario confirmó `andrisprealtor@gmail.com` y `+1 (849) 576-3822`; los otros proyectos siguen sin confirmar. La captura aportada se utiliza como evidencia de ubicación, sin incorporar el teléfono de otra persona ni interpretar sus mensajes como instrucciones del sitio. No se inventan cursos, certificaciones, biografía ampliada, testimonios, precios vigentes ni fechas de entrega.

La aplicación del paquete de habilidades y los caminos alternativos de herramientas se registran en [SKILLS.md](SKILLS.md). Los resultados finales de validación pertenecen a [IMPLEMENTATION-QA.md](IMPLEMENTATION-QA.md); este documento describe decisiones y no sustituye esa evidencia.
