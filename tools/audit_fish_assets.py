#!/usr/bin/env python3
"""Read-only fish PNG audit; optional conservative downsample with --apply.

PNG pixel dimensions are NOT evidence of visual detail. This reports both actual
alpha-occupied pixels and the effective source-pixel / intended display-pixel ratio.
Never upscales, crops, recolors, or overwrites a PNG with poorer detail.
"""
import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import tempfile

from PIL import Image, ImageOps

REPO_ROOT = Path(__file__).resolve().parents[1]
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"

def alpha_bbox(image):
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    return alpha.point(lambda v: 255 if v > 12 else 0).getbbox()

def choose_downsample(width, height, bbox, profile):
    """Return new (width,height), or None if downscaling would lose useful detail."""
    longest = max(width, height)
    if longest <= profile["maxRecommendedEdge"]:
        return None
    target = min(int(profile["preferredSourceEdge"]), int(profile["maxRecommendedEdge"]))
    factor = target / longest
    dest = (max(1, round(width * factor)), max(1, round(height * factor)))
    if min(dest) < profile["minSourceEdge"] or not bbox:
        return None
    effective_width = (bbox[2] - bbox[0]) * factor
    max_display_width = max(1, float(profile["maxDisplayWidth"]))
    if effective_width / max_display_width < profile["minEffectiveDensity"]:
        return None
    return dest

def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def analyze_file(path, profile, apply=False):
    raw = path.read_bytes()
    if not raw.startswith(PNG_SIGNATURE):
        return dict(fishId=profile["fishId"], file=str(path), error="NOT_PNG",
                    warnings=["NOT_PNG"], action="unchanged")
    with Image.open(path) as opened:
        if opened.format != "PNG":
            raise ValueError(f"{path} does not contain PNG data")
        image = ImageOps.exif_transpose(opened).convert("RGBA")
    width, height = image.size
    bbox = alpha_bbox(image)
    if bbox is None:
        return dict(fishId=profile["fishId"], file=str(path), width=width, height=height,
                    warnings=["EMPTY_ALPHA"], action="unchanged")
    fill_x = (bbox[2] - bbox[0]) / width
    fill_y = (bbox[3] - bbox[1]) / height
    fill_area = fill_x * fill_y
    density = (bbox[2] - bbox[0]) / max(1.0, profile["maxDisplayWidth"])
    status = []
    if min(width, height) < profile["minSourceEdge"]:
        status.append("SMALL_SOURCE_REVIEW")
    if fill_x < .57:
        status.append("EXCESS_HORIZONTAL_PADDING_REVIEW")
    if fill_area < .16:
        status.append("LOW_SUBJECT_COVERAGE_REVIEW")
    if density < 1.0:
        status.append("INSUFFICIENT_EFFECTIVE_PIXELS")
    elif density < profile["minEffectiveDensity"]:
        status.append("LOW_EFFECTIVE_PIXELS_REVIEW")
    proposed = choose_downsample(width, height, bbox, profile)
    if max(width, height) > profile["maxRecommendedEdge"]:
        status.append("OVERSIZE_SAFE_TO_DOWNSAMPLE" if proposed else "OVERSIZE_RETAIN_DETAIL")
    if profile.get("dedicatedArtMissing"):
        status.append("EVENT_ART_USES_BASE_FISH")
    before_hash = hashlib.sha256(raw).hexdigest()
    action = "unchanged"
    final_size = [width, height]
    if apply and proposed:
        resized = image.resize(proposed, Image.Resampling.LANCZOS)
        with tempfile.NamedTemporaryFile(dir=path.parent, suffix=".png", delete=False) as handle:
            temp_path = Path(handle.name)
        try:
            resized.save(temp_path, format="PNG", optimize=True)
            with Image.open(temp_path) as check:
                check.verify()
            os.replace(temp_path, path)
            action = "downsampled"
            final_size = list(proposed)
        finally:
            temp_path.unlink(missing_ok=True)
    return {
        "fishId": profile["fishId"], "sourceId": profile["sourceId"], "file": str(path),
        "sizeClass": profile["sizeClass"], "priority": profile["priority"],
        "width": width, "height": height, "bbox": list(bbox),
        "subjectFillX": round(fill_x, 3), "subjectFillY": round(fill_y, 3),
        "subjectAreaRatio": round(fill_area, 3), "effectivePixelDensity": round(density, 3),
        "requiredPixelDensity": profile["minEffectiveDensity"],
        "recommendedMin": profile["minSourceEdge"], "recommendedMax": profile["maxRecommendedEdge"],
        "maxDisplayWidth": profile["maxDisplayWidth"], "unpackedMiB": round(width * height * 4 / 1048576, 2),
        "proposedSize": list(proposed) if proposed else None, "finalSize": final_size,
        "sourceSha256": before_hash, "finalSha256": sha256(path) if apply and proposed else before_hash,
        "warnings": status, "action": action
    }

def write_reports(items, directory):
    directory.mkdir(parents=True, exist_ok=True)
    (directory / "fish_asset_audit.json").write_text(
        json.dumps(items, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    lines = [
        "# Fish asset audit",
        "",
        "Full diagnostics and SHA-256 are in fish_asset_audit.json.",
        "Pixel dimensions are recommendations; low-resolution sources are never enlarged automatically.",
        "",
        "| Asset | Source size | Subject fill (X) | Effective px ratio | Max displayed | Result | Review flags |",
        "|---|---:|---:|---:|---:|---|---|"
    ]
    for row in items:
        if row.get("error"):
            lines.append(f"| {row['fishId']} | - | - | - | - | error | {row['error']} |")
            continue
        lines.append(f"| {row['fishId']} | {row['width']}×{row['height']} | "
                     f"{row['subjectFillX']:.0%} | {row['effectivePixelDensity']:.2f}× | "
                     f"{row['maxDisplayWidth']} | {row['action']} | "
                     f"{', '.join(row['warnings']) or '-'} |")
    (directory / "fish_asset_audit.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Conservatively downsample oversized assets")
    parser.add_argument("--policy", type=Path, default=REPO_ROOT / "reports/fish_asset_policy.json")
    parser.add_argument("--image-dir", type=Path, default=REPO_ROOT / "assets/images")
    parser.add_argument("--report-dir", type=Path, default=REPO_ROOT / "reports")
    args = parser.parse_args()
    policy = json.loads(args.policy.read_text(encoding="utf-8"))
    results = []
    for fish_id, profile in policy.items():
        path = args.image_dir / (profile["sourceId"] + ".png")
        if profile["sourceId"] != fish_id:
            # Event aliases are not new images; report their base artwork separately.
            results.append(dict(fishId=fish_id, sourceId=profile["sourceId"],
                                file=str(path), action="shared_artwork", warnings=["EVENT_ART_USES_BASE_FISH"]))
            continue
        if not path.is_file():
            results.append(dict(fishId=fish_id, file=str(path),
                                error="MISSING_ASSET", action="unchanged", warnings=["MISSING_ASSET"]))
            continue
        results.append(analyze_file(path, profile, args.apply))
    results.sort(key=lambda r: (
        0 if r.get("error") else 1 if "INSUFFICIENT_EFFECTIVE_PIXELS" in r["warnings"] else
        2 if r.get("priority") == "high" else 3, r["fishId"]))
    write_reports(results, args.report_dir)
    altered = [r for r in results if r["action"] == "downsampled"]
    failures = [r for r in results if r.get("error")]
    warnings = [r for r in results if r["warnings"] and not r.get("error")]
    total_before = sum(r.get("unpackedMiB", 0) for r in results)
    total_after = sum((r.get("finalSize", [0, 0])[0] * r.get("finalSize", [0, 0])[1] * 4) / 1048576
                      for r in results if "finalSize" in r)
    print(f"ASSET_AUDIT mode={'APPLY' if args.apply else 'READ_ONLY'} checked={len(results)} "
          f"modified={len(altered)} review={len(warnings)} missing={len(failures)} "
          f"unpackedMiB_before={total_before:.1f} after={total_after:.1f}")
    for r in results:
        if r["warnings"] or r["action"] == "downsampled":
            print(f"ASSET {r['fishId']} "
                  f"size={r.get('width', '?')}x{r.get('height', '?')} "
                  f"effective={r.get('effectivePixelDensity', '?')} "
                  f"action={r['action']} proposed={r.get('proposedSize')} "
                  f"flags={','.join(r['warnings'])}")
    if failures:
        raise SystemExit(1)

if __name__ == "__main__":
    main()
