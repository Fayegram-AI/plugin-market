"""Dependency-light validation helpers shared by editor contracts."""

from __future__ import annotations

import math
import re
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Any

from .errors import RequestValidationError


MAX_DIMENSION = 4096
MAX_GEOMETRY_MAGNITUDE = 32_768
MAX_OPERATION_COUNT = 256
MAX_COMPOSITE_OPERATION_COUNT = 32
MAX_STROKE_POINTS = 16_384
MAX_TOTAL_STROKE_POINTS = 65_536
MAX_TEXT_CHARACTERS = 4_096
MAX_TOTAL_TEXT_CHARACTERS = 16_384
HEX_COLOR_PATTERN = re.compile(r"#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?")


def require_mapping(value: Any, path: str) -> Mapping[str, Any]:
    if not isinstance(value, Mapping):
        raise RequestValidationError(f"{path} must be an object.")
    return value


def reject_unknown_fields(
    value: Mapping[str, Any],
    allowed: set[str],
    path: str,
) -> None:
    unknown = sorted(set(value) - allowed)
    if unknown:
        raise RequestValidationError(f"{path}.{unknown[0]} is not allowed.")


def require_string(value: Any, path: str, *, max_length: int | None = None) -> str:
    if not isinstance(value, str) or not value.strip():
        raise RequestValidationError(f"{path} must be a non-empty string.")
    stripped = value.strip()
    if max_length is not None and len(stripped) > max_length:
        raise RequestValidationError(
            f"{path} must contain at most {max_length:,} characters."
        )
    return stripped


def require_boolean(value: Any, path: str) -> bool:
    if not isinstance(value, bool):
        raise RequestValidationError(f"{path} must be a boolean.")
    return value


def optional_path(value: Any, path: str) -> Path | None:
    if value is None:
        return None
    return Path(require_string(value, path))


def require_number(value: Any, path: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise RequestValidationError(f"{path} must be a number.")
    try:
        number = float(value)
    except (OverflowError, ValueError) as exc:
        raise RequestValidationError(f"{path} must be finite.") from exc
    if not math.isfinite(number):
        raise RequestValidationError(f"{path} must be finite.")
    return number


def require_integer(value: Any, path: str) -> int:
    number = require_number(value, path)
    if not number.is_integer():
        raise RequestValidationError(f"{path} must be an integer.")
    return int(number)


def require_bounded_integer(
    value: Any,
    path: str,
    *,
    minimum: int,
    maximum: int,
) -> int:
    """Require an integer inside an inclusive operation-safe range."""

    number = require_integer(value, path)
    if not minimum <= number <= maximum:
        raise RequestValidationError(
            f"{path} must be an integer from {minimum:,} to {maximum:,}."
        )
    return number


def require_dimension(value: Any, path: str) -> int:
    dimension = require_integer(value, path)
    if not 1 <= dimension <= MAX_DIMENSION:
        raise RequestValidationError(
            f"{path} must be an integer from 1 to {MAX_DIMENSION}."
        )
    return dimension


def require_positive_number(value: Any, path: str) -> float:
    number = require_number(value, path)
    if number <= 0:
        raise RequestValidationError(f"{path} must be greater than zero.")
    return number


def require_coordinate(value: Any, path: str) -> float:
    """Require geometry that Pillow can safely clip against the editor canvas."""

    number = require_number(value, path)
    if abs(number) > MAX_GEOMETRY_MAGNITUDE:
        raise RequestValidationError(
            f"{path} must be from {-MAX_GEOMETRY_MAGNITUDE:,} "
            f"to {MAX_GEOMETRY_MAGNITUDE:,}."
        )
    return number


def require_extent(value: Any, path: str) -> float:
    """Require a positive shape extent with a bounded rendering cost."""

    number = require_positive_number(value, path)
    if number > MAX_GEOMETRY_MAGNITUDE:
        raise RequestValidationError(
            f"{path} must not exceed {MAX_GEOMETRY_MAGNITUDE:,}."
        )
    return number


def require_opacity(value: Any, path: str) -> float:
    opacity = require_number(value, path)
    if not 0 <= opacity <= 1:
        raise RequestValidationError(f"{path} must be from 0 to 1.")
    return opacity


def require_point(value: Any, path: str) -> tuple[float, float]:
    if (
        not isinstance(value, Sequence)
        or isinstance(value, (str, bytes))
        or len(value) != 2
    ):
        raise RequestValidationError(f"{path} must be [x, y].")
    return (
        require_coordinate(value[0], f"{path}[0]"),
        require_coordinate(value[1], f"{path}[1]"),
    )


def require_color(value: Any, path: str, *, allow_none: bool = False) -> str | None:
    if value is None and allow_none:
        return None
    color = require_string(value, path)
    if HEX_COLOR_PATTERN.fullmatch(color) is None:
        raise RequestValidationError(
            f"{path} must be #RRGGBB or #RRGGBBAA."
        )
    return color.lower()


def require_rgb_color(value: Any, path: str) -> str:
    color = require_color(value, path)
    if color is None or len(color) != 7:
        raise RequestValidationError(f"{path} must be #RRGGBB.")
    return color
