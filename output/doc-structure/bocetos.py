# Bocetos wireframe de las páginas del sitio — estilo marca Andris Peña.
from PIL import Image, ImageDraw, ImageFont
import os

OUT = "E:/PROYECTOS WEB/AndrisPortafolio/output/doc-structure/bocetos"
os.makedirs(OUT, exist_ok=True)

INK = "#0B1F3A"; INK_SOFT = "#132E4A"; BLUE = "#316692"; SAND = "#D8C8B4"
SAND_DEEP = "#C8B79C"; PAPER = "#FBF9F4"; SURFACE = "#F4F0E6"; MUTED = "#4E5A6B"
LINE = "#DCE1E5"; ONINK = "#FBF9F4"; ONINK_MUTED = "#C4D0DB"; INKLINE = "#38506A"
WHITE = "#FFFFFF"

FW = "C:/Windows/Fonts/"
def font(sz, bold=False, italic=False):
    name = "segoeuib.ttf" if bold else ("segoeuii.ttf" if italic else "segoeui.ttf")
    try:
        return ImageFont.truetype(FW + name, sz)
    except Exception:
        return ImageFont.truetype(FW + "arial.ttf", sz)

def serif(sz, italic=True):
    try:
        return ImageFont.truetype(FW + "georgiai.ttf" if italic else "georgiab.ttf", sz)
    except Exception:
        return ImageFont.truetype(FW + "georgia.ttf", sz)

PAGE_W, PAGE_H = 1720, 1180
M = 70  # margen del lienzo

def canvas():
    img = Image.new("RGB", (PAGE_W, PAGE_H), PAPER)
    d = ImageDraw.Draw(img)
    # fondo de puntos
    for y in range(0, PAGE_H, 26):
        for x in range(0, PAGE_W, 26):
            d.ellipse([x, y, x + 2, y + 2], fill="#E9E2D2")
    return img, d

def block(d, x, y, w, h, fill=WHITE, outline=LINE, radius=14, width=2):
    d.rounded_rectangle([x, y, x + w, y + h], radius=radius, fill=fill, outline=outline, width=width)

def label(d, x, y, text, color=MUTED, f=None, anchor="la"):
    d.text((x, y), text, fill=color, font=f or font(20), anchor=anchor)

def tag(d, x, y, text, fill=SAND, color=INK):
    f = font(17, bold=True)
    bbox = d.textbbox((0, 0), text, font=f)
    w = bbox[2] - bbox[0] + 26
    d.rounded_rectangle([x, y, x + w, y + 34], radius=17, fill=fill)
    d.text((x + 13, y + 6), text, fill=color, font=f)
    return w

def header(d, page_x, page_y, page_w, active=""):
    block(d, page_x, page_y, page_w, 74, fill=WHITE, radius=0)
    # logo
    d.ellipse([page_x + 26, page_y + 20, page_x + 52, page_y + 46], outline=INK, width=3)
    label(d, page_x + 64, page_y + 18, "Andris Peña", INK, font(19, bold=True))
    label(d, page_x + 64, page_y + 42, "Asesor inmobiliario", MUTED, font(13))
    nav = ["Inicio", "Proyectos", "Mapa", "Sobre mí", "Tu inversión"]
    nx = page_x + page_w - 730
    for n in nav:
        c = INK if n == active else MUTED
        label(d, nx, page_y + 26, n, c, font(16, bold=(n == active)))
        nx += 104
    d.rounded_rectangle([page_x + page_w - 168, page_y + 15, page_x + page_w - 26, page_y + 57], radius=10, fill=INK)
    label(d, page_x + page_w - 97, page_y + 29, "Conversemos", ONINK, font(15, bold=True), anchor="ma")

def footer(d, page_x, page_y, page_w):
    block(d, page_x, page_y, page_w, 120, fill=INK, outline=INK, radius=0)
    label(d, page_x + 40, page_y + 26, "Cada gran historia empieza con un lugar.", ONINK, serif(24))
    label(d, page_x + 40, page_y + 74, "andrisprealtor@gmail.com      +1 (849) 576-3822", ONINK_MUTED, font(15))
    label(d, page_x + page_w - 40, page_y + 74, "© 2026 Andris Peña", ONINK_MUTED, font(15), anchor="ra")

def title(d, x, y, main, accent):
    label(d, x, y, main, INK, font(34, bold=True))
    w = d.textbbox((x, y), main, font=font(34, bold=True))
    label(d, x, y + 44, accent, BLUE, serif(34))

def save(img, name):
    img.save(f"{OUT}/{name}.png", dpi=(150, 150))
    print("boceto", name)

PX, PW = M, PAGE_W - 2 * M  # página simulada dentro del lienzo

# ──────────────────────────────────────────────── INICIO
img, d = canvas()
block(d, PX, 46, PW, 1088, fill=WHITE, outline=LINE)
label(d, PX, 10, "BOCETO · ESTRUCTURA — INICIO (/)", INK, font(20, bold=True))
header(d, PX, 46, PW, "Inicio")
hy = 120
# hero
block(d, PX, hy, PW, 260, fill=INK, outline=INK, radius=0)
label(d, PX + 60, hy + 34, "ANDRIS", "#FFFFFF55", serif(84, italic=False))
label(d, PX + 60, hy + 130, "PEÑA", ONINK, serif(84, italic=False))
block(d, PX + 660, hy + 30, 240, 200, fill=INK_SOFT, outline=INKLINE)  # retrato
label(d, PX + 780, hy + 130, "RETRATO", ONINK_MUTED, font(16), anchor="mm")
label(d, PX + PW - 420, hy + 70, "Un lugar para vivir.", SAND, font(22, bold=True))
label(d, PX + PW - 420, hy + 110, "Una decisión para crecer.", ONINK, font(22, bold=True))
tag(d, PX + 60, hy + 210, "PROPUESTA DE VALOR")
tag(d, PX + 262, hy + 210, "CTA · Ver proyectos", fill=WHITE)
tag(d, PX + PW - 330, hy + 40, "VIDRIO NAVY · PANEL", fill=SAND)
# explorador
title(d, PX + 40, 396, "Un lugar", "que va contigo.")
block(d, PX + 40, 476, 980, 280, fill=INK, outline=INK)
block(d, PX + 60, 496, 940, 140, fill=INK_SOFT, outline=INKLINE)
label(d, PX + 530, 566, "FOTOGRAFÍA DEL PROYECTO (GESTO + FLECHAS + CONTADOR)", ONINK_MUTED, font(16), anchor="mm")
block(d, PX + 60, 648, 560, 88, fill="#0B1F3ACC", outline=INKLINE)
label(d, PX + 84, 668, "PANEL VIDRIO NAVY:", ONINK, font(16, bold=True))
label(d, PX + 84, 696, "nombre · hechos · CTA ficha", ONINK_MUTED, font(15))
block(d, PX + 1060, 476, PW - 1100, 280, fill=SURFACE, outline=SAND_DEEP)
label(d, PX + 1084, 500, "SELECTOR DE PROYECTOS", MUTED, font(15, bold=True))
for i, nm in enumerate(["Melcon Paradise", "Terra Serena", "The Beach…"]):
    yy = 532 + i * 74
    block(d, PX + 1084, yy, PW - 1148, 60, fill=WHITE, outline=(BLUE if i == 0 else LINE), width=3 if i == 0 else 2)
    label(d, PX + 1104, yy + 16, nm, INK if i == 0 else MUTED, font(16, bold=(i == 0)))
    if i == 0:
        d.ellipse([PX + PW - 96, yy + 18, PX + PW - 72, yy + 42], fill=BLUE)
# mapa compacto
my = 788
block(d, PX + 40, my, PW - 80, 170, fill=SURFACE, outline=LINE)
label(d, PX + 70, my + 22, "MIRA EL LUGAR. IMAGINA TU VIDA.", INK, font(20, bold=True))
block(d, PX + 70, my + 56, (PW - 160) // 2, 92, fill=WHITE, outline=SAND_DEEP)
label(d, PX + 90, my + 94, "MAPA COMPACTO INTERACTIVO (3 PUNTOS)", MUTED, font(15))
block(d, PX + 90 + (PW - 160) // 2, my + 56, (PW - 160) // 2, 92, fill=WHITE, outline=SAND_DEEP)
label(d, PX + 110 + (PW - 160) // 2, my + 94, "PANEL DEL PROYECTO SELECCIONADO", MUTED, font(15))
footer(d, PX, 1014, PW)
save(img, "boceto-inicio")

# ──────────────────────────────────────────────── CATÁLOGO
img, d = canvas()
block(d, PX, 46, PW, 1088, fill=WHITE, outline=LINE)
label(d, PX, 10, "BOCETO · ESTRUCTURA — CATÁLOGO (/proyectos)", INK, font(20, bold=True))
header(d, PX, 46, PW, "Proyectos")
title(d, PX + 40, 150, "Tres lugares.", "Un mismo acompañamiento.")
label(d, PX + 40, 252, "Explora los proyectos en Punta Cana. Compara, guarda favoritos y encuentra tu próximo paso.", MUTED, font(17))
# filtros
block(d, PX + 40, 300, PW - 80, 150, fill=SURFACE, outline=LINE)
tag(d, PX + 64, 322, "VERTODOS · 3"); tag(d, PX + 232, 322, "GUARDADOS · 0", fill=WHITE)
label(d, PX + 420, 328, "BUSCADOR (nombre o zona)", MUTED, font(14))
block(d, PX + 420, 352, 380, 44, fill=WHITE, outline=LINE)
label(d, PX + 836, 328, "PRESUPUESTO (USD)", MUTED, font(14))
block(d, PX + 836, 352, 260, 44, fill=WHITE, outline=LINE)
block(d, PX + 1120, 352, 200, 44, fill=WHITE, outline=LINE)
label(d, PX + 1140, 364, "FILTROS AVANZADOS", MUTED, font(14))
for i, c in enumerate(["Todos", "Vista Cana", "Verón-Bávaro", "Punta Cana City Place"]):
    tag(d, PX + 64 + i * 190, 404, c, fill=WHITE)
label(d, PX + 64, 462, "3 PROYECTOS", MUTED, font(15, bold=True))
# grid de tarjetas
cw = (PW - 120) // 3
for i, nm in enumerate(["MELCON PARADISE", "TERRA SERENA", "THE BEACH…"]):
    x = PX + 40 + i * (cw + 20)
    block(d, x, 500, cw, 420, fill=INK, outline=INK)
    block(d, x + 16, 516, cw - 32, 210, fill=INK_SOFT, outline=INKLINE)
    label(d, x + cw // 2, 620, "RENDER + ETIQUETA + FAVORITO", ONINK_MUTED, font(14), anchor="mm")
    block(d, x + 16, 696, cw - 32, 66, fill="#FFFFFF14", outline=INKLINE)
    label(d, x + 32, 706, nm, ONINK, font(18, bold=True))
    label(d, x + 32, 734, "ubicación · hechos confirmados", ONINK_MUTED, font(13))
    d.rounded_rectangle([x + 16, 790, x + cw - 32, 840], radius=8, fill=ONINK)
    label(d, x + 24, 804, "VER EL PROYECTO »", INK, font(14, bold=True))
    label(d, x + 24, 866, "• ABRIR UBICACIÓN", ONINK_MUTED, font(13))
label(d, PX + 40, 950, "Nota legal: renders entregados por el desarrollador; precios y disponibilidad por confirmar.", MUTED, font(14))
footer(d, PX, 1014, PW)
save(img, "boceto-catalogo")

# ──────────────────────────────────────────────── FICHA
img, d = canvas()
block(d, PX, 46, PW, 1088, fill=WHITE, outline=LINE)
label(d, PX, 10, "BOCETO · ESTRUCTURA — FICHA DE PROYECTO (/proyectos/[slug])", INK, font(20, bold=True))
header(d, PX, 46, PW, "Proyectos")
label(d, PX + 40, 136, "Inicio / Proyectos", MUTED, font(14))
label(d, PX + 40, 168, "Melcon Paradise", INK, font(44, bold=True))
label(d, PX + 40, 232, "• Vista Cana · Punta Cana", MUTED, font(16))
# galería
gy = 268
block(d, PX + 40, gy, 900, 380, fill=INK_SOFT, outline=INKLINE)
label(d, PX + 490, gy + 190, "IMAGEN PRINCIPAL + GALERÍA", ONINK_MUTED, font(18), anchor="mm")
block(d, PX + 960, gy, PW - 1000, 185, fill=SURFACE, outline=SAND_DEEP)
block(d, PX + 960, gy + 195, PW - 1000, 185, fill=SURFACE, outline=SAND_DEEP)
label(d, PX + 980, gy + 90, "VISTA 2", MUTED, font(14)); label(d, PX + 980, gy + 285, "VISTA 3", MUTED, font(14))
tag(d, PX + 60, gy + 320, "RENDER DEL PROYECTO")
# hechos
fy = gy + 400
for i, t in enumerate(["1, 2, 3 hab", "52–108 m²", "≈ 25 200 m²", "Piscinas · Coworking"]):
    x = PX + 40 + i * ((PW - 80) // 4)
    label(d, x, fy, t, INK, font(18, bold=True))
    d.line([x, fy + 34, x + ((PW - 80) // 4) - 40, fy + 34], fill=LINE, width=2)
# detalles
dy = fy + 60
title(d, PX + 40, dy, "Los detalles hacen", "la diferencia.")
label(d, PX + 40, dy + 96, "Descripción confirmada del proyecto (texto editorial con datos aportados por el desarrollador).", MUTED, font(15))
label(d, PX + 40, dy + 140, "TODO LO QUE HACE HOGAR", INK, font(18, bold=True))
for i in range(6):
    x = PX + 40 + (i % 2) * ((PW - 80) // 2); y = dy + 180 + (i // 2) * 56
    d.ellipse([x, y + 6, x + 12, y + 18], fill=SAND)
    label(d, x + 26, y, ["Piscina central", "Coworking", "Pet friendly", "Áreas comunes", "Seguridad 24/7", "Estacionamiento"][i], MUTED, font(16))
# ubicación
uy = dy + 380
title(d, PX + 40, uy, "Vista Cana ·", "Punta Cana.")
block(d, PX + 40, uy + 120, 460, 250, fill=SURFACE, outline=SAND_DEEP)
for i, nm in enumerate(["Melcon Paradise", "Terra Serena", "The Beach…"]):
    yy = uy + 140 + i * 62
    block(d, PX + 60, yy, 420, 52, fill=WHITE, outline=(BLUE if i == 0 else LINE), width=3 if i == 0 else 2)
    label(d, PX + 76, yy + 14, nm, INK if i == 0 else MUTED, font(15, bold=(i == 0)))
block(d, PX + 520, uy + 120, PW - 560, 250, fill=WHITE, outline=LINE)
label(d, PX + 540, uy + 140, "MAPA EMBEBIDO (MAPEXPLORER COMPACTO)", MUTED, font(14, bold=True))
for i in range(3):
    mx = PX + 600 + i * 300; myy = uy + 220 + (i % 2) * 80
    d.ellipse([mx, myy, mx + 22, myy + 22], fill=BLUE)
    d.line([mx + 11, myy, mx + 11, myy - 18], fill=INK, width=2)
label(d, PX + 540, uy + 340, "© OpenFreeMap · OpenStreetMap", MUTED, font(12))
footer(d, PX, 1014, PW)
save(img, "boceto-ficha")

# ──────────────────────────────────────────────── MAPA
img, d = canvas()
block(d, PX, 46, PW, 1088, fill=WHITE, outline=LINE)
label(d, PX, 10, "BOCETO · ESTRUCTURA — MAPA (/mapa)", INK, font(20, bold=True))
header(d, PX, 46, PW, "Mapa")
# panel lateral
block(d, PX, 120, 380, 894, fill=WHITE, outline=LINE, radius=0)
title(d, PX + 28, 150, "Dónde", "están.")
label(d, PX + 28, 250, "3 proyectos", MUTED, font(15))
for i, nm in enumerate(["Melcon Paradise", "Terra Serena", "The Beach…"]):
    yy = 300 + i * 104
    block(d, PX + 28, yy, 324, 88, fill=(SURFACE if i == 0 else WHITE), outline=(BLUE if i == 0 else LINE), width=3 if i == 0 else 2)
    block(d, PX + 44, yy + 14, 60, 60, fill=INK_SOFT, outline=INKLINE)
    label(d, PX + 118, yy + 18, nm, INK, font(16, bold=True))
    label(d, PX + 118, yy + 48, "zona", MUTED, font(13))
    if i == 0:
        d.ellipse([PX + 322, yy + 30, PX + 342, yy + 50], outline=BLUE, width=3)
# tarjeta seleccionada
block(d, PX + 28, 640, 324, 250, fill=INK, outline=INK)
block(d, PX + 44, 656, 292, 110, fill=INK_SOFT, outline=INKLINE)
label(d, PX + 60, 784, "MELCON PARADISE", ONINK, font(17, bold=True))
label(d, PX + 60, 812, "hechos confirmados", ONINK_MUTED, font(13))
d.rounded_rectangle([PX + 44, 836, PX + 336, 874], radius=8, fill=ONINK)
label(d, PX + 60, 846, "VER IMÁGENES", INK, font(13, bold=True))
# lienzo del mapa
block(d, PX + 380, 120, PW - 380, 894, fill=SURFACE, outline=LINE, radius=0)
label(d, PX + 420, 160, "LIENZO MAPLIBRE · OPENFREEMAP", MUTED, font(16, bold=True))
for i, (mx, myy, nm) in enumerate([(760, 420, "Terra Serena"), (900, 560, "Melcon Paradise"), (1480, 640, "The Beach…")]):
    d.ellipse([PX + mx, myy, PX + mx + 26, myy + 26], fill=INK)
    d.rounded_rectangle([PX + mx + 32, myy - 2, PX + mx + 32 + len(nm) * 9 + 20, myy + 28], radius=8, fill=WHITE, outline=LINE)
    label(d, PX + mx + 42, myy + 5, nm, INK, font(14, bold=True))
for i, t in enumerate(["3D", "+", "−", "N"]):
    d.ellipse([PX + PW - 100, 200 + i * 64, PX + PW - 52, 248 + i * 64], fill=WHITE, outline=LINE, width=2)
    label(d, PX + PW - 76, 212 + i * 64, t, INK, font(16, bold=True), anchor="ma")
label(d, PX + 420, 960, "EXPLORACIÓN LIMITADA A PUNTA CANA · ATRIBUCIÓN OSM VISIBLE", MUTED, font(13))
footer(d, PX, 1014, PW)
save(img, "boceto-mapa")

# ──────────────────────────────────────────────── SOBRE MÍ
img, d = canvas()
block(d, PX, 46, PW, 1088, fill=WHITE, outline=LINE)
label(d, PX, 10, "BOCETO · ESTRUCTURA — SOBRE MÍ (/sobre-mi)", INK, font(20, bold=True))
header(d, PX, 46, PW, "Sobre mí")
# escena editorial
block(d, PX + 40, 130, 760, 400, fill=SURFACE, outline=SAND_DEEP)
label(d, PX + 80, 170, "ANDRIS", "#0B1F3A22", serif(80, italic=False))
block(d, PX + 260, 160, 300, 340, fill=INK_SOFT, outline=INKLINE)
label(d, PX + 410, 330, "RETRATO", ONINK_MUTED, font(18), anchor="mm")
title(d, PX + 840, 170, "La decisión es tuya.", "El camino lo hacemos juntos.")
label(d, PX + 840, 270, "Soy Andris Peña. Acompaño decisiones inmobiliarias en Punta Cana con información clara y sin presiones.", MUTED, font(17))
tag(d, PX + 840, 380, "CTA · Conozcámonos")
# proceso
py = 580
title(d, PX + 40, py, "Así damos", "el siguiente paso.")
for i, t in enumerate(["01  Te escucho", "02  Exploramos", "03  Hacemos números", "04  Damos el siguiente paso"]):
    x = PX + 40 + i * ((PW - 80) // 4)
    label(d, x, py + 100, t, INK if i == 0 else MUTED, font(19, bold=True))
    d.line([x, py + 140, x + ((PW - 80) // 4) - 50, py + 140], fill=(BLUE if i == 0 else LINE), width=4)
    block(d, x, py + 160, (PW - 80) // 4 - 50, 150, fill=WHITE, outline=(BLUE if i == 0 else LINE), width=3 if i == 0 else 2)
    label(d, x + 20, py + 190, "Descripción del paso", MUTED, font(14))
# faq
qy = py + 360
title(d, PX + 40, qy, "Antes de decidir,", "conversemos.")
for i, q in enumerate(["¿Por dónde empezamos?", "¿Qué incluye el acompañamiento?", "¿Cómo sé que un proyecto es para mí?"]):
    yy = qy + 110 + i * 62
    block(d, PX + 40, yy, PW - 80, 52, fill=SURFACE, outline=LINE)
    label(d, PX + 64, yy + 14, q, INK, font(16))
    label(d, PX + PW - 70, yy + 8, "+", BLUE, font(24, bold=True))
footer(d, PX, 1014, PW)
save(img, "boceto-sobre-mi")

# ──────────────────────────────────────────────── CALCULADORA
img, d = canvas()
block(d, PX, 46, PW, 1088, fill=WHITE, outline=LINE)
label(d, PX, 10, "BOCETO · ESTRUCTURA — CALCULADORA (/calculadora)", INK, font(20, bold=True))
header(d, PX, 46, PW, "Tu inversión")
label(d, PX + 40, 140, "Andris Peña / Calculadora de pagos", MUTED, font(14))
title(d, PX + 40, 190, "Ponle números a", "tu próximo paso.")
label(d, PX + 40, 296, "Simulador de pagos", MUTED, font(16, bold=True))
# formulario izquierda
block(d, PX + 40, 340, (PW - 100) // 2, 500, fill=WHITE, outline=LINE)
label(d, PX + 70, 370, "VALOR DE LA PROPIEDAD (USD)", MUTED, font(14))
label(d, PX + 70, 400, "150 000", INK, font(40, bold=True))
block(d, PX + 70, 470, (PW - 100) // 2 - 60, 8, fill=LINE)
d.rounded_rectangle([PX + 150, 462, PX + 176, 486], radius=12, fill=WHITE, outline=INK, width=3)
label(d, PX + 70, 510, "MESES DE CONSTRUCCIÓN", MUTED, font(14))
label(d, PX + (PW - 100) // 2 - 40, 510, "24", INK, font(20, bold=True), anchor="ra")
block(d, PX + 70, 570, ((PW - 100) // 2 - 80) // 2, 70, fill=SURFACE, outline=LINE)
label(d, PX + 86, 592, "A LA FIRMA · 10 %", MUTED, font(14))
block(d, PX + 90 + ((PW - 100) // 2 - 80) // 2, 570, ((PW - 100) // 2 - 80) // 2, 70, fill=SURFACE, outline=LINE)
label(d, PX + 106 + ((PW - 100) // 2 - 80) // 2, 592, "DURANTE · 40 %", MUTED, font(14))
label(d, PX + 70, 700, "(i) Ejercicio ilustrativo: no es una oferta ni un cálculo hipotecario.", MUTED, font(14))
# resultado navy
rx = PX + 60 + (PW - 100) // 2
block(d, rx, 340, PW - rx - 40, 500, fill=INK, outline=INK)
label(d, rx + 40, 380, "CUOTA MENSUAL ESTIMADA", ONINK_MUTED, font(15))
label(d, rx + 40, 410, "US$ 2,500.00", ONINK, font(52, bold=True))
d.rounded_rectangle([rx + 40, 500, rx + PW - rx - 80, 512], radius=6, fill=SAND)
for i, t in enumerate(["A la firma 10 % · US$15,000", "Durante construcción 40 % · US$60,000", "A la entrega 50 % · US$75,000"]):
    yy = 540 + i * 52
    d.ellipse([rx + 40, yy + 4, rx + 52, yy + 16], fill=SAND)
    label(d, rx + 66, yy, t, ONINK, font(16))
d.rounded_rectangle([rx + 40, 730, rx + PW - rx - 80, 786], radius=10, fill=SAND)
label(d, rx + (PW - rx - 120) // 2, 748, "DESCARGAR MI ESCENARIO", INK, font(16, bold=True), anchor="ma")
footer(d, PX, 1014, PW)
save(img, "boceto-calculadora")

# ──────────────────────────────────────────────── CONTACTO
img, d = canvas()
block(d, PX, 46, PW, 1088, fill=INK, outline=INK, radius=0)
label(d, PX, 10, "BOCETO · ESTRUCTURA — CONTACTO (/contacto)", INK, font(20, bold=True))
header(d, PX, 46, PW, "")
block(d, PX, 46, PW, 74, fill=INK, outline=INK, radius=0)
label(d, PX + 40, 64, "Andris Peña", ONINK, font(19, bold=True))
for i, n in enumerate(["Inicio", "Proyectos", "Mapa", "Sobre mí", "Tu inversión"]):
    label(d, PX + PW - 700 + i * 108, 72, n, ONINK_MUTED, font(15))
label(d, PX + PW - 160, 66, "ES", ONINK, font(14, bold=True))
# columna izquierda
label(d, PX + 70, 200, "Hagamos espacio para", ONINK, font(34, bold=True))
label(d, PX + 70, 244, "tus planes.", SAND, serif(34))
label(d, PX + 70, 320, "Un hogar para ti. Un espacio para desconectar. Un proyecto para el futuro.", ONINK_MUTED, font(18))
label(d, PX + 70, 420, "O ESCRÍBEME DIRECTAMENTE", SAND, font(15, bold=True))
label(d, PX + 70, 460, "WhatsApp · +1 (849) 576-3822", ONINK, font(20))
label(d, PX + 70, 510, "Correo · andrisprealtor@gmail.com", ONINK, font(20))
label(d, PX + 70, 600, "Andris Peña", ONINK, serif(36))
label(d, PX + 70, 660, "Asesor inmobiliario", ONINK_MUTED, font(16))
# formulario
fx = PX + 820
block(d, fx, 170, PW - 860, 780, fill=WHITE, outline=INK)
label(d, fx + 40, 200, "TARJETA DE CONSULTA (FORMULARIO VALIDADO)", INK, font(16, bold=True))
fields = [("Tu nombre", "Correo electrónico"), ("Teléfono", "País de residencia"), ("Presupuesto (USD)", "¿Cuándo adquirir?")]
for r, (a, b) in enumerate(fields):
    yy = 250 + r * 96
    label(d, fx + 40, yy, a, MUTED, font(14)); label(d, fx + 320, yy, b, MUTED, font(14))
    block(d, fx + 40, yy + 26, 260, 52, fill=WHITE, outline=LINE)
    block(d, fx + 320, yy + 26, 260, 52, fill=WHITE, outline=LINE)
label(d, fx + 40, 548, "PROYECTO DE INTERÉS / ME INTERESA / CUÉNTAME UN POCO MÁS", MUTED, font(14))
block(d, fx + 40, 574, 540, 52, fill=WHITE, outline=LINE)
block(d, fx + 40, 636, 540, 110, fill=WHITE, outline=LINE)
d.rectangle([fx + 40, 766, fx + 62, 788], outline=MUTED, width=2)
label(d, fx + 74, 768, "He leído y acepto las condiciones de uso y privacidad", MUTED, font(14))
d.rounded_rectangle([fx + 40, 830, fx + 580, 890], radius=10, fill=SAND)
label(d, fx + 310, 848, "PREPARAR MI CONSULTA »", INK, font(16, bold=True), anchor="ma")
label(d, fx + 40, 906, "El resumen se prepara localmente; el visitante elige WhatsApp o correo.", MUTED, font(13))
footer(d, PX, 1014, PW)
save(img, "boceto-contacto")

print("OK")
