"""Centralized Pillow loading, frame handling, and EXIF normalization."""

from __future__ import annotations

import io
import math
import sys
import warnings
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from .formats import IMAGE_FORMAT_BY_LOGICAL
from .limits import MAX_IMAGE_INPUT_BYTES, InputReadError, read_limited_path

try:
    from PIL import Image, ImageCms, ImageOps, UnidentifiedImageError
except ImportError as exc:  # pragma: no cover - exercised only without Pillow.
    raise SystemExit(
        "Error: Pillow 12.3.0 or newer is required for image processing. "
        "Use the bundled runtime launcher with FAYE_WORKSPACE_ROOT for automatic "
        "project-local Pillow>=12.3.0 setup. Use the runtime "
        "launcher for full Python, pip, and OS-specific installation guidance."
    ) from exc


EXIF_ORIENTATION_TAG = 274
SUPPORTED_PILLOW_FORMATS = tuple(IMAGE_FORMAT_BY_LOGICAL.values())


class ImageDecodeError(Exception):
    """The supplied bytes cannot be decoded as an image."""


class UnsupportedImageError(ImageDecodeError):
    """The image decodes but violates a caller-requested loading policy."""


@dataclass(frozen=True)
class ImageEncodingMetadata:
    """Sanitized source properties that may be carried into an output container."""

    dpi: tuple[float, float] | None = None


@dataclass(frozen=True)
class DecodedImage:
    """A detached first frame plus stable properties of its encoded source."""

    image: Image.Image
    format: str
    encoded_width: int
    encoded_height: int
    encoded_mode: str
    frame_count: int
    animated: bool
    orientation_changed: bool
    encoding_metadata: ImageEncodingMetadata


def decode_image_bytes(
    raw: bytes,
    *,
    reject_multiframe: bool = False,
    max_edge: int | None = None,
    max_pixels: int | None = None,
) -> DecodedImage:
    """Decode frame zero, apply orientation, and normalize working pixels to sRGB."""

    try:
        with warnings.catch_warnings():
            warning_action = "ignore" if max_pixels is not None else "error"
            warnings.simplefilter(warning_action, Image.DecompressionBombWarning)
            with Image.open(
                io.BytesIO(raw),
                formats=SUPPORTED_PILLOW_FORMATS,
            ) as opened:
                source_format = (opened.format or "").lower()
                encoded_width, encoded_height = opened.size
                if max_edge is not None and (
                    encoded_width > max_edge or encoded_height > max_edge
                ):
                    raise UnsupportedImageError(
                        f"Image dimensions must not exceed {max_edge} pixels per edge."
                    )
                if max_pixels is not None and encoded_width * encoded_height > max_pixels:
                    raise UnsupportedImageError(
                        f"Image must not exceed {max_pixels:,} decoded pixels."
                    )
                encoded_mode = opened.mode
                frame_count = max(1, int(getattr(opened, "n_frames", 1)))
                animated = (
                    bool(getattr(opened, "is_animated", False)) or frame_count > 1
                )
                if reject_multiframe and animated:
                    raise UnsupportedImageError(
                        "Animated or multi-frame images are not supported."
                    )

                opened.seek(0)
                opened.load()
                orientation = opened.getexif().get(EXIF_ORIENTATION_TAG)
                dpi = sanitize_dpi(opened.info.get("dpi"))
                icc_profile = opened.info.get("icc_profile")
                detached = ImageOps.exif_transpose(opened).copy()
                normalized = normalize_to_srgb(detached, icc_profile)
    except UnsupportedImageError:
        raise
    except ImageDecodeError:
        raise
    except (Image.DecompressionBombWarning, Image.DecompressionBombError) as exc:
        raise ImageDecodeError(
            "Image dimensions exceed the supported pixel limit."
        ) from exc
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        raise ImageDecodeError("Input is not a supported image.") from exc

    return DecodedImage(
        image=normalized,
        format=source_format,
        encoded_width=encoded_width,
        encoded_height=encoded_height,
        encoded_mode=encoded_mode,
        frame_count=frame_count,
        animated=animated,
        orientation_changed=orientation not in (None, 1),
        encoding_metadata=ImageEncodingMetadata(dpi=dpi),
    )


def load_image_path(
    path: Path,
    *,
    reject_multiframe: bool = False,
    max_edge: int | None = None,
    max_pixels: int | None = None,
    max_bytes: int = MAX_IMAGE_INPUT_BYTES,
) -> DecodedImage:
    """Read an image path and decode it using the common byte loader."""

    try:
        raw = read_limited_path(
            path,
            max_bytes=max_bytes,
            description="Image input",
        )
    except (OSError, InputReadError) as exc:
        raise ImageDecodeError(str(exc) or "Unable to read image input.") from exc
    return decode_image_bytes(
        raw,
        reject_multiframe=reject_multiframe,
        max_edge=max_edge,
        max_pixels=max_pixels,
    )


def sanitize_dpi(value: object) -> tuple[float, float] | None:
    """Keep plausible finite DPI values while discarding malformed metadata."""

    if not isinstance(value, (tuple, list)) or len(value) != 2:
        return None
    try:
        dpi = (float(value[0]), float(value[1]))
    except (TypeError, ValueError, OverflowError):
        return None
    if not all(math.isfinite(item) and 0 < item <= 100_000 for item in dpi):
        return None
    return dpi


def normalize_to_srgb(image: Image.Image, icc_profile: object) -> Image.Image:
    """Return detached RGB/RGBA pixels in sRGB with no inherited metadata."""

    rgba = image.convert("RGBA") if has_alpha(image) else None
    alpha = rgba.getchannel("A") if rgba is not None else None
    color = (rgba if rgba is not None else image).convert("RGB")
    if icc_profile is not None:
        if not isinstance(icc_profile, bytes):
            raise ImageDecodeError("Input color profile is invalid or unsupported.")
        try:
            source_profile = ImageCms.ImageCmsProfile(io.BytesIO(icc_profile))
            profile_source = (
                image.copy()
                if alpha is None and image.mode in {"RGB", "CMYK", "L", "LAB", "XYZ"}
                else color
            )
            color = ImageCms.profileToProfile(
                profile_source,
                source_profile,
                srgb_profile(),
                outputMode="RGB",
            )
        except (OSError, TypeError, ValueError, ImageCms.PyCMSError) as exc:
            raise ImageDecodeError(
                "Input color profile is invalid or unsupported."
            ) from exc
    if alpha is not None:
        color.putalpha(alpha)
    color.info.clear()
    return color


@lru_cache(maxsize=1)
def srgb_profile() -> ImageCms.ImageCmsProfile:
    """Return the process-local canonical output profile."""

    return ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB"))


@lru_cache(maxsize=1)
def srgb_profile_bytes() -> bytes:
    """Return an embeddable sRGB ICC profile."""

    return srgb_profile().tobytes()


def has_alpha(image: Image.Image) -> bool:
    """Return whether the current image representation carries transparency."""

    return image.mode in ("RGBA", "LA") or (
        image.mode == "P" and "transparency" in image.info
    )
