"""Shared image-format names, suffixes, and normalization rules."""

from __future__ import annotations

from pathlib import Path


SUPPORTED_IMAGE_FORMATS = frozenset({"jpg", "png", "webp"})
IMAGE_FORMAT_BY_LOGICAL = {
    "jpg": "JPEG",
    "png": "PNG",
    "webp": "WEBP",
}
EXTENSION_BY_FORMAT = {
    "jpg": ".jpg",
    "png": ".png",
    "webp": ".webp",
}
FORMAT_BY_EXTENSION = {
    ".jpg": "jpg",
    ".jpeg": "jpg",
    ".png": "png",
    ".webp": "webp",
}
MIME_BY_FORMAT = {
    "jpg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp",
}
FORMAT_BY_MIME = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}


class ImageFormatError(Exception):
    """An image format or output option is unsupported or inconsistent."""


def normalize_image_format(value: str | None) -> str:
    """Return the canonical logical name for a supported image format."""

    normalized = (value or "").strip().lower()
    if normalized == "jpeg":
        normalized = "jpg"
    if normalized not in SUPPORTED_IMAGE_FORMATS:
        raise ImageFormatError(
            f"Unsupported image format {value!r}. Supported formats: jpg, png, webp."
        )
    return normalized


def pillow_format_to_logical(value: str | None) -> str:
    """Normalize a Pillow decoder format name."""

    return normalize_image_format(value)


def image_format_from_path(path: Path) -> str | None:
    """Infer a supported logical format from a path suffix."""

    return FORMAT_BY_EXTENSION.get(path.suffix.lower())
