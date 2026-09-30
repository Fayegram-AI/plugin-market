"""Bounded input readers and resource ceilings for image utilities."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, BinaryIO


MEBIBYTE = 1024 * 1024
MAX_IMAGE_INPUT_BYTES = 256 * MEBIBYTE
MAX_JSON_INPUT_BYTES = 8 * MEBIBYTE
MAX_DECODED_IMAGE_PIXELS = 128_000_000
MAX_DECODED_IMAGE_EDGE = 32_768
MAX_FONT_INPUT_BYTES = 32 * MEBIBYTE


class InputReadError(Exception):
    """A bounded input source could not be read or decoded as requested."""


class InputLimitError(InputReadError):
    """An input exceeded a declared byte ceiling."""

    def __init__(self, description: str, max_bytes: int) -> None:
        self.description = description
        self.max_bytes = max_bytes
        super().__init__(
            f"{description} exceeds the maximum size of {format_byte_limit(max_bytes)}."
        )


class JsonInputError(InputReadError):
    """A textual input could not be parsed as bounded standard JSON."""


def format_byte_limit(value: int) -> str:
    """Render configured byte limits in stable user-facing units."""

    if value % MEBIBYTE == 0:
        return f"{value // MEBIBYTE} MiB"
    return f"{value} bytes"


def read_limited_stream(
    stream: BinaryIO,
    *,
    max_bytes: int,
    description: str,
) -> bytes:
    """Read at most one byte beyond a ceiling so oversized streams are rejected."""

    payload = bytearray()
    try:
        while len(payload) <= max_bytes:
            chunk = stream.read(min(MEBIBYTE, max_bytes + 1 - len(payload)))
            if not chunk:
                break
            payload.extend(chunk)
    except OSError as exc:
        raise InputReadError(f"Unable to read {description}.") from exc
    if len(payload) > max_bytes:
        raise InputLimitError(description, max_bytes)
    return bytes(payload)


def read_limited_path(
    path: Path,
    *,
    max_bytes: int,
    description: str,
) -> bytes:
    """Read a regular file without trusting a racy size-only preflight check."""

    try:
        if not path.is_file():
            raise InputReadError(f"{description} is not a regular file: {path}.")
        with path.open("rb") as stream:
            return read_limited_stream(
                stream,
                max_bytes=max_bytes,
                description=f"{description}: {path}",
            )
    except InputReadError:
        raise
    except OSError as exc:
        raise InputReadError(f"Unable to read {description}: {path}.") from exc


def decode_utf8(payload: bytes, *, description: str) -> str:
    """Decode bounded textual input without accepting platform-default encodings."""

    try:
        return payload.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise InputReadError(f"{description} must be UTF-8 text.") from exc


def parse_json_text(source: str) -> Any:
    """Parse standard JSON while normalizing depth and numeric-size failures."""

    try:
        return json.loads(
            source,
            parse_constant=lambda value: _reject_json_constant(value, source),
        )
    except json.JSONDecodeError as exc:
        raise JsonInputError(
            f"Invalid JSON at line {exc.lineno}, column {exc.colno}: {exc.msg}."
        ) from exc
    except RecursionError as exc:
        raise JsonInputError("JSON nesting exceeds the supported depth.") from exc
    except (MemoryError, ValueError) as exc:
        raise JsonInputError("JSON value exceeds the supported size.") from exc


def _reject_json_constant(value: str, source: str) -> None:
    """Reject Python's non-standard NaN and Infinity JSON extensions."""

    raise json.JSONDecodeError(
        f"Invalid constant {value}",
        source,
        source.find(value),
    )
