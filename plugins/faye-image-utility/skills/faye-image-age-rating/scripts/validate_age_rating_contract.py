#!/usr/bin/env python3
"""Normalize, resolve, validate, or render an age-rating response from stdin."""

from __future__ import annotations

import json
import sys
sys.dont_write_bytecode = True
from pathlib import Path
from typing import Any, Callable


PLUGIN_ROOT = Path(__file__).resolve().parents[3]
SHARED_PYTHON = PLUGIN_ROOT / "shared" / "python"
SCRIPT_DIRECTORY = Path(__file__).resolve().parent
for import_path in (SHARED_PYTHON, SCRIPT_DIRECTORY):
    if str(import_path) not in sys.path:
        sys.path.insert(0, str(import_path))

from faye_image_common import (  # noqa: E402 - local runtime bootstrap.
    MAX_JSON_INPUT_BYTES,
    InputReadError,
    JsonInputError,
    decode_utf8,
    parse_json_text,
    read_limited_stream,
)

from faye_age_rating import (  # noqa: E402 - local runtime bootstrap.
    normalize_age_rating_request,
    render_age_rating_response,
    resolve_age_rating_systems,
    validate_age_rating_result,
)


USAGE = """Usage:
  <runtime-launcher> validate_age_rating_contract.py request < request.json
  <runtime-launcher> validate_age_rating_contract.py resolve < resolution-input.json
  <runtime-launcher> validate_age_rating_contract.py result < result-envelope.json
  <runtime-launcher> validate_age_rating_contract.py render < render-envelope.json"""
HANDLERS: dict[str, Callable[[Any], dict[str, Any]]] = {
    "request": normalize_age_rating_request,
    "resolve": resolve_age_rating_systems,
    "result": validate_age_rating_result,
    "render": render_age_rating_response,
}


def emit_failure(errors: list[str]) -> int:
    json.dump(
        {"valid": False, "errors": errors},
        sys.stderr,
        ensure_ascii=True,
        indent=4,
    )
    sys.stderr.write("\n")
    return 1


def parse_standard_input(
    *,
    max_bytes: int = MAX_JSON_INPUT_BYTES,
) -> tuple[Any, list[str] | None]:
    try:
        source = decode_utf8(
            read_limited_stream(
                sys.stdin.buffer,
                max_bytes=max_bytes,
                description="Age-rating contract input from stdin",
            ),
            description="Age-rating contract input",
        )
    except InputReadError as exc:
        return None, [str(exc)]
    if len(source.strip()) == 0:
        return None, ["Expected a JSON object on stdin."]
    try:
        return parse_json_text(source), None
    except JsonInputError as exc:
        return None, [str(exc)]


def main() -> int:
    if len(sys.argv) == 2 and sys.argv[1] in {"--help", "-h"}:
        print(USAGE)
        return 0
    if len(sys.argv) != 2 or sys.argv[1] not in HANDLERS:
        print(USAGE, file=sys.stderr)
        return 2

    input_value, parse_errors = parse_standard_input()
    if parse_errors is not None:
        return emit_failure(parse_errors)
    validation = HANDLERS[sys.argv[1]](input_value)
    if not validation["valid"]:
        return emit_failure(validation["errors"])
    if sys.argv[1] == "render":
        sys.stdout.write(validation["value"])
    else:
        json.dump(validation["value"], sys.stdout, ensure_ascii=True, indent=4)
        sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
