"""Structured JSON command adapter for the internal image editor."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any
from faye_workspace import WorkspaceError

from faye_image_common import (
    MAX_JSON_INPUT_BYTES,
    InputReadError,
    JsonInputError,
    decode_utf8,
    parse_json_text,
    read_limited_path,
    read_limited_stream,
)

from .errors import EditorError, EditorOutputError, RequestValidationError
from .models import SCHEMA_VERSION
from .service import execute_request


class EditorArgumentParser(argparse.ArgumentParser):
    """Normalize command-line mistakes into structured request failures."""

    def error(self, message: str) -> None:
        raise RequestValidationError(message)


def parse_args() -> argparse.Namespace:
    parser = EditorArgumentParser(
        description="Apply a structured edit request to a static image."
    )
    parser.add_argument(
        "--request",
        required=True,
        help="JSON request path, or '-' to read the request from stdin.",
    )
    return parser.parse_args()


def read_request(value: str, *, max_bytes: int = MAX_JSON_INPUT_BYTES) -> Any:
    try:
        payload = (
            read_limited_stream(
                sys.stdin.buffer,
                max_bytes=max_bytes,
                description="Editor request from stdin",
            )
            if value == "-"
            else read_limited_path(
                Path(value),
                max_bytes=max_bytes,
                description="Editor request",
            )
        )
        source = decode_utf8(payload, description="Editor request")
    except (OSError, InputReadError) as exc:
        raise RequestValidationError(
            str(exc) or "Unable to read editor request."
        ) from exc
    if not source.strip():
        raise RequestValidationError("Editor request must not be empty.")
    try:
        return parse_json_text(source)
    except JsonInputError as exc:
        raise RequestValidationError(str(exc)) from exc


def error_mapping(error: EditorError) -> dict[str, Any]:
    return {
        "schemaVersion": SCHEMA_VERSION,
        "status": "error",
        "error": {
            "code": error.code,
            "message": str(error),
        },
    }


def main() -> int:
    try:
        request = read_request(parse_args().request)
        result = execute_request(request)
    except WorkspaceError as exc:
        json.dump(error_mapping(RequestValidationError(str(exc))), sys.stderr, indent=4)
        sys.stderr.write("\n")
        return 2
    except EditorError as exc:
        json.dump(error_mapping(exc), sys.stderr, ensure_ascii=False, indent=4)
        sys.stderr.write("\n")
        return 2
    except (OSError, OverflowError, ValueError):
        error = EditorOutputError("Unable to complete editor filesystem operation.")
        json.dump(error_mapping(error), sys.stderr, ensure_ascii=False, indent=4)
        sys.stderr.write("\n")
        return 2

    json.dump(result.to_mapping(), sys.stdout, ensure_ascii=False, indent=4)
    sys.stdout.write("\n")
    return 0
