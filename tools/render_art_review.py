#!/usr/bin/env python3
"""Visual QA contact sheet from existing fish PNGs; read-only, never resaves source."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "reports" / "fish_art_review.png"
FISH = [
    ("fish_sunfish", "Sunfish"),
    ("fish_tuna", "Tuna"),
    ("fish_gwangeo", "Flatfish"),
    ("fish_striped_jewfish", "Striped jewfish"),
]
TILE = 560
PAD = 20

def preview(name, label):
    path = ROOT / "assets" / "images" / (name + ".png")
    with Image.open(path) as source:
        image = source.convert("RGBA")
    if image.getchannel("A").getextrema()[0] == 255:
        raise ValueError(f"{name}: expected transparent foreground PNG")
    backing = Image.new("RGBA", (TILE, TILE), (241, 247, 249, 255))
    draw = ImageDraw.Draw(backing)
    for y in range(0, TILE, 28):
        for x in range(0, TILE, 28):
            if (x // 28 + y // 28) % 2:
                draw.rectangle((x, y, x+27, y+27), fill=(225, 232, 237, 255))
    draw.rectangle((0, TILE//2, TILE, TILE), fill=(40, 59, 77, 255))
    # Full original canvas, not a crop, to expose actual alpha padding.
    image.thumbnail((TILE-54, TILE-54), Image.Resampling.LANCZOS)
    backing.alpha_composite(image, ((TILE-image.width)//2, (TILE-image.height)//2))
    draw.text((PAD, TILE-32), f"{label} | native {path.name}", fill="white")
    return backing.convert("RGB")

def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    sheet = Image.new("RGB", (TILE*2, TILE*2), "white")
    for index, (name, label) in enumerate(FISH):
        sheet.paste(preview(name, label), ((index%2)*TILE, (index//2)*TILE))
    sheet.save(OUT, format="PNG", optimize=True)
    print(f"Rendered original fish art inspection board: {OUT} ({sheet.width}x{sheet.height})")

if __name__ == "__main__":
    main()
