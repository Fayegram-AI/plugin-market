#!/usr/bin/env python3
"""Compute deterministic technical preflight data for local rating images."""

from __future__ import annotations

import json
import sys
sys.dont_write_bytecode = True
from pathlib import Path
from typing import Any


PLUGIN_ROOT = Path(__file__).resolve().parents[3]
SHARED_PYTHON = PLUGIN_ROOT / "shared" / "python"
SCRIPT_DIRECTORY = Path(__file__).resolve().parent
for import_path in (SHARED_PYTHON, SCRIPT_DIRECTORY):
    if str(import_path) not in sys.path:
        sys.path.insert(0, str(import_path))

from faye_image_common import (  # noqa: E402
    MAX_DECODED_IMAGE_EDGE,
    MAX_DECODED_IMAGE_PIXELS,
    MAX_IMAGE_INPUT_BYTES,
    MAX_JSON_INPUT_BYTES,
    ImageDecodeError,
    InputReadError,
    JsonInputError,
    decode_image_bytes,
    decode_utf8,
    parse_json_text,
    read_limited_path,
    read_limited_stream,
)
from faye_age_rating.image_metrics import analyze_image_bytes  # noqa: E402
from faye_age_rating.validation_helpers import (  # noqa: E402
    expect_non_empty_string,
)


USAGE = "Usage: <runtime-launcher> preflight_age_rating_images.py < preflight-input.json"


def validate_input(input_value: Any) -> tuple[list[dict[str, str]] | None, list[str]]:
    errors: list[str] = []
    if not isinstance(input_value, dict):
        return None, ["$ must be an object."]
    for key in input_value:
        if key != "images":
            errors.append(f"$.{key} is not allowed.")
    images = input_value.get("images")
    if not isinstance(images, list) or len(images) == 0:
        errors.append("$.images must be a non-empty array.")
        return None, errors
    if len(images) > 25:
        errors.append("$.images must contain at most 25 items.")

    labels: set[str] = set()
    for index, item in enumerate(images):
        path = f"$.images[{index}]"
        if not isinstance(item, dict):
            errors.append(f"{path} must be an object.")
            continue
        for key in item:
            if key not in {"label", "source"}:
                errors.append(f"{path}.{key} is not allowed.")
        label = item.get("label")
        source = item.get("source")
        error_count = len(errors)
        expect_non_empty_string(label, f"{path}.label", errors, 120)
        if len(errors) == error_count and isinstance(label, str):
            if label in labels:
                errors.append(f"{path}.label must be unique.")
            else:
                labels.add(label)
        expect_non_empty_string(source, f"{path}.source", errors)
    return (images if not errors else None), errors


def preflight_images(
    images: list[dict[str, str]],
    *,
    max_image_bytes: int = MAX_IMAGE_INPUT_BYTES,
    max_edge: int = MAX_DECODED_IMAGE_EDGE,
    max_pixels: int = MAX_DECODED_IMAGE_PIXELS,
) -> dict[str, Any]:
    results: list[dict[str, Any]] = []
    first_label_by_digest: dict[str, str] = {}
    for item in images:
        label = item["label"]
        path = Path(item["source"])
        if looks_nonlocal(item["source"]):
            results.append({
                "label": label,
                "status": "unavailable",
                "message": "Image source is not a readable local file.",
            })
            continue
        try:
            raw = read_limited_path(
                path,
                max_bytes=max_image_bytes,
                description="Image input",
            )
            decoded = decode_image_bytes(
                raw,
                max_edge=max_edge,
                max_pixels=max_pixels,
            )
            metrics = analyze_image_bytes(raw, decoded)
        except (OSError, ImageDecodeError, InputReadError) as exc:
            results.append({
                "label": label,
                "status": "unavailable",
                "message": str(exc),
            })
            continue

        digest = metrics["sha256"]
        duplicate_of = first_label_by_digest.get(digest)
        if duplicate_of is None:
            first_label_by_digest[digest] = label
        results.append({
            "label": label,
            "status": "available",
            **metrics,
            "exactDuplicateOf": duplicate_of,
        })
    return {"images": results}


def looks_nonlocal(source: str) -> bool:
    lowered = source.strip().lower()
    return lowered.startswith("data:") or "://" in lowered


def emit_failure(errors: list[str]) -> int:
    json.dump(
        {"valid": False, "errors": errors},
        sys.stderr,
        ensure_ascii=True,
        indent=4,
    )
    sys.stderr.write("\n")
    return 1


def parse_standard_input(*, max_bytes: int = MAX_JSON_INPUT_BYTES) -> tuple[Any, list[str] | None]:
    """Read and parse one bounded preflight request from stdin."""

    try:
        source = decode_utf8(
            read_limited_stream(
                sys.stdin.buffer,
                max_bytes=max_bytes,
                description="Age-rating preflight input from stdin",
            ),
            description="Age-rating preflight input",
        )
    except InputReadError as exc:
        return None, [str(exc)]
    if not source.strip():
        return None, ["Expected a JSON object on stdin."]
    try:
        return parse_json_text(source), None
    except JsonInputError as exc:
        return None, [str(exc)]


def main() -> int:
    if len(sys.argv) == 2 and sys.argv[1] in {"--help", "-h"}:
        print(USAGE)
        return 0
    if len(sys.argv) != 1:
        print(USAGE, file=sys.stderr)
        return 2
    input_value, parse_errors = parse_standard_input()
    if parse_errors is not None:
        return emit_failure(parse_errors)
    images, errors = validate_input(input_value)
    if errors:
        return emit_failure(errors)
    json.dump(preflight_images(images), sys.stdout, ensure_ascii=True, indent=4)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
