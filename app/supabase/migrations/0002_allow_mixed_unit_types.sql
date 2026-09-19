-- Permite unidades mixtas, usadas por el seed del proyecto Sole.
alter table public.project_unit_types
  drop constraint if exists project_unit_types_property_type_check;

alter table public.project_unit_types
  add constraint project_unit_types_property_type_check
  check (property_type in ('apartamento','villa','townhouse','penthouse','mixto','otro'));
