"""Typed request and result contracts for the shared image editor."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from faye_image_common import ImageFormatError, normalize_image_format

from .errors import RequestValidationError
from .validation import (
    MAX_OPERATION_COUNT,
    reject_unknown_fields,
    require_boolean,
    require_color,
    require_dimension,
    require_integer,
    require_mapping,
    require_rgb_color,
    require_string,
)


SCHEMA_VERSION = "1.0"


@dataclass(frozen=True)
class InputSpec:
    """An optional static source image."""

    path: Path


@dataclass(frozen=True)
class CanvasSpec:
    """Canvas settings used when no source image is supplied."""

    width: int = 640
    height: int = 360
    background: str = "#00000000"


@dataclass(frozen=True)
class OutputSpec:
    """Destination and encoding preferences."""

    path: Path | None = None
    format: str | None = None
    background: str = "#ffffff"
    quality: int = 95
    overwrite: bool = False


@dataclass(frozen=True)
class EditorRequest:
    """Validated high-level editor request before operation parsing."""

    input: InputSpec | None
    canvas: CanvasSpec
    operations: tuple[dict[str, Any], ...]
    output: OutputSpec

    @classmethod
    def from_mapping(cls, raw: Any) -> "EditorRequest":
        root = require_mapping(raw, "$")
        reject_unknown_fields(
            root,
            {"schemaVersion", "input", "canvas", "operations", "output"},
            "$",
        )
        if root.get("schemaVersion") != SCHEMA_VERSION:
            raise RequestValidationError(
                f"$.schemaVersion must be {SCHEMA_VERSION!r}."
            )

        input_spec = parse_input(root.get("input"))
        canvas = parse_canvas(root.get("canvas"), has_input=input_spec is not None)
        operations = parse_operation_mappings(root.get("operations", []))
        output = parse_output(root.get("output"))
        return cls(
            input=input_spec,
            canvas=canvas,
            operations=operations,
            output=output,
        )


@dataclass(frozen=True)
class EditorResult:
    """Stable machine-readable result returned by the editor service."""

    input_path: Path | None
    output_path: Path
    source_format: str | None
    output_format: str
    width: int
    height: int
    operation_types: tuple[str, ...]

    def to_mapping(self) -> dict[str, Any]:
        return {
            "schemaVersion": SCHEMA_VERSION,
            "status": "ok",
            "input": str(self.input_path.resolve()) if self.input_path else None,
            "output": str(self.output_path.resolve()),
            "sourceFormat": self.source_format,
            "outputFormat": self.output_format,
            "width": self.width,
            "height": self.height,
            "operationsApplied": list(self.operation_types),
        }


def parse_input(raw: Any) -> InputSpec | None:
    if raw is None:
        return None
    value = require_mapping(raw, "$.input")
    reject_unknown_fields(value, {"path"}, "$.input")
    return InputSpec(path=Path(require_string(value.get("path"), "$.input.path")))


def parse_canvas(raw: Any, *, has_input: bool) -> CanvasSpec:
    if raw is None:
        return CanvasSpec()
    value = require_mapping(raw, "$.canvas")
    reject_unknown_fields(value, {"width", "height", "background"}, "$.canvas")
    if has_input and value:
        raise RequestValidationError(
            "$.canvas is only valid when no input image is supplied; use editor operations instead."
        )
    return CanvasSpec(
        width=require_dimension(value.get("width", 640), "$.canvas.width"),
        height=require_dimension(value.get("height", 360), "$.canvas.height"),
        background=require_color(
            value.get("background", "#00000000"),
            "$.canvas.background",
        )
        or "#00000000",
    )


def parse_operation_mappings(raw: Any) -> tuple[dict[str, Any], ...]:
    if not isinstance(raw, list):
        raise RequestValidationError("$.operations must be an array.")
    if len(raw) > MAX_OPERATION_COUNT:
        raise RequestValidationError(
            f"$.operations must contain at most {MAX_OPERATION_COUNT} items."
        )
    operations: list[dict[str, Any]] = []
    for index, operation in enumerate(raw):
        mapping = require_mapping(operation, f"$.operations[{index}]")
        operations.append(dict(mapping))
    return tuple(operations)


def parse_output(raw: Any) -> OutputSpec:
    if raw is None:
        return OutputSpec()
    value = require_mapping(raw, "$.output")
    reject_unknown_fields(
        value,
        {"path", "format", "background", "quality", "overwrite"},
        "$.output",
    )
    output_format = value.get("format")
    if output_format is not None:
        try:
            output_format = normalize_image_format(
                require_string(output_format, "$.output.format")
            )
        except ImageFormatError as exc:
            raise RequestValidationError(str(exc)) from exc

    quality = require_integer(value.get("quality", 95), "$.output.quality")
    if not 1 <= quality <= 100:
        raise RequestValidationError("$.output.quality must be from 1 to 100.")
    path_value = value.get("path")
    output_path = None
    if path_value is not None:
        output_path = Path(require_string(path_value, "$.output.path"))
    overwrite = require_boolean(value.get("overwrite", False), "$.output.overwrite")
    if overwrite and output_path is None:
        raise RequestValidationError(
            "$.output.overwrite is allowed only when $.output.path is provided."
        )

    return OutputSpec(
        path=output_path,
        format=output_format,
        background=require_rgb_color(
            value.get("background", "#ffffff"),
            "$.output.background",
        ),
        quality=quality,
        overwrite=overwrite,
    )
