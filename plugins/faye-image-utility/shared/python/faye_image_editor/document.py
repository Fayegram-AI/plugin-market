"""Stateful in-memory image document built on reusable editor operations."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from PIL import ImageColor

from faye_image_common import (
    MAX_IMAGE_INPUT_BYTES,
    Image,
    ImageDecodeError,
    ImageEncodingMetadata,
    ImageFormatError,
    UnsupportedImageError,
    load_image_path,
    pillow_format_to_logical,
)

from .errors import EditorInputError
from .models import CanvasSpec, InputSpec
from .operations import ValidatedOperation, apply_operations, validate_operations
from .validation import MAX_DIMENSION, require_color, require_dimension


class ImageEditor:
    """An editable RGBA document that can be reused without the CLI adapter."""

    def __init__(
        self,
        image: Image.Image,
        *,
        input_path: Path | None = None,
        source_format: str | None = None,
        encoding_metadata: ImageEncodingMetadata | None = None,
    ) -> None:
        if image.width > MAX_DIMENSION or image.height > MAX_DIMENSION:
            raise EditorInputError(
                f"Image dimensions must not exceed {MAX_DIMENSION} pixels per edge."
            )
        self._image = image.convert("RGBA")
        self.input_path = input_path
        self.source_format = source_format
        self.encoding_metadata = encoding_metadata or ImageEncodingMetadata()

    @classmethod
    def create(cls, canvas: CanvasSpec) -> "ImageEditor":
        width = require_dimension(canvas.width, "canvas.width")
        height = require_dimension(canvas.height, "canvas.height")
        background = require_color(canvas.background, "canvas.background")
        image = Image.new(
            "RGBA",
            (width, height),
            ImageColor.getcolor(background, "RGBA"),
        )
        return cls(image)

    @classmethod
    def open(cls, input_spec: InputSpec) -> "ImageEditor":
        try:
            decoded = load_image_path(
                input_spec.path,
                reject_multiframe=True,
                max_edge=MAX_DIMENSION,
                max_bytes=MAX_IMAGE_INPUT_BYTES,
            )
            source_format = pillow_format_to_logical(decoded.format)
        except (OSError, ImageDecodeError, UnsupportedImageError, ImageFormatError) as exc:
            raise EditorInputError(f"Unable to load input image: {exc}") from exc
        return cls(
            decoded.image,
            input_path=input_spec.path,
            source_format=source_format,
            encoding_metadata=decoded.encoding_metadata,
        )

    @property
    def image(self) -> Image.Image:
        """Return a copy so direct consumers cannot mutate document state accidentally."""

        return self._image.copy()

    @property
    def size(self) -> tuple[int, int]:
        return self._image.size

    def apply(self, operations: tuple[ValidatedOperation, ...]) -> "ImageEditor":
        """Apply prevalidated operations in order and return this document."""

        self._image = apply_operations(self._image, operations)
        return self

    def apply_mappings(self, operations: list[dict[str, Any]]) -> "ImageEditor":
        """Validate and apply mapping-based operations for direct script consumers."""

        return self.apply(validate_operations(operations))

    def render_image(self) -> Image.Image:
        """Return the final RGBA image for a caller-owned output pipeline."""

        return self._image.copy()
