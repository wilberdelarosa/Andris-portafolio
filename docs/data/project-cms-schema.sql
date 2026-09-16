PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS developers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  legal_name TEXT,
  website_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  developer_id TEXT REFERENCES developers(id) ON DELETE SET NULL,
  public_status TEXT NOT NULL DEFAULT 'draft' CHECK (public_status IN ('draft','review','published','archived')),
  sales_status TEXT NOT NULL DEFAULT 'consultar' CHECK (sales_status IN ('preventa','construccion','terminado','agotado','consultar')),
  property_category TEXT NOT NULL DEFAULT 'otro' CHECK (property_category IN ('apartamento','villa','townhouse','penthouse','mixto','otro')),
  sector TEXT,
  city TEXT,
  province TEXT,
  country TEXT NOT NULL DEFAULT 'República Dominicana',
  is_featured INTEGER NOT NULL DEFAULT 0 CHECK (is_featured IN (0,1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_translations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('es','en','fr')),
  headline TEXT,
  summary TEXT,
  description TEXT,
  investment_note TEXT,
  location_note TEXT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (project_id, locale)
);

CREATE TABLE IF NOT EXISTS project_source_records (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('brochure','developer_message','website','price_list','contract','manual_note')),
  title TEXT NOT NULL,
  url TEXT,
  file_path TEXT,
  received_at TEXT,
  verified_at TEXT,
  verified_by TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_phases (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  delivery_date TEXT,
  delivery_year INTEGER,
  status TEXT NOT NULL DEFAULT 'consultar' CHECK (status IN ('preventa','construccion','entregado','consultar')),
  source_status TEXT NOT NULL DEFAULT 'pending' CHECK (source_status IN ('documented','pending','varies','not_applicable','archived')),
  source_record_id TEXT REFERENCES project_source_records(id) ON DELETE SET NULL,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_locations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  latitude REAL,
  longitude REAL,
  map_label TEXT,
  address_public TEXT,
  sector TEXT,
  city TEXT,
  province TEXT,
  country TEXT NOT NULL DEFAULT 'República Dominicana',
  distance_to_beach_minutes REAL,
  distance_to_airport_minutes REAL,
  source_status TEXT NOT NULL DEFAULT 'pending' CHECK (source_status IN ('documented','pending','varies','not_applicable','archived')),
  source_record_id TEXT REFERENCES project_source_records(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_unit_types (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_id TEXT REFERENCES project_phases(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  property_type TEXT NOT NULL DEFAULT 'otro' CHECK (property_type IN ('apartamento','villa','townhouse','penthouse','otro')),
  bedrooms_min REAL,
  bedrooms_max REAL,
  bathrooms_min REAL,
  bathrooms_max REAL,
  area_min_m2 REAL,
  area_max_m2 REAL,
  parking_min REAL,
  parking_max REAL,
  furnished_status TEXT NOT NULL DEFAULT 'unknown' CHECK (furnished_status IN ('yes','no','optional','unknown')),
  availability_status TEXT NOT NULL DEFAULT 'consult' CHECK (availability_status IN ('available','limited','sold_out','consult')),
  source_status TEXT NOT NULL DEFAULT 'pending' CHECK (source_status IN ('documented','pending','varies','not_applicable','archived')),
  source_record_id TEXT REFERENCES project_source_records(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_price_snapshots (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  unit_type_id TEXT REFERENCES project_unit_types(id) ON DELETE SET NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  price_from REAL,
  price_to REAL,
  reservation_amount REAL,
  effective_from TEXT,
  effective_to TEXT,
  source_status TEXT NOT NULL DEFAULT 'pending' CHECK (source_status IN ('documented','pending','varies','not_applicable','archived')),
  source_record_id TEXT REFERENCES project_source_records(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_payment_plans (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_id TEXT REFERENCES project_phases(id) ON DELETE SET NULL,
  unit_type_id TEXT REFERENCES project_unit_types(id) ON DELETE SET NULL,
  initial_percent REAL,
  during_construction_percent REAL,
  on_delivery_percent REAL,
  reservation_amount REAL,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT,
  source_status TEXT NOT NULL DEFAULT 'pending' CHECK (source_status IN ('documented','pending','varies','not_applicable','archived')),
  source_record_id TEXT REFERENCES project_source_records(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS specification_fields (
  id TEXT PRIMARY KEY,
  field_key TEXT NOT NULL UNIQUE,
  label_es TEXT NOT NULL,
  label_en TEXT,
  label_fr TEXT,
  group_key TEXT NOT NULL CHECK (group_key IN ('investment','space','location','operation','amenities','legal')),
  data_type TEXT NOT NULL CHECK (data_type IN ('text','number','money','percent','distance','date','boolean','enum')),
  unit TEXT,
  is_filterable INTEGER NOT NULL DEFAULT 0 CHECK (is_filterable IN (0,1)),
  is_comparable INTEGER NOT NULL DEFAULT 1 CHECK (is_comparable IN (0,1)),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_spec_values (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  field_id TEXT NOT NULL REFERENCES specification_fields(id) ON DELETE CASCADE,
  phase_id TEXT REFERENCES project_phases(id) ON DELETE SET NULL,
  unit_type_id TEXT REFERENCES project_unit_types(id) ON DELETE SET NULL,
  value_text TEXT,
  value_number REAL,
  value_boolean INTEGER CHECK (value_boolean IN (0,1)),
  value_date TEXT,
  value_json TEXT,
  source_status TEXT NOT NULL DEFAULT 'pending' CHECK (source_status IN ('documented','pending','varies','not_applicable','archived')),
  source_record_id TEXT REFERENCES project_source_records(id) ON DELETE SET NULL,
  public_note TEXT,
  internal_note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (project_id, field_id, phase_id, unit_type_id)
);

CREATE TABLE IF NOT EXISTS amenities (
  id TEXT PRIMARY KEY,
  amenity_key TEXT NOT NULL UNIQUE,
  label_es TEXT NOT NULL,
  label_en TEXT,
  label_fr TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  icon_name TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_amenities (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  amenity_id TEXT NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  phase_id TEXT REFERENCES project_phases(id) ON DELETE SET NULL,
  availability TEXT NOT NULL DEFAULT 'unknown' CHECK (availability IN ('included','not_included','optional','varies','unknown')),
  source_status TEXT NOT NULL DEFAULT 'pending' CHECK (source_status IN ('documented','pending','varies','not_applicable','archived')),
  source_record_id TEXT REFERENCES project_source_records(id) ON DELETE SET NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (project_id, amenity_id, phase_id)
);

CREATE TABLE IF NOT EXISTS project_media (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('hero','gallery','floor_plan','map','video','document')),
  url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  caption TEXT,
  rights_status TEXT NOT NULL DEFAULT 'unknown' CHECK (rights_status IN ('owned','developer_provided','licensed','unknown')),
  is_public INTEGER NOT NULL DEFAULT 1 CHECK (is_public IN (0,1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_contacts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('sales','developer','broker','support','internal')),
  name TEXT,
  phone TEXT,
  email TEXT,
  whatsapp TEXT,
  is_public INTEGER NOT NULL DEFAULT 0 CHECK (is_public IN (0,1)),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_public_status ON projects(public_status);
CREATE INDEX IF NOT EXISTS idx_projects_sector ON projects(sector, city, country);
CREATE INDEX IF NOT EXISTS idx_project_phases_project ON project_phases(project_id, delivery_year, status);
CREATE INDEX IF NOT EXISTS idx_project_unit_types_project ON project_unit_types(project_id, bedrooms_min, bedrooms_max, area_min_m2, area_max_m2);
CREATE INDEX IF NOT EXISTS idx_project_prices_project ON project_price_snapshots(project_id, currency, price_from);
CREATE INDEX IF NOT EXISTS idx_project_prices_filter ON project_price_snapshots(currency, price_from, effective_from, effective_to, source_status);
CREATE INDEX IF NOT EXISTS idx_project_specs_field ON project_spec_values(field_id, source_status);
CREATE INDEX IF NOT EXISTS idx_project_amenities_amenity ON project_amenities(amenity_id, availability, source_status);
CREATE INDEX IF NOT EXISTS idx_project_media_project ON project_media(project_id, media_type, is_public, sort_order);

INSERT OR IGNORE INTO specification_fields (id, field_key, label_es, group_key, data_type, unit, is_filterable, is_comparable, display_order) VALUES
  ('spec_price_from','price_from','Precio desde','investment','money','USD',1,1,10),
  ('spec_reservation','reservation','Reserva','investment','money','USD',0,1,20),
  ('spec_payment_plan','payment_plan','Plan de pago','investment','text',NULL,0,1,30),
  ('spec_roi_estimated','roi_estimated','ROI estimado','investment','percent','%',0,1,40),
  ('spec_appreciation','appreciation_potential','Potencial de revalorización','investment','enum',NULL,1,1,50),
  ('spec_property_type','property_type','Tipo de propiedad','space','enum',NULL,1,1,60),
  ('spec_bedrooms','bedrooms','Habitaciones','space','number',NULL,1,1,70),
  ('spec_bathrooms','bathrooms','Baños','space','number',NULL,0,1,80),
  ('spec_area','area','Metraje','space','number','m²',1,1,90),
  ('spec_parking','parking','Parking','space','number',NULL,0,1,100),
  ('spec_furnished','furnished','Amueblado','space','enum',NULL,0,1,110),
  ('spec_location','location','Ubicación','location','text',NULL,1,1,120),
  ('spec_beach_distance','beach_distance','Distancia a la playa','location','distance','min',1,1,130),
  ('spec_airport_distance','airport_distance','Distancia al aeropuerto','location','distance','min',0,1,140),
  ('spec_delivery_date','delivery_date','Fecha de entrega','location','date',NULL,1,1,150),
  ('spec_project_status','project_status','Estado del proyecto','location','enum',NULL,1,1,160),
  ('spec_vacation_rental','vacation_rental','Renta vacacional','operation','enum',NULL,1,1,170),
  ('spec_rental_management','rental_management','Administración de Airbnb','operation','enum',NULL,0,1,180),
  ('spec_maintenance_fee','maintenance_fee','Cuota de mantenimiento','operation','money','USD/m² mensual',0,1,190),
  ('spec_developer','developer','Desarrollador','operation','text',NULL,0,1,200),
  ('spec_financing','financing','Financiamiento','operation','enum',NULL,1,1,210),
  ('spec_ideal_for','ideal_for','Ideal para','operation','text',NULL,1,1,220),
  ('spec_smart_home','smart_home','Domótica / Smart Home','amenities','boolean',NULL,1,1,230),
  ('spec_energy_efficiency','energy_efficiency','Eficiencia energética','amenities','text',NULL,0,1,240),
  ('spec_confotur','confotur','CONFOTUR','legal','enum',NULL,1,1,250);

INSERT OR IGNORE INTO amenities (id, amenity_key, label_es, category, display_order) VALUES
  ('amenity_pool','pool','Piscina','wellness',10),
  ('amenity_jacuzzi','jacuzzi','Jacuzzi','wellness',20),
  ('amenity_gym','gym','Gimnasio','wellness',30),
  ('amenity_spa','spa','Spa','wellness',40),
  ('amenity_coworking','coworking','Coworking','lifestyle',50),
  ('amenity_security_24_7','security_24_7','Seguridad 24/7','service',60),
  ('amenity_concierge','concierge','Concierge','service',70),
  ('amenity_kids_club','kids_club','Kids Club','family',80),
  ('amenity_pet_area','pet_area','Área de mascotas','family',90),
  ('amenity_beach_club','beach_club','Beach Club','beach',100),
  ('amenity_near_beach','near_beach','Cerca de playa','beach',110),
  ('amenity_beachfront','beachfront','Primera línea de playa','beach',120),
  ('amenity_artificial_beach','artificial_beach','Playa artificial','beach',130),
  ('amenity_golf','golf','Golf','sports',140),
  ('amenity_tennis','tennis','Cancha de tenis','sports',150),
  ('amenity_padel','padel','Cancha de pádel','sports',160),
  ('amenity_pickleball','pickleball','Pickleball','sports',170),
  ('amenity_rooftop','rooftop','Rooftop','lifestyle',180),
  ('amenity_rental_management','rental_management','Rental Management','operation',190),
  ('amenity_smart_home','smart_home','Smart Home','technology',200),
  ('amenity_solar_panels','solar_panels','Paneles solares','sustainability',210);
