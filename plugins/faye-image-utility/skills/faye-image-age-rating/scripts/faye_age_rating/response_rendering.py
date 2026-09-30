"""Deterministically render a correlated public age-rating response."""

from __future__ import annotations

import json
from typing import Any

from .result_contract import validate_age_rating_result
from .validation_helpers import (
    MISSING,
    contains_contract_line_break,
    contains_non_whitespace,
    has_surrounding_contract_whitespace,
    invalid,
    is_object,
    reject_unknown_keys,
    valid,
)


RENDER_KEYS = {"request", "result", "trailingSummary"}


def render_age_rating_response(input_value: Any) -> dict[str, Any]:
    errors: list[str] = []
    if not is_object(input_value):
        return invalid(["$ must be an object."])
    reject_unknown_keys(input_value, RENDER_KEYS, "$", errors)

    result_validation = validate_age_rating_result({
        "request": input_value.get("request", MISSING),
        "result": input_value.get("result", MISSING),
    })
    if not result_validation["valid"]:
        errors.extend(result_validation["errors"])
    result = result_validation["value"]
    if result is not None:
        validate_trailing_summary(
            result["outputMode"],
            input_value.get("trailingSummary", MISSING),
            "trailingSummary" in input_value,
            errors,
        )
    if errors:
        return invalid(errors)

    response = json.dumps(result, ensure_ascii=False, indent=4) + "\n"
    if result["outputMode"] == "json_then_summary":
        response += f"\n{input_value['trailingSummary']}\n"
    return valid(response)


def validate_trailing_summary(
    output_mode: str,
    summary: Any,
    supplied: bool,
    errors: list[str],
) -> None:
    if output_mode != "json_then_summary":
        if supplied and summary is not None:
            errors.append(
                "$.trailingSummary is allowed only for json_then_summary output."
            )
        return
    if not isinstance(summary, str) or not contains_non_whitespace(summary):
        errors.append(
            "$.trailingSummary must contain at least one non-whitespace "
            "character for json_then_summary output."
        )
        return
    if has_surrounding_contract_whitespace(summary):
        errors.append("$.trailingSummary must not have surrounding whitespace.")
    if contains_contract_line_break(summary):
        errors.append("$.trailingSummary must contain exactly one text line.")
