# Retrato de contacto y diagnóstico de scroll

## Alcance

Integración de la foto real de Andris en `JourneyActions`, por Terra con razonamiento alto. No se generó una identidad nueva ni se cambiaron datos de contacto. El retrato, la luz ambiental y los círculos son decorativos; el enlace conserva su nombre accesible y destino por idioma/proyecto.

El panel reserva una columna para la foto en escritorio y la coloca debajo del texto en móvil. La luz radial y la sombra aportan profundidad sin desenfocar el rostro ni reducir el contraste del texto. El hover se limita al puntero fino y se desactiva con movimiento reducido.

## Diagnóstico reproducido

- La pestaña inicial de `localhost:3001` registró `No link element found for chunk ...css` al aplicar actualizaciones de Turbopack. El HTML obtenido directamente del servidor incluía el retrato nuevo, pero la pestaña conservaba el componente anterior incluso después de recargar.
- Una sesión nueva contra el servidor de desarrollo también llegó a mostrar HTML sin hidratar: no arrancaban Lenis ni el mapa; los valores de Motion permanecían en su estado inicial. No basta con que la página responda 200 ni con que no haya excepciones JavaScript.
- Usar `127.0.0.1` añadió un problema distinto: Next rechazó el WebSocket HMR por origen no permitido. No se debe alternar entre ambos hosts para validar desarrollo sin configurar expresamente los orígenes.
- La compilación de producción sí respondió al scroll real en los dos sentidos. Reiniciar el desarrollo con Webpack y usar `localhost` también pasó las comprobaciones. Se dejó la vista previa en `http://localhost:3001`. En el cierre posterior se fijó Webpack en el script `dev`; se inicia con `npm run dev -- --port 3001`.
- La prueba antigua `check-scroll-motion.mjs` buscaba `.guide-section .section-heading` y `.scroll-progress-bar`, ausentes en la página actual; terminaba sin fallar. No sirve como evidencia de que el scroll funcione.
- Los títulos/paneles tienen tramos centrales de transformación constante. Eso explica parte de la percepción de poco movimiento, pero no el fallo de hidratación. Se preservaron los cambios concurrentes de portada y primitivas globales de movimiento, ajenos a este panel.

No se confirmó un service worker como causa: en la sesión limpia de diagnóstico no había uno controlando la página. La comparación aísla el fallo observado a la entrega/actualización del cliente en desarrollo, no a una ausencia de Motion.

## Verificación reproducible

Con la vista previa activa:

```powershell
cd 'E:\PROYECTOS WEB\AndrisPortafolio\app'
node scripts/verify-contact-scroll.mjs
```

La prueba exige hidratación y elementos reales, usa rueda en ambos sentidos, comprueba el retrato en 320/375/768/1440 px y ES/EN/FR, abre contacto con teclado y comprueba movimiento reducido y errores de ejecución. Guarda mediciones, resultado y capturas en `output/playwright/contact-scroll/`.

Resultado observado con Webpack y localhost: 5/5 comprobaciones. La capa decorativa pasó de 92.1495 px a 24.0187 px al bajar y volvió a 92.1495 px al subir. No es una certificación general de accesibilidad o del sitio completo.

También se ejecutaron lint (0 errores, 2 advertencias preexistentes en `capture-tour-code.js`), typecheck, las cinco pruebas unitarias y build. La suite más amplia `verify-premium-motion.mjs` falló durante el diagnóstico contra el desarrollo sin hidratación; no se presenta como aprobada.
