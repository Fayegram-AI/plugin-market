"""Central operation registry with validation-before-render dispatch."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any

from faye_image_common import Image

from ..errors import EditorError, RequestValidationError
from ..validation import (
    MAX_COMPOSITE_OPERATION_COUNT,
    MAX_OPERATION_COUNT,
    MAX_TOTAL_STROKE_POINTS,
    MAX_TOTAL_TEXT_CHARACTERS,
    require_string,
)
from .compositing import (
    COMPOSITING_TYPES,
    apply_compositing_operation,
    validate_compositing_operation,
)
from .drawing import DRAWING_TYPES, apply_drawing_operation, validate_drawing_operation
from .transforms import (
    TRANSFORM_TYPES,
    apply_transform_operation,
    validate_transform_operation,
)


@dataclass(frozen=True)
class ValidatedOperation:
    """A canonical operation ready for ordered application."""

    type: str
    values: Mapping[str, Any]


def validate_operations(
    operations: Sequence[Mapping[str, Any]],
) -> tuple[ValidatedOperation, ...]:
    if len(operations) > MAX_OPERATION_COUNT:
        raise RequestValidationError(
            f"$.operations must contain at most {MAX_OPERATION_COUNT} items."
        )
    validated: list[ValidatedOperation] = []
    composite_count = 0
    stroke_point_count = 0
    text_character_count = 0
    for index, raw in enumerate(operations):
        path = f"$.operations[{index}]"
        operation_type = require_string(raw.get("type"), f"{path}.type").lower()
        if operation_type in DRAWING_TYPES:
            values = validate_drawing_operation(operation_type, raw, path)
        elif operation_type in TRANSFORM_TYPES:
            values = validate_transform_operation(operation_type, raw, path)
        elif operation_type in COMPOSITING_TYPES:
            values = validate_compositing_operation(operation_type, raw, path)
        else:
            raise RequestValidationError(
                f"Unsupported operation type at {path}.type: {operation_type}."
            )
        if operation_type == "composite":
            composite_count += 1
            if composite_count > MAX_COMPOSITE_OPERATION_COUNT:
                raise RequestValidationError(
                    "$.operations must contain at most "
                    f"{MAX_COMPOSITE_OPERATION_COUNT} composite operations."
                )
        elif operation_type == "stroke":
            stroke_point_count += len(values["points"])
            if stroke_point_count > MAX_TOTAL_STROKE_POINTS:
                raise RequestValidationError(
                    "$.operations stroke data must contain at most "
                    f"{MAX_TOTAL_STROKE_POINTS:,} total points."
                )
        elif operation_type in {"text", "label"}:
            text_character_count += len(values["text"])
            if text_character_count > MAX_TOTAL_TEXT_CHARACTERS:
                raise RequestValidationError(
                    "$.operations text data must contain at most "
                    f"{MAX_TOTAL_TEXT_CHARACTERS:,} total characters."
                )
        validated.append(ValidatedOperation(operation_type, values))
    return tuple(validated)


def apply_operations(
    image: Image.Image,
    operations: Sequence[ValidatedOperation],
) -> Image.Image:
    current = image.convert("RGBA")
    for index, operation in enumerate(operations):
        try:
            if operation.type in DRAWING_TYPES:
                current = apply_drawing_operation(current, operation.type, operation.values)
            elif operation.type in TRANSFORM_TYPES:
                current = apply_transform_operation(current, operation.type, operation.values)
            elif operation.type in COMPOSITING_TYPES:
                current = apply_compositing_operation(current, operation.type, operation.values)
            else:  # pragma: no cover - validated operations cannot reach this state.
                raise RequestValidationError(
                    f"Unsupported operation type: {operation.type}."
                )
        except EditorError:
            raise
        except (OSError, OverflowError, TypeError, ValueError) as exc:
            raise RequestValidationError(
                f"Unable to apply $.operations[{index}] ({operation.type}) safely."
            ) from exc
    return current
