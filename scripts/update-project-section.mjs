import fs from 'fs';

const path = 'app/src/components/project-section.tsx';
let content = fs.readFileSync(path, 'utf8');

// Añadir el import si no está
if (!content.includes('AmenitiesCarousel')) {
  content = content.replace(
    'import { getPublishedProjects, getProject, type PropertyProject } from "@/lib/cms";',
    'import { getPublishedProjects, getProject, type PropertyProject } from "@/lib/cms";\\nimport { AmenitiesCarousel } from "./amenities-carousel";'
  );
}

// Reemplazar la parte de las amenidades de forma exacta
const oldBlock = '{project.amenities.length > 0 && <><h3 className="amenities-heading">{t.amenities}</h3>\\n      <div className="amenities-list">\\n        {project.amenities.map((amenity, index) => (\\n          <div key={index}>{amenity[locale]}</div>\\n        ))}\\n      </div></>}';

const newBlock = \`{project.amenities.length > 0 && (
        <>
          <h3 className="amenities-heading">{t.amenities}</h3>
          {project.amenities.some(a => a?.image) ? (
            <AmenitiesCarousel items={project.amenities.map((a, i) => ({
              id: String(i),
              name: a?.name?.[locale] || a?.[locale] || a?.name || String(a),
              image: a?.image
            }))} />
          ) : (
            <div className="amenities-list">
              {project.amenities.map((amenity, index) => {
                const name = amenity?.name?.[locale] || amenity?.[locale] || String(amenity);
                return <div key={index}>{name}</div>;
              })}
            </div>
          )}
        </>
      )}\`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync(path, content);
