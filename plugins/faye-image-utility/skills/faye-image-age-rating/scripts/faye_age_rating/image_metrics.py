"""Dependency-light, deterministic technical metrics for local image preflight."""

from __future__ import annotations

import hashlib
import math
from typing import Any

from faye_image_common import DecodedImage, Image, has_alpha
from PIL import ImageFilter


MAX_ANALYSIS_EDGE = 1024


def analyze_image_bytes(raw: bytes, decoded: DecodedImage) -> dict[str, Any]:
    """Return stable technical properties without making semantic judgments."""

    displayed = decoded.image
    analysis_source = composite_transparency_on_white(displayed)
    analysis_image = resize_for_analysis(analysis_source)
    grayscale = analysis_image.convert("L")
    histogram = grayscale.histogram()[:256]
    pixel_count = grayscale.width * grayscale.height

    mean = sum(level * count for level, count in enumerate(histogram)) / pixel_count
    variance = (
        sum(((level - mean) ** 2) * count for level, count in enumerate(histogram))
        / pixel_count
    )
    entropy = 0.0
    for count in histogram:
        if count:
            probability = count / pixel_count
            entropy -= probability * math.log2(probability)

    return {
        "sha256": hashlib.sha256(raw).hexdigest(),
        "format": decoded.format,
        "byteSize": len(raw),
        "encoded": {
            "width": decoded.encoded_width,
            "height": decoded.encoded_height,
            "mode": decoded.encoded_mode,
        },
        "display": {
            "width": displayed.width,
            "height": displayed.height,
            "orientationChanged": decoded.orientation_changed,
        },
        "hasAlpha": has_alpha(displayed),
        "frameCount": decoded.frame_count,
        "animated": decoded.animated,
        "analysis": {
            "width": grayscale.width,
            "height": grayscale.height,
            "lumaMean": rounded(mean),
            "lumaStdDev": rounded(math.sqrt(variance)),
            "lumaP01": percentile(histogram, pixel_count, 0.01),
            "lumaP99": percentile(histogram, pixel_count, 0.99),
            "blackClipRatio": rounded(histogram[0] / pixel_count),
            "whiteClipRatio": rounded(histogram[255] / pixel_count),
            "entropy": rounded(entropy),
            "edgeVariance": rounded(edge_variance(grayscale)),
            "dHash": difference_hash(grayscale),
        },
    }


def composite_transparency_on_white(image: Image.Image) -> Image.Image:
    """Prevent invisible RGB values from distorting technical luma metrics."""

    if not has_alpha(image):
        return image.convert("RGB")
    rgba = image.convert("RGBA")
    background = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
    return Image.alpha_composite(background, rgba).convert("RGB")


def resize_for_analysis(image: Image.Image) -> Image.Image:
    longest = max(image.size)
    if longest <= MAX_ANALYSIS_EDGE:
        return image.copy()
    scale = MAX_ANALYSIS_EDGE / longest
    size = (
        max(1, round(image.width * scale)),
        max(1, round(image.height * scale)),
    )
    return image.resize(size, Image.Resampling.LANCZOS)


def percentile(histogram: list[int], pixel_count: int, fraction: float) -> int:
    rank = max(1, math.ceil(pixel_count * fraction))
    cumulative = 0
    for level, count in enumerate(histogram):
        cumulative += count
        if cumulative >= rank:
            return level
    return 255


def edge_variance(grayscale: Image.Image) -> float:
    if grayscale.width <= 2 or grayscale.height <= 2:
        return 0.0
    edges = grayscale.filter(ImageFilter.FIND_EDGES).crop(
        (1, 1, grayscale.width - 1, grayscale.height - 1)
    )
    values = list(edges.getdata())
    if not values:
        return 0.0
    mean = sum(values) / len(values)
    return sum((value - mean) ** 2 for value in values) / len(values)


def difference_hash(grayscale: Image.Image) -> str:
    sampled = grayscale.resize((9, 8), Image.Resampling.LANCZOS)
    pixels = list(sampled.getdata())
    value = 0
    for row in range(8):
        offset = row * 9
        for column in range(8):
            value <<= 1
            if pixels[offset + column] > pixels[offset + column + 1]:
                value |= 1
    return f"{value:016x}"


def rounded(value: float) -> float:
    return round(value, 6)
