-- ============================================================================
-- Andris Peña · CMS — Datos iniciales (seed)
-- ============================================================================
-- Refleja el contenido verificado de app/src/content/projects.ts al 2026-09-14.
-- Es idempotente: usa UUID estables y `on conflict do nothing`.
-- Aplicar después de supabase/migrations/0001_cms_core.sql.
--
-- Regla editorial: un dato sin evidencia queda con source_status 'pending' y
-- la interfaz pública lo presenta como "por confirmar". No inventar valores.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- Catálogo de campos comparables y amenidades
-- ---------------------------------------------------------------------------

insert into public.specification_fields (id, field_key, label_es, label_en, label_fr, group_key, data_type, unit, is_filterable, is_comparable, display_order) values
  ('ac000000-0000-4000-8000-000000000010','price_from','Precio desde','Price from','Prix à partir de','investment','money','USD',true,true,10),
  ('ac000000-0000-4000-8000-000000000020','reservation','Reserva','Reservation','Réservation','investment','money','USD',false,true,20),
  ('ac000000-0000-4000-8000-000000000030','payment_plan','Plan de pago','Payment plan','Plan de paiement','investment','text',null,false,true,30),
  ('ac000000-0000-4000-8000-000000000040','roi_estimated','ROI estimado','Estimated ROI','ROI estimé','investment','percent','%',false,true,40),
  ('ac000000-0000-4000-8000-000000000050','appreciation_potential','Potencial de revalorización','Appreciation potential','Potentiel de plus-value','investment','enum',null,true,true,50),
  ('ac000000-0000-4000-8000-000000000060','property_type','Tipo de propiedad','Property type','Type de bien','space','enum',null,true,true,60),
  ('ac000000-0000-4000-8000-000000000070','bedrooms','Habitaciones','Bedrooms','Chambres','space','number',null,true,true,70),
  ('ac000000-0000-4000-8000-000000000080','bathrooms','Baños','Bathrooms','Salles de bain','space','number',null,false,true,80),
  ('ac000000-0000-4000-8000-000000000090','area','Metraje','Area','Surface','space','number','m²',true,true,90),
  ('ac000000-0000-4000-8000-000000000100','parking','Parking','Parking','Parking','space','number',null,false,true,100),
  ('ac000000-0000-4000-8000-000000000110','furnished','Amueblado','Furnished','Meublé','space','enum',null,false,true,110),
  ('ac000000-0000-4000-8000-000000000120','location','Ubicación','Location','Emplacement','location','text',null,true,true,120),
  ('ac000000-0000-4000-8000-000000000130','beach_distance','Distancia a la playa','Distance to the beach','Distance à la plage','location','distance','min',true,true,130),
  ('ac000000-0000-4000-8000-000000000140','airport_distance','Distancia al aeropuerto','Distance to the airport','Distance à l''aéroport','location','distance','min',false,true,140),
  ('ac000000-0000-4000-8000-000000000150','delivery_date','Fecha de entrega','Delivery date','Date de livraison','location','date',null,true,true,150),
  ('ac000000-0000-4000-8000-000000000160','project_status','Estado del proyecto','Project status','État du projet','location','enum',null,true,true,160),
  ('ac000000-0000-4000-8000-000000000170','vacation_rental','Renta vacacional','Vacation rental','Location saisonnière','operation','enum',null,true,true,170),
  ('ac000000-0000-4000-8000-000000000180','rental_management','Administración de Airbnb','Rental management','Gestion locative','operation','enum',null,false,true,180),
  ('ac000000-0000-4000-8000-000000000190','maintenance_fee','Cuota de mantenimiento','Maintenance fee','Charges de copropriété','operation','money','USD/m² mensual',false,true,190),
  ('ac000000-0000-4000-8000-000000000200','developer','Desarrollador','Developer','Promoteur','operation','text',null,false,true,200),
  ('ac000000-0000-4000-8000-000000000210','financing','Financiamiento','Financing','Financement','operation','enum',null,true,true,210),
  ('ac000000-0000-4000-8000-000000000220','ideal_for','Ideal para','Ideal for','Idéal pour','operation','text',null,true,true,220),
  ('ac000000-0000-4000-8000-000000000230','smart_home','Domótica / Smart Home','Smart home','Domotique','amenities','boolean',null,true,true,230),
  ('ac000000-0000-4000-8000-000000000240','energy_efficiency','Eficiencia energética','Energy efficiency','Efficacité énergétique','amenities','text',null,false,true,240),
  ('ac000000-0000-4000-8000-000000000250','confotur','CONFOTUR','CONFOTUR','CONFOTUR','legal','enum',null,true,true,250)
on conflict (field_key) do nothing;

insert into public.amenities (id, amenity_key, label_es, label_en, label_fr, category, display_order) values
  ('ab000000-0000-4000-8000-000000000010','pool','Piscina','Pool','Piscine','wellness',10),
  ('ab000000-0000-4000-8000-000000000020','jacuzzi','Jacuzzi','Jacuzzi','Jacuzzi','wellness',20),
  ('ab000000-0000-4000-8000-000000000030','gym','Gimnasio','Gym','Salle de sport','wellness',30),
  ('ab000000-0000-4000-8000-000000000040','spa','Spa','Spa','Spa','wellness',40),
  ('ab000000-0000-4000-8000-000000000050','coworking','Coworking','Coworking','Coworking','lifestyle',50),
  ('ab000000-0000-4000-8000-000000000060','security_24_7','Seguridad 24/7','24/7 security','Sécurité 24 h/24','service',60),
  ('ab000000-0000-4000-8000-000000000070','concierge','Concierge','Concierge','Conciergerie','service',70),
  ('ab000000-0000-4000-8000-000000000080','kids_club','Parque infantil','Children''s play area','Aire de jeux','family',80),
  ('ab000000-0000-4000-8000-000000000090','pet_area','Área de mascotas','Pet area','Espace pour animaux','family',90),
  ('ab000000-0000-4000-8000-000000000100','beach_club','Beach Club','Beach Club','Beach Club','beach',100),
  ('ab000000-0000-4000-8000-000000000110','near_beach','Cerca de playa','Near the beach','Proche de la plage','beach',110),
  ('ab000000-0000-4000-8000-000000000120','beachfront','Primera línea de playa','Beachfront','Front de mer','beach',120),
  ('ab000000-0000-4000-8000-000000000130','artificial_beach','Playa artificial / laguna','Artificial beach / lagoon','Plage artificielle / lagon','beach',130),
  ('ab000000-0000-4000-8000-000000000140','golf','Golf','Golf','Golf','sports',140),
  ('ab000000-0000-4000-8000-000000000150','tennis','Cancha de tenis','Tennis court','Court de tennis','sports',150),
  ('ab000000-0000-4000-8000-000000000160','padel','Cancha de pádel','Padel court','Terrain de padel','sports',160),
  ('ab000000-0000-4000-8000-000000000170','pickleball','Pickleball','Pickleball','Pickleball','sports',170),
  ('ab000000-0000-4000-8000-000000000180','rooftop','Rooftop','Rooftop','Rooftop','lifestyle',180),
  ('ab000000-0000-4000-8000-000000000190','rental_management','Rental Management','Rental Management','Gestion locative','operation',190),
  ('ab000000-0000-4000-8000-000000000200','smart_home','Smart Home','Smart Home','Smart Home','technology',200),
  ('ab000000-0000-4000-8000-000000000210','solar_panels','Paneles solares','Solar panels','Panneaux solaires','sustainability',210)
on conflict (amenity_key) do nothing;

-- ---------------------------------------------------------------------------
-- Proyecto 1: Melcon Paradise (ficha completa, precio por confirmar)
-- ---------------------------------------------------------------------------

insert into public.projects (id, slug, name, public_status, sales_status, property_category, sector, city, province, country, is_featured, sort_order, published_at) values
  ('aa000000-0000-4000-8000-000000000001','melcon-paradise','Melcon Paradise','published','preventa','apartamento','Vista Cana','Punta Cana','La Altagracia','República Dominicana',true,10,'2026-09-13T00:00:00Z')
on conflict (slug) do nothing;

insert into public.project_translations (project_id, locale, headline, summary, description, seo_title, seo_description)
select 'aa000000-0000-4000-8000-000000000001', t.locale, t.headline, t.summary, t.description, t.headline, t.summary
from (values
  ('es','Febrero de 2028','Un entorno donde la naturaleza es parte de tu día a día.','Un entorno donde la naturaleza es parte de tu día a día. Apartamentos de 1, 2 y 3 habitaciones, rodeados de jardines y espacios para disfrutar a tu ritmo.'),
  ('en','February 2028','A place where nature is part of everyday life.','A place where nature is part of everyday life. One, two and three-bedroom apartments surrounded by gardens and spaces to enjoy at your own pace.'),
  ('fr','Février 2028','Un cadre où la nature fait partie du quotidien.','Un cadre où la nature fait partie du quotidien. Des appartements de 1, 2 et 3 chambres, entourés de jardins et d’espaces à vivre à votre rythme.')
) as t(locale, headline, summary, description)
on conflict (project_id, locale) do nothing;

insert into public.project_source_records (id, project_id, source_type, title, file_path, received_at, verified_at) values
  ('ad000000-0000-4000-8000-000000000001','aa000000-0000-4000-8000-000000000001','brochure','Ficha Melcon Paradise','ASSETS/projects/melcon-paradise/DESCRIPCION.txt','2026-09-12T00:00:00Z','2026-09-13T00:00:00Z')
on conflict do nothing;

insert into public.project_phases (project_id, name, delivery_year, status, source_status, source_record_id, sort_order) values
  ('aa000000-0000-4000-8000-000000000001','Fase única',2028,'construccion','documented','ad000000-0000-4000-8000-000000000001',10)
on conflict do nothing;

insert into public.project_locations (project_id, latitude, longitude, map_label, address_public, sector, city, distance_to_airport_minutes, source_status, source_record_id) values
  ('aa000000-0000-4000-8000-000000000001',18.637918,-68.444033,'Melcon Paradise','Vista Cana · Punta Cana','Vista Cana','Punta Cana',10,'documented','ad000000-0000-4000-8000-000000000001')
on conflict do nothing;

insert into public.project_unit_types (project_id, name, property_type, bedrooms_min, bedrooms_max, area_min_m2, area_max_m2, furnished_status, availability_status, source_status, source_record_id, sort_order) values
  ('aa000000-0000-4000-8000-000000000001','Apartamento 1 habitación','apartamento',1,1,52,108,'yes','consult','documented','ad000000-0000-4000-8000-000000000001',10),
  ('aa000000-0000-4000-8000-000000000001','Apartamento 2 habitaciones','apartamento',2,2,52,108,'yes','consult','documented','ad000000-0000-4000-8000-000000000001',20),
  ('aa000000-0000-4000-8000-000000000001','Apartamento 3 habitaciones','apartamento',3,3,52,108,'yes','consult','documented','ad000000-0000-4000-8000-000000000001',30)
on conflict do nothing;

-- Precio de referencia del desarrollador sin confirmar vigencia: queda pendiente.
insert into public.project_price_snapshots (project_id, currency, price_from, price_to, reservation_amount, source_status, source_record_id, notes) values
  ('aa000000-0000-4000-8000-000000000001','USD',null,null,2000,'pending','ad000000-0000-4000-8000-000000000001','Ficha registra 113900/149000/194000 USD por tipología; el canal comercial difiere por etapa. Pendiente de tabla vigente.')
on conflict do nothing;

insert into public.project_payment_plans (project_id, initial_percent, during_construction_percent, on_delivery_percent, reservation_amount, source_status, source_record_id, sort_order) values
  ('aa000000-0000-4000-8000-000000000001',10,40,50,2000,'pending','ad000000-0000-4000-8000-000000000001',10)
on conflict do nothing;

insert into public.project_amenities (project_id, amenity_id, availability, source_status, source_record_id)
select 'aa000000-0000-4000-8000-000000000001', id, 'included', 'documented', 'ad000000-0000-4000-8000-000000000001'
from public.amenities where amenity_key in ('pool','jacuzzi','gym','spa','coworking','padel','pet_area','concierge','security_24_7')
on conflict do nothing;

insert into public.project_media (project_id, media_type, url, alt_es, alt_en, alt_fr, rights_status, is_public, sort_order) values
  ('aa000000-0000-4000-8000-000000000001','hero','/derived/melcon-hero.webp','Render de los jardines y río artificial de Melcon Paradise','Rendering of the gardens and artificial river at Melcon Paradise','Vue de synthèse des jardins et de la rivière artificielle de Melcon Paradise','developer_provided',true,0),
  ('aa000000-0000-4000-8000-000000000001','gallery','/derived/melcon-hero.webp','Render de los jardines y río artificial de Melcon Paradise','Rendering of the gardens and artificial river at Melcon Paradise','Vue de synthèse des jardins et de la rivière artificielle de Melcon Paradise','developer_provided',true,10),
  ('aa000000-0000-4000-8000-000000000001','gallery','/derived/melcon-pool.webp','Render de la piscina de Melcon Paradise','Rendering of the Melcon Paradise swimming pool','Vue de synthèse de la piscine de Melcon Paradise','developer_provided',true,20),
  ('aa000000-0000-4000-8000-000000000001','gallery','/derived/melcon-living.webp','Render interior de un apartamento de Melcon Paradise','Interior rendering of a Melcon Paradise apartment','Vue de synthèse de l’intérieur d’un appartement Melcon Paradise','developer_provided',true,30),
  ('aa000000-0000-4000-8000-000000000001','gallery','/derived/melcon-bedroom.webp','Render de una habitación de Melcon Paradise','Bedroom rendering at Melcon Paradise','Vue de synthèse d’une chambre de Melcon Paradise','developer_provided',true,40),
  ('aa000000-0000-4000-8000-000000000001','gallery','/derived/melcon-aerial.webp','Render de la vista aérea de Melcon Paradise','Aerial rendering of Melcon Paradise','Vue aérienne de synthèse de Melcon Paradise','developer_provided',true,50),
  ('aa000000-0000-4000-8000-000000000001','gallery','/derived/melcon-gardens.webp','Render de Summer Gardens en Melcon Paradise','Rendering of Summer Gardens at Melcon Paradise','Vue de synthèse de Summer Gardens à Melcon Paradise','developer_provided',true,60)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Proyecto 2: Terra Serena (precio desde confirmado)
-- ---------------------------------------------------------------------------

insert into public.projects (id, slug, name, public_status, sales_status, property_category, sector, city, province, country, is_featured, sort_order, published_at) values
  ('aa000000-0000-4000-8000-000000000002','terra-serena','Terra Serena','published','preventa','mixto','Verón–Bávaro','Punta Cana','La Altagracia','República Dominicana',false,20,'2026-09-14T00:00:00Z')
on conflict (slug) do nothing;

insert into public.project_translations (project_id, locale, headline, summary, description, seo_title, seo_description)
select 'aa000000-0000-4000-8000-000000000002', t.locale, t.headline, t.summary, t.description, t.headline, t.summary
from (values
  ('es','Noviembre de 2028','Un residencial de baja altura con áreas verdes.','Un residencial de baja altura con áreas verdes y espacios pensados para la vida diaria.'),
  ('en','November 2028','A low-rise residential community with green areas.','A low-rise residential community with green areas and spaces designed for everyday life.'),
  ('fr','Novembre 2028','Une résidence de faible hauteur avec des espaces verts.','Une résidence de faible hauteur avec des espaces verts et des lieux pensés pour le quotidien.')
) as t(locale, headline, summary, description)
on conflict (project_id, locale) do nothing;

insert into public.project_source_records (id, project_id, source_type, title, file_path, received_at, verified_at) values
  ('ad000000-0000-4000-8000-000000000002','aa000000-0000-4000-8000-000000000002','developer_message','Descripción Terra Serena aportada por el cliente','ASSETS/projects/project-01-unidentified/','2026-09-14T00:00:00Z','2026-09-14T00:00:00Z')
on conflict do nothing;

insert into public.project_phases (project_id, name, delivery_year, status, source_status, source_record_id, sort_order) values
  ('aa000000-0000-4000-8000-000000000002','Fase única',2028,'construccion','documented','ad000000-0000-4000-8000-000000000002',10)
on conflict do nothing;

insert into public.project_locations (project_id, latitude, longitude, map_label, address_public, sector, city, distance_to_beach_minutes, distance_to_airport_minutes, source_status, source_record_id) values
  ('aa000000-0000-4000-8000-000000000002',18.6486529,-68.4372208,'Terra Serena','Verón–Bávaro · Punta Cana','Verón–Bávaro','Punta Cana',15,20,'documented','ad000000-0000-4000-8000-000000000002')
on conflict do nothing;

insert into public.project_unit_types (project_id, name, property_type, bedrooms_min, bedrooms_max, area_min_m2, area_max_m2, furnished_status, availability_status, source_status, source_record_id, sort_order) values
  ('aa000000-0000-4000-8000-000000000002','Apartamento 1 dormitorio + den','apartamento',1,1,74,134,'unknown','consult','documented','ad000000-0000-4000-8000-000000000002',10),
  ('aa000000-0000-4000-8000-000000000002','Penthouse con terraza privada','penthouse',1,1,74,134,'unknown','consult','documented','ad000000-0000-4000-8000-000000000002',20)
on conflict do nothing;

insert into public.project_price_snapshots (project_id, currency, price_from, price_to, reservation_amount, effective_from, source_status, source_record_id) values
  ('aa000000-0000-4000-8000-000000000002','USD',120000,null,2000,'2026-09-14','documented','ad000000-0000-4000-8000-000000000002')
on conflict do nothing;

insert into public.project_payment_plans (project_id, initial_percent, during_construction_percent, on_delivery_percent, reservation_amount, source_status, source_record_id, sort_order) values
  ('aa000000-0000-4000-8000-000000000002',20,30,50,2000,'documented','ad000000-0000-4000-8000-000000000002',10)
on conflict do nothing;

insert into public.project_amenities (project_id, amenity_id, availability, source_status, source_record_id)
select 'aa000000-0000-4000-8000-000000000002', id, 'included', 'documented', 'ad000000-0000-4000-8000-000000000002'
from public.amenities where amenity_key in ('pool','gym','kids_club','pet_area','security_24_7')
on conflict do nothing;

insert into public.project_media (project_id, media_type, url, alt_es, alt_en, alt_fr, rights_status, is_public, sort_order) values
  ('aa000000-0000-4000-8000-000000000002','hero','/derived/terra-serena-hero.webp','Render de las áreas verdes de Terra Serena','Rendering of Terra Serena''s green areas','Vue de synthèse des espaces verts de Terra Serena','developer_provided',true,0),
  ('aa000000-0000-4000-8000-000000000002','gallery','/derived/terra-serena-hero.webp','Render de las áreas verdes de Terra Serena','Rendering of Terra Serena''s green areas','Vue de synthèse des espaces verts de Terra Serena','developer_provided',true,10),
  ('aa000000-0000-4000-8000-000000000002','gallery','/derived/terra-serena-pool.webp','Render de la piscina de Terra Serena','Rendering of Terra Serena''s pool','Vue de synthèse de la piscine de Terra Serena','developer_provided',true,20),
  ('aa000000-0000-4000-8000-000000000002','gallery','/derived/terra-serena-aerial.webp','Render aéreo de Terra Serena','Aerial rendering of Terra Serena','Vue aérienne de synthèse de Terra Serena','developer_provided',true,30),
  ('aa000000-0000-4000-8000-000000000002','gallery','/derived/terra-serena-living.webp','Render interior de Terra Serena','Interior rendering of Terra Serena','Vue de synthèse intérieure de Terra Serena','developer_provided',true,40),
  ('aa000000-0000-4000-8000-000000000002','gallery','/derived/terra-serena-bedroom.webp','Render de habitación de Terra Serena','Bedroom rendering of Terra Serena','Vue de synthèse d''une chambre de Terra Serena','developer_provided',true,50)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Proyecto 3: The Beach at Punta Cana City Place (precio por confirmar)
-- ---------------------------------------------------------------------------

insert into public.projects (id, slug, name, public_status, sales_status, property_category, sector, city, province, country, is_featured, sort_order, published_at) values
  ('aa000000-0000-4000-8000-000000000003','the-beach-at-punta-cana-city-place','The Beach at Punta Cana City Place','published','consultar','mixto','Punta Cana City Place','Punta Cana','La Altagracia','República Dominicana',false,30,'2026-09-14T00:00:00Z')
on conflict (slug) do nothing;

insert into public.project_translations (project_id, locale, headline, summary, description, seo_title, seo_description)
select 'aa000000-0000-4000-8000-000000000003', t.locale, t.headline, t.summary, t.description, t.headline, t.summary
from (values
  ('es','Entrega inmediata o en construcción según fase','Vista y acceso directo a Crystal Lagoons®.','Un desarrollo residencial en Punta Cana City Place con vista y acceso directo a Crystal Lagoons®, pensado para vivir o invertir en alquiler vacacional.'),
  ('en','Immediate delivery or under construction depending on phase','Views and direct access to Crystal Lagoons®.','A residential development in Punta Cana City Place with views and direct access to Crystal Lagoons®, designed for living or vacation-rental investment.'),
  ('fr','Livraison immédiate ou en construction selon la phase','Vue et accès direct à Crystal Lagoons®.','Un développement résidentiel à Punta Cana City Place avec vue et accès direct à Crystal Lagoons®, pensé pour vivre ou investir en location saisonnière.')
) as t(locale, headline, summary, description)
on conflict (project_id, locale) do nothing;

insert into public.project_source_records (id, project_id, source_type, title, file_path, received_at, verified_at) values
  ('ad000000-0000-4000-8000-000000000003','aa000000-0000-4000-8000-000000000003','developer_message','Descripción The Beach aportada por el cliente','ASSETS/projects/project-03-unidentified/','2026-09-14T00:00:00Z','2026-09-14T00:00:00Z')
on conflict do nothing;

insert into public.project_phases (project_id, name, status, source_status, source_record_id, notes, sort_order) values
  ('aa000000-0000-4000-8000-000000000003','Mare','consultar','varies','ad000000-0000-4000-8000-000000000003','Entrega según fase y tipología.',10),
  ('aa000000-0000-4000-8000-000000000003','Sole','consultar','varies','ad000000-0000-4000-8000-000000000003','Entrega según fase y tipología.',20),
  ('aa000000-0000-4000-8000-000000000003','Arena','consultar','varies','ad000000-0000-4000-8000-000000000003','Entrega según fase y tipología.',30)
on conflict do nothing;

insert into public.project_locations (project_id, latitude, longitude, map_label, address_public, sector, city, distance_to_beach_minutes, distance_to_airport_minutes, source_status, source_record_id) values
  ('aa000000-0000-4000-8000-000000000003',18.6337522,-68.3834561,'The Beach at Punta Cana City Place','Punta Cana City Place · Punta Cana','Punta Cana City Place','Punta Cana',5,9,'documented','ad000000-0000-4000-8000-000000000003')
on conflict do nothing;

insert into public.project_unit_types (project_id, name, property_type, bedrooms_min, bedrooms_max, furnished_status, availability_status, source_status, source_record_id, sort_order) values
  ('aa000000-0000-4000-8000-000000000003','Mare: 1 y 2 habitaciones con vista al Crystal Lagoon','apartamento',1,2,'yes','consult','varies','ad000000-0000-4000-8000-000000000003',10),
  ('aa000000-0000-4000-8000-000000000003','Sole: estudios, 2 a 4 habitaciones y penthouses limitados','mixto',0,4,'yes','consult','varies','ad000000-0000-4000-8000-000000000003',20),
  ('aa000000-0000-4000-8000-000000000003','Arena: estudios y 1 a 3 habitaciones con vista a piscina','apartamento',0,3,'yes','consult','varies','ad000000-0000-4000-8000-000000000003',30)
on conflict do nothing;

-- Sin tabla de precios entregada: snapshot pendiente con la reserva documentada.
insert into public.project_price_snapshots (project_id, currency, price_from, price_to, reservation_amount, source_status, source_record_id, notes) values
  ('aa000000-0000-4000-8000-000000000003','USD',null,null,3000,'pending','ad000000-0000-4000-8000-000000000003','Reserva de 3000 USD incluye gastos legales. Precio por confirmar; disponibilidad sujeta a fase/tipología.')
on conflict do nothing;

insert into public.project_payment_plans (project_id, initial_percent, during_construction_percent, on_delivery_percent, reservation_amount, discount_label, source_status, source_record_id, sort_order) values
  ('aa000000-0000-4000-8000-000000000003',20,30,50,3000,null,'documented','ad000000-0000-4000-8000-000000000003',10),
  ('aa000000-0000-4000-8000-000000000003',30,25,45,3000,null,'documented','ad000000-0000-4000-8000-000000000003',20),
  ('aa000000-0000-4000-8000-000000000003',50,25,25,3000,'2%','documented','ad000000-0000-4000-8000-000000000003',30)
on conflict do nothing;

insert into public.project_amenities (project_id, amenity_id, availability, source_status, source_record_id)
select 'aa000000-0000-4000-8000-000000000003', id, 'included', 'documented', 'ad000000-0000-4000-8000-000000000003'
from public.amenities where amenity_key in ('artificial_beach','near_beach','pool','tennis','padel','pickleball','spa','gym','security_24_7','rental_management')
on conflict do nothing;

insert into public.project_media (project_id, media_type, url, alt_es, alt_en, alt_fr, rights_status, is_public, sort_order) values
  ('aa000000-0000-4000-8000-000000000003','hero','/derived/the-beach-hero.webp','Render de la laguna de The Beach at Punta Cana City Place','Rendering of The Beach at Punta Cana City Place lagoon','Vue de synthèse du lagon de The Beach at Punta Cana City Place','developer_provided',true,0),
  ('aa000000-0000-4000-8000-000000000003','gallery','/derived/the-beach-hero.webp','Render de la laguna de The Beach at Punta Cana City Place','Rendering of The Beach at Punta Cana City Place lagoon','Vue de synthèse du lagon de The Beach at Punta Cana City Place','developer_provided',true,10),
  ('aa000000-0000-4000-8000-000000000003','gallery','/derived/the-beach-pool.webp','Render de la piscina de The Beach at Punta Cana City Place','Rendering of The Beach at Punta Cana City Place pool','Vue de synthèse de la piscine de The Beach at Punta Cana City Place','developer_provided',true,20),
  ('aa000000-0000-4000-8000-000000000003','gallery','/derived/the-beach-terrace.webp','Render de las terrazas de The Beach at Punta Cana City Place','Rendering of The Beach at Punta Cana City Place terraces','Vue de synthèse des terrasses de The Beach at Punta Cana City Place','developer_provided',true,30),
  ('aa000000-0000-4000-8000-000000000003','gallery','/derived/the-beach-living.webp','Render interior de The Beach at Punta Cana City Place','Interior rendering of The Beach at Punta Cana City Place','Vue de synthèse intérieure de The Beach at Punta Cana City Place','developer_provided',true,40),
  ('aa000000-0000-4000-8000-000000000003','gallery','/derived/the-beach-bedroom.webp','Render de habitación de The Beach at Punta Cana City Place','Bedroom rendering of The Beach at Punta Cana City Place','Vue de synthèse d''une chambre de The Beach at Punta Cana City Place','developer_provided',true,50)
on conflict do nothing;

commit;
