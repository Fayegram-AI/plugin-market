"""Shape, stroke, arrow, and modern text rendering operations."""

from __future__ import annotations

import io
import math
from collections.abc import Mapping
from pathlib import Path
from typing import Any

from PIL import ImageColor, ImageDraw, ImageFont

from faye_image_common import (
    MAX_FONT_INPUT_BYTES,
    Image,
    InputReadError,
    read_limited_path,
)

from ..errors import EditorInputError, RequestValidationError
from ..validation import (
    MAX_DIMENSION,
    MAX_GEOMETRY_MAGNITUDE,
    MAX_STROKE_POINTS,
    MAX_TEXT_CHARACTERS,
    reject_unknown_fields,
    require_color,
    require_coordinate,
    require_extent,
    require_number,
    require_point,
    require_positive_number,
    require_string,
)


DRAWING_TYPES = frozenset(
    {"stroke", "line", "arrow", "rectangle", "circle", "dot", "text", "label"}
)
MAX_TEXT_RENDER_EDGE = MAX_GEOMETRY_MAGNITUDE
MAX_TEXT_RENDER_PIXELS = MAX_DIMENSION * MAX_DIMENSION


def validate_drawing_operation(
    operation_type: str,
    raw: Mapping[str, Any],
    path: str,
) -> dict[str, Any]:
    if operation_type == "stroke":
        reject_unknown_fields(raw, {"type", "points", "color", "width"}, path)
        points_value = raw.get("points")
        if not isinstance(points_value, list) or len(points_value) < 2:
            raise RequestValidationError(f"{path}.points must contain at least two points.")
        if len(points_value) > MAX_STROKE_POINTS:
            raise RequestValidationError(
                f"{path}.points must contain at most {MAX_STROKE_POINTS:,} points."
            )
        return {
            "points": tuple(
                require_point(point, f"{path}.points[{index}]")
                for index, point in enumerate(points_value)
            ),
            "color": require_color(raw.get("color", "#111827"), f"{path}.color"),
            "width": pixel_width(raw.get("width", 4), f"{path}.width"),
        }

    if operation_type in {"line", "arrow"}:
        reject_unknown_fields(raw, {"type", "start", "end", "color", "width"}, path)
        return {
            "start": require_point(raw.get("start"), f"{path}.start"),
            "end": require_point(raw.get("end"), f"{path}.end"),
            "color": require_color(raw.get("color", "#111827"), f"{path}.color"),
            "width": pixel_width(raw.get("width", 4), f"{path}.width"),
        }

    if operation_type == "rectangle":
        reject_unknown_fields(
            raw,
            {"type", "x", "y", "width", "height", "fill", "stroke", "strokeWidth"},
            path,
        )
        return {
            "x": require_coordinate(raw.get("x"), f"{path}.x"),
            "y": require_coordinate(raw.get("y"), f"{path}.y"),
            "width": require_extent(raw.get("width"), f"{path}.width"),
            "height": require_extent(raw.get("height"), f"{path}.height"),
            "fill": require_color(raw.get("fill"), f"{path}.fill", allow_none=True),
            "stroke": require_color(raw.get("stroke", "#111827"), f"{path}.stroke"),
            "strokeWidth": pixel_width(raw.get("strokeWidth", 3), f"{path}.strokeWidth"),
        }

    if operation_type == "circle":
        reject_unknown_fields(
            raw,
            {"type", "center", "radius", "fill", "stroke", "strokeWidth"},
            path,
        )
        return {
            "center": require_point(raw.get("center"), f"{path}.center"),
            "radius": require_extent(raw.get("radius"), f"{path}.radius"),
            "fill": require_color(raw.get("fill"), f"{path}.fill", allow_none=True),
            "stroke": require_color(raw.get("stroke", "#111827"), f"{path}.stroke"),
            "strokeWidth": pixel_width(raw.get("strokeWidth", 3), f"{path}.strokeWidth"),
        }

    if operation_type == "dot":
        reject_unknown_fields(raw, {"type", "center", "radius", "color"}, path)
        return {
            "center": require_point(raw.get("center"), f"{path}.center"),
            "radius": require_extent(raw.get("radius", 8), f"{path}.radius"),
            "color": require_color(raw.get("color", "#111827"), f"{path}.color"),
        }

    if operation_type in {"text", "label"}:
        reject_unknown_fields(
            raw,
            {
                "type",
                "text",
                "x",
                "y",
                "color",
                "fontSize",
                "fontPath",
                "background",
                "padding",
                "spacing",
            },
            path,
        )
        font_path = raw.get("fontPath")
        if font_path is not None:
            font_path = require_string(font_path, f"{path}.fontPath")
        background_default = "#fef3c7" if operation_type == "label" else None
        return {
            "text": require_string(
                raw.get("text"),
                f"{path}.text",
                max_length=MAX_TEXT_CHARACTERS,
            ),
            "x": require_coordinate(raw.get("x", 24), f"{path}.x"),
            "y": require_coordinate(raw.get("y", 24), f"{path}.y"),
            "color": require_color(raw.get("color", "#111827"), f"{path}.color"),
            "fontSize": pixel_width(raw.get("fontSize", 24), f"{path}.fontSize"),
            "fontPath": font_path,
            "background": require_color(
                raw.get("background", background_default),
                f"{path}.background",
                allow_none=True,
            ),
            "padding": nonnegative_number(raw.get("padding", 6), f"{path}.padding"),
            "spacing": nonnegative_number(raw.get("spacing", 4), f"{path}.spacing"),
        }

    raise RequestValidationError(f"Unsupported drawing operation: {operation_type}.")


def apply_drawing_operation(
    image: Image.Image,
    operation_type: str,
    values: Mapping[str, Any],
) -> Image.Image:
    base = image.convert("RGBA")
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    if operation_type == "stroke":
        draw.line(
            values["points"],
            fill=rgba(values["color"]),
            width=values["width"],
            joint="curve",
        )
        draw_round_endpoints(draw, values["points"], values["width"], values["color"])
    elif operation_type == "line":
        draw.line(
            [values["start"], values["end"]],
            fill=rgba(values["color"]),
            width=values["width"],
        )
    elif operation_type == "arrow":
        draw_arrow(draw, values)
    elif operation_type == "rectangle":
        x = values["x"]
        y = values["y"]
        box = [x, y, x + values["width"], y + values["height"]]
        draw.rectangle(
            box,
            fill=rgba(values["fill"]) if values["fill"] else None,
            outline=rgba(values["stroke"]) if values["stroke"] else None,
            width=values["strokeWidth"],
        )
    elif operation_type == "circle":
        x, y = values["center"]
        radius = values["radius"]
        draw.ellipse(
            [x - radius, y - radius, x + radius, y + radius],
            fill=rgba(values["fill"]) if values["fill"] else None,
            outline=rgba(values["stroke"]) if values["stroke"] else None,
            width=values["strokeWidth"],
        )
    elif operation_type == "dot":
        x, y = values["center"]
        radius = values["radius"]
        draw.ellipse(
            [x - radius, y - radius, x + radius, y + radius],
            fill=rgba(values["color"]),
        )
    elif operation_type in {"text", "label"}:
        draw_text(draw, values)
    else:  # pragma: no cover - the registry prevents this state.
        raise RequestValidationError(f"Unsupported drawing operation: {operation_type}.")

    return Image.alpha_composite(base, layer)


def pixel_width(value: Any, path: str) -> int:
    width = require_positive_number(value, path)
    if width > MAX_DIMENSION:
        raise RequestValidationError(
            f"{path} must not exceed {MAX_DIMENSION}."
        )
    return max(1, round(width))


def nonnegative_number(value: Any, path: str) -> float:
    number = require_number(value, path)
    if number < 0:
        raise RequestValidationError(f"{path} must be zero or greater.")
    if number > MAX_GEOMETRY_MAGNITUDE:
        raise RequestValidationError(
            f"{path} must not exceed {MAX_GEOMETRY_MAGNITUDE:,}."
        )
    return number


def rgba(value: str) -> tuple[int, int, int, int]:
    return ImageColor.getcolor(value, "RGBA")


def draw_round_endpoints(
    draw: ImageDraw.ImageDraw,
    points: tuple[tuple[float, float], ...],
    width: int,
    color: str,
) -> None:
    radius = width / 2
    fill = rgba(color)
    for x, y in (points[0], points[-1]):
        draw.ellipse([x - radius, y - radius, x + radius, y + radius], fill=fill)


def draw_arrow(draw: ImageDraw.ImageDraw, values: Mapping[str, Any]) -> None:
    start_x, start_y = values["start"]
    end_x, end_y = values["end"]
    width = values["width"]
    color = rgba(values["color"])
    draw.line([(start_x, start_y), (end_x, end_y)], fill=color, width=width)

    angle = math.atan2(end_y - start_y, end_x - start_x)
    length = max(10, width * 3)
    spread = math.pi / 6
    left = (
        end_x - length * math.cos(angle - spread),
        end_y - length * math.sin(angle - spread),
    )
    right = (
        end_x - length * math.cos(angle + spread),
        end_y - length * math.sin(angle + spread),
    )
    draw.polygon([(end_x, end_y), left, right], fill=color)


def draw_text(draw: ImageDraw.ImageDraw, values: Mapping[str, Any]) -> None:
    font = load_font(values["fontPath"], values["fontSize"])
    position = (values["x"], values["y"])
    spacing = round(values["spacing"])
    bounds = draw.multiline_textbbox(
        position,
        values["text"],
        font=font,
        spacing=spacing,
    )
    ensure_text_render_bounds(bounds)
    background = values["background"]
    if background:
        padding = values["padding"]
        draw.rounded_rectangle(
            [
                bounds[0] - padding,
                bounds[1] - padding,
                bounds[2] + padding,
                bounds[3] + padding,
            ],
            radius=max(0, round(padding / 2)),
            fill=rgba(background),
        )
    draw.multiline_text(
        position,
        values["text"],
        font=font,
        fill=rgba(values["color"]),
        spacing=spacing,
    )


def ensure_text_render_bounds(bounds: tuple[float, float, float, float]) -> None:
    """Reject text masks whose combined dimensions exceed safe raster limits."""

    width = max(0, math.ceil(bounds[2] - bounds[0]))
    height = max(0, math.ceil(bounds[3] - bounds[1]))
    if (
        width > MAX_TEXT_RENDER_EDGE
        or height > MAX_TEXT_RENDER_EDGE
        or width * height > MAX_TEXT_RENDER_PIXELS
    ):
        raise RequestValidationError(
            "Rendered text must not exceed "
            f"{MAX_TEXT_RENDER_EDGE:,} pixels per edge or "
            f"{MAX_TEXT_RENDER_PIXELS:,} pixels in area."
        )


def load_font(font_path: str | None, font_size: int) -> ImageFont.ImageFont:
    try:
        if font_path:
            path = Path(font_path)
            payload = read_limited_path(
                path,
                max_bytes=MAX_FONT_INPUT_BYTES,
                description="Font file",
            )
            return ImageFont.truetype(io.BytesIO(payload), size=font_size)
        return ImageFont.load_default(size=font_size)
    except (InputReadError, OSError) as exc:
        raise EditorInputError(f"Unable to load font {font_path!r}: {exc}") from exc
