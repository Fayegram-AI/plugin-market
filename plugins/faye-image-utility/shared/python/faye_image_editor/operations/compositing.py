"""Static image overlay and compositing operation."""

from __future__ import annotations

from collections.abc import Mapping
from pathlib import Path
from typing import Any

from faye_image_common import (
    MAX_IMAGE_INPUT_BYTES,
    Image,
    ImageDecodeError,
    ImageFormatError,
    UnsupportedImageError,
    load_image_path,
    pillow_format_to_logical,
)

from ..errors import EditorInputError, RequestValidationError
from ..validation import (
    MAX_DIMENSION,
    MAX_GEOMETRY_MAGNITUDE,
    reject_unknown_fields,
    require_dimension,
    require_bounded_integer,
    require_opacity,
    require_string,
)


COMPOSITING_TYPES = frozenset({"composite"})


def validate_compositing_operation(
    operation_type: str,
    raw: Mapping[str, Any],
    path: str,
) -> dict[str, Any]:
    reject_unknown_fields(
        raw,
        {"type", "path", "x", "y", "opacity", "width", "height"},
        path,
    )
    width = raw.get("width")
    height = raw.get("height")
    if (width is None) != (height is None):
        raise RequestValidationError(
            f"{path}.width and {path}.height must be supplied together."
        )
    return {
        "path": Path(require_string(raw.get("path"), f"{path}.path")),
        "x": require_bounded_integer(
            raw.get("x", 0),
            f"{path}.x",
            minimum=-MAX_GEOMETRY_MAGNITUDE,
            maximum=MAX_GEOMETRY_MAGNITUDE,
        ),
        "y": require_bounded_integer(
            raw.get("y", 0),
            f"{path}.y",
            minimum=-MAX_GEOMETRY_MAGNITUDE,
            maximum=MAX_GEOMETRY_MAGNITUDE,
        ),
        "opacity": require_opacity(raw.get("opacity", 1), f"{path}.opacity"),
        "width": require_dimension(width, f"{path}.width") if width is not None else None,
        "height": require_dimension(height, f"{path}.height") if height is not None else None,
    }


def apply_compositing_operation(
    image: Image.Image,
    operation_type: str,
    values: Mapping[str, Any],
) -> Image.Image:
    try:
        decoded = load_image_path(
            values["path"],
            reject_multiframe=True,
            max_edge=MAX_DIMENSION,
            max_bytes=MAX_IMAGE_INPUT_BYTES,
        )
        pillow_format_to_logical(decoded.format)
    except (OSError, ImageDecodeError, UnsupportedImageError, ImageFormatError) as exc:
        raise EditorInputError(f"Unable to load composite image: {exc}") from exc

    overlay = decoded.image.convert("RGBA")
    if values["width"] is not None:
        overlay = overlay.resize(
            (values["width"], values["height"]),
            Image.Resampling.LANCZOS,
        )
    if values["opacity"] < 1:
        alpha = overlay.getchannel("A").point(
            lambda value: round(value * values["opacity"])
        )
        overlay.putalpha(alpha)

    base = image.convert("RGBA")
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    layer.alpha_composite(overlay, dest=(values["x"], values["y"]))
    return Image.alpha_composite(base, layer)
