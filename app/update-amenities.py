import re

path = 'src/content/projects.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'amenities: Localized\[\];', r'amenities: (Localized | { name: Localized; image?: string })[];', content)

new_amenities = """  amenities: [
    { name: l("Piscinas y jacuzzi", "Pools & jacuzzi", "Piscines et jacuzzi"), image: "/derived/melcon-pool.webp" },
    { name: l("Gimnasio y spa", "Gym & spa", "Salle de sport et spa"), image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop" },
    { name: l("Coworking", "Coworking", "Coworking"), image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop" },
    { name: l("Pádel", "Padel court", "Terrain de padel"), image: "https://images.unsplash.com/photo-1626245367807-6cb5cc93c042?q=80&w=2071&auto=format&fit=crop" },
    l("Pet friendly", "Pet friendly", "Animaux bienvenus"),
    l("Conserjería 24/7", "24/7 concierge", "Conciergerie 24 h/24"),
    { name: l("Summer Gardens", "Summer Gardens", "Summer Gardens"), image: "/derived/melcon-gardens.webp" },
    l("Owners Club", "Owners Club", "Owners Club"),
  ],"""

content = re.sub(r'amenities:\s*\[\s*l\("Piscinas y jacuzzi"[\s\S]*?Owners Club"\),\s*\],', new_amenities, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Success")
