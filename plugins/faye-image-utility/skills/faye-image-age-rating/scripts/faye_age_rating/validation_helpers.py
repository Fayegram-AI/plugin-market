"""Shared, side-effect-free validation primitives."""

from __future__ import annotations

import json
from typing import Any, Iterable


MISSING = object()

# Stable union of ECMAScript/JSON Schema whitespace and Python's additional
# stripping controls. Keep this set synchronized with the schema patterns.
CONTRACT_BLANK_CODE_POINTS = frozenset({
    *range(0x0009, 0x000E),
    *range(0x001C, 0x0021),
    0x0085,
    0x00A0,
    0x1680,
    *range(0x2000, 0x200B),
    0x2028,
    0x2029,
    0x202F,
    0x205F,
    0x3000,
    0xFEFF,
})

# Explicit line boundaries for render-only single-line text. This mirrors
# Python's documented split-line boundaries without depending on runtime
# trimming or platform newline behavior.
CONTRACT_LINE_BREAK_CODE_POINTS = frozenset({
    *range(0x000A, 0x000E),
    *range(0x001C, 0x001F),
    0x0085,
    0x2028,
    0x2029,
})


def json_literal(value: Any) -> str:
    """Render a compact JSON literal in public validation messages."""

    if value is MISSING:
        return "undefined"
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def validate_exact_string_list(
    value: Any,
    expected: list[str],
    path: str,
    errors: list[str],
) -> None:
    if not isinstance(value, list):
        errors.append(f"{path} must be an array.")
        return
    if value != expected:
        errors.append(f"{path} must equal {json_literal(expected)}.")


def validate_unique_enum_list(
    value: Any,
    allowed: Iterable[str],
    path: str,
    errors: list[str],
) -> None:
    if not isinstance(value, list):
        errors.append(f"{path} must be an array.")
        return
    seen: list[Any] = []
    for index, item in enumerate(value):
        expect_enum(item, allowed, f"{path}[{index}]", errors)
        if item in seen:
            errors.append(f"{path}[{index}] must be unique.")
        seen.append(item)


def validate_string_list(value: Any, path: str, errors: list[str]) -> None:
    if not isinstance(value, list):
        errors.append(f"{path} must be an array.")
        return
    seen: list[Any] = []
    for index, item in enumerate(value):
        expect_non_empty_string(item, f"{path}[{index}]", errors)
        if item in seen:
            errors.append(f"{path}[{index}] must be unique.")
        seen.append(item)


def reject_unknown_keys(
    value: dict[str, Any],
    allowed: set[str],
    path: str,
    errors: list[str],
) -> None:
    for key in value:
        if key not in allowed:
            errors.append(f"{path}.{key} is not allowed.")


def expect_equal(actual: Any, expected: Any, path: str, errors: list[str]) -> None:
    if not js_strict_equal(actual, expected):
        errors.append(f"{path} must equal {json_literal(expected)}.")


def expect_enum(value: Any, allowed: Iterable[Any], path: str, errors: list[str]) -> None:
    try:
        supported = value in allowed
    except (TypeError, ValueError):
        supported = False
    if not supported:
        errors.append(f"{path} has unsupported value {json_literal(value)}.")


def expect_non_empty_string(
    value: Any,
    path: str,
    errors: list[str],
    max_length: int | None = None,
) -> None:
    if not isinstance(value, str) or not contains_non_whitespace(value):
        errors.append(
            f"{path} must contain at least one non-whitespace character."
        )
    elif max_length is not None and len(value) > max_length:
        errors.append(f"{path} must contain at most {max_length} characters.")


def contains_non_whitespace(value: str) -> bool:
    """Return whether a string contains a contract-defined text character."""

    return any(
        ord(character) not in CONTRACT_BLANK_CODE_POINTS
        for character in value
    )


def has_surrounding_contract_whitespace(value: str) -> bool:
    """Return whether a non-empty string starts or ends with a contract blank."""

    return bool(value) and (
        ord(value[0]) in CONTRACT_BLANK_CODE_POINTS
        or ord(value[-1]) in CONTRACT_BLANK_CODE_POINTS
    )


def contains_contract_line_break(value: str) -> bool:
    """Return whether a string contains a deterministic text-line boundary."""

    return any(
        ord(character) in CONTRACT_LINE_BREAK_CODE_POINTS
        for character in value
    )


def is_object(value: Any) -> bool:
    return isinstance(value, dict)


def valid(value: Any) -> dict[str, Any]:
    return {"valid": True, "value": value, "errors": []}


def invalid(errors: list[str]) -> dict[str, Any]:
    return {"valid": False, "value": None, "errors": errors}


def js_strict_equal(actual: Any, expected: Any) -> bool:
    """Approximate JavaScript strict equality for JSON-derived values."""

    if isinstance(actual, bool) != isinstance(expected, bool):
        return False
    if isinstance(actual, (dict, list)) or isinstance(expected, (dict, list)):
        return actual is expected
    return type(actual) is type(expected) and actual == expected
