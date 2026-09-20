/**
 * Selector de ubicacion dominicana para el alta de proyectos.
 *
 * El campo publico `location` del catalogo usa el formato "Sector · Ciudad"
 * (ver `src/content/projects.ts`), asi que el componente compone exactamente
 * ese texto. La provincia no viaja en esa cadena pero si en `onPartsChange`,
 * porque las tablas `projects` y `project_locations` la guardan aparte.
 *
 * Sector y ciudad se derivan de `value` en cada render en lugar de duplicarse
 * en estado: asi el campo nunca se desincroniza del formulario que lo controla.
 */
"use client";

const SEPARATOR = " · ";

/** Las 31 provincias mas el Distrito Nacional. */
const RD_PROVINCES = [
  "Azua",
  "Bahoruco",
  "Barahona",
  "Dajabón",
  "Distrito Nacional",
  "Duarte",
  "El Seibo",
  "Elías Piña",
  "Espaillat",
  "Hato Mayor",
  "Hermanas Mirabal",
  "Independencia",
  "La Altagracia",
  "La Romana",
  "La Vega",
  "María Trinidad Sánchez",
  "Monseñor Nouel",
  "Monte Cristi",
  "Monte Plata",
  "Pedernales",
  "Peravia",
  "Puerto Plata",
  "Samaná",
  "San Cristóbal",
  "San José de Ocoa",
  "San Juan",
  "San Pedro de Macorís",
  "Sánchez Ramírez",
  "Santiago",
  "Santiago Rodríguez",
  "Santo Domingo",
  "Valverde",
] as const;

/** Sugerencias de ciudad para las provincias donde hay obra nueva. */
const CITIES_BY_PROVINCE: Record<string, string[]> = {
  "La Altagracia": [
    "Punta Cana",
    "Bávaro",
    "Verón",
    "Cap Cana",
    "Uvero Alto",
    "Macao",
    "Higüey",
    "Bayahíbe",
  ],
  "Distrito Nacional": ["Santo Domingo"],
  "Santo Domingo": ["Santo Domingo Este", "Santo Domingo Norte", "Santo Domingo Oeste", "Boca Chica"],
  "La Romana": ["La Romana", "Casa de Campo"],
  "Puerto Plata": ["Puerto Plata", "Sosúa", "Cabarete"],
  Samaná: ["Las Terrenas", "Samaná", "Las Galeras"],
  Santiago: ["Santiago de los Caballeros", "Jarabacoa"],
  "San Pedro de Macorís": ["Juan Dolio", "Guayacanes", "San Pedro de Macorís"],
};

export interface LocationParts {
  sector: string;
  city: string;
  province: string;
}

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Partes estructuradas, para las columnas `sector`, `city` y `province`. */
  onPartsChange?: (parts: LocationParts) => void;
  province?: string;
  onProvinceChange?: (province: string) => void;
  label?: string;
}

/** Acepta el separador nuevo y la coma que usaba la version anterior. */
function splitLocation(value: string): { sector: string; city: string } {
  const parts = value
    .split(/·|,/)
    .map((part) => part.trim())
    .filter(Boolean);
  return { sector: parts[0] ?? "", city: parts[1] ?? "" };
}

function joinLocation(sector: string, city: string): string {
  const clean = [sector.trim(), city.trim()].filter(Boolean);
  return clean.join(SEPARATOR);
}

export function LocationInput({
  value,
  onChange,
  onPartsChange,
  province = "La Altagracia",
  onProvinceChange,
  label = "Ubicación",
}: LocationInputProps) {
  const { sector, city } = splitLocation(value);
  const suggestions = CITIES_BY_PROVINCE[province] ?? [];

  const emit = (next: LocationParts) => {
    onChange(joinLocation(next.sector, next.city));
    onPartsChange?.(next);
    if (next.province !== province) onProvinceChange?.(next.province);
  };

  return (
    <fieldset className="npf-fieldset admin-location-fieldset">
      <legend>{label}</legend>
      <div className="admin-field-row admin-field-row--triple">
        <label className="admin-field">
          Sector
          <input
            type="text"
            value={sector}
            onChange={(event) => emit({ sector: event.target.value, city, province })}
            placeholder="Vista Cana"
            autoComplete="off"
          />
        </label>
        <label className="admin-field">
          Ciudad
          <input
            type="text"
            value={city}
            list="admin-city-suggestions"
            onChange={(event) => emit({ sector, city: event.target.value, province })}
            placeholder="Punta Cana"
            autoComplete="off"
          />
          <datalist id="admin-city-suggestions">
            {suggestions.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </label>
        <label className="admin-field">
          Provincia
          <select
            value={province}
            onChange={(event) => emit({ sector, city, province: event.target.value })}
          >
            {RD_PROVINCES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      <small className="admin-field-help">
        En el catálogo se publica como <strong>{joinLocation(sector, city) || "Sector · Ciudad"}</strong>.
        La provincia se guarda aparte en la base de datos.
      </small>
    </fieldset>
  );
}
