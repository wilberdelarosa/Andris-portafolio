import test from "node:test";
import assert from "node:assert/strict";
import {
  buildAlterEstateLeadPayload,
  getSafeLeadWebhookUrl,
  parseBudgetToUsdMax,
} from "../src/lib/lead-payload.ts";

test("maps contact form data to an AlterEstate lead payload without project UID assumptions", () => {
  const payload = buildAlterEstateLeadPayload({
    name: "  Prueba Andris  ",
    email: "QA@Example.COM ",
    phone: "+1 809 000 0000",
    country: "República Dominicana",
    budget: "US$150,000 a US$200,000",
    timeframe: "Entre 3 y 6 meses",
    project: "Terra Serena",
    interest: "Explorar una inversión",
    message: "Quiero confirmar disponibilidad.",
    locale: "es",
    pageUrl:
      "https://andris.example/contacto/?lang=es&utm_source=instagram&utm_campaign=lanzamiento",
    submittedAt: "2026-09-15T12:00:00.000Z",
  });

  assert.equal(payload.full_name, "Prueba Andris");
  assert.equal(payload.email, "qa@example.com");
  assert.equal(payload.phone, "+1 809 000 0000");
  assert.equal(payload.budget, 200000);
  assert.equal(payload.currency, "USD");
  assert.equal(payload.listing_type, "1");
  assert.equal(payload.form_name, "andris_portfolio_contact");
  assert.equal(payload.platform, "website");
  assert.equal(payload.utm_source, "instagram");
  assert.equal(payload.utm_campaign, "lanzamiento");
  assert.equal(payload.metadata.project_name, "Terra Serena");
  assert.equal(payload.metadata.consent_privacy, true);
  assert.ok(!("property_uid" in payload));
  assert.match(payload.notes, /Lead generado desde el portafolio web/);
});

test("budget parsing stays conservative for guidance-only selections", () => {
  assert.equal(parseBudgetToUsdMax("Hasta US$150,000"), 150000);
  assert.equal(parseBudgetToUsdMax("US$200,000 a US$300,000"), 300000);
  assert.equal(parseBudgetToUsdMax("Necesito orientación"), undefined);
});

test("public webhook url must be https, except localhost during development", () => {
  assert.equal(
    getSafeLeadWebhookUrl("https://lead-proxy.example.com/andris"),
    "https://lead-proxy.example.com/andris",
  );
  assert.equal(
    getSafeLeadWebhookUrl("http://localhost:8787/lead"),
    "http://localhost:8787/lead",
  );
  assert.equal(getSafeLeadWebhookUrl("http://example.com/lead"), "");
  assert.equal(getSafeLeadWebhookUrl("javascript:alert(1)"), "");
});
