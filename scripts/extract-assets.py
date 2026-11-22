#!/usr/bin/env python3
"""
Extract transparent PNG assets from Logo.jpg and Kodelokal_Maskot.jpeg
for KodeLokal (https://kodelokal.store) Light Mode & Dark Mode.
"""
from collections import deque
from pathlib import Path
from PIL import Image

REPO_ROOT = Path("/home/antigravity/kodelokal/LP-KodeLokal-FS-2026")
BRAND_DIR = REPO_ROOT / "public" / "brand"
MASCOT_DIR = REPO_ROOT / "public" / "mascot"
BRAND_DIR.mkdir(parents=True, exist_ok=True)
MASCOT_DIR.mkdir(parents=True, exist_ok=True)


def remove_white_bg_floodfill(img: Image.Image, white_thresh: int = 236, feather_thresh: int = 205) -> Image.Image:
    """
    Flood-fill from all 4 borders through near-white pixels so internal white
    areas (like the mascot's eyes and white specular highlights!) remain opaque.
    Applies smooth anti-aliased edge feathering to remove white halos in Dark Mode.
    """
    rgba = img.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()

    visited = [[False] * w for _ in range(h)]
    bg = [[False] * w for _ in range(h)]
    q = deque()

    def is_bg_candidate(r, g, b):
        # High luminance and low color saturation (near white/light gray JPEG bg)
        return r >= white_thresh and g >= white_thresh and b >= white_thresh and (max(r, g, b) - min(r, g, b) <= 18)

    for x in range(w):
        for y in (0, h - 1):
            r, g, b, _ = px[x, y]
            if is_bg_candidate(r, g, b):
                visited[y][x] = True
                bg[y][x] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not visited[y][x]:
                r, g, b, _ = px[x, y]
                if is_bg_candidate(r, g, b):
                    visited[y][x] = True
                    bg[y][x] = True
                    q.append((x, y))

    while q:
        cx, cy = q.popleft()
        for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
            if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
                r, g, b, _ = px[nx, ny]
                if is_bg_candidate(r, g, b):
                    visited[ny][nx] = True
                    bg[ny][nx] = True
                    q.append((nx, ny))

    # Also flood-fill enclosed white holes inside letters like 'o', 'd', 'e', 'a'
    # ONLY for neutral white regions that do NOT touch blue mascot skin directly, or
    # we handle logo letters separately with a targeted region pass.
    for y in range(h):
        for x in range(w):
            if bg[y][x]:
                px[x, y] = (0, 0, 0, 0)

    # Anti-alias 1-2px border adjacent to transparent background
    for _ in range(2):
        updates = []
        for y in range(1, h - 1):
            for x in range(1, w - 1):
                r, g, b, a = px[x, y]
                if a == 0:
                    continue
                if any(px[nx, ny][3] == 0 for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1))):
                    lum = (r + g + b) / 3.0
                    sat = max(r, g, b) - min(r, g, b)
                    if lum > feather_thresh and sat < 35:
                        # Linearly fade near-white anti-aliased edge pixels
                        new_a = int(max(0, min(255, (250 - lum) / (250 - feather_thresh) * 220)))
                        updates.append((x, y, (r, g, b, new_a)))
        for x, y, val in updates:
            px[x, y] = val

    return rgba


def clear_letter_holes(img: Image.Image, x_start: int, white_thresh: int = 232) -> Image.Image:
    """Make pure white inner counters of letters (o, d, e, a, etc.) transparent."""
    rgba = img.copy()
    w, h = rgba.size
    px = rgba.load()
    for y in range(h):
        for x in range(max(0, x_start), w):
            r, g, b, a = px[x, y]
            if a > 0 and r >= white_thresh and g >= white_thresh and b >= white_thresh and (max(r, g, b) - min(r, g, b) <= 15):
                px[x, y] = (0, 0, 0, 0)
    return rgba


def trim_alpha(img: Image.Image, pad: int = 8) -> Image.Image:
    bbox = img.getbbox()
    if not bbox:
        return img
    x0, y0, x1, y1 = bbox
    w, h = img.size
    cropped = img.crop((max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad), min(h, y1 + pad)))
    return cropped


def process_logo():
    logo = Image.open("/home/antigravity/Logo.jpg").convert("RGB")
    # 1. Full logo light mode
    full_crop = logo.crop((55, 195, 992, 560))
    full_light = remove_white_bg_floodfill(full_crop, white_thresh=232, feather_thresh=195)
    # Clear inner counters of letters (text starts around x = 330 in full_crop coords)
    full_light = clear_letter_holes(full_light, x_start=325, white_thresh=228)
    full_light = trim_alpha(full_light, pad=8)
    full_light.save(BRAND_DIR / "logo-full-light.png", "PNG", optimize=True)

    # 2. Full logo dark mode (convert black subtitle "Mitra Digital Anda" to crisp light slate)
    full_dark = full_light.copy()
    dw, dh = full_dark.size
    dpx = full_dark.load()
    for y in range(int(dh * 0.56), dh):
        for x in range(int(dw * 0.34), dw):
            r, g, b, a = dpx[x, y]
            if a > 10:
                sat = max(r, g, b) - min(r, g, b)
                lum = (r + g + b) / 3.0
                if sat < 35 and lum < 170:
                    # Preserve anti-aliasing alpha while shifting ink to luminous #E6F1FA
                    intensity = max(0.0, min(1.0, (180 - lum) / 180.0))
                    new_a = int(min(255, max(a, int(intensity * 255))))
                    dpx[x, y] = (230, 241, 250, min(a, new_a))
    full_dark.save(BRAND_DIR / "logo-full-dark.png", "PNG", optimize=True)

    # 3. Mascot mark only (for navbar icon, favicon, loaders)
    mark_crop = logo.crop((55, 195, 380, 560))
    mark_rgba = remove_white_bg_floodfill(mark_crop, white_thresh=232, feather_thresh=195)
    mark_rgba = trim_alpha(mark_rgba, pad=8)
    mark_rgba.save(BRAND_DIR / "logo-mark.png", "PNG", optimize=True)

    # 4. Square icon for Next.js app/icon.png (256x256)
    icon_size = 256
    square = Image.new("RGBA", (icon_size, icon_size), (0, 0, 0, 0))
    mw, mh = mark_rgba.size
    scale = min((icon_size - 20) / mw, (icon_size - 20) / mh)
    resized = mark_rgba.resize((int(mw * scale), int(mh * scale)), Image.Resampling.LANCZOS)
    square.paste(resized, ((icon_size - resized.width) // 2, (icon_size - resized.height) // 2), resized)
    square.save(REPO_ROOT / "src" / "app" / "icon.png", "PNG", optimize=True)
    square.save(BRAND_DIR / "icon-256.png", "PNG", optimize=True)
    print("Saved brand assets successfully.")


def process_mascots():
    sheet = Image.open("/home/antigravity/Kodelokal_Maskot.jpeg").convert("RGB")
    # Carefully measured bounding boxes (x0, y0, x1, y1) excluding title & bottom text labels
    poses = {
        # Top row (y: 105..372)
        "hello": (52, 108, 286, 372),
        "thinking": (272, 105, 526, 372),
        "confused": (520, 105, 748, 372),
        "yay": (748, 105, 1020, 372),
        # Bottom row (y: 430..718)
        "coding": (36, 480, 268, 718),
        "idea": (270, 430, 504, 718),
        "sleepy": (512, 465, 756, 718),
        "top": (756, 480, 976, 718),
    }

    for name, box in poses.items():
        crop = sheet.crop(box)
        # Note: for 'hello', the top-right corner of the box might clip 2px of the '?' speech bubble from 'thinking'
        # Clean the top-right corner of 'hello' (above the waving hand) where '?' bubble edge lives
        if name == "hello":
            cw, ch = crop.size
            cpx = crop.load()
            for y in range(0, 82):
                for x in range(cw - 24, cw):
                    cpx[x, y] = (255, 255, 255)
        # For 'thinking', clean left edge of 'hello' waving hand tip if any
        if name == "thinking":
            cw, ch = crop.size
            cpx = crop.load()
            for y in range(80, 220):
                for x in range(0, 20):
                    cpx[x, y] = (255, 255, 255)

        rgba = remove_white_bg_floodfill(crop, white_thresh=232, feather_thresh=195)
        # Also clear small shadow ellipses at very bottom? Keep subtle soft shadow or leave crisp!
        rgba = trim_alpha(rgba, pad=6)
        rgba.save(MASCOT_DIR / f"{name}.png", "PNG", optimize=True)
        print(f"Saved mascot/{name}.png -> {rgba.size}")


if __name__ == "__main__":
    process_logo()
    process_mascots()
