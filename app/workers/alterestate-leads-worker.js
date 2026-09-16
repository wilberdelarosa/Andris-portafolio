const alterEstateEndpoint = "https://secure.alterestate.com/api/v1/leads/";

const requiredFields = ["full_name", "phone", "email"];

function json(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...init.headers,
    },
  });
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigin = env.ALLOWED_ORIGIN || "";
  if (allowedOrigin && origin === allowedOrigin) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin",
    };
  }
  return {};
}

function isAllowedOrigin(request, env) {
  const allowedOrigin = env.ALLOWED_ORIGIN || "";
  if (!allowedOrigin) return true;
  return request.headers.get("Origin") === allowedOrigin;
}

function cleanLead(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { error: "Payload inválido." };
  }
  const lead = Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== "" && value != null),
  );
  const missing = requiredFields.filter(
    (field) => typeof lead[field] !== "string" || !lead[field].trim(),
  );
  if (missing.length) return { error: "Faltan campos requeridos.", missing };
  return {
    lead: {
      ...lead,
      full_name: lead.full_name.trim(),
      phone: lead.phone.trim(),
      email: lead.email.trim().toLowerCase(),
    },
  };
}

const worker = {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "POST") {
      return json({ ok: false, error: "Método no permitido." }, {
        status: 405,
        headers: cors,
      });
    }
    if (!isAllowedOrigin(request, env)) {
      return json({ ok: false, error: "Origen no permitido." }, {
        status: 403,
        headers: cors,
      });
    }
    if (!env.ALTERESTATE_API_TOKEN) {
      return json({ ok: false, error: "Integración no configurada." }, {
        status: 500,
        headers: cors,
      });
    }

    const contentType = request.headers.get("Content-Type") || "";
    if (!contentType.includes("application/json")) {
      return json({ ok: false, error: "Content-Type debe ser application/json." }, {
        status: 415,
        headers: cors,
      });
    }

    const body = await request.json().catch(() => null);
    const cleaned = cleanLead(body);
    if (cleaned.error) {
      return json({ ok: false, ...cleaned }, { status: 400, headers: cors });
    }

    const upstream = await fetch(alterEstateEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Token ${env.ALTERESTATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cleaned.lead),
    });
    const result = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return json(
        {
          ok: false,
          error: "AlterEstate rechazó el lead.",
          status: result.status,
          validationErrors: result,
        },
        { status: 502, headers: cors },
      );
    }

    return json(
      {
        ok: true,
        status: result.status,
        leadId: result.data?.id,
        leadUid: result.data?.uid,
        dealUid: result.deal_uid,
        contactUid: result.contact_uid,
        logId: result.log_id,
        duplicate: result.status === 200,
      },
      { status: 200, headers: cors },
    );
  },
};

export default worker;
