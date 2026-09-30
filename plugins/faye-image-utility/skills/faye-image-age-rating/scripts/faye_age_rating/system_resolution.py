"""Pure system-selection and medium-context rules for image age ratings."""

from __future__ import annotations

from copy import deepcopy
from typing import Any

from .validation_helpers import (
    MISSING,
    expect_enum,
    expect_equal,
    expect_non_empty_string,
    is_object,
    reject_unknown_keys,
    validate_exact_string_list,
    validate_unique_enum_list,
)


SPECIAL_SELECTIONS = {"all", "auto"}
ROUTING_CONFIDENCE = {"high", "very_high"}


def normalize_systems_selection(selection: Any, catalog: dict[str, Any]) -> Any:
    if not isinstance(selection, list):
        return selection
    return [item for item in catalog["systemOrder"] if item in selection]


def validate_systems_selection(
    selection: Any,
    catalog: dict[str, Any],
    path: str,
    errors: list[str],
) -> None:
    if isinstance(selection, str):
        expect_enum(selection, SPECIAL_SELECTIONS, path, errors)
        return
    if not isinstance(selection, list):
        errors.append(f'{path} must be "all", "auto", or an array of system IDs.')
        return
    if len(selection) == 0:
        errors.append(f"{path} must contain at least one system ID.")
    if len(selection) > len(catalog["systemOrder"]):
        errors.append(
            f"{path} must contain at most {len(catalog['systemOrder'])} system IDs."
        )
    validate_unique_enum_list(selection, catalog["systemOrder"], path, errors)


def validate_medium_result(
    medium: Any,
    catalog: dict[str, Any],
    path: str,
    errors: list[str],
) -> None:
    if not is_object(medium):
        errors.append(f"{path} must be an object.")
        return
    reject_unknown_keys(medium, {"id", "source", "confidence"}, path, errors)
    expect_enum(medium.get("id"), catalog["requestEnums"]["medium"], f"{path}.id", errors)
    expect_enum(
        medium.get("source"),
        catalog["resultEnums"]["mediumSource"],
        f"{path}.source",
        errors,
    )

    confidence = medium.get("confidence", MISSING)
    if medium.get("source") == "inferred":
        if medium.get("id") == "unknown":
            errors.append(f"{path}.id cannot be unknown when source is inferred.")
        expect_enum(
            confidence,
            catalog["findingEnums"]["confidence"],
            f"{path}.confidence",
            errors,
        )
    elif confidence is not None:
        errors.append(f"{path}.confidence must be null unless source is inferred.")

    if medium.get("source") == "undetermined" and medium.get("id") != "unknown":
        errors.append(f"{path}.id must be unknown when source is undetermined.")


def validate_medium_against_request(
    medium: Any,
    requested_medium: Any,
    path: str,
    errors: list[str],
) -> None:
    if not is_object(medium):
        return
    if requested_medium is not None:
        expect_equal(medium.get("id"), requested_medium, f"{path}.id", errors)
        expect_equal(medium.get("source"), "invoker_provided", f"{path}.source", errors)
        expect_equal(medium.get("confidence", MISSING), None, f"{path}.confidence", errors)
    elif medium.get("source") == "invoker_provided":
        errors.append(
            f"{path}.source cannot be invoker_provided when request medium is null."
        )


def resolve_image_plan(
    selection: Any,
    medium: dict[str, Any],
    catalog: dict[str, Any],
) -> dict[str, Any]:
    all_systems = list(catalog["systemOrder"])
    direct_systems = systems_for_medium(medium.get("id"), catalog)
    routing_trusted = is_routing_medium_trusted(medium)
    fallback = False

    if selection == "auto":
        if routing_trusted and direct_systems:
            systems_evaluated = direct_systems
        else:
            systems_evaluated = all_systems
            fallback = True
    elif selection == "all":
        systems_evaluated = all_systems
    elif isinstance(selection, list):
        systems_evaluated = list(selection)
    else:
        systems_evaluated = []

    messages = build_required_messages(
        selection=selection,
        medium=medium,
        systems_evaluated=systems_evaluated,
        direct_systems=direct_systems,
        routing_trusted=routing_trusted,
        fallback=fallback,
    )
    return {
        "medium": deepcopy(medium),
        "systemsEvaluated": systems_evaluated,
        "messages": messages,
    }


def systems_selection_equals(actual: Any, expected: Any) -> bool:
    if isinstance(actual, list) or isinstance(expected, list):
        return isinstance(actual, list) and isinstance(expected, list) and actual == expected
    return actual == expected and type(actual) is type(expected)


def validate_resolved_messages(
    messages: Any,
    required: list[dict[str, Any]],
    evaluated_systems: list[str],
    catalog: dict[str, Any],
    path: str,
    errors: list[str],
) -> None:
    if not isinstance(messages, list):
        errors.append(f"{path} must be an array.")
        return
    if len(messages) < len(required):
        errors.append(f"{path} must include every deterministic resolver message.")

    allowed_levels = catalog["resultEnums"]["messageLevel"]
    allowed_codes = catalog["resultEnums"]["messageCode"]
    seen_required_codes: set[Any] = set()
    for index, message in enumerate(messages):
        item_path = f"{path}[{index}]"
        if not is_object(message):
            errors.append(f"{item_path} must be an object.")
            continue
        reject_unknown_keys(
            message,
            {"level", "code", "systemIds", "message"},
            item_path,
            errors,
        )
        expect_enum(message.get("level"), allowed_levels, f"{item_path}.level", errors)
        expect_enum(message.get("code"), allowed_codes, f"{item_path}.code", errors)
        expect_non_empty_string(message.get("message"), f"{item_path}.message", errors)
        validate_unique_enum_list(
            message.get("systemIds"), evaluated_systems, f"{item_path}.systemIds", errors
        )

        if index < len(required):
            expected = required[index]
            expect_equal(message.get("level"), expected["level"], f"{item_path}.level", errors)
            expect_equal(message.get("code"), expected["code"], f"{item_path}.code", errors)
            validate_exact_string_list(
                message.get("systemIds"), expected["systemIds"], f"{item_path}.systemIds", errors
            )
            expect_equal(
                message.get("message"), expected["message"], f"{item_path}.message", errors
            )
            try:
                seen_required_codes.add(message.get("code"))
            except TypeError:
                pass
        else:
            expect_equal(message.get("code"), "assessment-note", f"{item_path}.code", errors)
            expect_equal(message.get("level"), "info", f"{item_path}.level", errors)

    if len(seen_required_codes) != len(required):
        errors.append(f"{path} must preserve deterministic resolver message ordering.")


def systems_for_medium(medium_id: Any, catalog: dict[str, Any]) -> list[str]:
    systems: list[str] = []
    for system_id in catalog["systemOrder"]:
        system = next(
            (item for item in catalog["systems"] if item["id"] == system_id),
            None,
        )
        if system is not None and medium_id in system["applicableMedia"]:
            systems.append(system_id)
    return systems


def is_routing_medium_trusted(medium: dict[str, Any]) -> bool:
    if medium.get("id") == "unknown" or medium.get("source") == "undetermined":
        return False
    if medium.get("source") == "invoker_provided":
        return True
    confidence = medium.get("confidence")
    return (
        medium.get("source") == "inferred"
        and isinstance(confidence, str)
        and confidence in ROUTING_CONFIDENCE
    )


def build_required_messages(
    *,
    selection: Any,
    medium: dict[str, Any],
    systems_evaluated: list[str],
    direct_systems: list[str],
    routing_trusted: bool,
    fallback: bool,
) -> list[dict[str, Any]]:
    messages: list[dict[str, Any]] = []
    if medium.get("source") == "inferred":
        messages.append({
            "level": "info",
            "code": "medium-inferred",
            "systemIds": [],
            "message": (
                f'Medium "{medium.get("id")}" was inferred from the visible image '
                f'with {medium.get("confidence")} confidence.'
            ),
        })
    if medium.get("id") == "unknown" or medium.get("source") == "undetermined":
        messages.append({
            "level": "info",
            "code": "medium-unspecified",
            "systemIds": [],
            "message": (
                "The image medium is unknown, so direct rating-system applicability "
                "cannot be determined."
            ),
        })
    if selection == "auto" and fallback:
        messages.append({
            "level": "warning",
            "code": "auto-selection-fallback",
            "systemIds": list(systems_evaluated),
            "message": (
                "No directly applicable system set could be resolved for medium "
                f'"{medium.get("id")}" at sufficient confidence; all supported systems '
                "are evaluated as still-image analogies."
            ),
        })
    elif selection != "auto" and routing_trusted:
        direct_set = set(direct_systems)
        mismatches = [item for item in systems_evaluated if item not in direct_set]
        if mismatches:
            messages.append({
                "level": "warning",
                "code": "system-medium-mismatch",
                "systemIds": mismatches,
                "message": (
                    f'Systems {", ".join(mismatches)} are not directly applicable to medium '
                    f'"{medium.get("id")}"; the requested ratings are still provided as '
                    "still-image analogies."
                ),
            })
    return messages
