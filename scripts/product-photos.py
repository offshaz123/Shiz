"""Makes the Google Shopping product pictures in public/product-photos/.

Two pictures per product (lib/listings): "main", the plates at a slight
angle like a product photo (no writing on it: Google's rule for the first
picture), and "info", a PlatedUp card with the facts about it. The plates themselves are drawn by the website
(/api/plate-image with hero=1 / hero=side), in the legal font, exactly as
the builder shows them; this script only adds what that can't draw: soft
shadows, perspective, the plate's edge and the gloss of gel letters.

Run with the site running locally (npx next dev -p 3101):
    python3 scripts/product-photos.py http://localhost:3101
Then bump the v= number in lib/listings.ts so Google fetches them again.
"""

import io
import sys
import urllib.parse
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3101"
OUT = Path(__file__).resolve().parent.parent / "public" / "product-photos"
SIDE = 1200

ROOT = Path(__file__).resolve().parent.parent
FONT = str(ROOT / "src" / "assets" / "BarlowCondensed-SemiBold.ttf")
LOGO = ROOT / "src" / "assets" / "email-logo.png"
# Keep in step with lib/plates.ts (FREE_DELIVERY_FROM) and lib/site.ts.
FREE_DELIVERY = "£39.99"
CUTOFF = "2pm"
NAMES = {
    "standard": ("Standard", "Classic flat print, crisp factory finish"),
    "3d-gel": ("3D Gel", "Raised, glossy resin gel letters"),
    "4d-3mm": ("4D 3mm", "3mm laser-cut acrylic letters"),
    "4d-5mm": ("4D 5mm", "5mm laser-cut acrylic letters"),
    "5mm-gel": ("5mm Gel", "5mm acrylic letters topped with glossy gel"),
    "7mm-gel": ("7mm Gel", "Our deepest 7mm gel letters"),
}
KIND_NAMES = {
    "pair": "Front & rear pair",
    "single": "Single plate",
    "motorbike": "Motorbike plate 9 × 7 in",
    "4x4-import": "4x4 / import square pair",
    "hex": "Hex pair",
    "show": "Show plates, any text",
}

STYLES = {
    # style: (look, how far the letters stand off the plate in mm)
    "standard": ("flat", 0),
    "3d-gel": ("gel", 1.5),
    "4d-3mm": ("acrylic", 3),
    "4d-5mm": ("acrylic", 5),
    "5mm-gel": ("gel", 5.5),
    "7mm-gel": ("gel", 7),
}
# kind: (plate size, which plates, legal or show) — as KINDS in lib/listings.ts
KINDS = {
    "pair": ("standard", ["front", "rear"], "legal"),
    "single": ("standard", ["rear"], "legal"),
    "motorbike": ("motorbike", ["rear"], "legal"),
    "4x4-import": ("square", ["front", "rear"], "legal"),
    "hex": ("hex7", ["front", "rear"], "legal"),
    "show": ("standard", ["front", "rear"], "show"),
}
TWO_LINE = {"motorbike", "square"}
EDGE = {"rear": (176, 136, 0), "front": (196, 194, 186)}


def fetch(**q):
    url = f"{BASE}/api/plate-image?{urllib.parse.urlencode(q)}"
    with urllib.request.urlopen(url, timeout=60) as r:
        return Image.open(io.BytesIO(r.read())).convert("RGBA")


def blur(a, radius):
    """Gaussian blur in floating point (PIL's 8-bit blur makes the shine grainy)."""
    sigma = max(radius, 0.5)
    r = int(sigma * 3)
    k = np.exp(-(np.arange(-r, r + 1) ** 2) / (2 * sigma * sigma))
    k /= k.sum()
    a = np.apply_along_axis(lambda v: np.convolve(v, k, mode="same"), 1, a)
    return np.apply_along_axis(lambda v: np.convolve(v, k, mode="same"), 0, a)


def gloss(plate, face, look):
    """Light on the letters: domed, glassy highlights for gel, a crisp edge
    catch for laser-cut acrylic, nothing for flat print."""
    if look == "flat":
        return plate
    mask = np.asarray(face.getchannel("A"), dtype=np.float32) / 255
    cap = max(20, int((mask.sum(axis=1) > 0).sum() * 0.5))
    radius = cap * (0.07 if look == "gel" else 0.015)
    height = blur(mask.astype(np.float64), radius)
    gy, gx = np.gradient(height)
    k = (6 if look == "gel" else 3) * radius
    n = np.dstack([-gx * k, -gy * k, np.ones_like(height)])
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    light = np.array([-0.45, -0.65, 0.6])
    half = light / np.linalg.norm(light) + np.array([0, 0, 1])
    half /= np.linalg.norm(half)
    ndoth = np.clip((n * half).sum(axis=2), 0, 1)
    if look == "gel":
        spec = ndoth**30 * 0.95 + ndoth**6 * 0.12
        # A broad soft sheen over the upper part of each letter.
        rows = np.linspace(0, 1, mask.shape[0])[:, None]
        spec += np.clip(0.5 - rows, 0, 1) * 0.10
    else:
        spec = ndoth**12 * 0.55
    alpha = np.clip(spec * mask, 0, 1)
    shine = Image.new("RGBA", plate.size, (255, 255, 255, 0))
    shine.putalpha(Image.fromarray((alpha * 255).astype(np.uint8)))
    return Image.alpha_composite(plate, shine)


def surface_sheen(plate):
    """A soft diagonal reflection across the plate's face."""
    w, h = plate.size
    band = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(band)
    d.polygon([(w * 0.28, 0), (w * 0.40, 0), (w * 0.30, h), (w * 0.18, h)], fill=60)
    d.polygon([(w * 0.62, 0), (w * 0.66, 0), (w * 0.56, h), (w * 0.52, h)], fill=35)
    band = band.filter(ImageFilter.GaussianBlur(w * 0.02))
    band = ImageChops.multiply(band, plate.getchannel("A"))
    layer = Image.new("RGBA", (w, h), (255, 255, 255, 0))
    layer.putalpha(band)
    return Image.alpha_composite(plate, layer)


def plate_texture(style, size, side, kind_type, view):
    text = "YOUR NAME" if kind_type == "show" else "PL24 TED"
    # shine=0: the gloss is added here instead (gloss()).
    q = dict(text=text, type=kind_type, style=style, size=size, badge="none", border="none", side=side, hero=view, shine="0")
    plate = fetch(**q)
    face = fetch(**q, only="face")
    return surface_sheen(gloss(plate, face, STYLES[style][0]))


def place(canvas, plate, alpha_shape, edge_colour, offset, thick, shadow_shift):
    """Puts a plate on the canvas with its edge and a soft shadow under it."""
    x, y = offset
    # Shadow.
    sh_mask = Image.new("L", canvas.size, 0)
    sh_mask.paste(alpha_shape, (x + shadow_shift[0], y + shadow_shift[1]))
    sh_mask = sh_mask.filter(ImageFilter.GaussianBlur(22)).point(lambda v: int(v * 0.42))
    shadow = Image.new("RGBA", canvas.size, (50, 40, 15, 0))
    shadow.putalpha(sh_mask)
    canvas.alpha_composite(shadow)
    # The plate's edge (its thickness), showing below it.
    edge = Image.new("RGBA", plate.size, edge_colour + (255,))
    edge.putalpha(alpha_shape)
    for t in range(thick, 0, -1):
        canvas.alpha_composite(edge, (x, y + t))
    canvas.alpha_composite(plate, (x, y))


def background():
    top, bottom = np.array([251, 250, 247]), np.array([226, 222, 212])
    rows = np.linspace(0, 1, SIDE)[:, None, None]
    grad = (top + (bottom - top) * rows**1.4) * np.ones((1, SIDE, 1))
    img = Image.fromarray(grad.astype(np.uint8), "RGB").convert("RGBA")
    return img


def main_picture(style, kind):
    size, sides, kind_type = KINDS[kind]
    two_line = size in TWO_LINE
    pair = len(sides) == 2
    canvas = background()
    textures = [plate_texture(style, size, s, kind_type, "1") for s in sides]
    w0, h0 = textures[0].size
    max_w = (560 if pair else 820) if two_line else (1000 if pair else 1060)
    scale = min(max_w / w0, (760 if two_line else 400) / h0)
    spots = ([(0.3, 0.4), (0.7, 0.6)] if two_line else [(0.47, 0.36), (0.53, 0.63)]) if pair else [(0.5, 0.5)]
    for tex, side, (sx, sy) in zip(textures, sides, spots):
        t = tex.resize((round(w0 * scale), round(h0 * scale)), Image.LANCZOS).rotate(5, resample=Image.BICUBIC, expand=True)
        a = t.getchannel("A")
        x, y = round(SIDE * sx - t.width / 2), round(SIDE * sy - t.height / 2)
        place(canvas, t, a, EDGE[side], (x, y), max(4, round(6 * scale)), (14, 26))
    return canvas


def coeffs(src, dst):
    """Perspective coefficients mapping dst corners back to src corners."""
    m = []
    for (xs, ys), (xd, yd) in zip(src, dst):
        m.append([xd, yd, 1, 0, 0, 0, -xs * xd, -xs * yd])
        m.append([0, 0, 0, xd, yd, 1, -ys * xd, -ys * yd])
    a = np.array(m, dtype=np.float64)
    b = np.array(src, dtype=np.float64).reshape(8)
    return np.linalg.solve(a, b).tolist()


def side_picture(style, kind):
    size, sides, kind_type = KINDS[kind]
    side = sides[-1]  # the rear (yellow) plate
    tex = plate_texture(style, size, side, kind_type, "side")
    w, h = tex.size
    # Seen from the left: the near (left) end is taller than the far end.
    if size in TWO_LINE:
        quad = [(150, 200), (1060, 300), (1060, 860), (150, 1000)]
    else:
        quad = [(60, 400), (1140, 470), (1140, 700), (60, 790)]
    src = [(0, 0), (w, 0), (w, h), (0, h)]
    warped = tex.transform((SIDE, SIDE), Image.PERSPECTIVE, coeffs(src, quad), Image.BICUBIC)
    canvas = background()
    place(canvas, warped, warped.getchannel("A"), EDGE[side], (0, 0), 9, (18, 34))
    return canvas


def info_picture(style, kind, main):
    """A PlatedUp card: the product, what it is and how buying works."""
    gold, ink, cream = (212, 175, 55), (20, 20, 20), (246, 239, 220)
    canvas = Image.new("RGBA", (SIDE, SIDE), ink + (255,))
    # A soft gold glow from the top.
    glow = Image.new("L", (SIDE, SIDE), 0)
    ImageDraw.Draw(glow).ellipse((-200, -700, SIDE + 200, 420), fill=70)
    glow = glow.filter(ImageFilter.GaussianBlur(120))
    canvas.alpha_composite(Image.merge("RGBA", (*Image.new("RGB", (SIDE, SIDE), gold).split(), glow)))
    logo = Image.open(LOGO).convert("RGBA")
    logo = logo.resize((240, round(240 * logo.height / logo.width)), Image.LANCZOS)
    canvas.alpha_composite(logo, ((SIDE - logo.width) // 2, 36))
    # The product itself, on a light panel.
    top = 36 + logo.height + 22
    panel = main.convert("RGBA").resize((1040, 1040), Image.LANCZOS).crop((0, 240, 1040, 800))
    m = Image.new("L", panel.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, *panel.size), 28, fill=255)
    canvas.paste(panel, (80, top), m)
    d = ImageDraw.Draw(canvas)
    big = ImageFont.truetype(FONT, 64)
    mid = ImageFont.truetype(FONT, 42)
    name, blurb = NAMES[style]
    y = top + panel.height + 22
    d.text((SIDE // 2, y), f"{name} · {KIND_NAMES[kind]}", font=big, fill=cream, anchor="mt")
    y += 76
    d.text((SIDE // 2, y), blurb, font=mid, fill=gold, anchor="mt")
    y += 62
    legal = KINDS[kind][2] == "legal"
    lines = [
        "Road legal: BS AU 145e, DVLA registered supplier" if legal else "Show plates: for display and off-road use only",
        "Made to order in our London workshop",
        f"Same day dispatch when you order before {CUTOFF}",
        f"Free tracked delivery from {FREE_DELIVERY}",
        "Pay by card, Apple Pay, Google Pay or Klarna",
    ]
    for line in lines:
        x = 170
        d.ellipse((x, y + 4, x + 34, y + 38), fill=gold)
        d.line([(x + 9, y + 21), (x + 16, y + 29), (x + 27, y + 12)], fill=ink, width=5, joint="curve")
        d.text((x + 56, y + 21), line, font=mid, fill=cream, anchor="lm")
        y += 54
    return canvas


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for style in STYLES:
        for kind in KINDS:
            main_img = main_picture(style, kind)
            # A side view (side_picture) was tried and looked fake, so it isn't used.
            pictures = {"main": main_img, "info": info_picture(style, kind, main_img)}
            for name, img in pictures.items():
                path = OUT / f"{style}-{kind}-{name}.jpg"
                img.convert("RGB").save(path, quality=86, optimize=True, progressive=True)
                print(path.name, path.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
