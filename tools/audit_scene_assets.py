#!/usr/bin/env python3
"""Read-only audit of existing game backgrounds and accessory art.

Do not mistake JPEG data bearing a .png extension for a transparent PNG.
Original art stays unchanged; shortfalls are reported for replacement with real art.
"""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIR = ROOT / "assets/images"
REPORT_DIR = ROOT / "reports"
BACKGROUNDS = ("bg_freshwater", "bg_coast", "bg_sea", "bg_treasure_island")
DECOR = ("decor_coral_garden", "decor_shell_bed", "decor_bubble_fountain",
         "decor_treasure_castle", "decor_kelp_arch", "decor_moon_rocks")
PLATFORM = ("platform_dock", "platform_pier", "platform_boat", "platform_sandbar")

def inspect_asset(name, category, minimum=(0, 0)):
    path = IMAGE_DIR / (name + ".png")
    if not path.exists():
        return dict(asset=name, category=category, status="MISSING", flags=["MISSING"])
    with Image.open(path) as image:
        width, height = image.size
        actual_format = image.format
        has_alpha = image.mode in ("RGBA", "LA") or "transparency" in image.info
    flags = []
    if actual_format != "PNG":
        flags.append("EXTENSION_FORMAT_MISMATCH")
    if width < minimum[0] or height < minimum[1]:
        flags.append("UNDER_TARGET_RENDER_RESOLUTION")
    ratio = min(width / max(1, minimum[0]), height / max(1, minimum[1])) if all(minimum) else None
    return dict(asset=name, category=category, path=str(path.relative_to(ROOT)),
                width=width, height=height, actualFormat=actual_format,
                hasAlpha=has_alpha, suggestedMinimum=list(minimum),
                sourceToDisplayRatio=round(ratio, 3) if ratio is not None else None,
                flags=flags, status="REVIEW" if flags else "OK")

def main():
    rows = [inspect_asset(name, "background", (720, 1280)) for name in BACKGROUNDS]
    rows += [inspect_asset(name, "decor", (256, 256)) for name in DECOR]
    rows += [inspect_asset(name, "platform", (128, 64)) for name in PLATFORM]
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    (REPORT_DIR / "scene_asset_audit.json").write_text(
        json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# Existing scene art audit", "",
             "Minimums are review targets, never automatic pixel upscales.",
             "", "| Asset | Format | Size | Source / background target | Flags |",
             "|---|---|---:|---:|---|"]
    for row in rows:
        lines.append(f"| {row['asset']} | {row.get('actualFormat', '-')} | "
                     f"{row.get('width', '-')}×{row.get('height', '-')} | "
                     f"{row.get('sourceToDisplayRatio', '-')} | "
                     f"{', '.join(row['flags']) or '-'} |")
    (REPORT_DIR / "scene_asset_audit.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    for row in rows:
        print(f"SCENE_ASSET {row['asset']} size={row.get('width')}x{row.get('height')} "
              f"format={row.get('actualFormat')} flags={','.join(row['flags']) or '-'}")
    print(f"SCENE_AUDIT checked={len(rows)} reviews={sum(bool(x['flags']) for x in rows)}")
    if any(row["status"] == "MISSING" for row in rows):
        raise SystemExit(1)

if __name__ == "__main__":
    main()
