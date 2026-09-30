"""Correlated validation of public image age-rating results."""

from __future__ import annotations

from typing import Any

from .catalog import AGE_RATING_CATALOG
from .request_contract import normalize_nested_request, validate_cause_selection
from .result_content import (
    validate_aggregate_status,
    validate_cause_report,
    validate_interactive_risk_report,
    validate_manual_review,
    validate_rating_cause_consistency,
    validate_ratings,
)
from .system_resolution import (
    resolve_image_plan,
    systems_selection_equals,
    validate_medium_against_request,
    validate_medium_result,
    validate_resolved_messages,
    validate_systems_selection,
)
from .validation_helpers import (
    MISSING,
    expect_enum,
    expect_equal,
    expect_non_empty_string,
    invalid,
    is_object,
    reject_unknown_keys,
    valid,
    validate_exact_string_list,
    validate_string_list,
)


OUTPUT_MODES = set(AGE_RATING_CATALOG["requestEnums"]["outputMode"])
RESULT_STATUSES = set(AGE_RATING_CATALOG["resultEnums"]["status"])
RESULT_KEYS = {
    "schemaVersion",
    "catalogVersion",
    "utility",
    "status",
    "systemsSelection",
    "causeSelection",
    "outputMode",
    "results",
    "summary",
    "notice",
}


def validate_age_rating_result(input_value: Any) -> dict[str, Any]:
    errors: list[str] = []
    if not is_object(input_value):
        return invalid(["$ must be an object."])
    reject_unknown_keys(input_value, {"request", "result"}, "$", errors)

    request_validation = normalize_nested_request(input_value.get("request", MISSING), errors)
    request = request_validation["value"]
    value = input_value.get("result", MISSING)
    if not is_object(value):
        errors.append("$.result must be an object.")
        return invalid(errors)

    reject_unknown_keys(value, RESULT_KEYS, "$.result", errors)
    expect_equal(
        value.get("schemaVersion", MISSING),
        AGE_RATING_CATALOG["schemaVersion"],
        "$.result.schemaVersion",
        errors,
    )
    expect_equal(
        value.get("catalogVersion", MISSING),
        AGE_RATING_CATALOG["catalogVersion"],
        "$.result.catalogVersion",
        errors,
    )
    expect_equal(value.get("utility", MISSING), "age_rating", "$.result.utility", errors)
    expect_enum(value.get("status", MISSING), RESULT_STATUSES, "$.result.status", errors)
    systems_selection = value.get("systemsSelection", MISSING)
    validate_systems_selection(
        systems_selection, AGE_RATING_CATALOG, "$.result.systemsSelection", errors
    )
    if request is not None and not systems_selection_equals(
        systems_selection, request["systems"]
    ):
        errors.append(
            "$.result.systemsSelection must equal the normalized request systems selection."
        )
    cause_selection = value.get("causeSelection", MISSING)
    validate_cause_selection(cause_selection, "$.result.causeSelection", errors)
    validate_cause_selection_against_request(cause_selection, request, errors)
    output_mode = value.get("outputMode", MISSING)
    expect_enum(output_mode, OUTPUT_MODES, "$.result.outputMode", errors)
    if request is not None:
        expect_equal(output_mode, request["outputMode"], "$.result.outputMode", errors)
    expect_equal(
        value.get("notice", MISSING),
        AGE_RATING_CATALOG["notice"],
        "$.result.notice",
        errors,
    )
    validate_summary_mode(value, errors, "$.result")

    results = value.get("results", MISSING)
    if not isinstance(results, list) or len(results) == 0:
        errors.append("$.result.results must be a non-empty array.")
    elif len(results) > 25:
        errors.append("$.result.results must contain at most 25 items.")
    else:
        if request is not None and len(results) != len(request["imageInputs"]):
            errors.append("$.result.results must contain one result per request image.")
        for index, result in enumerate(results):
            image_input = (
                request["imageInputs"][index]
                if request is not None and index < len(request["imageInputs"])
                else None
            )
            validate_image_result(
                result,
                f"$.result.results[{index}]",
                image_input,
                request["systems"] if request is not None else systems_selection,
                cause_selection,
                errors,
            )
        validate_aggregate_status(
            value.get("status", MISSING), results, "$.result.status", errors
        )

    return valid(value) if not errors else invalid(errors)


def validate_cause_selection_against_request(
    selection: Any,
    request: dict[str, Any] | None,
    errors: list[str],
) -> None:
    if request is None or not is_object(selection):
        return
    expect_equal(
        selection.get("mode", MISSING),
        request["causes"]["mode"],
        "$.result.causeSelection.mode",
        errors,
    )
    if request["causes"]["mode"] == "selected":
        expect_equal(
            selection.get("selectedId", MISSING),
            request["causes"].get("selectedId", MISSING),
            "$.result.causeSelection.selectedId",
            errors,
        )


def validate_image_result(
    result: Any,
    path: str,
    image_input: dict[str, Any] | None,
    systems_selection: Any,
    selection: Any,
    errors: list[str],
) -> None:
    if not is_object(result):
        errors.append(f"{path} must be an object.")
        return
    reject_unknown_keys(
        result,
        {
            "imageLabel",
            "status",
            "medium",
            "systemsEvaluated",
            "messages",
            "ratings",
            "causes",
            "interactiveRisks",
            "visibilityLimits",
            "manualReview",
        },
        path,
        errors,
    )
    expect_non_empty_string(result.get("imageLabel", MISSING), f"{path}.imageLabel", errors, 120)
    if image_input is not None:
        expect_equal(
            result.get("imageLabel", MISSING),
            image_input["label"],
            f"{path}.imageLabel",
            errors,
        )
    status = result.get("status", MISSING)
    expect_enum(status, RESULT_STATUSES, f"{path}.status", errors)
    medium = result.get("medium", MISSING)
    validate_medium_result(medium, AGE_RATING_CATALOG, f"{path}.medium", errors)
    if image_input is not None:
        validate_medium_against_request(
            medium, image_input["medium"], f"{path}.medium", errors
        )

    if is_object(medium):
        resolution = resolve_image_plan(
            systems_selection, medium, AGE_RATING_CATALOG
        )
    else:
        resolution = {"systemsEvaluated": [], "messages": []}
    systems_evaluated = result.get("systemsEvaluated", MISSING)
    validate_exact_string_list(
        systems_evaluated,
        resolution["systemsEvaluated"],
        f"{path}.systemsEvaluated",
        errors,
    )
    validate_resolved_messages(
        result.get("messages", MISSING),
        resolution["messages"],
        resolution["systemsEvaluated"],
        AGE_RATING_CATALOG,
        f"{path}.messages",
        errors,
    )
    ratings = result.get("ratings", MISSING)
    causes = result.get("causes", MISSING)
    validate_ratings(
        ratings,
        f"{path}.ratings",
        resolution["systemsEvaluated"],
        selection,
        errors,
    )
    validate_cause_report(causes, f"{path}.causes", selection, errors)
    validate_rating_cause_consistency(
        ratings,
        causes,
        selection,
        f"{path}.ratings",
        f"{path}.causes",
        errors,
    )
    validate_interactive_risk_report(
        result.get("interactiveRisks", MISSING),
        f"{path}.interactiveRisks",
        "pegi" in resolution["systemsEvaluated"],
        errors,
    )
    validate_string_list(
        result.get("visibilityLimits", MISSING), f"{path}.visibilityLimits", errors
    )
    validate_manual_review(
        result.get("manualReview", MISSING), f"{path}.manualReview", status, errors
    )

    if status == "completed" and isinstance(ratings, list) and any(
        is_object(rating) and rating.get("ratingId", MISSING) is None
        for rating in ratings
    ):
        errors.append(f"{path}.ratings cannot contain null ratingId when status is completed.")
    if status == "unable_to_assess" and isinstance(ratings, list) and any(
        not is_object(rating) or rating.get("ratingId", MISSING) is not None
        for rating in ratings
    ):
        errors.append(
            f"{path}.ratings must use null ratingId when status is unable_to_assess."
        )


def validate_summary_mode(value: dict[str, Any], errors: list[str], path: str) -> None:
    if value.get("outputMode") == "json_with_summary":
        expect_non_empty_string(value.get("summary", MISSING), f"{path}.summary", errors)
    elif "summary" in value:
        errors.append(f"{path}.summary is allowed only for json_with_summary output.")
