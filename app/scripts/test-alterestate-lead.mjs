#!/usr/bin/env node
const endpoint =
  process.env.ALTERESTATE_LEADS_ENDPOINT ||
  "https://secure.alterestate.com/api/v1/leads/";
const token = process.env.ALTERESTATE_API_TOKEN;
const shouldSend = process.argv.includes("--send");

function redact(value) {
  if (!value || typeof value !== "string") return value;
  return value.length > 8 ? `${value.slice(0, 4)}…${value.slice(-4)}` : "redacted";
}

const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
const payload = {
  full_name: `TEST Andris Web ${stamp}`,
  phone: process.env.ALTERESTATE_TEST_PHONE || "+18090000000",
  email:
    process.env.ALTERESTATE_TEST_EMAIL ||
    `andris-web-test-${stamp}@example.com`,
  notes:
    "Lead de prueba generado por el script local del portafolio de Andris Peña. Puede eliminarse después de validar la integración.",
  listing_type: "1",
  currency: "USD",
  budget: 150000,
  form_name: "andris_portfolio_contact_test",
  platform: "website",
  metadata: {
    source: "andris-pena-portfolio",
    test: true,
    submitted_at: new Date().toISOString(),
  },
};

if (!shouldSend) {
  console.log(
    JSON.stringify(
      {
        mode: "dry-run",
        endpoint,
        hasToken: Boolean(token),
        payload,
        next:
          "Define ALTERESTATE_API_TOKEN en tu entorno privado y vuelve a ejecutar con --send para crear un lead de prueba real.",
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (!token) {
  console.error(
    "Falta ALTERESTATE_API_TOKEN. No pegues el token en el código; defínelo como variable de entorno privada.",
  );
  process.exit(1);
}

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    Authorization: `Token ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});
const body = await response.json().catch(async () => ({
  raw: await response.text().catch(() => ""),
}));

console.log(
  JSON.stringify(
    {
      ok: response.ok,
      httpStatus: response.status,
      token: redact(token),
      alterEstateStatus: body?.status,
      leadUid: body?.data?.uid,
      dealUid: body?.deal_uid,
      contactUid: body?.contact_uid,
      logId: body?.log_id,
      message: body?.message,
      validationErrors: response.ok ? undefined : body,
    },
    null,
    2,
  ),
);

if (!response.ok) process.exitCode = 1;
