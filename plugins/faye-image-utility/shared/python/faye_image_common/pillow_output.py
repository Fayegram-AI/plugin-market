"""Shared Pillow preparation and encoding for static image outputs."""

from __future__ import annotations

import io
import re
from typing import TypeAlias

from .formats import IMAGE_FORMAT_BY_LOGICAL, ImageFormatError, normalize_image_format
from .pillow_io import (
    Image,
    ImageEncodingMetadata,
    has_alpha,
    srgb_profile_bytes,
)


RgbColor: TypeAlias = tuple[int, int, int]


def parse_rgb_color(value: str) -> RgbColor:
    """Parse an opaque #RRGGBB color for alpha flattening."""

    text = value.strip()
    if not re.fullmatch(r"#[0-9a-fA-F]{6}", text):
        raise ImageFormatError("Background must be a hex color in #RRGGBB form.")
    return tuple(int(text[index : index + 2], 16) for index in (1, 3, 5))


def prepare_image_for_output(
    image: Image.Image,
    target_format: str,
    background: RgbColor = (255, 255, 255),
) -> Image.Image:
    """Return an image mode suitable for the requested output container."""

    normalized = normalize_image_format(target_format)
    if normalized == "jpg":
        if has_alpha(image):
            rgba = image.convert("RGBA")
            flattened = Image.new("RGB", rgba.size, background)
            flattened.paste(rgba, mask=rgba.getchannel("A"))
            return flattened
        return image.convert("RGB")

    if has_alpha(image):
        return image.convert("RGBA")
    return image.convert("RGB")


def encode_image_bytes(
    image: Image.Image,
    target_format: str,
    *,
    background: RgbColor = (255, 255, 255),
    quality: int = 95,
    metadata: ImageEncodingMetadata | None = None,
) -> bytes:
    """Encode one static Pillow image to PNG, JPEG, or WebP bytes."""

    normalized = normalize_image_format(target_format)
    if not isinstance(quality, int) or isinstance(quality, bool) or not 1 <= quality <= 100:
        raise ImageFormatError("Quality must be an integer from 1 to 100.")

    prepared = prepare_image_for_output(image, normalized, background).copy()
    prepared.info.clear()
    options: dict[str, object] = {"icc_profile": srgb_profile_bytes()}
    encoding_metadata = metadata or ImageEncodingMetadata()
    if encoding_metadata.dpi is not None and normalized in {"jpg", "png"}:
        options["dpi"] = encoding_metadata.dpi
    if normalized == "jpg":
        options.update({"quality": quality, "optimize": True})
    elif normalized == "webp":
        options.update({"quality": quality})

    output = io.BytesIO()
    prepared.save(output, IMAGE_FORMAT_BY_LOGICAL[normalized], **options)
    return output.getvalue()
