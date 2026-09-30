#!/usr/bin/env python3
"""Convert images among JPG, PNG, WebP, and base64."""

from __future__ import annotations

import argparse
import base64
import binascii
import re
import sys
sys.dont_write_bytecode = True
from pathlib import Path

PLUGIN_ROOT = Path(__file__).resolve().parents[3]
SHARED_PYTHON = PLUGIN_ROOT / "shared" / "python"
if str(SHARED_PYTHON) not in sys.path:
    sys.path.insert(0, str(SHARED_PYTHON))

from faye_workspace import WorkspaceError, workspace_from_environment

from faye_image_common import (  # noqa: E402 - local runtime bootstrap.
    EXTENSION_BY_FORMAT,
    FORMAT_BY_EXTENSION,
    FORMAT_BY_MIME,
    MIME_BY_FORMAT,
    SUPPORTED_IMAGE_FORMATS,
    Image,
    ImageDecodeError,
    ImageEncodingMetadata,
    ImageFormatError,
    InputLimitError,
    InputReadError,
    MAX_DECODED_IMAGE_EDGE,
    MAX_DECODED_IMAGE_PIXELS,
    MAX_IMAGE_INPUT_BYTES,
    OutputCollisionError,
    OutputWriteError,
    OutputWriteMode,
    UnsupportedImageError,
    decode_image_bytes,
    encode_image_bytes,
    format_byte_limit,
    parse_rgb_color,
    pillow_format_to_logical,
    read_limited_path,
    read_limited_stream,
    write_output_bytes,
)


SUPPORTED_LOGICAL_FORMATS = SUPPORTED_IMAGE_FORMATS | {"base64"}
LOGICAL_EXTENSION_BY_FORMAT = {
    **EXTENSION_BY_FORMAT,
    "base64": ".txt",
}
DEFAULT_OUTPUT_DIR = Path("artifacts") / "faye-image-utility" / "format-converter"
LOGICAL_FORMAT_BY_EXTENSION = {
    **FORMAT_BY_EXTENSION,
    ".txt": "base64",
    ".b64": "base64",
}
DATA_URL_RE = re.compile(
    r"^\s*data:(image/(?:jpeg|jpg|png|webp));base64,(?P<payload>.*)\s*$",
    re.IGNORECASE | re.DOTALL,
)


class ConversionError(Exception):
    """User-facing conversion failure."""


class ConversionArgumentParser(argparse.ArgumentParser):
    """Normalize command-line mistakes into the converter error contract."""

    def error(self, message: str) -> None:
        raise ConversionError(message)


def parse_args() -> argparse.Namespace:
    parser = ConversionArgumentParser(
        description="Convert images among jpg, png, webp, and base64."
    )
    parser.add_argument("--input", required=True, help="Input path, '-' for stdin, or base64 text.")
    parser.add_argument("--to", required=True, choices=sorted(SUPPORTED_LOGICAL_FORMATS))
    parser.add_argument(
        "--from",
        dest="from_format",
        default="auto",
        choices=["auto", *sorted(SUPPORTED_LOGICAL_FORMATS)],
        help="Input format hint.",
    )
    parser.add_argument(
        "--output",
        help=(
            "Output path. If omitted, writes under "
            ".faye/artifacts/faye-image-utility/format-converter/ with auto-suffixing."
        ),
    )
    parser.add_argument(
        "--background",
        default="#ffffff",
        help="JPEG flatten background as #RRGGBB. Defaults to white.",
    )
    parser.add_argument(
        "--base64-format",
        choices=sorted(SUPPORTED_IMAGE_FORMATS),
        help="Image container to encode when --to base64.",
    )
    parser.add_argument(
        "--raw-base64",
        action="store_true",
        help="Write raw base64 instead of a data URL when --to base64.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite an existing explicit --output file.",
    )
    return parser.parse_args()


def validate_args(args: argparse.Namespace) -> None:
    """Reject options whose requested effect cannot apply to this conversion."""

    if args.force and args.output is None:
        raise ConversionError("--force requires an explicit --output path.")
    if args.base64_format is not None and args.to != "base64":
        raise ConversionError("--base64-format is allowed only when --to is base64.")
    if args.raw_base64 and args.to != "base64":
        raise ConversionError("--raw-base64 is allowed only when --to is base64.")


def normalize_detected_format(pillow_format: str | None) -> str:
    try:
        return pillow_format_to_logical(pillow_format)
    except ImageFormatError as exc:
        raise ConversionError(
            f"Unsupported source image format {pillow_format!r}. Supported formats: jpg, png, webp, base64."
        ) from exc


def parse_background(value: str) -> tuple[int, int, int]:
    try:
        return parse_rgb_color(value)
    except ImageFormatError as exc:
        raise ConversionError(str(exc)) from exc


def strip_base64_text(text: str) -> tuple[str, str | None]:
    match = DATA_URL_RE.match(text)
    if match:
        mime = match.group(1).lower()
        return match.group("payload"), FORMAT_BY_MIME[mime]
    return "".join(text.split()), None


def decode_base64_text(
    text: str,
    *,
    max_bytes: int = MAX_IMAGE_INPUT_BYTES,
) -> tuple[bytes, str | None]:
    if len(text.encode("utf-8")) > max_bytes:
        raise ConversionError(
            f"Base64 input exceeds the maximum size of {format_byte_limit(max_bytes)}."
        )
    payload, declared_format = strip_base64_text(text)
    try:
        return base64.b64decode(payload, validate=True), declared_format
    except (binascii.Error, ValueError) as exc:
        raise ConversionError("Invalid base64 input.") from exc


def looks_like_base64_text(data: bytes) -> bool:
    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError:
        return False
    payload, _ = strip_base64_text(text)
    return bool(payload) and re.fullmatch(r"[A-Za-z0-9+/=]+", payload) is not None


def decode_base64_bytes(
    data: bytes,
    *,
    max_bytes: int = MAX_IMAGE_INPUT_BYTES,
) -> tuple[bytes, str | None]:
    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise ConversionError("Base64 input must be UTF-8 text.") from exc
    return decode_base64_text(text, max_bytes=max_bytes)


def read_input(
    input_value: str,
    from_format: str,
    *,
    max_bytes: int = MAX_IMAGE_INPUT_BYTES,
) -> tuple[bytes, str | None, Path | None]:
    if input_value == "-":
        try:
            raw = read_limited_stream(
                sys.stdin.buffer,
                max_bytes=max_bytes,
                description="Image input from stdin",
            )
        except InputReadError as exc:
            raise ConversionError(str(exc)) from exc
        if from_format == "base64":
            decoded, declared = decode_base64_bytes(raw, max_bytes=max_bytes)
            return decoded, declared or "base64", None
        if from_format == "auto" and looks_like_base64_text(raw):
            decoded, declared = decode_base64_bytes(raw, max_bytes=max_bytes)
            if has_supported_image_signature(decoded):
                return decoded, declared or "base64", None
        return raw, None, None

    path = Path(input_value)
    try:
        path_exists = path.exists()
        if path_exists and not path.is_file():
            raise ConversionError(f"Input path is not a regular file: {path}.")
        if path_exists:
            raw = read_limited_path(
                path,
                max_bytes=max_bytes,
                description="Input file",
            )
        else:
            raw = None
    except ConversionError:
        raise
    except InputLimitError as exc:
        raise ConversionError(str(exc)) from exc
    except (OSError, InputReadError) as exc:
        raise ConversionError(f"Unable to read input file: {path}.") from exc

    if raw is not None:
        suffix_format = LOGICAL_FORMAT_BY_EXTENSION.get(path.suffix.lower())
        if from_format == "base64" or (from_format == "auto" and suffix_format == "base64"):
            decoded, declared = decode_base64_bytes(raw, max_bytes=max_bytes)
            return decoded, declared or "base64", path
        return raw, suffix_format if from_format == "auto" else from_format, path

    if from_format == "base64" or DATA_URL_RE.match(input_value):
        decoded, declared = decode_base64_text(input_value, max_bytes=max_bytes)
        return decoded, declared or "base64", None
    if from_format == "auto":
        if len(input_value.encode("utf-8")) > max_bytes:
            raise ConversionError(
                f"Base64 input exceeds the maximum size of {format_byte_limit(max_bytes)}."
            )
        try:
            decoded, declared = decode_base64_text(input_value, max_bytes=max_bytes)
        except ConversionError:
            pass
        else:
            if has_supported_image_signature(decoded):
                return decoded, declared or "base64", None

    raise ConversionError(f"Input file does not exist: {input_value}")


def has_supported_image_signature(raw: bytes) -> bool:
    """Recognize supported containers before accepting ambiguous inline text."""

    return (
        raw.startswith(b"\x89PNG\r\n\x1a\n")
        or raw.startswith(b"\xff\xd8\xff")
        or (len(raw) >= 12 and raw[:4] == b"RIFF" and raw[8:12] == b"WEBP")
    )


def open_static_image(
    raw: bytes,
    *,
    max_edge: int = MAX_DECODED_IMAGE_EDGE,
    max_pixels: int = MAX_DECODED_IMAGE_PIXELS,
) -> tuple[Image.Image, str, ImageEncodingMetadata]:
    try:
        decoded = decode_image_bytes(
            raw,
            reject_multiframe=True,
            max_edge=max_edge,
            max_pixels=max_pixels,
        )
    except (ImageDecodeError, UnsupportedImageError) as exc:
        raise ConversionError(str(exc)) from exc
    source_format = normalize_detected_format(decoded.format)
    return decoded.image, source_format, decoded.encoding_metadata


def default_output_path(input_path: Path | None, target_format: str) -> Path:
    suffix = LOGICAL_EXTENSION_BY_FORMAT[target_format]
    workspace = workspace_from_environment().initialize()
    output_dir = workspace.checked(workspace.base / DEFAULT_OUTPUT_DIR)
    if input_path is not None:
        return output_dir / f"{input_path.stem}{suffix}"
    return output_dir / f"converted{suffix}"


def resolve_output_path(
    output: str | None,
    input_path: Path | None,
    target_format: str,
    force: bool,
) -> tuple[Path, OutputWriteMode]:
    if output is not None:
        path = Path(output)
        accepted_extensions = sorted(
            extension
            for extension, logical_format in LOGICAL_FORMAT_BY_EXTENSION.items()
            if logical_format == target_format
        )
        if path.suffix.lower() not in accepted_extensions:
            choices = ", ".join(accepted_extensions)
            raise ConversionError(
                f"Output path for {target_format} must end with one of: {choices}."
            )
        mode = OutputWriteMode.OVERWRITE if force else OutputWriteMode.EXCLUSIVE
    else:
        path = default_output_path(input_path, target_format)
        mode = OutputWriteMode.AUTO_SUFFIX
    return path, mode


def encode_output(
    image: Image.Image,
    source_format: str,
    target_format: str,
    background: tuple[int, int, int],
    base64_format: str | None,
    raw_base64: bool,
    metadata: ImageEncodingMetadata,
) -> tuple[bytes, str, str]:
    if target_format == "base64":
        container_format = base64_format or source_format
        if container_format not in SUPPORTED_IMAGE_FORMATS:
            raise ConversionError("Base64 output container must be jpg, png, or webp.")
        try:
            image_bytes = encode_image_bytes(
                image,
                container_format,
                background=background,
                metadata=metadata,
            )
        except (ImageFormatError, OSError, OverflowError, ValueError) as exc:
            raise ConversionError(f"Unable to encode output image: {exc}") from exc
        payload = base64.b64encode(image_bytes).decode("ascii")
        if raw_base64:
            text = payload
        else:
            text = f"data:{MIME_BY_FORMAT[container_format]};base64,{payload}"
        return text.encode("utf-8"), "base64", container_format

    try:
        image_bytes = encode_image_bytes(
            image,
            target_format,
            background=background,
            metadata=metadata,
        )
    except (ImageFormatError, OSError, OverflowError, ValueError) as exc:
        raise ConversionError(f"Unable to encode output image: {exc}") from exc
    return image_bytes, target_format, target_format


def commit_output(
    path: Path,
    payload: bytes,
    mode: OutputWriteMode,
) -> Path:
    """Commit encoded output and translate shared filesystem failures."""

    try:
        return write_output_bytes(path, payload, mode)
    except OutputCollisionError as exc:
        raise ConversionError(
            f"Output file already exists: {exc.path}. Use --force to overwrite it."
        ) from exc
    except OutputWriteError as exc:
        raise ConversionError(str(exc)) from exc


def run() -> int:
    args = parse_args()
    validate_args(args)
    background = parse_background(args.background)
    raw, format_hint, input_path = read_input(args.input, args.from_format)
    image, detected_format, metadata = open_static_image(raw)
    source_format = detected_format
    if args.from_format not in ("auto", "base64") and args.from_format != detected_format:
        raise ConversionError(
            f"Input was declared as {args.from_format}, but decoded as {detected_format}."
        )
    if format_hint in SUPPORTED_IMAGE_FORMATS and format_hint != detected_format:
        # Extension or data URL metadata can be wrong; decoded bytes are authoritative.
        source_format = detected_format

    output_path, output_mode = resolve_output_path(
        args.output,
        input_path,
        args.to,
        args.force,
    )
    payload, logical_target, container_format = encode_output(
        image=image,
        source_format=source_format,
        target_format=args.to,
        background=background,
        base64_format=args.base64_format,
        raw_base64=args.raw_base64,
        metadata=metadata,
    )
    output_path = commit_output(output_path, payload, output_mode)

    try:
        is_valid_output = output_path.is_file() and output_path.stat().st_size > 0
    except OSError as exc:
        raise ConversionError(f"Unable to inspect output file: {output_path}.") from exc
    if not is_valid_output:
        raise ConversionError(f"Conversion did not produce a non-empty output file: {output_path}")

    print(f"Converted: {source_format} -> {logical_target}")
    if logical_target == "base64":
        print(f"Base64 image container: {container_format}")
    print(f"Output: {output_path.resolve()}")
    return 0


def main() -> int:
    try:
        return run()
    except (ConversionError, WorkspaceError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 2
    except OSError:
        print("Error: Unable to complete conversion filesystem operation.", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
