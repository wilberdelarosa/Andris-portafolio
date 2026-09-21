/**
 * Alta de proyectos del estudio CMS.
 *
 * Cambios frente a la version anterior:
 *  - importaba `LocationInput`, `NumberPicker`, `CurrencyInput` y `TagInput`
 *    sin declararlos, asi que la pestana entera reventaba en tiempo de
 *    ejecucion;
 *  - el boton decia "Guardar y publicar" y "aparecera en el catalogo
 *    automaticamente", pero solo escribia un borrador en `localStorage`.
 *
 * Ahora escribe en Supabase cuando la sesion tiene permiso y, si RLS lo
 * rechaza, conserva el borrador local y explica que falta. El JSON del
 * proyecto siempre se puede descargar para pegarlo en `src/content/projects.ts`.
 */
"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Buildings,
  CheckCircle,
  CurrencyDollar,
  DownloadSimple,
  FileText,
  Image as ImageIcon,
  ListChecks,
  MapPin,
  Ruler,
  Warning,
  Eye,
  X,
} from "@phosphor-icons/react";
import type { Localized, PropertyProject } from "@/content/projects";
import { draftsStore } from "@/lib/cms/local-store";
import { describeError, isSupabaseConfigured } from "@/lib/cms/session";
import { createProject, WriteDeniedError } from "@/lib/cms/project-writer";
import { CurrencyInput } from "./currency-input";
import { ImageInput } from "./image-input";
import { NumberPicker } from "./number-picker";
import { LocationInput } from "./rd-location-selector";
import { TagInput } from "./tag-input";
import { LivePreviewPanel } from "./live-preview-panel";

function loc(text: string): Localized {
  return { es: text, en: text, fr: text };
}

/** Slug ASCII: la version anterior dejaba acentos y signos en la URL. */
function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type TabId = "basico" | "mapa" | "espacios" | "precios" | "especificaciones" | "media";
type FieldValue = string | number | string[];

const TABS: { id: TabId; label: string; icon: typeof FileText }[] = [
  { id: "basico", label: "General", icon: FileText },
  { id: "mapa", label: "Ubicación", icon: MapPin },
  { id: "espacios", label: "Dimensiones", icon: Ruler },
  { id: "precios", label: "Precios", icon: CurrencyDollar },
  { id: "especificaciones", label: "Specs", icon: ListChecks },
  { id: "media", label: "Galería", icon: ImageIcon },
];

const TAB_FIELDS: Record<TabId, string[]> = {
  basico: ["name", "location", "desc"],
  mapa: ["mapUrl", "mapCoords"],
  espacios: ["bedrooms", "areaMin"],
  precios: ["priceFrom", "reservation", "deliveryYear"],
  especificaciones: ["amenities", "typologies", "investmentBenefits", "nearby"],
  media: ["heroImg", "gallery1"],
};

function isFilled(value: FieldValue | undefined): boolean {
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return value > 0;
  return false;
}

type Feedback = { tone: "ok" | "error" | "info"; message: string };


function RichAmenityBuilder({ amenities, setAmenities }: { amenities: any[]; setAmenities: (v: any[]) => void }) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [feature, setFeature] = useState("");
  const [features, setFeatures] = useState<string[]>([]);

  const addFeature = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (feature.trim()) {
        setFeatures([...features, feature.trim()]);
        setFeature("");
      }
    }
  };

  const addAmenity = () => {
    if (name.trim()) {
      setAmenities([...amenities, {
        name: { es: name, en: name, fr: name },
        image: image || undefined,
        features: features.map(f => ({ es: f, en: f, fr: f }))
      }]);
      setName("");
      setImage("");
      setFeatures([]);
    }
  };

  return (
    <div className="admin-card" style={{ marginBottom: '16px', background: 'var(--soft)' }}>
      <label>
        Construir Amenidad Interactiva
        <input type="text" placeholder="Nombre (ej. Piscina)" value={name} onChange={e => setName(e.target.value)} />
      </label>
      <ImageInput label="Imagen de Amenidad" value={image} onChange={setImage} />
      <label style={{ marginTop: '10px' }}>
        Añadir viñeta (Enter para confirmar)
        <input type="text" placeholder="ej. Climatizada" value={feature} onChange={e => setFeature(e.target.value)} onKeyDown={addFeature} />
      </label>
      {features.length > 0 && (
        <ul style={{ paddingLeft: '20px', marginBottom: '10px' }}>
          {features.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      )}
      <button type="button" className="button button-outline" onClick={addAmenity}>Agregar Amenidad</button>
      
      {amenities.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <strong>Amenidades agregadas:</strong>
          <ul>
            {amenities.map((a, idx) => (
              <li key={idx}>
                {a.name?.es || a} 
                <button type="button" style={{ marginLeft: '10px', color: 'red' }} onClick={() => setAmenities(amenities.filter((_, i) => i !== idx))}>Quitar</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function NewProjectForm() {

  const [activeTab, setActiveTab] = useState<TabId>("basico");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [location, setLocation] = useState("");
  const [province, setProvince] = useState("La Altagracia");
  const [sector, setSector] = useState("");
  const [city, setCity] = useState("");
  const [desc, setDesc] = useState("");

  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [parking, setParking] = useState(1);
  const [areaMin, setAreaMin] = useState(0);
  const [areaMax, setAreaMax] = useState(0);
  const [greenArea, setGreenArea] = useState(0);

  const [priceFrom, setPriceFrom] = useState(0);
  const [priceTo, setPriceTo] = useState(0);
  const [reservation, setReservation] = useState(0);
  const [deliveryYear, setDeliveryYear] = useState(new Date().getFullYear() + 2);
  const [deliveryLabel, setDeliveryLabel] = useState("");
  /**
   * El ano y el precio llegan prerrellenados o en cero, asi que enviarlos como
   * confirmados publicaria cifras que nadie verifico. La evidencia se declara
   * a mano, igual que en el editor de proyectos existentes.
   */
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);
  const [priceConfirmed, setPriceConfirmed] = useState(false);
  const [signing, setSigning] = useState(10);
  const [construction, setConstruction] = useState(30);
  const [onDelivery, setOnDelivery] = useState(60);

  const [amenities, setAmenities] = useState<any[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [typologies, setTypologies] = useState<string[]>([]);
  const [nearby, setNearby] = useState<string[]>([]);
  const [investmentBenefits, setInvestmentBenefits] = useState<string[]>([]);
  const [includesAppliances, setIncludesAppliances] = useState(false);

  const [mapUrl, setMapUrl] = useState("");
  const [mapCoords, setMapCoords] = useState("");

  const [heroImg, setHeroImg] = useState("");
  const [gallery1, setGallery1] = useState("");
  const [gallery2, setGallery2] = useState("");
  const [gallery3, setGallery3] = useState("");

  const [publish, setPublish] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const fieldValues: Record<string, FieldValue> = {
    name, location, desc, mapUrl, mapCoords, bedrooms, areaMin,
    priceFrom, reservation, deliveryYear, amenities, typologies,
    investmentBenefits, nearby, heroImg, gallery1,
  };

  const totalFields = Object.keys(fieldValues).length;
  const filledFields = Object.values(fieldValues).filter(isFilled).length;
  const completionPct = Math.round((filledFields / totalFields) * 100);

  const tabCompletion = Object.fromEntries(
    TABS.map((tab) => {
      const keys = TAB_FIELDS[tab.id];
      return [tab.id, { filled: keys.filter((key) => isFilled(fieldValues[key])).length, total: keys.length }];
    }),
  ) as Record<TabId, { filled: number; total: number }>;

  const tabIndex = TABS.findIndex((tab) => tab.id === activeTab);
  const nextTab = () => tabIndex < TABS.length - 1 && setActiveTab(TABS[tabIndex + 1].id);
  const prevTab = () => tabIndex > 0 && setActiveTab(TABS[tabIndex - 1].id);

  const effectiveSlug = slug.trim() ? slugify(slug) : slugify(name);
  const coords = mapCoords
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((part) => Number.isFinite(part));
  const validCoords: [number, number] | null =
    coords.length === 2 ? [coords[0], coords[1]] : null;

  const galleryUrls = [gallery1, gallery2, gallery3].filter(Boolean);

  /** Registro en el formato de `src/content/projects.ts`, para exportarlo. */
  const buildProject = (): PropertyProject => ({
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : effectiveSlug,
    slug: effectiveSlug,
    name: name.trim(),
    status: publish ? "reviewed" : "draft",
    location,
    description: loc(desc),
    bedrooms: bedrooms ? [bedrooms] : [],
    bathrooms: bathrooms ? [bathrooms] : [],
    parking: parking || null,
    area: { min: areaMin || 0, max: areaMax || areaMin || 0, unit: "m²" },
    greenArea: greenArea || 0,
    delivery: {
      label: loc(deliveryLabel || "Por confirmar"),
      year: deliveryYear || null,
      status: deliveryConfirmed ? "confirmed" : "pending",
    },
    reservation: { amount: reservation || null, currency: "USD", note: null },
    productTypes: productTypes.map(loc),
    typologies: typologies.map(loc),
    includesAppliances,
    investmentBenefits: investmentBenefits.map(loc),
    nearby: nearby.map(loc),
    hero: heroImg,
    gallery: [
      ...(heroImg ? [{ src: heroImg, alt: loc(`Vista principal de ${name}`) }] : []),
      ...galleryUrls.map((src, index) => ({ src, alt: loc(`${name}, imagen ${index + 1}`) })),
    ],
    amenities: amenities.map(loc),
    map: {
      url: mapUrl,
      coordinates: validCoords,
      precision: validCoords ? "exact" : "unverified",
    },
    paymentReference: {
      signing,
      construction,
      delivery: onDelivery,
      commercialStatus: publish ? "En venta" : "Por confirmar",
    },
    source: "Estudio CMS",
    price: {
      from: priceFrom || null,
      to: priceTo || null,
      currency: "USD",
      status: priceConfirmed && priceFrom ? "confirmed" : "pending",
    },
  });

  const saveLocalDraft = (project: PropertyProject) => {
    draftsStore.save({
      projectId: project.slug,
      fields: {
        priceFrom: project.price.from,
        priceTo: project.price.to,
        priceStatus: project.price.status,
        reservationAmount: project.reservation.amount,
        deliveryLabelEs: project.delivery.label.es,
        deliveryYear: project.delivery.year,
        status: project.status,
      },
      notes: JSON.stringify(project, null, 2),
    });
  };

  const downloadJson = () => {
    const project = buildProject();
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${project.slug || "proyecto"}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const missing: string[] = [];
  if (!name.trim()) missing.push("nombre");
  if (!desc.trim()) missing.push("descripción");
  if (!location.trim()) missing.push("ubicación");
  if (!heroImg.trim()) missing.push("imagen principal");

  const handleSave = async () => {
    if (missing.length > 0 || isSaving) return;
    setIsSaving(true);
    setFeedback(null);

    const project = buildProject();
    // El borrador local se guarda siempre: pase lo que pase con la red,
    // el trabajo escrito no se pierde.
    saveLocalDraft(project);

    if (!isSupabaseConfigured()) {
      setFeedback({
        tone: "info",
        message:
          "Supabase no está configurado, así que el proyecto quedó como borrador en este dispositivo. Descarga el JSON para añadirlo al contenido del sitio.",
      });
      setIsSaving(false);
      return;
    }

    try {
      await createProject({
        slug: project.slug,
        name: project.name,
        publish,
        sector,
        city,
        province,
        description: desc,
        deliveryLabel: deliveryLabel || "Por confirmar",
        deliveryYear: deliveryYear || null,
        deliveryConfirmed,
        priceConfirmed,
        bedrooms,
        bathrooms,
        parking,
        areaMin,
        areaMax: areaMax || areaMin,
        greenArea,
        priceFrom: priceFrom || null,
        priceTo: priceTo || null,
        reservation: reservation || null,
        productTypes,
        typologies,
        amenities,
        investmentBenefits,
        nearby,
        includesAppliances,
        mapUrl,
        coordinates: validCoords,
        hero: heroImg,
        gallery: galleryUrls,
        payment: { signing, construction, delivery: onDelivery },
      });
      setFeedback({
        tone: "ok",
        message: publish
          ? `«${project.name}» se creó en Supabase y ya aparece en el catálogo.`
          : `«${project.name}» se creó en Supabase como borrador. Publícalo cuando los datos estén confirmados.`,
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof WriteDeniedError
            ? "Supabase rechazó la escritura: esta sesión no tiene permiso de edición. Aplica la migración 0006_cms_studio_access.sql y registra tu usuario en cms_profiles. El borrador quedó guardado en este dispositivo."
            : `${describeError(error)} El borrador quedó guardado en este dispositivo.`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="npf-split-layout">
      <div className="npf-form-area">
        <div className="npf">
          <div className="npf-header">
        <div>
          <h2 className="npf-title">
            <Buildings size={22} weight="duotone" /> Añadir proyecto
          </h2>
          <p className="npf-subtitle">
            Completa cada sección para publicar en el catálogo, la matriz y el mapa.
          </p>
        </div>
        <div className="npf-progress-pill" data-complete={completionPct === 100 ? "" : undefined}>
          <svg viewBox="0 0 36 36" className="npf-progress-ring" aria-hidden="true">
            <circle cx="18" cy="18" r="15.9" />
            <circle cx="18" cy="18" r="15.9" strokeDasharray={`${completionPct} 100`} />
          </svg>
          <span>{completionPct}%</span>
        </div>
      </div>

      <nav className="npf-tabs" role="tablist" aria-label="Secciones del proyecto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const count = tabCompletion[tab.id];
          const isComplete = count.filled === count.total;
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
              {!isComplete && count.filled > 0 && (
                <span className="npf-tab-badge">{count.filled}/{count.total}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="npf-panel" role="tabpanel">
        {activeTab === "basico" && (
          <fieldset className="npf-fieldset">
            <legend>Información básica</legend>
            <div className="admin-field-row">
              <label className="admin-field">
                Nombre del proyecto *
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Torre Esmeralda"
                />
              </label>
              <label className="admin-field">
                Slug (URL)
                <input
                  type="text"
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  placeholder={slugify(name) || "torre-esmeralda"}
                />
                <small className="admin-field-help">
                  /proyectos/{effectiveSlug || "…"}
                </small>
              </label>
            </div>
            <LocationInput
              value={location}
              onChange={setLocation}
              province={province}
              onProvinceChange={setProvince}
              onPartsChange={(parts) => {
                setSector(parts.sector);
                setCity(parts.city);
                setProvince(parts.province);
              }}
            />
            <label className="admin-field">
              Descripción *
              <textarea
                value={desc}
                onChange={(event) => setDesc(event.target.value)}
                rows={4}
                placeholder="Descripción completa del proyecto…"
              />
            </label>
          </fieldset>
        )}

        {activeTab === "mapa" && (
          <fieldset className="npf-fieldset">
            <legend>Mapa y ubicación exacta</legend>
            <label className="admin-field">
              Enlace de Google Maps o tour 360
              <input
                type="url"
                value={mapUrl}
                onChange={(event) => {
                  const val = event.target.value;
                  setMapUrl(val);
                  const match = val.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                  if (match && !mapCoords) {
                    setMapCoords(`${match[1]}, ${match[2]}`);
                  }
                }}
                placeholder="https://maps.app.goo.gl/…"
              />
              <span className="admin-field-help">Pega un enlace completo de Google Maps con `@lat,lng` para extraer automáticamente las coordenadas a la derecha.</span>
            </label>
            <label className="admin-field">
              Coordenadas (latitud, longitud)
              <input
                type="text"
                value={mapCoords}
                onChange={(event) => setMapCoords(event.target.value)}
                placeholder="18.4718, -69.9234"
              />
              <small className="admin-field-help">
                {validCoords
                  ? "Coordenadas válidas: el proyecto se marcará como ubicación exacta."
                  : "Sin coordenadas válidas el mapa marcará la zona como no verificada."}
              </small>
            </label>
          </fieldset>
        )}

        {activeTab === "espacios" && (
          <fieldset className="npf-fieldset">
            <legend>Dimensiones y espacios</legend>
            <div className="admin-field-row admin-field-row--triple">
              <NumberPicker label="Habitaciones (máx)" value={bedrooms} onChange={setBedrooms} min={0} max={10} />
              <NumberPicker label="Baños (máx)" value={bathrooms} onChange={setBathrooms} min={0} max={10} step={0.5} />
              <NumberPicker label="Parqueos (máx)" value={parking} onChange={setParking} min={0} max={10} />
            </div>
            <div className="admin-field-row admin-field-row--triple">
              <label className="admin-field">
                Área mín (m²)
                <input type="number" min="0" value={areaMin || ""} onChange={(event) => setAreaMin(Number(event.target.value) || 0)} />
              </label>
              <label className="admin-field">
                Área máx (m²)
                <input type="number" min="0" value={areaMax || ""} onChange={(event) => setAreaMax(Number(event.target.value) || 0)} />
              </label>
              <label className="admin-field">
                Área verde (m²)
                <input type="number" min="0" value={greenArea || ""} onChange={(event) => setGreenArea(Number(event.target.value) || 0)} />
              </label>
            </div>
          </fieldset>
        )}

        {activeTab === "precios" && (
          <fieldset className="npf-fieldset">
            <legend>Precios y plan de pago</legend>
            <div className="admin-field-row">
              <CurrencyInput label="Precio desde" value={priceFrom} onChange={setPriceFrom} currency="US$" />
              <CurrencyInput label="Precio hasta" value={priceTo} onChange={setPriceTo} currency="US$" />
            </div>
            <div className="admin-field-row">
              <CurrencyInput label="Reserva" value={reservation} onChange={setReservation} currency="US$" />
              <NumberPicker label="Año de entrega" value={deliveryYear} onChange={setDeliveryYear} min={2025} max={2040} />
            </div>
            <label className="admin-field">
              Texto público de entrega
              <input
                type="text"
                value={deliveryLabel}
                onChange={(event) => setDeliveryLabel(event.target.value)}
                placeholder="Diciembre"
              />
            </label>
            <div className="admin-field-row admin-field-row--triple">
              <NumberPicker label="Firma (%)" value={signing} onChange={setSigning} min={0} max={100} step={5} />
              <NumberPicker label="Construcción (%)" value={construction} onChange={setConstruction} min={0} max={100} step={5} />
              <NumberPicker label="Entrega (%)" value={onDelivery} onChange={setOnDelivery} min={0} max={100} step={5} />
            </div>
            {signing + construction + onDelivery !== 100 && (
              <p className="admin-error-text">
                El plan suma {signing + construction + onDelivery}%; debería sumar 100%.
              </p>
            )}
            <label className="npf-check">
              <input
                type="checkbox"
                checked={priceConfirmed}
                onChange={(event) => setPriceConfirmed(event.target.checked)}
                disabled={!priceFrom}
              />
              El precio está confirmado por el desarrollador
            </label>
            <label className="npf-check">
              <input
                type="checkbox"
                checked={deliveryConfirmed}
                onChange={(event) => setDeliveryConfirmed(event.target.checked)}
              />
              La fecha de entrega está confirmada por el desarrollador
            </label>
            <small className="admin-field-help">
              Sin marcar, el dato se publica como «por confirmar». Nunca se
              anuncia una cifra que nadie verificó.
            </small>
          </fieldset>
        )}

        {activeTab === "especificaciones" && (
          <fieldset className="npf-fieldset">
            <legend>Especificaciones</legend>
            <TagInput label="Tipos de producto" values={productTypes} onChange={setProductTypes} categoryType="product_type" placeholder="Apartamento, villa…" />
            <TagInput label="Tipologías" values={typologies} onChange={setTypologies} categoryType="typology" placeholder="A (1 hab), PH…" />
            <RichAmenityBuilder amenities={amenities} setAmenities={setAmenities} />
            <TagInput label="Beneficios de inversión" values={investmentBenefits} onChange={setInvestmentBenefits} categoryType="investment_benefit" placeholder="Ley CONFOTUR…" />
            <TagInput label="Lugares cercanos" values={nearby} onChange={setNearby} categoryType="nearby_place" placeholder="Aeropuerto (15 min)…" />
            <label className="npf-check">
              <input
                type="checkbox"
                checked={includesAppliances}
                onChange={(event) => setIncludesAppliances(event.target.checked)}
              />
              Incluye línea blanca (electrodomésticos)
            </label>
          </fieldset>
        )}

        {activeTab === "media" && (
          <fieldset className="npf-fieldset">
            <legend>Galería de fotos</legend>
            <ImageInput label="Imagen principal (hero)" value={heroImg} onChange={setHeroImg} required />
            <div className="admin-field-row admin-field-row--triple">
              <ImageInput label="Foto 2" value={gallery1} onChange={setGallery1} />
              <ImageInput label="Foto 3" value={gallery2} onChange={setGallery2} />
              <ImageInput label="Foto 4" value={gallery3} onChange={setGallery3} />
            </div>

            <div className="npf-save-card">
              <h4>¿Todo listo?</h4>
              <label className="npf-check">
                <input
                  type="checkbox"
                  checked={publish}
                  onChange={(event) => setPublish(event.target.checked)}
                />
                Publicar en el catálogo ahora (si no, se crea como borrador)
              </label>

              {missing.length > 0 && (
                <p className="admin-error-text">
                  <Warning size={15} weight="fill" /> Falta completar: {missing.join(", ")}.
                </p>
              )}

              {feedback && (
                <div
                  className={`admin-notification is-${feedback.tone === "ok" ? "success" : feedback.tone === "error" ? "error" : "info"}`}
                  role="status"
                >
                  <span>{feedback.message}</span>
                </div>
              )}

              <div className="admin-actions">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || missing.length > 0}
                  className="npf-save-btn"
                >
                  {isSaving ? "Guardando…" : publish ? "Guardar y publicar" : "Guardar borrador"}
                </button>
                <button type="button" className="button button-outline" onClick={downloadJson}>
                  <DownloadSimple size={16} /> Descargar JSON
                </button>
              </div>
            </div>
          </fieldset>
        )}
      </div>

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
          <span className="npf-done-label">
            <CheckCircle size={16} weight="fill" /> Último paso
          </span>
        )}
      </div>
    </div>
      </div>
      <LivePreviewPanel activeTab={activeTab} draft={fieldValues as unknown as Parameters<typeof LivePreviewPanel>[0]["draft"]} />
    </div>
  );
}
