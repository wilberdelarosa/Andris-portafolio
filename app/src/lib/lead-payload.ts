export type LeadLocale = "es" | "en" | "fr";

export type ContactLeadInput = {
  name: string;
  email: string;
  phone: string;
  country: string;
  budget: string;
  timeframe: string;
  project: string;
  interest: string;
  message: string;
  locale: LeadLocale;
  pageUrl?: string;
  submittedAt?: string;
};

export type AlterEstateLeadPayload = {
  full_name: string;
  phone: string;
  email: string;
  notes: string;
  listing_type: "1";
  currency: "USD";
  budget?: number;
  form_name: string;
  platform: "website";
  utm_source?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_medium?: string;
  utm_term?: string;
  adset_name?: string;
  campaign_name?: string;
  metadata: Record<string, string | boolean>;
};

const utmKeys = [
  "utm_source",
  "utm_campaign",
  "utm_content",
  "utm_medium",
  "utm_term",
  "adset_name",
  "campaign_name",
] as const;

export function getSafeLeadWebhookUrl(value: string | undefined) {
  const raw = value?.trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    const isLocal =
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
    return url.protocol === "https:" || isLocal ? url.href : "";
  } catch {
    return "";
  }
}

export function parseBudgetToUsdMax(label: string) {
  const values = label
    .match(/\d[\d\s,.]*/g)
    ?.map((value) => Number(value.replace(/[^\d]/g, "")))
    .filter((value) => Number.isFinite(value) && value > 0);
  if (!values?.length) return undefined;
  return Math.max(...values);
}

function readUtmFields(pageUrl?: string) {
  if (!pageUrl) return {};
  try {
    const params = new URL(pageUrl).searchParams;
    return Object.fromEntries(
      utmKeys.flatMap((key) => {
        const value = params.get(key)?.trim();
        return value ? [[key, value]] : [];
      }),
    ) as Partial<
      Pick<
        AlterEstateLeadPayload,
        | "utm_source"
        | "utm_campaign"
        | "utm_content"
        | "utm_medium"
        | "utm_term"
        | "adset_name"
        | "campaign_name"
      >
    >;
  } catch {
    return {};
  }
}

export function buildAlterEstateLeadPayload(
  input: ContactLeadInput,
): AlterEstateLeadPayload {
  const submittedAt = input.submittedAt ?? new Date().toISOString();
  const project = input.project.trim() || "Asesoría general";
  const message = input.message.trim() || "—";
  const budget = parseBudgetToUsdMax(input.budget);

  return {
    full_name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email.trim().toLowerCase(),
    notes: [
      "Lead generado desde el portafolio web de Andris Peña.",
      `Proyecto de interés: ${project}`,
      `Interés: ${input.interest.trim()}`,
      `País de residencia: ${input.country.trim()}`,
      `Presupuesto declarado: ${input.budget.trim()}`,
      `Plazo deseado: ${input.timeframe.trim()}`,
      `Mensaje: ${message}`,
      "Condiciones de uso y privacidad: aceptadas.",
    ].join("\n"),
    listing_type: "1",
    currency: "USD",
    ...(budget ? { budget } : {}),
    form_name: "andris_portfolio_contact",
    platform: "website",
    ...readUtmFields(input.pageUrl),
    metadata: {
      source: "andris-pena-portfolio",
      locale: input.locale,
      page_url: input.pageUrl ?? "",
      project_name: project,
      interest: input.interest.trim(),
      country: input.country.trim(),
      budget_label: input.budget.trim(),
      timeframe_label: input.timeframe.trim(),
      consent_privacy: true,
      submitted_at: submittedAt,
    },
  };
}
