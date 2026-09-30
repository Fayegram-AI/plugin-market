"""Request normalization and deterministic per-image system resolution."""

from __future__ import annotations

from copy import deepcopy
from typing import Any

from .catalog import AGE_RATING_CATALOG
from .system_resolution import (
    normalize_systems_selection,
    resolve_image_plan,
    validate_medium_against_request,
    validate_medium_result,
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
    validate_unique_enum_list,
)


CAUSE_IDS = {cause["id"] for cause in AGE_RATING_CATALOG["causes"]}
INTERACTIVE_RISK_IDS = {
    risk["id"] for risk in AGE_RATING_CATALOG["interactiveRisks"]
}
CAUSE_MODES = set(AGE_RATING_CATALOG["requestEnums"]["causeMode"])
OUTPUT_MODES = set(AGE_RATING_CATALOG["requestEnums"]["outputMode"])
MEDIA = set(AGE_RATING_CATALOG["requestEnums"]["medium"])

REQUEST_KEYS = {
    "schemaVersion",
    "utility",
    "imageInputs",
    "systems",
    "causes",
    "outputMode",
    "context",
}
CONTEXT_KEYS = {
    "intendedUse",
    "visibleText",
    "declaredStyle",
    "declaredTheme",
    "specificConcerns",
    "interactiveRiskEvidence",
}


def normalize_age_rating_request(input_value: Any) -> dict[str, Any]:
    errors: list[str] = []
    if not is_object(input_value):
        return invalid(["$ must be an object."])

    reject_unknown_keys(input_value, REQUEST_KEYS, "$", errors)
    raw_systems = input_value.get("systems")
    if raw_systems is None:
        raw_systems = AGE_RATING_CATALOG["defaultSystemsSelection"]
    validate_systems_selection(raw_systems, AGE_RATING_CATALOG, "$.systems", errors)

    value = {
        "schemaVersion": coalesce(
            input_value.get("schemaVersion"), AGE_RATING_CATALOG["schemaVersion"]
        ),
        "utility": coalesce(input_value.get("utility"), "age_rating"),
        "imageInputs": normalize_image_inputs(input_value.get("imageInputs", MISSING)),
        "systems": normalize_systems_selection(raw_systems, AGE_RATING_CATALOG),
        "causes": input_value.get("causes")
        if input_value.get("causes") is not None
        else {"mode": AGE_RATING_CATALOG["defaultCauseMode"]},
        "outputMode": coalesce(
            input_value.get("outputMode"), AGE_RATING_CATALOG["defaultOutputMode"]
        ),
        "context": input_value.get("context")
        if input_value.get("context") is not None
        else {},
    }
    validate_request_value(value, errors)
    return valid(value) if not errors else invalid(errors)


def resolve_age_rating_systems(input_value: Any) -> dict[str, Any]:
    errors: list[str] = []
    if not is_object(input_value):
        return invalid(["$ must be an object."])
    reject_unknown_keys(input_value, {"request", "mediumDeterminations"}, "$", errors)

    request_validation = normalize_nested_request(input_value.get("request", MISSING), errors)
    request = request_validation["value"]
    determinations = validate_medium_determinations(
        input_value.get("mediumDeterminations", MISSING), request, errors
    )
    if errors:
        return invalid(errors)

    return valid({
        "systemsSelection": deepcopy(request["systems"]),
        "images": [
            {
                "imageLabel": image_input["label"],
                **resolve_image_plan(
                    request["systems"],
                    determinations[index]["medium"],
                    AGE_RATING_CATALOG,
                ),
            }
            for index, image_input in enumerate(request["imageInputs"])
        ],
    })


def normalize_nested_request(request: Any, errors: list[str]) -> dict[str, Any]:
    validation = normalize_age_rating_request(request)
    if not validation["valid"]:
        errors.extend(
            "$.request" + error[1:] if error.startswith("$") else error
            for error in validation["errors"]
        )
        return {"valid": False, "value": None}
    return validation


def normalize_image_inputs(image_inputs: Any) -> Any:
    if not isinstance(image_inputs, list):
        return image_inputs
    normalized: list[Any] = []
    for image_input in image_inputs:
        if not is_object(image_input):
            normalized.append(image_input)
            continue
        item = dict(image_input)
        if item.get("medium") is None:
            item["medium"] = None
        normalized.append(item)
    return normalized


def validate_medium_determinations(
    determinations: Any,
    request: dict[str, Any] | None,
    errors: list[str],
) -> list[Any]:
    if not isinstance(determinations, list):
        errors.append("$.mediumDeterminations must be an array.")
        return []
    if request is None:
        return determinations
    if len(determinations) != len(request["imageInputs"]):
        errors.append("$.mediumDeterminations must contain one entry per request image.")

    for index, determination in enumerate(determinations):
        path = f"$.mediumDeterminations[{index}]"
        if not is_object(determination):
            errors.append(f"{path} must be an object.")
            continue
        reject_unknown_keys(determination, {"imageLabel", "medium"}, path, errors)
        if index >= len(request["imageInputs"]):
            continue
        image_input = request["imageInputs"][index]
        expect_equal(
            determination.get("imageLabel", MISSING),
            image_input["label"],
            f"{path}.imageLabel",
            errors,
        )
        medium = determination.get("medium", MISSING)
        validate_medium_result(medium, AGE_RATING_CATALOG, f"{path}.medium", errors)
        validate_medium_against_request(
            medium, image_input["medium"], f"{path}.medium", errors
        )
    return determinations


def validate_request_value(value: dict[str, Any], errors: list[str]) -> None:
    expect_equal(
        value["schemaVersion"],
        AGE_RATING_CATALOG["schemaVersion"],
        "$.schemaVersion",
        errors,
    )
    expect_equal(value["utility"], "age_rating", "$.utility", errors)
    expect_enum(value["outputMode"], OUTPUT_MODES, "$.outputMode", errors)
    validate_cause_selection(value["causes"], "$.causes", errors)
    validate_image_inputs(value["imageInputs"], errors)
    validate_context(value["context"], errors)


def validate_image_inputs(image_inputs: Any, errors: list[str]) -> None:
    if not isinstance(image_inputs, list) or len(image_inputs) == 0:
        errors.append("$.imageInputs must be a non-empty array.")
        return
    if len(image_inputs) > 25:
        errors.append("$.imageInputs must contain at most 25 items.")

    labels: list[str] = []
    for index, image_input in enumerate(image_inputs):
        path = f"$.imageInputs[{index}]"
        if not is_object(image_input):
            errors.append(f"{path} must be an object.")
            continue
        reject_unknown_keys(image_input, {"label", "source", "medium"}, path, errors)
        label = image_input.get("label", MISSING)
        expect_non_empty_string(label, f"{path}.label", errors, 120)
        expect_non_empty_string(image_input.get("source", MISSING), f"{path}.source", errors)
        medium = image_input.get("medium", MISSING)
        if medium is not None:
            expect_enum(medium, MEDIA, f"{path}.medium", errors)
        if isinstance(label, str):
            if label in labels:
                errors.append(f"{path}.label must be unique.")
            labels.append(label)


def validate_context(context: Any, errors: list[str]) -> None:
    if not is_object(context):
        errors.append("$.context must be an object.")
        return
    reject_unknown_keys(context, CONTEXT_KEYS, "$.context", errors)
    for key in ("intendedUse", "visibleText", "declaredStyle", "declaredTheme"):
        if key in context and not isinstance(context[key], str):
            errors.append(f"$.context.{key} must be a string.")
    if "specificConcerns" in context:
        validate_unique_enum_list(
            context["specificConcerns"],
            CAUSE_IDS,
            "$.context.specificConcerns",
            errors,
        )
    if "interactiveRiskEvidence" in context:
        validate_interactive_risk_evidence(context["interactiveRiskEvidence"], errors)


def validate_interactive_risk_evidence(evidence_items: Any, errors: list[str]) -> None:
    if not isinstance(evidence_items, list):
        errors.append("$.context.interactiveRiskEvidence must be an array.")
        return
    for index, item in enumerate(evidence_items):
        path = f"$.context.interactiveRiskEvidence[{index}]"
        if not is_object(item):
            errors.append(f"{path} must be an object.")
            continue
        reject_unknown_keys(item, {"riskId", "evidence", "source"}, path, errors)
        expect_enum(item.get("riskId", MISSING), INTERACTIVE_RISK_IDS, f"{path}.riskId", errors)
        expect_non_empty_string(item.get("evidence", MISSING), f"{path}.evidence", errors)
        expect_enum(
            item.get("source", MISSING),
            {"visible", "user_provided"},
            f"{path}.source",
            errors,
        )


def validate_cause_selection(selection: Any, path: str, errors: list[str]) -> None:
    if not is_object(selection):
        errors.append(f"{path} must be an object.")
        return
    reject_unknown_keys(selection, {"mode", "selectedId"}, path, errors)
    mode = selection.get("mode", MISSING)
    expect_enum(mode, CAUSE_MODES, f"{path}.mode", errors)
    if mode == "selected":
        expect_enum(selection.get("selectedId", MISSING), CAUSE_IDS, f"{path}.selectedId", errors)
    elif "selectedId" in selection:
        errors.append(f"{path}.selectedId is allowed only when mode is selected.")


def coalesce(value: Any, fallback: Any) -> Any:
    """Match JavaScript's nullish-coalescing behavior for JSON values."""

    return fallback if value is None else value
