# Integración AlterEstate para leads

Fecha de análisis: 2026-09-15.

## Qué permite la API oficial

AlterEstate documenta un endpoint de entrada para leads:

- `POST https://secure.alterestate.com/api/v1/leads/`
- Header privado: `Authorization: Token <ALTERESTATE_API_TOKEN>`
- Campos mínimos: `full_name`, `phone`, `email`
- Campos útiles para este sitio: `notes`, `listing_type`, `currency`, `budget`, UTMs, `metadata`, `custom_fields`, `related`, `round_robin` y `property_uid`.

Respuesta típica:

- Lead nuevo: `status: 201`, más `data.uid`, `log_id`, `deal_uid` y `contact_uid`.
- Contacto duplicado con duplicados desactivados: `status: 200`, mensaje de duplicado y `log_id`.
- Error de validación: `400` con detalle por campo.

Fuentes oficiales:

- <https://dev.alterestate.com/leads>
- <https://dev.alterestate.com/agents>
- <https://dev.alterestate.com/properties/list-all-properties>

## Decisión técnica para este proyecto

El sitio está configurado para exportación estática (`next.config.ts` usa `output: "export"` y GPT Sites publica `out`). Por eso una API route de Next no es suficiente para producción: en el deploy estático no existe un backend que pueda guardar un secreto.

La conexión segura queda así:

1. El formulario genera el payload de AlterEstate en el navegador sin incluir secretos.
2. Si existe `NEXT_PUBLIC_LEAD_WEBHOOK_URL`, el navegador envía ese payload al proxy.
3. El proxy privado añade `ALTERESTATE_API_TOKEN` y reenvía el lead a AlterEstate.
4. El proxy devuelve al navegador solo datos seguros: `ok`, `leadUid`, `dealUid`, `contactUid` o error.
5. Si el proxy no está configurado o falla, el formulario conserva el resumen y los botones de WhatsApp/correo como respaldo.

Nunca se debe poner `ALTERESTATE_API_TOKEN` en `NEXT_PUBLIC_*`, en `public/`, en un archivo commiteado ni en el código del cliente.

## Archivos añadidos

- `app/src/lib/lead-payload.ts`: mapea el formulario al formato AlterEstate.
- `app/workers/alterestate-leads-worker.js`: proxy base para Cloudflare Worker u otro runtime compatible con Fetch.
- `app/scripts/test-alterestate-lead.mjs`: prueba real/dry-run desde servidor local.
- `app/tests/lead-payload.test.ts`: cubre mapeo, presupuesto y URL pública segura.

## Variables de entorno

Frontend público:

```env
NEXT_PUBLIC_LEAD_WEBHOOK_URL=https://tu-proxy.example.com/leads
```

Servidor/proxy privado:

```env
ALTERESTATE_API_TOKEN=token_privado
ALLOWED_ORIGIN=https://andris-pena-portafolio.jos-luis-2194.chatgpt.site
```

Prueba local:

```env
ALTERESTATE_API_TOKEN=token_privado
ALTERESTATE_TEST_PHONE=+18090000000
ALTERESTATE_TEST_EMAIL=andris-web-test@example.com
```

## Payload que envía el formulario

El sitio envía:

- Nombre, teléfono y correo como campos obligatorios.
- `notes` con proyecto, interés, país, presupuesto, plazo, mensaje y consentimiento.
- `budget` numérico estimado desde la etiqueta del presupuesto cuando es posible.
- `listing_type: "1"` para compra.
- `currency: "USD"`.
- `form_name: "andris_portfolio_contact"`.
- `platform: "website"`.
- UTMs si están en la URL.
- `metadata` con contexto no indexable: idioma, URL, proyecto, país, presupuesto escrito, plazo y hora.

No se envía `property_uid` todavía porque los proyectos locales no tienen UID confirmado de AlterEstate. Cuando Andris entregue esos UID, se puede mapear cada `slug` a su `property_uid` y el deal heredará precio, moneda, sector y categoría desde AlterEstate.

## Cómo probar sin crear leads

Desde `app/`:

```bash
npm run test:alterestate
```

Eso imprime el payload en modo `dry-run` y confirma si el entorno tiene token, pero no llama a AlterEstate.

## Cómo crear un lead de prueba real

Define el token como variable privada del shell y ejecuta:

```bash
npm run test:alterestate -- --send
```

El lead se crea con nombre `TEST Andris Web <fecha>` y nota explícita de prueba. Después hay que verificar en AlterEstate si apareció el contacto/deal y si llegó la alerta al agente configurado.

## Alerta al recibir lead

La documentación pública no muestra un webhook saliente específico para notificar leads. Las vías razonables son:

1. Usar AlterEstate como fuente de alerta: configurar el lead para asignarse al dueño del token, a `related` o a una regla `round_robin`.
2. Añadir una alerta paralela en el proxy: email transaccional, Slack, Gmail, WhatsApp Business/Twilio o el canal que el cliente apruebe.

La opción 1 es la más limpia porque mantiene el seguimiento dentro del CRM. La opción 2 es útil si Andris quiere aviso instantáneo fuera de AlterEstate.
