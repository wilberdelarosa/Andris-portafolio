"use client";

import { useState, useMemo } from "react";
import type { PropertyProject, Localized } from "@/content/projects";
import { draftsStore } from "@/lib/cms/local-store";
import {
  Buildings,
  MapPin,
  Image as ImageIcon,
  CurrencyDollar,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Ruler,
  ListChecks,
} from "@phosphor-icons/react";

function loc(text: string): Localized {
  return { es: text, en: text, fr: text };
}

function parseArray(text: string): string[] {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseNumbers(text: string): number[] {
  return parseArray(text)
    .map(Number)
    .filter((n) => !isNaN(n));
}

type TabId =
  | "basico"
  | "mapa"
  | "espacios"
  | "precios"
  | "especificaciones"
  | "media";

const TABS: { id: TabId; label: string; icon: typeof FileText }[] = [
  { id: "basico", label: "General", icon: FileText },
  { id: "mapa", label: "Ubicaci\u00F3n", icon: MapPin },
  { id: "espacios", label: "Dimensiones", icon: Ruler },
  { id: "precios", label: "Precios", icon: CurrencyDollar },
  { id: "especificaciones", label: "Specs", icon: ListChecks },
  { id: "media", label: "Galer\u00EDa", icon: ImageIcon },
];

const TAB_FIELDS: Record<TabId, string[]> = {
  basico: ["name", "location", "desc"],
  mapa: ["mapUrl", "mapCoords"],
  espacios: ["bedrooms", "areaMin"],
  precios: ["priceFrom", "reservation", "deliveryYear"],
  especificaciones: ["amenities", "typologies", "investmentBenefits", "nearby"],
  media: ["heroImg", "gallery1"],
};

export function NewProjectForm() {
  const [activeTab, setActiveTab] = useState<TabId>("basico");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [location, setLocation] = useState("");
  const [desc, setDesc] = useState("");

  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [parking, setParking] = useState("1");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [greenArea, setGreenArea] = useState("0");

  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [reservation, setReservation] = useState("");
  const [deliveryYear, setDeliveryYear] = useState("");

  const [amenities, setAmenities] = useState("");
  const [productTypes, setProductTypes] = useState("");
  const [typologies, setTypologies] = useState("");
  const [nearby, setNearby] = useState("");
  const [investmentBenefits, setInvestmentBenefits] = useState("");
  const [includesAppliances, setIncludesAppliances] = useState(false);

  const [mapUrl, setMapUrl] = useState("");
  const [mapCoords, setMapCoords] = useState("");

  const [heroImg, setHeroImg] = useState("");
  const [gallery1, setGallery1] = useState("");
  const [gallery2, setGallery2] = useState("");
  const [gallery3, setGallery3] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const fieldValues: Record<string, string> = {
    name, location, desc, mapUrl, mapCoords, bedrooms, areaMin,
    priceFrom, reservation, deliveryYear, amenities, typologies,
    investmentBenefits, nearby, heroImg, gallery1,
  };

  const totalFields = Object.keys(fieldValues).length;
  const filledFields = Object.values(fieldValues).filter((v) => v.trim()).length;
  const completionPct = Math.round((filledFields / totalFields) * 100);

  const tabCompletion = useMemo(() => {
    const result = {} as Record<TabId, { filled: number; total: number }>;
    for (const tab of TABS) {
      const keys = TAB_FIELDS[tab.id];
      const filled = keys.filter((k) => fieldValues[k]?.trim()).length;
      result[tab.id] = { filled, total: keys.length };
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, location, desc, mapUrl, mapCoords, bedrooms, areaMin, priceFrom, reservation, deliveryYear, amenities, typologies, investmentBenefits, nearby, heroImg, gallery1]);

  const tabIndex = TABS.findIndex((t) => t.id === activeTab);
  const nextTab = () => {
    if (tabIndex < TABS.length - 1) setActiveTab(TABS[tabIndex + 1].id);
  };
  const prevTab = () => {
    if (tabIndex > 0) setActiveTab(TABS[tabIndex - 1].id);
  };

  const generateJson = () => {
    setIsSaving(true);
    const coords = mapCoords.split(",").map(Number);
    const validCoords =
      coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])
        ? ([coords[0], coords[1]] as [number, number])
        : null;

    const gallery = [
      { src: heroImg || "/derived/terra-serena-hero.webp", alt: loc("Vista principal") },
    ];
    if (gallery1) gallery.push({ src: gallery1, alt: loc("Vista 2") });
    if (gallery2) gallery.push({ src: gallery2, alt: loc("Vista 3") });
    if (gallery3) gallery.push({ src: gallery3, alt: loc("Vista 4") });

    const project: PropertyProject = {
      id: crypto.randomUUID(),
      slug: slug || name.toLowerCase().replace(/[\s_]+/g, "-"),
      name,
      status: "reviewed",
      location,
      description: loc(desc),
      bedrooms: parseNumbers(bedrooms),
      bathrooms: parseNumbers(bathrooms),
      parking: parseInt(parking) || null,
      area: { min: parseInt(areaMin) || 0, max: parseInt(areaMax) || 0, unit: "m\u00B2" },
      greenArea: parseInt(greenArea) || 0,
      delivery: {
        label: loc("Diciembre"),
        year: parseInt(deliveryYear) || new Date().getFullYear() + 2,
        status: "confirmed",
      },
      reservation: { amount: parseInt(reservation) || null, currency: "USD", note: null },
      productTypes: parseArray(productTypes).map(loc),
      typologies: parseArray(typologies).map(loc),
      includesAppliances,
      investmentBenefits: parseArray(investmentBenefits).map(loc),
      nearby: parseArray(nearby).map(loc),
      hero: heroImg || "/derived/terra-serena-hero.webp",
      gallery,
      amenities: parseArray(amenities).map(loc),
      map: {
        url: mapUrl,
        coordinates: validCoords,
        precision: validCoords ? "exact" : "unverified",
      },
      paymentReference: { signing: 10, construction: 30, delivery: 60, commercialStatus: "En Venta" },
      source: "Admin CMS Form",
      price: { from: parseInt(priceFrom) || null, to: parseInt(priceTo) || null, currency: "USD", status: "confirmed" },
    };

    draftsStore.save({
      projectId: project.slug,
      fields: {
        priceFrom: project.price.from,
        priceTo: project.price.to,
        priceStatus: project.price.status,
        reservationAmount: project.reservation.amount,
        deliveryLabelEs: project.delivery.label.es,
        deliveryYear: project.delivery.year,
        status: "draft",
      },
      notes: JSON.stringify(project, null, 2),
    });
    setIsSaving(false);
    alert("\u00A1Borrador guardado en este dispositivo!");
    window.location.reload();
  };

  return (
    <div className="npf">
      {/* Header + progress */}
      <div className="npf-header">
        <div>
          <h2 className="npf-title">
            <Buildings size={22} weight="duotone" /> A\u00F1adir Proyecto
          </h2>
          <p className="npf-subtitle">
            Completa cada secci\u00F3n para publicar en el cat\u00E1logo, la matriz y el mapa.
          </p>
        </div>
        <div className="npf-progress-pill" data-complete={completionPct === 100 ? "" : undefined}>
          <svg viewBox="0 0 36 36" className="npf-progress-ring">
            <circle cx="18" cy="18" r="15.9" />
            <circle cx="18" cy="18" r="15.9" strokeDasharray={`${completionPct} 100`} />
          </svg>
          <span>{completionPct}%</span>
        </div>
      </div>

      {/* Tab bar */}
      <nav className="npf-tabs" role="tablist" aria-label="Secciones del proyecto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const tc = tabCompletion[tab.id];
          const isComplete = tc.filled === tc.total;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={activeTab === tab.id}
              className={`npf-tab${activeTab === tab.id ? " is-active" : ""}${isComplete ? " is-done" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={17} weight={activeTab === tab.id ? "fill" : "regular"} />
              <span className="npf-tab-label">{tab.label}</span>
              {isComplete && <CheckCircle size={14} weight="fill" className="npf-tab-check" />}
              {!isComplete && tc.filled > 0 && (
                <span className="npf-tab-badge">{tc.filled}/{tc.total}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Panels */}
      <div className="npf-panel" role="tabpanel">
        {activeTab === "basico" && (
          <fieldset className="npf-fieldset">
            <legend>Informaci\u00F3n B\u00E1sica</legend>
            <div className="admin-field-row">
              <label className="admin-field">
                Nombre del Proyecto *
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Torre Esmeralda" />
              </label>
              <label className="admin-field">
                Slug (URL)
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="torre-esmeralda" />
              </label>
            </div>
            <label className="admin-field">
              Ubicaci\u00F3n (Sector, Ciudad) *
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Piantini, Santo Domingo" />
            </label>
            <label className="admin-field">
              Descripci\u00F3n *
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} placeholder="Descripci\u00F3n completa del proyecto\u2026" />
            </label>
          </fieldset>
        )}

        {activeTab === "mapa" && (
          <fieldset className="npf-fieldset">
            <legend>Mapa y Tour 360</legend>
            <label className="admin-field">
              URL Tour 360 / Google Maps
              <input type="url" value={mapUrl} onChange={(e) => setMapUrl(e.target.value)} placeholder="https://maps.app.goo.gl/\u2026" />
            </label>
            <label className="admin-field">
              Coordenadas (Lat, Lng)
              <input type="text" value={mapCoords} onChange={(e) => setMapCoords(e.target.value)} placeholder="18.4718, -69.9234" />
            </label>
          </fieldset>
        )}

        {activeTab === "espacios" && (
          <fieldset className="npf-fieldset">
            <legend>Dimensiones y Espacios</legend>
            <div className="admin-field-row admin-field-row--triple">
              <label className="admin-field">Habitaciones<input type="text" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} placeholder="1, 2, 3" /></label>
              <label className="admin-field">Ba\u00F1os<input type="text" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="1, 2.5" /></label>
              <label className="admin-field">Parqueos<input type="number" value={parking} onChange={(e) => setParking(e.target.value)} /></label>
            </div>
            <div className="admin-field-row admin-field-row--triple">
              <label className="admin-field">\u00C1rea m\u00EDn (m\u00B2)<input type="number" value={areaMin} onChange={(e) => setAreaMin(e.target.value)} /></label>
              <label className="admin-field">\u00C1rea m\u00E1x (m\u00B2)<input type="number" value={areaMax} onChange={(e) => setAreaMax(e.target.value)} /></label>
              <label className="admin-field">\u00C1rea verde (m\u00B2)<input type="number" value={greenArea} onChange={(e) => setGreenArea(e.target.value)} /></label>
            </div>
          </fieldset>
        )}

        {activeTab === "precios" && (
          <fieldset className="npf-fieldset">
            <legend>Precios y Comercial</legend>
            <div className="admin-field-row">
              <label className="admin-field">Precio desde (USD)<input type="number" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} /></label>
              <label className="admin-field">Precio hasta (USD)<input type="number" value={priceTo} onChange={(e) => setPriceTo(e.target.value)} /></label>
            </div>
            <div className="admin-field-row">
              <label className="admin-field">Reserva (USD)<input type="number" value={reservation} onChange={(e) => setReservation(e.target.value)} /></label>
              <label className="admin-field">A\u00F1o de entrega<input type="number" value={deliveryYear} onChange={(e) => setDeliveryYear(e.target.value)} /></label>
            </div>
          </fieldset>
        )}

        {activeTab === "especificaciones" && (
          <fieldset className="npf-fieldset">
            <legend>Especificaciones</legend>
            <p className="npf-hint">Separa los valores con coma.</p>
            <label className="admin-field">Tipos de producto<input type="text" value={productTypes} onChange={(e) => setProductTypes(e.target.value)} placeholder="Apartamento, Penthouse, Villa\u2026" /></label>
            <label className="admin-field">Tipolog\u00EDas<input type="text" value={typologies} onChange={(e) => setTypologies(e.target.value)} placeholder="A (1 Hab), B (2 Habs)\u2026" /></label>
            <label className="admin-field">Amenidades<input type="text" value={amenities} onChange={(e) => setAmenities(e.target.value)} placeholder="Piscina, Gimnasio, Seguridad 24/7\u2026" /></label>
            <label className="admin-field">Beneficios de inversi\u00F3n<input type="text" value={investmentBenefits} onChange={(e) => setInvestmentBenefits(e.target.value)} placeholder="Alta rentabilidad, Exenci\u00F3n CONFOTUR\u2026" /></label>
            <label className="admin-field">Lugares cercanos<input type="text" value={nearby} onChange={(e) => setNearby(e.target.value)} placeholder="Plaza Central (5 min), Aeropuerto (15 min)\u2026" /></label>
            <label className="npf-check">
              <input type="checkbox" checked={includesAppliances} onChange={(e) => setIncludesAppliances(e.target.checked)} />
              Incluye l\u00EDnea blanca (electrodom\u00E9sticos)
            </label>
          </fieldset>
        )}

        {activeTab === "media" && (
          <fieldset className="npf-fieldset">
            <legend>Galer\u00EDa de fotos</legend>
            <label className="admin-field">Imagen principal (Hero) *<input type="text" value={heroImg} onChange={(e) => setHeroImg(e.target.value)} placeholder="/derived/\u2026 o https://\u2026" /></label>
            <div className="admin-field-row admin-field-row--triple">
              <label className="admin-field">Foto 2<input type="text" value={gallery1} onChange={(e) => setGallery1(e.target.value)} /></label>
              <label className="admin-field">Foto 3<input type="text" value={gallery2} onChange={(e) => setGallery2(e.target.value)} /></label>
              <label className="admin-field">Foto 4<input type="text" value={gallery3} onChange={(e) => setGallery3(e.target.value)} /></label>
            </div>
            <div className="npf-save-card">
              <h4>\u00BFTodo listo?</h4>
              <p>El proyecto se guardar\u00E1 y aparecer\u00E1 en el cat\u00E1logo autom\u00E1ticamente.</p>
              <button type="button" onClick={generateJson} disabled={isSaving || !name.trim()} className="npf-save-btn">
                {isSaving ? "Guardando\u2026" : "Guardar y publicar"}
              </button>
            </div>
          </fieldset>
        )}
      </div>

      {/* Footer nav */}
      <div className="npf-footer">
        <button type="button" onClick={prevTab} disabled={tabIndex === 0} className="npf-nav-btn">
          <ArrowLeft size={16} /> Anterior
        </button>
        <span className="npf-step-indicator">{tabIndex + 1} / {TABS.length}</span>
        {tabIndex < TABS.length - 1 ? (
          <button type="button" onClick={nextTab} className="npf-nav-btn npf-nav-btn--next">
            Siguiente <ArrowRight size={16} />
          </button>
        ) : (
          <span className="npf-done-label"><CheckCircle size={16} weight="fill" /> \u00DAltimo paso</span>
        )}
      </div>
    </div>
  );
}
