/**
 * Alta Y edicion de proyectos del estudio CMS: un unico formulario.
 *
 * Antes eran dos cosas distintas y ninguna completa: esta pantalla solo daba
 * de alta, y "editar" abria otro editor que guardaba cuatro campos en
 * `localStorage` sin tocar la base. Ahora el mismo formulario se usa para las
 * dos operaciones —`projectId` presente significa editar— y en ambos casos
 * escribe el grafo completo en Supabase.
 *
 * Al editar, el componente se monta con `initial` ya resuelto por
 * `loadProjectForEdit`, y el padre lo remonta con `key={projectId}`: por eso
 * el estado se inicializa directamente desde `initial` y no hay ningun
 * `setState` dentro de un efecto para rellenar campos.
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
  PencilSimple,
  Plus,
  Ruler,
  Trash,
  Warning,
  Eye,
  X,
} from "@phosphor-icons/react";
import type { AmenityEntry, Localized, PropertyProject } from "@/content/projects";
import { describeError, isSupabaseConfigured } from "@/lib/cms/session";
import {
  createProject,
  ProjectStepError,
  updateProject,
  WriteDeniedError,
  type AmenityInput,
  type ProjectFormValues,
} from "@/lib/cms/project-writer";
import { CurrencyInput } from "./currency-input";
import { ImageInput } from "./image-input";
import { NumberPicker } from "./number-picker";
import { LocationInput } from "./rd-location-selector";
import { PropertyCategorySelect } from "./property-category-select";
import { AmenityGroupSelect } from "./amenity-group-select";
import { TagInput } from "./tag-input";
import { LivePreviewPanel } from "./live-preview-panel";

function loc(text: string): Localized {
  return { es: text, en: text, fr: text };
}

/**
 * `AmenityInput` (lo que arma `RichAmenityBuilder`, con `features` como
 * lista de viñetas ya localizadas) al `AmenityEntry` que espera
 * `PropertyProject` para la vista previa y el JSON descargable (`features`
 * como conjunto `{es,en,fr}` de textos sueltos).
 */
function toAmenityEntry(amenity: AmenityInput): AmenityEntry {
  return {
    name: amenity.name,
    image: amenity.image || null,
    features:
      amenity.features && amenity.features.length > 0
        ? {
            es: amenity.features.map((f) => f.es).filter(Boolean),
            en: amenity.features.map((f) => f.en).filter(Boolean),
            fr: amenity.features.map((f) => f.fr).filter(Boolean),
          }
        : undefined,
  };
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
type FieldValue = string | number | string[] | AmenityInput[];

export interface NewProjectFormProps {
  /** Valores precargados de un proyecto existente, para editarlo. */
  initial?: ProjectFormValues;
  /** Se llama tras guardar en Supabase, para que el panel refresque la lista. */
  onSaved?: () => void;
  /** Vuelve al listado sin guardar. */
  onCancel?: () => void;
}

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
  media: ["heroImg", "gallery"],
};

function isFilled(value: FieldValue | undefined): boolean {
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return value > 0;
  return false;
}

type Feedback = { tone: "ok" | "error" | "info"; message: string };


function RichAmenityBuilder({
  amenities,
  setAmenities,
}: {
  amenities: AmenityInput[];
  setAmenities: (v: AmenityInput[]) => void;
}) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [feature, setFeature] = useState("");
  const [features, setFeatures] = useState<Localized[]>([]);
  const [groupId, setGroupId] = useState("");

  const addFeature = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (feature.trim()) {
        setFeatures([...features, loc(feature.trim())]);
        setFeature("");
      }
    }
  };

  const addAmenity = () => {
    if (name.trim()) {
      setAmenities([
        ...amenities,
        {
          name: loc(name.trim()),
          image: image || undefined,
          features,
          groupId: groupId || undefined,
        },
      ]);
      setName("");
      setImage("");
      setFeatures([]);
      setGroupId("");
    }
  };

  return (
    <div className="admin-card" style={{ marginBottom: '16px', background: 'var(--soft)' }}>
      <label>
        Construir Amenidad Interactiva
        <input type="text" placeholder="Nombre (ej. Piscina)" value={name} onChange={e => setName(e.target.value)} />
      </label>
      <ImageInput label="Imagen de Amenidad" value={image} onChange={setImage} />
      <AmenityGroupSelect value={groupId} onChange={setGroupId} />
      <label style={{ marginTop: '10px' }}>
        Añadir viñeta (Enter para confirmar)
        <input type="text" placeholder="ej. Climatizada" value={feature} onChange={e => setFeature(e.target.value)} onKeyDown={addFeature} />
      </label>
      {features.length > 0 && (
        <ul style={{ paddingLeft: '20px', marginBottom: '10px' }}>
          {features.map((f, i) => <li key={i}>{f.es}</li>)}
        </ul>
      )}
      <button type="button" className="button button-outline" onClick={addAmenity}>Agregar Amenidad</button>

      {amenities.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <strong>Amenidades agregadas:</strong>
          <ul>
            {amenities.map((a, idx) => (
              <li key={idx}>
                {a.name.es}
                <button type="button" style={{ marginLeft: '10px', color: 'red' }} onClick={() => setAmenities(amenities.filter((_, i) => i !== idx))}>Quitar</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function NewProjectForm({ initial, onSaved, onCancel }: NewProjectFormProps = {}) {
  const editing = initial !== undefined;

  const [activeTab, setActiveTab] = useState<TabId>("basico");

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [province, setProvince] = useState(initial?.province ?? "La Altagracia");
  const [sector, setSector] = useState(initial?.sector ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [desc, setDesc] = useState(initial?.description ?? "");

  const [bedrooms, setBedrooms] = useState(initial?.bedrooms ?? 0);
  const [bathrooms, setBathrooms] = useState(initial?.bathrooms ?? 0);
  const [parking, setParking] = useState(initial?.parking ?? 0);
  const [areaMin, setAreaMin] = useState(initial?.areaMin ?? 0);
  const [areaMax, setAreaMax] = useState(initial?.areaMax ?? 0);
  const [greenArea, setGreenArea] = useState(initial?.greenArea ?? 0);

  const [priceFrom, setPriceFrom] = useState(initial?.priceFrom ?? 0);
  const [priceTo, setPriceTo] = useState(initial?.priceTo ?? 0);
  const [reservation, setReservation] = useState(initial?.reservation ?? 0);
  const [deliveryYear, setDeliveryYear] = useState(
    initial?.deliveryYear ?? new Date().getFullYear() + 2,
  );
  const [deliveryLabel, setDeliveryLabel] = useState(initial?.deliveryLabel ?? "");
  /**
   * El ano y el precio llegan prerrellenados o en cero, asi que enviarlos como
   * confirmados publicaria cifras que nadie verifico. La evidencia se declara
   * a mano; al editar se conserva la que ya tenia el proyecto.
   */
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(
    initial?.deliveryConfirmed ?? false,
  );
  const [priceConfirmed, setPriceConfirmed] = useState(initial?.priceConfirmed ?? false);
  const [signing, setSigning] = useState(initial?.payment.signing ?? 0);
  const [construction, setConstruction] = useState(initial?.payment.construction ?? 0);
  const [onDelivery, setOnDelivery] = useState(initial?.payment.delivery ?? 0);

  const [amenities, setAmenities] = useState<AmenityInput[]>(initial?.amenities ?? []);
  /** `property_category_id` elegido en el combo box; `""` mientras no se elija. */
  const [propertyCategoryId, setPropertyCategoryId] = useState(
    initial?.propertyCategoryId ?? "",
  );
  const [propertyCategoryKey, setPropertyCategoryKey] = useState(
    initial?.propertyCategoryKey ?? "",
  );
  const [propertyCategoryLabel, setPropertyCategoryLabel] = useState(
    initial?.propertyCategoryLabel ?? "",
  );
  /**
   * Ya no hay un campo de texto libre para el tipo de producto: la categoría
   * real se elige en `PropertyCategorySelect`. Este arreglo se deriva de esa
   * elección para no dejar vacío el spec legado `product_types` que algunos
   * lectores antiguos todavía consultan.
   */
  const productTypes = propertyCategoryLabel ? [propertyCategoryLabel] : [];
  const [typologies, setTypologies] = useState<string[]>(initial?.typologies ?? []);
  const [nearby, setNearby] = useState<string[]>(initial?.nearby ?? []);
  const [investmentBenefits, setInvestmentBenefits] = useState<string[]>(
    initial?.investmentBenefits ?? [],
  );
  const [includesAppliances, setIncludesAppliances] = useState(
    initial?.includesAppliances ?? false,
  );

  const [mapUrl, setMapUrl] = useState(initial?.mapUrl ?? "");
  const [mapCoords, setMapCoords] = useState(
    initial?.coordinates ? initial.coordinates.join(", ") : "",
  );

  const [heroImg, setHeroImg] = useState(initial?.hero ?? "");
  /**
   * Galeria de longitud libre. Antes eran tres campos fijos (`gallery1..3`):
   * al editar un proyecto con seis fotos, guardar habria borrado tres sin
   * avisar, porque la edicion reemplaza las filas de `project_media`.
   */
  const [gallery, setGallery] = useState<string[]>(initial?.gallery ?? []);

  const [publish, setPublish] = useState(initial?.publish ?? false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const setGalleryAt = (index: number, value: string) =>
    setGallery(gallery.map((item, position) => (position === index ? value : item)));

  const fieldValues: Record<string, FieldValue> = {
    name, location, desc, mapUrl, mapCoords, bedrooms, areaMin,
    priceFrom, reservation, deliveryYear, amenities, typologies,
    investmentBenefits, nearby, heroImg, gallery,
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

  const galleryUrls = gallery.map((url) => url.trim()).filter(Boolean);

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
    propertyCategory: propertyCategoryKey
      ? { key: propertyCategoryKey, label: loc(propertyCategoryLabel) }
      : null,
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
    amenities: amenities.map(toAmenityEntry),
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
  if (!propertyCategoryId) missing.push("categoría de propiedad");

  /** Mensaje de error que dice qué pasó y qué hacer, no solo que falló. */
  const explainSaveError = (error: unknown): string => {
    if (error instanceof WriteDeniedError) {
      return (
        "Supabase rechazó la escritura: esta sesión no tiene permiso de edición. " +
        "Aplica la migración 0006_cms_studio_access.sql y registra tu usuario en cms_profiles. " +
        "Nada se guardó; descarga el JSON si no quieres perder lo escrito."
      );
    }
    if (error instanceof ProjectStepError) {
      return editing
        ? `Se guardaron los datos anteriores pero falló el paso «${error.step}»: ${error.message} El proyecto quedó a medias; vuelve a pulsar Guardar para completarlo.`
        : `Falló el paso «${error.step}»: ${error.message} No se creó nada: el proyecto se revirtió por completo.`;
    }
    return `${describeError(error)} Descarga el JSON si no quieres perder lo escrito.`;
  };

  const handleSave = async () => {
    if (missing.length > 0 || isSaving) return;
    setIsSaving(true);
    setFeedback(null);

    const project = buildProject();

    if (!isSupabaseConfigured()) {
      setFeedback({
        tone: "error",
        message:
          "Supabase no está configurado en este despliegue, así que no hay dónde guardar el proyecto. " +
          "Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY, o descarga el JSON para no perder lo escrito.",
      });
      setIsSaving(false);
      return;
    }

    const payload = {
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
      propertyCategoryId,
      propertyCategoryKey,
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
    };

    try {
      if (initial) {
        await updateProject(initial.id, payload);
        setFeedback({
          tone: "ok",
          message: publish
            ? `«${project.name}» se actualizó en Supabase y el catálogo ya muestra los cambios.`
            : `«${project.name}» se actualizó en Supabase y quedó como borrador, fuera del catálogo público.`,
        });
      } else {
        await createProject(payload);
        setFeedback({
          tone: "ok",
          message: publish
            ? `«${project.name}» se creó en Supabase y ya aparece en el catálogo.`
            : `«${project.name}» se creó en Supabase como borrador. Publícalo cuando los datos estén confirmados.`,
        });
      }
      onSaved?.();
    } catch (error) {
      setFeedback({ tone: "error", message: explainSaveError(error) });
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
          {onCancel && (
            <button type="button" className="npf-back-btn" onClick={onCancel}>
              <ArrowLeft size={15} /> Volver a Proyectos
            </button>
          )}
          <h2 className="npf-title">
            {editing ? (
              <>
                <PencilSimple size={22} weight="duotone" /> Editar proyecto
              </>
            ) : (
              <>
                <Buildings size={22} weight="duotone" /> Añadir proyecto
              </>
            )}
          </h2>
          <p className="npf-subtitle">
            {editing
              ? `Modifica «${initial.name}». Al guardar se reescribe su ficha completa en Supabase.`
              : "Completa cada sección para publicar en el catálogo, la matriz y el mapa."}
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
              /* La pestaña activa siempre queda visible dentro de la tira
                 deslizable: al avanzar con «Siguiente» la tira acompaña. */
              ref={(el) => {
                if (el && activeTab === tab.id) {
                  el.scrollIntoView({ block: "nearest", inline: "nearest" });
                }
              }}
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
            <PropertyCategorySelect
              value={propertyCategoryId}
              onChange={(categoryId, categoryKey, categoryLabel) => {
                setPropertyCategoryId(categoryId);
                setPropertyCategoryKey(categoryKey);
                setPropertyCategoryLabel(categoryLabel);
              }}
            />
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

            {gallery.length > 0 && (
              <div className="npf-gallery-grid">
                {gallery.map((url, index) => (
                  <div key={index} className="npf-gallery-slot">
                    <ImageInput
                      label={`Foto ${index + 2}`}
                      value={url}
                      onChange={(value) => setGalleryAt(index, value)}
                    />
                    <button
                      type="button"
                      className="npf-gallery-remove"
                      onClick={() =>
                        setGallery(gallery.filter((_, position) => position !== index))
                      }
                    >
                      <Trash size={14} /> Quitar foto {index + 2}
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              className="button button-outline"
              onClick={() => setGallery([...gallery, ""])}
            >
              <Plus size={16} /> Añadir foto a la galería
            </button>

            <div className="npf-save-card">
              <h4>{editing ? "¿Guardamos los cambios?" : "¿Todo listo?"}</h4>
              <label className="npf-check">
                <input
                  type="checkbox"
                  checked={publish}
                  onChange={(event) => setPublish(event.target.checked)}
                />
                {editing
                  ? "Publicado en el catálogo (al desmarcar vuelve a borrador)"
                  : "Publicar en el catálogo ahora (si no, se crea como borrador)"}
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
                  {isSaving
                    ? "Guardando…"
                    : editing
                      ? "Guardar cambios"
                      : publish
                        ? "Guardar y publicar"
                        : "Guardar borrador"}
                </button>
                <button type="button" className="button button-outline" onClick={downloadJson}>
                  <DownloadSimple size={16} /> Descargar JSON
                </button>
                {onCancel && (
                  <button type="button" className="button button-outline" onClick={onCancel}>
                    <X size={16} /> Cancelar
                  </button>
                )}
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
      <div className={`npf-preview-container ${showMobilePreview ? 'is-open' : ''}`}>
        <div className="npf-preview-mobile-header">
          <h3>Vista Previa</h3>
          <button type="button" onClick={() => setShowMobilePreview(false)} aria-label="Cerrar vista previa">
            <X size={20} />
          </button>
        </div>
        {/*
          Antes esto era `fieldValues as unknown as DraftPreview`: el doble
          cast colaba `amenities` como objetos donde la vista previa espera
          nombres sueltos, así que la tarjeta no pintaba ninguna. El objeto se
          arma explícito, con los tipos que el contrato declara.
        */}
        <LivePreviewPanel
          activeTab={activeTab}
          draft={{
            name,
            location,
            desc,
            bedrooms,
            bathrooms,
            parking,
            areaMin,
            areaMax,
            greenArea,
            deliveryLabel,
            deliveryYear,
            reservation,
            productTypes,
            typologies,
            includesAppliances,
            investmentBenefits,
            nearby,
            priceFrom,
            priceTo,
            heroImg,
            gallery1: galleryUrls[0],
            mapUrl,
            mapCoords,
            amenities: amenities.map((amenity) => amenity.name.es),
            signing,
            construction,
            onDelivery,
          }}
        />
      </div>
      <button 
        type="button" 
        className="npf-mobile-preview-fab" 
        onClick={() => setShowMobilePreview(true)}
      >
        <Eye size={20} /> Vista previa
      </button>
    </div>
  );
}
