#!/usr/bin/env python3
"""
Generate SEO & SMO assets for KodeLokal (https://kodelokal.store):
- src/app/favicon.ico (multi-size mascot favicon: 16, 32, 48, 64)
- src/app/icon.png & public/brand/icon-512.png (512x512 mascot icon)
- src/app/apple-icon.png (180x180 iOS Touch Icon with mascot)
- public/brand/og-kodelokal.png (1200x630 OpenGraph / Twitter SMO card with Logo + Mascots)
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

REPO = Path("/home/antigravity/kodelokal/LP-KodeLokal-FS-2026")
BRAND = REPO / "public" / "brand"
MASCOT = REPO / "public" / "mascot"
APP = REPO / "src" / "app"

FONT_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
FONT_MONO = "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf"


def make_square_icon(src: Image.Image, size: int, bg_color=None, pad_ratio: float = 0.08) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), bg_color if bg_color else (0, 0, 0, 0))
    pad = int(size * pad_ratio)
    max_dim = size - pad * 2
    scale = min(max_dim / src.width, max_dim / src.height)
    nw, nh = max(1, int(src.width * scale)), max(1, int(src.height * scale))
    resized = src.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas.paste(resized, ((size - nw) // 2, (size - nh) // 2), resized)
    return canvas


def generate_favicons():
    mark = Image.open(BRAND / "logo-mark.png").convert("RGBA")

    # 1. Multi-resolution mascot favicon.ico
    ico_base = make_square_icon(mark, 256, pad_ratio=0.04)
    ico_base.save(
        APP / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64)],
    )

    # 2. High-res 512x512 mascot icon.png (PWA & browsers)
    icon_512 = make_square_icon(mark, 512, pad_ratio=0.06)
    icon_512.save(APP / "icon.png", "PNG", optimize=True)
    icon_512.save(BRAND / "icon-512.png", "PNG", optimize=True)

    # 3. Apple touch icon 180x180 (subtle off-white backdrop for iOS homescreen)
    apple = make_square_icon(mark, 180, bg_color=(248, 251, 255, 255), pad_ratio=0.11)
    apple.convert("RGB").save(APP / "apple-icon.png", "PNG", optimize=True)
    print("Generated mascot favicon.ico, icon.png (512x512), and apple-icon.png (180x180).")


def draw_soft_radial(base: Image.Image, cx: int, cy: int, radius: int, color_rgb: tuple, max_alpha: int):
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=(*color_rgb, max_alpha))
    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=int(radius * 0.52)))
    return Image.alpha_composite(base, overlay)


def generate_og_image():
    W, H = 1200, 630
    # Crisp light editorial canvas with subtle blue & orange ambient glow
    canvas = Image.new("RGBA", (W, H), (249, 251, 254, 255))
    canvas = draw_soft_radial(canvas, 180, 110, 320, (53, 146, 212), 45)
    canvas = draw_soft_radial(canvas, 1020, 520, 340, (234, 108, 31), 48)
    canvas = draw_soft_radial(canvas, 930, 190, 260, (53, 146, 212), 55)

    draw = ImageDraw.Draw(canvas)

    # Top accent bar (KodeLokal Blue + Orange split)
    draw.rectangle((0, 0, 720, 10), fill=(53, 146, 212, 255))
    draw.rectangle((720, 0, W, 10), fill=(234, 108, 31, 255))

    # Right stage organic circle behind mascot
    stage_cx, stage_cy, stage_r = 955, 325, 195
    draw.ellipse(
        (stage_cx - stage_r, stage_cy - stage_r, stage_cx + stage_r, stage_cy + stage_r),
        fill=(232, 244, 253, 255),
        outline=(203, 227, 246, 255),
        width=3,
    )

    # Paste Full KodeLokal Logo (top-left)
    logo = Image.open(BRAND / "logo-full-light.png").convert("RGBA")
    logo_h = 92
    logo_w = int(logo.width * (logo_h / logo.height))
    logo_resized = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    canvas.paste(logo_resized, (68, 56), logo_resized)

    # Typography
    font_h1 = ImageFont.truetype(FONT_BOLD, 54)
    font_sub = ImageFont.truetype(FONT_REG, 24)
    font_pill = ImageFont.truetype(FONT_BOLD, 18)
    font_url = ImageFont.truetype(FONT_MONO, 21)

    # Headline (two punchy lines)
    draw.text((70, 192), "Bikin Website & Aplikasi", font=font_h1, fill=(16, 42, 67, 255))
    draw.text((70, 258), "Nggak Pake Ribet.", font=font_h1, fill=(234, 108, 31, 255))

    # Subtitle
    draw.text(
        (70, 342),
        "Landing page, toko online, web app custom & CMS modern",
        font=font_sub,
        fill=(72, 101, 129, 255),
    )
    draw.text(
        (70, 376),
        "dengan pantau progres project real-time bareng mimin!",
        font=font_sub,
        fill=(72, 101, 129, 255),
    )

    # Feature pills
    pills = [
        ("Landing Page & Web App", (53, 146, 212, 255), (255, 255, 255, 255)),
        ("CMS & Project Tracker", (234, 108, 31, 255), (255, 255, 255, 255)),
        ("SEO & Dark Mode", (20, 58, 89, 255), (255, 255, 255, 255)),
    ]
    px = 70
    py = 442
    for label, bg, fg in pills:
        bbox = draw.textbbox((0, 0), label, font=font_pill)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        pw, ph = tw + 26, th + 20
        draw.rounded_rectangle((px, py, px + pw, py + ph), radius=20, fill=bg)
        draw.text((px + 13, py + 8), label, font=font_pill, fill=fg)
        px += pw + 10

    # Bottom domain strip
    draw.line((70, 535, 675, 535), fill=(215, 229, 242, 255), width=2)
    draw.text((70, 554), "https://kodelokal.store", font=font_url, fill=(53, 146, 212, 255))
    draw.text((400, 555), "·  Mitra Digital Anda", font=font_sub, fill=(98, 125, 152, 255))

    # Paste Main Mascot (hello.png) with soft shadow on right stage
    mascot_main = Image.open(MASCOT / "hello.png").convert("RGBA")
    m_size = 335
    m_scale = min(m_size / mascot_main.width, m_size / mascot_main.height)
    mw, mh = int(mascot_main.width * m_scale), int(mascot_main.height * m_scale)
    mascot_main_r = mascot_main.resize((mw, mh), Image.Resampling.LANCZOS)

    # Secondary small coding mascot floating bottom-left of main mascot
    mascot_sec = Image.open(MASCOT / "coding.png").convert("RGBA")
    s_size = 148
    s_scale = min(s_size / mascot_sec.width, s_size / mascot_sec.height)
    sw, sh = int(mascot_sec.width * s_scale), int(mascot_sec.height * s_scale)
    mascot_sec_r = mascot_sec.resize((sw, sh), Image.Resampling.LANCZOS)

    # Speech bubble above mascot
    bubble_text = "Yuk ngobrol sama mimin!"
    bb = draw.textbbox((0, 0), bubble_text, font=font_pill)
    bw, bh = (bb[2] - bb[0]) + 36, (bb[3] - bb[1]) + 22
    bx = stage_cx - bw // 2
    by = 74
    draw.rounded_rectangle(
        (bx, by, bx + bw, by + bh),
        radius=20,
        fill=(255, 255, 255, 255),
        outline=(210, 228, 244, 255),
        width=2,
    )
    draw.text((bx + 18, by + 9), bubble_text, font=font_pill, fill=(20, 58, 89, 255))

    # Place mascots
    canvas.paste(mascot_main_r, (stage_cx - mw // 2 + 16, stage_cy - mh // 2 + 12), mascot_main_r)
    canvas.paste(mascot_sec_r, (stage_cx - 180, stage_cy + 85), mascot_sec_r)

    out_rgb = canvas.convert("RGB")
    out_rgb.save(BRAND / "og-kodelokal.png", "PNG", optimize=True)
    print("Generated 1200x630 SMO image public/brand/og-kodelokal.png")


if __name__ == "__main__":
    generate_favicons()
    generate_og_image()
