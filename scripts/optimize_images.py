#!/usr/bin/env python3
"""Create lightweight WebP copies of portfolio images without altering originals."""

from __future__ import annotations

import json
import math
from pathlib import Path
from PIL import Image, ImageChops, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "photos"
OUTPUT = ROOT / "assets" / "photos-web"
REPORT = ROOT / "content" / "image-optimization-report.json"


def target_long_edge(path: Path) -> int:
    parts = {part.lower() for part in path.parts}
    if "hero" in parts or "featured" in parts or path.stem.lower().endswith("_cover"):
        return 3000
    return 2560


def psnr(reference: Image.Image, result: Image.Image) -> float:
    diff = ImageChops.difference(reference, result)
    histogram = diff.histogram()
    squared = sum((value % 256) ** 2 * count for value, count in enumerate(histogram))
    mse = squared / (reference.width * reference.height * 3)
    return 99.0 if mse == 0 else 20 * math.log10(255 / math.sqrt(mse))


def optimize(source: Path) -> dict:
    relative = source.relative_to(SOURCE)
    destination = (OUTPUT / relative).with_suffix(".webp")
    destination.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGB")
        elif image.mode == "RGBA":
            background = Image.new("RGB", image.size, "white")
            background.paste(image, mask=image.getchannel("A"))
            image = background

        original_size = image.size
        limit = target_long_edge(relative)
        if max(image.size) > limit:
            scale = limit / max(image.size)
            image = image.resize(
                (round(image.width * scale), round(image.height * scale)),
                Image.Resampling.LANCZOS,
            )

        image.save(destination, "WEBP", quality=84, method=6)
        with Image.open(destination) as encoded:
            score = psnr(image, encoded.convert("RGB"))

    source_bytes = source.stat().st_size
    output_bytes = destination.stat().st_size
    return {
        "source": str(relative),
        "output": str(destination.relative_to(ROOT)),
        "original_dimensions": list(original_size),
        "web_dimensions": list(image.size),
        "source_bytes": source_bytes,
        "web_bytes": output_bytes,
        "reduction_percent": round((1 - output_bytes / source_bytes) * 100, 1),
        "psnr_db": round(score, 2),
    }


def main() -> None:
    extensions = {".jpg", ".jpeg", ".png", ".webp"}
    sources = sorted(path for path in SOURCE.rglob("*") if path.suffix.lower() in extensions)
    results = []
    for index, source in enumerate(sources, 1):
        result = optimize(source)
        results.append(result)
        print(f"[{index:03}/{len(sources):03}] {result['source']}", flush=True)

    source_total = sum(item["source_bytes"] for item in results)
    web_total = sum(item["web_bytes"] for item in results)
    report = {
        "images": len(results),
        "source_bytes": source_total,
        "web_bytes": web_total,
        "reduction_percent": round((1 - web_total / source_total) * 100, 1),
        "minimum_psnr_db": min(item["psnr_db"] for item in results),
        "average_psnr_db": round(sum(item["psnr_db"] for item in results) / len(results), 2),
        "files": results,
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: report[key] for key in report if key != "files"}, indent=2))


if __name__ == "__main__":
    main()
