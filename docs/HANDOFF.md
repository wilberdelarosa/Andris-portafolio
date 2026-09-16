# Traspaso del proyecto Andris Peña

Fecha de traspaso: 2026-09-15.

Este documento resume lo necesario para que otra persona pueda levantar, validar y continuar el portafolio de Andris Peña sin depender del historial de chat.

## Estado general

- La aplicación activa vive en `app/` y usa Next.js, React y TypeScript.
- El sitio está preparado como portafolio independiente de Andris Peña, con rutas para inicio, proyectos, fichas, mapa, asesor, calculadora y contacto.
- El mapa usa MapLibre/OpenFreeMap/OpenStreetMap con perspectiva 3D inicial y puntos de proyectos.
- El formulario de contacto prepara consultas, valida datos obligatorios y puede enviar a un proxy externo si se configura `NEXT_PUBLIC_LEAD_WEBHOOK_URL`.
- GPT Sites está configurado para salida estática mediante `app/.openai/hosting.json` y `npm run build:sites`.
- La integración con AlterEstate está documentada y preparada como proxy, pero no debe exponerse ninguna clave en el frontend.

## Levantar local

Requisitos:

- Node.js 20.9 o superior.
- npm.

Comandos:

```powershell
cd app
npm ci
npm run dev
```

URL local por defecto:

```text
http://localhost:3000
```

Si otro proceso usa el puerto, ejecutar con un puerto alterno:

```powershell
$env:PORT='3014'
npm run dev
```

## Validar antes de entregar

Desde `app/`:

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
```

Con el servidor local corriendo:

```powershell
$env:BASE_URL='http://127.0.0.1:3014'
npm run test:browser
```

La verificación de navegador revisa rutas principales, overflow, errores de consola, imágenes, idiomas, 404 y flujos esenciales.

## Publicar en GPT Sites

La publicación esperada es estática.

```powershell
cd app
npm run build:sites
```

El build deja el resultado en `app/out`. La configuración de Sites está en:

```text
app/.openai/hosting.json
```

Antes de publicar, confirmar:

- `NEXT_PUBLIC_SITE_URL` con el dominio final.
- `NEXT_PUBLIC_INDEXABLE=true` solo cuando Andris apruebe indexación.
- Textos comerciales, derechos de imágenes y política de privacidad.
- Que no exista ninguna clave privada en archivos commiteados.

## AlterEstate

Documentación principal:

```text
docs/integrations/ALTERESTATE.md
```

Archivos relevantes:

- `app/src/lib/lead-payload.ts`
- `app/src/components/contact-section.tsx`
- `app/workers/alterestate-leads-worker.js`
- `app/scripts/test-alterestate-lead.mjs`
- `app/tests/lead-payload.test.ts`

El frontend solo debe conocer:

```env
NEXT_PUBLIC_LEAD_WEBHOOK_URL=https://tu-proxy.example.com/leads
```

El token privado de AlterEstate va solo en el proxy:

```env
ALTERESTATE_API_TOKEN=token_privado
ALLOWED_ORIGIN=https://dominio-publico-del-sitio
```

Las claves probadas durante la preparación devolvieron `401 Invalid token` desde la API oficial de AlterEstate. No se sube ninguna de esas claves al repositorio. Para activar leads reales, Andris debe entregar una API Key valida para el endpoint de leads.

## Contenido pendiente

Antes de convertir el sitio en oferta comercial, confirmar:

- Tabla de precios vigente.
- Fechas de entrega vigentes.
- Disponibilidad por proyecto y tipología.
- UID de propiedades en AlterEstate si se quieren vincular leads a propiedades concretas.
- Texto legal final de privacidad y terminos.
- Biografia ampliada, certificaciones, enlaces sociales y testimonios si Andris desea mostrarlos.

No inventar datos para completar tarjetas, filtros, SEO o formularios.

## Reglas de marca

- Presentar el sitio solo como portafolio independiente de Andris Peña.
- No publicar capturas de referencia como si fueran activos de marca.
- No usar recursos externos sin revisar procedencia y licencia.
- Mantener originales en `ASSETS/` y publicar derivados optimizados desde `app/public/derived/`.

## Rutas utiles

- Inicio: `/`
- Proyectos: `/proyectos`
- Ficha: `/proyectos/[slug]`
- Mapa: `/mapa`
- Sobre mi: `/sobre-mi`
- Calculadora: `/calculadora`
- Contacto: `/contacto`

Los parametros `?lang=es`, `?lang=en`, `?lang=fr` cambian idioma. El parametro `?proyecto=slug` conserva la seleccion entre ficha, mapa y contacto.
