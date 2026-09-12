from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont
import json, hashlib

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/design/asset-contact-sheets'
OUT.mkdir(parents=True, exist_ok=True)
groups = {
    '01-brand': ['ASSETS/brand/logos', 'ASSETS/brand/palettes'],
    '02-broker': ['ASSETS/content/broker'],
    '03-melcon': ['ASSETS/projects/melcon-paradise'],
    '04-unidentified-01': ['ASSETS/projects/project-01-unidentified'],
    '05-unidentified-03': ['ASSETS/projects/project-03-unidentified'],
    '06-references-web': ['ASSETS/references/web-inspiration'],
    '07-references-pwa-location': ['ASSETS/references/pwa', 'ASSETS/content/project-location-reference'],
}
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 16)
title_font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 22)
inventory = []
for group, dirs in groups.items():
    files = sorted(p for d in dirs for p in (ROOT/d).rglob('*') if p.suffix.lower() in ('.png','.jpeg','.jpg','.webp'))
    cols = 3 if 'broker' in group or 'reference' in group else 4
    tile_w, tile_h = (500, 410) if 'reference' in group else (400, 330)
    sheet = Image.new('RGB', (cols*tile_w, ((len(files)+cols-1)//cols)*tile_h + 50), '#eeeeea')
    draw = ImageDraw.Draw(sheet)
    draw.text((16, 12), group, font=title_font, fill='#0B1F3A')
    for idx, path in enumerate(files):
        original = Image.open(path)
        im = ImageOps.exif_transpose(original).convert('RGBA')
        alpha = im.getchannel('A')
        row = {'group':group, 'index':idx+1, 'path':path.relative_to(ROOT).as_posix(), 'width':im.width, 'height':im.height, 'mode':original.mode, 'alpha_min':alpha.getextrema()[0], 'bbox':alpha.getbbox(), 'bytes':path.stat().st_size, 'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
        inventory.append(row)
        im.thumbnail((tile_w-20,tile_h-70), Image.Resampling.LANCZOS)
        x, y = (idx%cols)*tile_w, (idx//cols)*tile_h + 50
        sheet.paste(im, (x+(tile_w-im.width)//2,y), im)
        label = f'{idx+1:02} | {original.width}x{original.height} | {path.name}'
        draw.text((x+8,y+tile_h-65), label[:53], font=font, fill='#0B1F3A')
        if len(label)>53: draw.text((x+8,y+tile_h-42), label[53:106], font=font, fill='#0B1F3A')
    sheet.save(OUT/f'{group}.jpg', quality=90)
    print(group, len(files), str(OUT/f'{group}.jpg'))
(OUT/'inventory.json').write_text(json.dumps(inventory, ensure_ascii=False, indent=2), encoding='utf-8')
