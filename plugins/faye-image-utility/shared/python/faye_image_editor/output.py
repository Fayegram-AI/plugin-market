"""Editor-specific output resolution and verified atomic file writes."""

from __future__ import annotations

import io
from pathlib import Path
from faye_workspace import workspace_from_environment

from faye_image_common import (
    EXTENSION_BY_FORMAT,
    Image,
    ImageEncodingMetadata,
    ImageFormatError,
    OutputCollisionError,
    OutputWriteError,
    OutputWriteMode,
    encode_image_bytes,
    image_format_from_path,
    parse_rgb_color,
    write_output_bytes,
)

from .errors import EditorOutputError, RequestValidationError
from .models import OutputSpec


DEFAULT_OUTPUT_DIR = Path("artifacts") / "faye-image-utility" / "image-editor"


def resolve_output(
    output: OutputSpec,
    *,
    input_path: Path | None,
    source_format: str | None,
) -> tuple[Path, str]:
    """Resolve destination and format with explicit conflict detection."""

    path_format = image_format_from_path(output.path) if output.path else None
    if output.path and path_format is None:
        raise RequestValidationError(
            "$.output.path must end with .png, .jpg, .jpeg, or .webp."
        )
    if output.format and path_format and output.format != path_format:
        raise RequestValidationError(
            "$.output.format conflicts with the extension of $.output.path."
        )

    target_format = output.format or path_format or source_format or "png"
    if output.path:
        return output.path, target_format

    workspace = workspace_from_environment().initialize()
    output_dir = workspace.checked(workspace.base / DEFAULT_OUTPUT_DIR)
    stem = f"{input_path.stem}-edited" if input_path else "edited"
    path = output_dir / f"{stem}{EXTENSION_BY_FORMAT[target_format]}"
    return path, target_format


def write_editor_output(
    image: Image.Image,
    path: Path,
    target_format: str,
    output: OutputSpec,
    metadata: ImageEncodingMetadata | None = None,
) -> Path:
    """Encode, verify, and commit an editor output without clobbering."""

    try:
        background = parse_rgb_color(output.background)
        payload = encode_image_bytes(
            image,
            target_format,
            background=background,
            quality=output.quality,
            metadata=metadata,
        )
    except (ImageFormatError, OSError, OverflowError, ValueError) as exc:
        raise EditorOutputError(f"Unable to encode output image: {exc}") from exc

    try:
        with Image.open(io.BytesIO(payload)) as verification:
            verification.verify()
    except (OSError, ValueError) as exc:
        raise EditorOutputError("Encoded output failed image verification.") from exc

    if output.path is None:
        mode = OutputWriteMode.AUTO_SUFFIX
    elif output.overwrite:
        mode = OutputWriteMode.OVERWRITE
    else:
        mode = OutputWriteMode.EXCLUSIVE

    try:
        committed_path = write_output_bytes(path, payload, mode)
    except OutputCollisionError as exc:
        raise RequestValidationError(
            "$.output.path already exists; set $.output.overwrite to true "
            "to replace it."
        ) from exc
    except OutputWriteError as exc:
        raise EditorOutputError(str(exc)) from exc

    try:
        is_valid_output = committed_path.is_file() and committed_path.stat().st_size > 0
    except OSError as exc:
        raise EditorOutputError(
            f"Unable to inspect output image: {committed_path}."
        ) from exc
    if not is_valid_output:
        raise EditorOutputError(
            f"Editor did not produce a non-empty output file: {committed_path}"
        )
    return committed_path
