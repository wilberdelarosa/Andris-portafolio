/**
 * Genera el PDF del escenario de pagos de la calculadora.
 *
 * Documento de marca (navy, arena; Helvetica como sustituto del sistema por
 * las restricciones de jsPDF) con el desglose firma / construcción / entrega,
 * el cronograma mensual, la nota de referencia comercial y los datos de
 * contacto confirmados del asesor.
 *
 * Los importes son ilustrativos: el documento lo declara en la nota y el pie.
 */
import { jsPDF } from "jspdf";
import { advisor } from "../content/advisor.ts";
import type { Locale } from "../content/projects.ts";

export interface PaymentPdfInput {
  locale: Locale;
  price: number;
  signingPercent: number;
  constructionPercent: number;
  months: number;
  plan: {
    total: number;
    signing: number;
    construction: number;
    delivery: number;
    deliveryPercent: number;
    monthly: number;
    lastMonthly: number;
  };
  projectName: string | null;
  reservationNote: string | null;
}

const INK: [number, number, number] = [11, 31, 58];
const INK_SOFT: [number, number, number] = [19, 46, 74];
const BLUE: [number, number, number] = [49, 102, 146];
const SAND: [number, number, number] = [216, 200, 180];
const SAND_DEEP: [number, number, number] = [200, 183, 156];
const SURFACE: [number, number, number] = [244, 240, 230];
const MUTED: [number, number, number] = [78, 90, 107];
const IVORY: [number, number, number] = [251, 249, 244];

const LOCALE_TAGS: Record<Locale, string> = {
  es: "es-DO",
  en: "en-US",
  fr: "fr-FR",
};

const LABELS: Record<
  Locale,
  {
    docType: string;
    title: string;
    scenario: string;
    propertyValue: string;
    project: string;
    projectNone: string;
    monthly: string;
    monthlyCaption: string;
    breakdown: string;
    concept: string;
    percent: string;
    amount: string;
    signing: string;
    construction: string;
    delivery: string;
    total: string;
    schedule: string;
    monthsUnit: string;
    lastPayment: string;
    reservation: string;
    disclaimerTitle: string;
    disclaimer: string;
    contactTitle: string;
    generated: string;
    advisorRole: string;
  }
> = {
  es: {
    docType: "SIMULADOR DE PAGOS",
    title: "Escenario de pagos",
    scenario: "Escenario",
    propertyValue: "Valor de la propiedad",
    project: "Proyecto de referencia",
    projectNone: "Escenario libre",
    monthly: "Cuota mensual estimada",
    monthlyCaption: "durante construcción",
    breakdown: "Distribución del pago",
    concept: "Concepto",
    percent: "%",
    amount: "Monto",
    signing: "A la firma",
    construction: "Durante construcción",
    delivery: "A la entrega",
    total: "Total",
    schedule: "Cronograma de construcción",
    monthsUnit: "meses",
    lastPayment: "Última cuota ajustada por redondeo",
    reservation: "Reserva de referencia",
    disclaimerTitle: "Nota importante",
    disclaimer:
      "Los importes son ilustrativos y no constituyen una oferta vigente ni financiación prometida. El precio, la disponibilidad, el plan de pagos, las fechas de entrega y la aplicación de la reserva deben confirmarse por escrito con el desarrollador antes de cualquier reserva.",
    contactTitle: "Confirmar este escenario",
    generated: "Documento generado el",
    advisorRole: "Asesor inmobiliario · Punta Cana, República Dominicana",
  },
  en: {
    docType: "PAYMENT SIMULATOR",
    title: "Payment scenario",
    scenario: "Scenario",
    propertyValue: "Property value",
    project: "Reference project",
    projectNone: "Custom scenario",
    monthly: "Estimated monthly payment",
    monthlyCaption: "during construction",
    breakdown: "Payment distribution",
    concept: "Concept",
    percent: "%",
    amount: "Amount",
    signing: "At signing",
    construction: "During construction",
    delivery: "On delivery",
    total: "Total",
    schedule: "Construction schedule",
    monthsUnit: "months",
    lastPayment: "Final payment adjusted for rounding",
    reservation: "Reference reservation",
    disclaimerTitle: "Important note",
    disclaimer:
      "Amounts are illustrative and do not constitute a current offer or promised financing. Price, availability, payment plan, delivery dates and application of the reservation must be confirmed in writing with the developer before any booking.",
    contactTitle: "Confirm this scenario",
    generated: "Document generated on",
    advisorRole: "Real estate advisor · Punta Cana, Dominican Republic",
  },
  fr: {
    docType: "SIMULATEUR DE PAIEMENT",
    title: "Scénario de paiement",
    scenario: "Scénario",
    propertyValue: "Valeur du bien",
    project: "Projet de référence",
    projectNone: "Scénario libre",
    monthly: "Mensualité estimée",
    monthlyCaption: "pendant la construction",
    breakdown: "Répartition du paiement",
    concept: "Concept",
    percent: "%",
    amount: "Montant",
    signing: "À la signature",
    construction: "Pendant la construction",
    delivery: "À la livraison",
    total: "Total",
    schedule: "Calendrier de construction",
    monthsUnit: "mois",
    lastPayment: "Dernière mensualité ajustée pour l’arrondi",
    reservation: "Réservation de référence",
    disclaimerTitle: "Note importante",
    disclaimer:
      "Les montants sont indicatifs et ne constituent ni une offre en vigueur ni un financement promis. Le prix, la disponibilité, le plan de paiement, les dates de livraison et l’imputation de la réservation doivent être confirmés par écrit avec le promoteur avant toute réservation.",
    contactTitle: "Confirmer ce scénario",
    generated: "Document généré le",
    advisorRole: "Conseiller immobilier · Punta Cana, République dominicaine",
  },
};

export function buildPaymentPdf(input: PaymentPdfInput): jsPDF {
  const { locale, plan } = input;
  const L = LABELS[locale];
  const tag = LOCALE_TAGS[locale];
  const money = (amount: number) =>
    new Intl.NumberFormat(tag, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  const dateLine = new Intl.DateTimeFormat(tag, {
    dateStyle: "long",
  }).format(new Date());

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = 0;

  // --- Portada: banda navy -------------------------------------------------
  doc.setFillColor(...INK);
  doc.rect(0, 0, pageW, 122, "F");
  doc.setFillColor(...SAND);
  doc.rect(0, 122, pageW, 4, "F");

  doc.setTextColor(...IVORY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("ANDRIS PEÑA", margin, 50);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...SAND);
  doc.text(L.advisorRole, margin, 66);
  doc.setTextColor(...IVORY);
  doc.setFontSize(8.5);
  doc.text(L.docType, margin, 98, { charSpace: 2.2 });

  // --- Título y fecha --------------------------------------------------------
  y = 158;
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(L.title, margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  y += 18;
  doc.text(`${L.generated} ${dateLine} · ${locale.toUpperCase()}`, margin, y);

  // --- Tarjeta de cuota mensual -----------------------------------------------
  y += 18;
  doc.setFillColor(...SURFACE);
  doc.setDrawColor(...SAND_DEEP);
  doc.roundedRect(margin, y, contentW, 90, 10, 10, "FD");

  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text(`${L.monthly} · ${L.monthlyCaption}`, margin + 18, y + 24);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(27);
  doc.setTextColor(...INK);
  doc.text(money(plan.monthly), margin + 18, y + 54);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text(
    `${input.months} ${L.monthsUnit} · ${L.lastPayment}: ${money(plan.lastMonthly)}`,
    margin + 18,
    y + 74,
  );

  // --- Datos del escenario -------------------------------------------------------
  y += 114;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(...INK);
  doc.text(L.scenario, margin, y);
  doc.setDrawColor(...SAND_DEEP);
  doc.line(margin, y + 7, pageW - margin, y + 7);

  const scenarioRows: [string, string][] = [
    [L.propertyValue, money(input.price)],
    [L.project, input.projectName ?? L.projectNone],
  ];
  if (input.reservationNote) {
    scenarioRows.push([L.reservation, input.reservationNote]);
  }
  scenarioRows.push([
    L.schedule,
    `${input.signingPercent}% / ${input.constructionPercent}% / ${plan.deliveryPercent}% · ${input.months} ${L.monthsUnit}`,
  ]);

  doc.setFontSize(10);
  for (const [label, value] of scenarioRows) {
    y += 21;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(label, margin, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK);
    doc.text(value, pageW - margin, y, { align: "right" });
  }

  // --- Tabla de distribución -------------------------------------------------------
  y += 34;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(...INK);
  doc.text(L.breakdown, margin, y);

  y += 12;
  const colX = {
    concept: margin,
    percent: pageW - margin - 170,
    amount: pageW - margin,
  };
  doc.setFillColor(...INK_SOFT);
  doc.roundedRect(margin, y, contentW, 24, 6, 6, "F");
  doc.setTextColor(...IVORY);
  doc.setFontSize(9);
  doc.text(L.concept, colX.concept + 12, y + 16);
  doc.text(L.percent, colX.percent, y + 16, { align: "right" });
  doc.text(L.amount, colX.amount - 12, y + 16, { align: "right" });

  const rows: [string, string, string][] = [
    [L.signing, `${input.signingPercent}%`, money(plan.signing)],
    [L.construction, `${input.constructionPercent}%`, money(plan.construction)],
    [L.delivery, `${plan.deliveryPercent}%`, money(plan.delivery)],
    [L.total, "100%", money(plan.total)],
  ];
  // Separación extra para que la primera fila no toque la cabecera navy.
  y += 6;
  rows.forEach(([concept, percent, amount], index) => {
    y += 28;
    if (index === rows.length - 1) {
      doc.setFillColor(...SURFACE);
      doc.rect(margin, y - 17, contentW, 27, "F");
    }
    doc.setFont("helvetica", index === rows.length - 1 ? "bold" : "normal");
    doc.setTextColor(...INK);
    doc.setFontSize(10);
    doc.text(concept, colX.concept + 12, y);
    doc.setTextColor(...BLUE);
    doc.text(percent, colX.percent, y, { align: "right" });
    doc.setTextColor(...INK);
    doc.text(amount, colX.amount - 12, y, { align: "right" });
    doc.setDrawColor(226, 229, 233);
    doc.line(margin, y + 9, pageW - margin, y + 9);
  });

  // --- Barra de pago -----------------------------------------------------------------
  y += 28;
  const segments: [number, [number, number, number]][] = [
    [input.signingPercent, SAND_DEEP],
    [input.constructionPercent, BLUE],
    [plan.deliveryPercent, INK],
  ];
  let cursor = margin;
  for (const [percent, color] of segments) {
    const w = (contentW * percent) / 100;
    if (w > 0) {
      doc.setFillColor(...color);
      doc.rect(cursor, y, w, 9, "F");
      cursor += w;
    }
  }

  // --- Nota importante ------------------------------------------------------------------
  y += 28;
  // Medir con la fuente final: el ancho de línea depende de familia y tamaño.
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const disclaimerLines = doc.splitTextToSize(L.disclaimer, contentW - 32);
  const boxH = 36 + disclaimerLines.length * 12;
  doc.setFillColor(...SURFACE);
  doc.roundedRect(margin, y, contentW, boxH, 10, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  doc.text(L.disclaimerTitle, margin + 16, y + 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(disclaimerLines, margin + 16, y + 34);

  // --- Contacto: salto de página si no cabe ----------------------------------------------
  y += boxH + 26;
  const contactH = 78;
  if (y + contactH > pageH - 48) {
    doc.addPage();
    y = 70;
  }
  doc.setFillColor(...INK);
  doc.roundedRect(margin, y, contentW, contactH, 10, 10, "F");
  doc.setTextColor(...SAND);
  doc.setFontSize(8.5);
  doc.text(L.contactTitle.toUpperCase(), margin + 18, y + 21, {
    charSpace: 1.5,
  });
  doc.setTextColor(...IVORY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.text(advisor.name, margin + 18, y + 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(
    `${advisor.phone}  ·  ${advisor.email}  ·  WhatsApp +${advisor.whatsapp}`,
    margin + 18,
    y + 61,
  );

  // --- Pie ----------------------------------------------------------------------------------
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(
    `${advisor.name} · ${L.title} · ${dateLine}`,
    pageW / 2,
    pageH - 26,
    { align: "center" },
  );

  return doc;
}

export function downloadPaymentPdf(input: PaymentPdfInput): string {
  const doc = buildPaymentPdf(input);
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `andris-pena-plan-de-pagos-${stamp}.pdf`;
  doc.save(filename);
  return filename;
}
