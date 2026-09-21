import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'app/src/components/admin/new-project-form.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace typing of useState
content = content.replace('const [amenities, setAmenities] = useState<string[]>([]);', 'const [amenities, setAmenities] = useState<any[]>([]);');

// Insert RichAmenityBuilder above NewProjectForm
const richAmenityBuilderCode = `
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
      <label>
        URL de Imagen
        <input type="text" placeholder="https://..." value={image} onChange={e => setImage(e.target.value)} />
      </label>
      <label>
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
`;

content = content.replace('export function NewProjectForm() {', richAmenityBuilderCode);

const oldTagInput = '<TagInput label="Amenidades" values={amenities} onChange={setAmenities} categoryType="amenity" placeholder="Piscina, gimnasio." />';
const newTagInput = '<RichAmenityBuilder amenities={amenities} setAmenities={setAmenities} />';

content = content.replace(oldTagInput, newTagInput);

fs.writeFileSync(file, content, 'utf8');
console.log("Updated new-project-form.tsx");
