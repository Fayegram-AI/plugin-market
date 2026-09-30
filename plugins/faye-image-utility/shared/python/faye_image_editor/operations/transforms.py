"""Resize, crop, rotate, flip, and opacity operations."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from PIL import ImageColor, ImageOps

from faye_image_common import Image

from ..errors import RequestValidationError
from ..validation import (
    MAX_DIMENSION,
    reject_unknown_fields,
    require_bounded_integer,
    require_color,
    require_dimension,
    require_number,
    require_opacity,
    require_string,
)


TRANSFORM_TYPES = frozenset({"resize", "crop", "rotate", "flip", "opacity"})


def validate_transform_operation(
    operation_type: str,
    raw: Mapping[str, Any],
    path: str,
) -> dict[str, Any]:
    if operation_type == "resize":
        reject_unknown_fields(raw, {"type", "width", "height", "mode", "background"}, path)
        mode = require_string(raw.get("mode", "stretch"), f"{path}.mode").lower()
        if mode not in {"stretch", "contain", "cover"}:
            raise RequestValidationError(
                f"{path}.mode must be stretch, contain, or cover."
            )
        return {
            "width": require_dimension(raw.get("width"), f"{path}.width"),
            "height": require_dimension(raw.get("height"), f"{path}.height"),
            "mode": mode,
            "background": require_color(
                raw.get("background", "#00000000"),
                f"{path}.background",
            ),
        }

    if operation_type == "crop":
        reject_unknown_fields(raw, {"type", "x", "y", "width", "height"}, path)
        x = require_bounded_integer(
            raw.get("x"),
            f"{path}.x",
            minimum=0,
            maximum=MAX_DIMENSION,
        )
        y = require_bounded_integer(
            raw.get("y"),
            f"{path}.y",
            minimum=0,
            maximum=MAX_DIMENSION,
        )
        return {
            "x": x,
            "y": y,
            "width": require_dimension(raw.get("width"), f"{path}.width"),
            "height": require_dimension(raw.get("height"), f"{path}.height"),
        }

    if operation_type == "rotate":
        reject_unknown_fields(raw, {"type", "degrees", "expand", "background"}, path)
        expand = raw.get("expand", True)
        if not isinstance(expand, bool):
            raise RequestValidationError(f"{path}.expand must be a boolean.")
        return {
            "degrees": require_number(raw.get("degrees"), f"{path}.degrees") % 360,
            "expand": expand,
            "background": require_color(
                raw.get("background", "#00000000"),
                f"{path}.background",
            ),
        }

    if operation_type == "flip":
        reject_unknown_fields(raw, {"type", "axis"}, path)
        axis = require_string(raw.get("axis"), f"{path}.axis").lower()
        if axis not in {"horizontal", "vertical"}:
            raise RequestValidationError(
                f"{path}.axis must be horizontal or vertical."
            )
        return {"axis": axis}

    if operation_type == "opacity":
        reject_unknown_fields(raw, {"type", "value"}, path)
        return {"value": require_opacity(raw.get("value"), f"{path}.value")}

    raise RequestValidationError(f"Unsupported transform operation: {operation_type}.")


def apply_transform_operation(
    image: Image.Image,
    operation_type: str,
    values: Mapping[str, Any],
) -> Image.Image:
    rgba = image.convert("RGBA")
    if operation_type == "resize":
        return resize_image(rgba, values)
    if operation_type == "crop":
        right = values["x"] + values["width"]
        bottom = values["y"] + values["height"]
        if right > rgba.width or bottom > rgba.height:
            raise RequestValidationError("Crop bounds must remain inside the current image.")
        return rgba.crop((values["x"], values["y"], right, bottom))
    if operation_type == "rotate":
        rotated = rgba.rotate(
            values["degrees"],
            resample=Image.Resampling.BICUBIC,
            expand=values["expand"],
            fillcolor=ImageColor.getcolor(values["background"], "RGBA"),
        )
        ensure_dimensions(rotated)
        return rotated
    if operation_type == "flip":
        if values["axis"] == "horizontal":
            return ImageOps.mirror(rgba)
        return ImageOps.flip(rgba)
    if operation_type == "opacity":
        alpha = rgba.getchannel("A").point(lambda value: round(value * values["value"]))
        adjusted = rgba.copy()
        adjusted.putalpha(alpha)
        return adjusted
    raise RequestValidationError(f"Unsupported transform operation: {operation_type}.")


def resize_image(image: Image.Image, values: Mapping[str, Any]) -> Image.Image:
    size = (values["width"], values["height"])
    if values["mode"] == "stretch":
        return image.resize(size, Image.Resampling.LANCZOS)
    if values["mode"] == "cover":
        return ImageOps.fit(image, size, method=Image.Resampling.LANCZOS)

    contained = ImageOps.contain(image, size, method=Image.Resampling.LANCZOS)
    canvas = Image.new(
        "RGBA",
        size,
        ImageColor.getcolor(values["background"], "RGBA"),
    )
    position = (
        (size[0] - contained.width) // 2,
        (size[1] - contained.height) // 2,
    )
    canvas.alpha_composite(contained.convert("RGBA"), dest=position)
    return canvas


def ensure_dimensions(image: Image.Image) -> None:
    require_dimension(image.width, "result.width")
    require_dimension(image.height, "result.height")
