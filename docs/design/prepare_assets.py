"""Create technical web derivatives. Never overwrite client originals."""
from pathlib import Path
from PIL import Image, ImageOps
import json

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'app/public/derived'
OUT.mkdir(parents=True, exist_ok=True)
records = []

def export(source, filename, maxsize, *, trim=False, crop=None, quality=85, png=False):
    source = ROOT / source
    original = ImageOps.exif_transpose(Image.open(source))
    im = original.copy()
    if crop: im = im.crop(crop)
    trimmed_bbox = None
    if trim and im.mode == 'RGBA':
        # Ignore isolated nearly invisible pixels when finding the usable logo bounds.
        alpha = im.getchannel('A')
        box = alpha.point(lambda x: 255 if x > 100 else 0).getbbox()
        if box:
            pad = 12
            trimmed_bbox = (max(0,box[0]-pad),max(0,box[1]-pad),min(im.width,box[2]+pad),min(im.height,box[3]+pad))
            im = im.crop(trimmed_bbox)
    im.thumbnail(maxsize, Image.Resampling.LANCZOS)
    target = OUT / filename
    if png: im.save(target, optimize=True)
    else: im.save(target, format='WEBP', quality=quality, method=6)
    records.append({'source':source.relative_to(ROOT).as_posix(),'output':target.relative_to(ROOT).as_posix(),'source_dimensions':list(original.size),'dimensions':list(im.size),'bytes':target.stat().st_size,'crop':crop,'trimmed_bbox':trimmed_bbox})

BROKER = 'ASSETS/content/broker/'
LOGO = 'ASSETS/brand/logos/'
export(BROKER+'portraits/andris-suit-cutout.png', 'andris-suit.webp', (910,1503), trim=True, quality=90)
export(BROKER+'portraits/andris-white-shirt-cutout.png', 'andris-white-shirt.webp', (833,1519), trim=True, quality=88)
export(BROKER+'portraits/andris-coast-portrait-01.png', 'andris-coast.webp', (800,1067), quality=84)
export(BROKER+'hero-compositions/resort-hero-background.png', 'resort-backdrop.webp', (1672,941), quality=85)
export(BROKER+'backgrounds/coast-background.png', 'coast-backdrop.webp', (800,1200), quality=83)
export(LOGO+'01_logo_completo_color_principal.png', 'logo-full.webp', (520,400), trim=True, quality=95)
export(LOGO+'05_imagotipo_monograma_ap_navy.png', 'logo-navy.webp', (256,256), trim=True, quality=95)
export(LOGO+'06_imagotipo_monograma_ap_blanco_para_fondo_oscuro.png', 'logo-white.webp', (256,256), trim=True, quality=95)
export(LOGO+'01_logo_completo_color_principal.png', 'wordmark-navy.webp', (650,190), crop=(25,790,1225,1085), trim=True, quality=95)
export(LOGO+'03_wordmark_nombre_y_subtitulo_navy.png', 'wordmark-white.webp', (650,210), trim=True, quality=95)
def app_icon(filename, size, *, maskable=False):
    source = ROOT / LOGO / '04_imagotipo_monograma_ap_dorado.png'
    original = Image.open(source).convert('RGBA')
    box = original.getchannel('A').point(lambda x: 255 if x > 100 else 0).getbbox()
    mark = original.crop(box)
    # 56% square fits wholly inside the maskable 80%-diameter safe circle.
    bound = round(size * (0.56 if maskable else 0.68))
    mark.thumbnail((bound,bound),Image.Resampling.LANCZOS)
    im = Image.new('RGBA',(size,size),'#0B1F3A')
    im.alpha_composite(mark,((size-mark.width)//2,(size-mark.height)//2))
    target = OUT / filename
    im.convert('RGB').save(target,optimize=True)
    records.append({'source':source.relative_to(ROOT).as_posix(),'output':target.relative_to(ROOT).as_posix(),'source_dimensions':list(original.size),'dimensions':list(im.size),'bytes':target.stat().st_size,'crop':list(box),'background':'#0B1F3A','mark_max_fraction':0.56 if maskable else 0.68,'purpose':'maskable' if maskable else 'any'})

app_icon('icon-192.png',192)
app_icon('icon-512.png',512)
app_icon('apple-touch-icon.png',180)
app_icon('icon-maskable-512.png',512,maskable=True)

PREFIX='ASSETS/projects/melcon-paradise/WhatsApp Image 2026-09-10 at '
projects = [
    ('11.16.36 PM (2).jpeg','melcon-hero.webp'),
    ('11.16.36 PM (1).jpeg','melcon-masterplan.webp'),
    ('11.16.36 PM (3).jpeg','melcon-facade.webp'),
    ('11.16.36 PM (4).jpeg','melcon-gardens.webp'),
    ('11.16.36 PM (5).jpeg','melcon-river.webp'),
    ('11.16.36 PM (6).jpeg','melcon-promenade.webp'),
    ('11.16.36 PM.jpeg','melcon-aerial.webp'),
    ('11.16.37 PM (1).jpeg','melcon-pool.webp'),
    ('11.16.37 PM (2).jpeg','melcon-living.webp'),
    ('11.16.37 PM (3).jpeg','melcon-lounge.webp'),
    ('11.16.37 PM (4).jpeg','melcon-kitchen.webp'),
    ('11.16.37 PM (5).jpeg','melcon-bedroom.webp'),
    ('11.16.37 PM (6).jpeg','melcon-interior.webp'),
    ('11.16.37 PM (7).jpeg','melcon-suite.webp'),
    ('11.16.37 PM.jpeg','melcon-poolside.webp'),
]
for source, filename in projects:
    export(PREFIX+source,filename,(1200,1200),quality=84)
    if filename in ('melcon-hero.webp','melcon-pool.webp','melcon-gardens.webp','melcon-living.webp'):
        export(PREFIX+source,filename.replace('.webp','-small.webp'),(640,640),quality=80)

# The two project folders below were supplied by the client. Their originals stay
# untouched; these public derivatives make the verified project cards and galleries
# performant without claiming commercial data that has not been confirmed.
TERRA_PREFIX='ASSETS/projects/project-01-unidentified/WhatsApp Image 2026-09-10 at '
terra = [
    ('11.13.58 PM (2).jpeg','terra-serena-hero.webp'),
    ('11.13.58 PM (3).jpeg','terra-serena-pool.webp'),
    ('11.13.58 PM.jpeg','terra-serena-aerial.webp'),
    ('11.13.59 PM (2).jpeg','terra-serena-living.webp'),
    ('11.13.59 PM (6).jpeg','terra-serena-bedroom.webp'),
]
for source, filename in terra:
    export(TERRA_PREFIX+source,filename,(1200,1200),quality=84)
    if filename == 'terra-serena-hero.webp':
        export(TERRA_PREFIX+source,'terra-serena-hero-small.webp',(640,640),quality=80)

BEACH_PREFIX='ASSETS/projects/project-03-unidentified/'
beach = [
    ('IMG01.jpeg','the-beach-hero.webp'),
    ('WhatsApp Image 2026-09-10 at 11.27.50 PM (1).jpeg','the-beach-pool.webp'),
    ('WhatsApp Image 2026-09-10 at 11.27.50 PM (2).jpeg','the-beach-terrace.webp'),
    ('WhatsApp Image 2026-09-10 at 11.27.51 PM (2).jpeg','the-beach-living.webp'),
    ('WhatsApp Image 2026-09-10 at 11.27.51 PM (6).jpeg','the-beach-bedroom.webp'),
]
for source, filename in beach:
    export(BEACH_PREFIX+source,filename,(1200,1200),quality=84)
    if filename == 'the-beach-hero.webp':
        export(BEACH_PREFIX+source,'the-beach-hero-small.webp',(640,640),quality=80)

(ROOT / 'docs/design/asset-contact-sheets/derivatives.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{len(records)} derivatives; {sum(r["bytes"] for r in records)/1024/1024:.2f} MiB total.')
for r in records: print(r['output'],r['dimensions'],round(r['bytes']/1024,1),'KiB')
