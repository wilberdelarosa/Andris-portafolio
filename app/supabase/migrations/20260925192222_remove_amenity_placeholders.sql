-- Remove prototype imagery from the amenity catalog. Real images must be
-- uploaded or entered through the CMS for each project.
update public.project_amenities as pa
set custom_image_url = null
where pa.custom_image_url ilike '%picsum.photos%';

update public.amenities as a
set image_url = null
where a.image_url ilike '%picsum.photos%';
