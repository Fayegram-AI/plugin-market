"""Validation for ratings, causes, interactive risks, and review state."""

from __future__ import annotations

from typing import Any

from .catalog import AGE_RATING_CATALOG as CATALOG
from .validation_helpers import (
    MISSING,
    expect_enum,
    expect_equal,
    is_object,
    reject_unknown_keys,
    validate_string_list,
    validate_unique_enum_list,
)


SYSTEM_RATINGS = {
    system["id"]: {rating["id"]: rating for rating in system["ratings"]}
    for system in CATALOG["systems"]
}
CAUSE_IDS = {cause["id"] for cause in CATALOG["causes"]}
INTERACTIVE_RISK_IDS = {risk["id"] for risk in CATALOG["interactiveRisks"]}
INTERACTIVE_STATUSES = set(CATALOG["resultEnums"]["interactiveRiskStatus"])
FINDING_ENUMS = {
    key: set(values) for key, values in CATALOG["findingEnums"].items()
}


def validate_ratings(
    ratings: Any,
    path: str,
    expected_systems: list[str],
    selection: Any,
    errors: list[str],
) -> None:
    if not isinstance(ratings, list):
        errors.append(f"{path} must be an array.")
        return
    if len(ratings) != len(expected_systems):
        errors.append(f"{path} must contain one entry per evaluated system.")
    for index, rating in enumerate(ratings):
        item_path = f"{path}[{index}]"
        if not is_object(rating):
            errors.append(f"{item_path} must be an object.")
            continue
        reject_unknown_keys(
            rating,
            {
                "systemId",
                "ratingId",
                "ratingLabel",
                "confidence",
                "driverIds",
                "hasUnreportedDrivers",
                "visibilityLimits",
            },
            item_path,
            errors,
        )
        expected_system = expected_systems[index] if index < len(expected_systems) else MISSING
        system_id = rating.get("systemId", MISSING)
        rating_id = rating.get("ratingId", MISSING)
        expect_equal(system_id, expected_system, f"{item_path}.systemId", errors)
        if rating_id is not None:
            definitions = SYSTEM_RATINGS.get(system_id, {}) if isinstance(system_id, str) else {}
            rating_definition = definitions.get(rating_id) if isinstance(rating_id, str) else None
            expect_enum(rating_id, definitions, f"{item_path}.ratingId", errors)
            if rating_definition is not None:
                expect_equal(
                    rating.get("ratingLabel", MISSING),
                    rating_definition["label"],
                    f"{item_path}.ratingLabel",
                    errors,
                )
        elif rating.get("ratingLabel", MISSING) is not None:
            errors.append(f"{item_path}.ratingLabel must be null when ratingId is null.")
        expect_enum(
            rating.get("confidence", MISSING),
            FINDING_ENUMS["confidence"],
            f"{item_path}.confidence",
            errors,
        )
        validate_unique_enum_list(
            rating.get("driverIds", MISSING),
            CAUSE_IDS,
            f"{item_path}.driverIds",
            errors,
        )
        has_unreported = rating.get("hasUnreportedDrivers", MISSING)
        if not isinstance(has_unreported, bool):
            errors.append(f"{item_path}.hasUnreportedDrivers must be a boolean.")
        validate_string_list(
            rating.get("visibilityLimits", MISSING),
            f"{item_path}.visibilityLimits",
            errors,
        )

        driver_ids = rating.get("driverIds")
        selection_mode = selection.get("mode") if is_object(selection) else None
        if selection_mode == "off":
            if isinstance(driver_ids, list) and len(driver_ids) > 0:
                errors.append(f"{item_path}.driverIds must be empty when causes are off.")
        if selection_mode == "selected":
            if isinstance(driver_ids, list) and any(
                item != selection.get("selectedId") for item in driver_ids
            ):
                errors.append(
                    f"{item_path}.driverIds may contain only the selected cause."
                )


def validate_cause_report(
    report: Any,
    path: str,
    selection: Any,
    errors: list[str],
) -> None:
    if not is_object(report):
        errors.append(f"{path} must be an object.")
        return
    reject_unknown_keys(report, {"mode", "selectedId", "findings"}, path, errors)
    selected_mode = selection.get("mode") if is_object(selection) else MISSING
    expect_equal(report.get("mode", MISSING), selected_mode, f"{path}.mode", errors)
    if selected_mode == "selected":
        expect_equal(
            report.get("selectedId", MISSING),
            selection.get("selectedId", MISSING),
            f"{path}.selectedId",
            errors,
        )
    elif "selectedId" in report:
        errors.append(f"{path}.selectedId is allowed only in selected mode.")
    findings = report.get("findings", MISSING)
    if not isinstance(findings, list):
        errors.append(f"{path}.findings must be an array.")
        return
    if selected_mode == "off" and len(findings) != 0:
        errors.append(f"{path}.findings must be empty when causes are off.")
    if selected_mode == "selected" and len(findings) != 1:
        errors.append(f"{path}.findings must contain exactly the selected cause.")

    ids: list[Any] = []
    for index, finding in enumerate(findings):
        item_path = f"{path}.findings[{index}]"
        validate_cause_finding(finding, item_path, errors)
        if is_object(finding):
            finding_id = finding.get("id", MISSING)
            if finding_id in ids:
                errors.append(f"{item_path}.id must be unique.")
            ids.append(finding_id)
            if selected_mode == "selected" and finding_id != selection.get("selectedId"):
                errors.append(f"{item_path}.id must match the selected cause.")
            if selected_mode == "all" and finding.get("presence") not in {
                "present",
                "uncertain",
            }:
                errors.append(
                    f"{item_path}.presence must be present or uncertain in all mode."
                )


def validate_rating_cause_consistency(
    ratings: Any,
    cause_report: Any,
    selection: Any,
    ratings_path: str,
    causes_path: str,
    errors: list[str],
) -> None:
    """Enforce deterministic relationships between rating drivers and findings."""

    if not isinstance(ratings, list) or not is_object(cause_report):
        return
    findings = cause_report.get("findings")
    if not isinstance(findings, list):
        return
    eligible_driver_ids = {
        finding.get("id")
        for finding in findings
        if is_object(finding)
        and finding.get("presence") in {"present", "uncertain"}
        and isinstance(finding.get("id"), str)
    }
    selection_mode = selection.get("mode") if is_object(selection) else None

    for index, rating in enumerate(ratings):
        if not is_object(rating):
            continue
        item_path = f"{ratings_path}[{index}]"
        driver_ids = rating.get("driverIds")
        if selection_mode == "all" and rating.get("hasUnreportedDrivers") is not False:
            errors.append(
                f"{item_path}.hasUnreportedDrivers must be false when causes are all."
            )
        if rating.get("ratingId", MISSING) is None and isinstance(driver_ids, list) and driver_ids:
            errors.append(f"{item_path}.driverIds must be empty when ratingId is null.")
        if isinstance(driver_ids, list):
            for driver_index, driver_id in enumerate(driver_ids):
                if driver_id not in eligible_driver_ids:
                    errors.append(
                        f"{item_path}.driverIds[{driver_index}] must identify a reported "
                        "present or uncertain cause finding."
                    )

    for index, finding in enumerate(findings):
        if not is_object(finding):
            continue
        if finding.get("presence") == "present":
            evidence = finding.get("evidence")
            if isinstance(evidence, list) and len(evidence) == 0:
                errors.append(
                    f"{causes_path}.findings[{index}].evidence must be non-empty when "
                    "presence is present."
                )


def validate_interactive_risk_report(
    report: Any,
    path: str,
    pegi_evaluated: bool,
    errors: list[str],
) -> None:
    if not is_object(report):
        errors.append(f"{path} must be an object.")
        return
    reject_unknown_keys(report, {"status", "findings"}, path, errors)
    status = report.get("status", MISSING)
    expect_enum(status, INTERACTIVE_STATUSES, f"{path}.status", errors)
    findings = report.get("findings", MISSING)
    if not isinstance(findings, list):
        errors.append(f"{path}.findings must be an array.")
        return
    if not pegi_evaluated and status != "not_applicable":
        errors.append(f"{path}.status must be not_applicable when PEGI is not evaluated.")
    if not pegi_evaluated and findings:
        errors.append(f"{path}.findings must be empty when PEGI is not evaluated.")
    if pegi_evaluated and status == "not_applicable":
        errors.append(f"{path}.status cannot be not_applicable when PEGI is evaluated.")
    if status == "not_assessable" and findings:
        errors.append(f"{path}.findings must be empty when status is not_assessable.")

    ids: list[Any] = []
    for index, finding in enumerate(findings):
        item_path = f"{path}.findings[{index}]"
        if not is_object(finding):
            errors.append(f"{item_path} must be an object.")
            continue
        reject_unknown_keys(
            finding,
            {"id", "presence", "confidence", "evidenceSource", "evidence"},
            item_path,
            errors,
        )
        finding_id = finding.get("id", MISSING)
        expect_enum(finding_id, INTERACTIVE_RISK_IDS, f"{item_path}.id", errors)
        expect_enum(
            finding.get("presence", MISSING),
            FINDING_ENUMS["presence"],
            f"{item_path}.presence",
            errors,
        )
        expect_enum(
            finding.get("confidence", MISSING),
            FINDING_ENUMS["confidence"],
            f"{item_path}.confidence",
            errors,
        )
        expect_enum(
            finding.get("evidenceSource", MISSING),
            {"visible", "user_provided"},
            f"{item_path}.evidenceSource",
            errors,
        )
        validate_string_list(finding.get("evidence", MISSING), f"{item_path}.evidence", errors)
        if finding.get("presence") == "present":
            evidence = finding.get("evidence")
            if isinstance(evidence, list) and len(evidence) == 0:
                errors.append(
                    f"{item_path}.evidence must be non-empty when presence is present."
                )
        if finding_id in ids:
            errors.append(f"{item_path}.id must be unique.")
        ids.append(finding_id)


def validate_manual_review(
    review: Any,
    path: str,
    status: Any,
    errors: list[str],
) -> None:
    if not is_object(review):
        errors.append(f"{path} must be an object.")
        return
    reject_unknown_keys(review, {"required", "reasons"}, path, errors)
    required = review.get("required", MISSING)
    reasons = review.get("reasons", MISSING)
    if not isinstance(required, bool):
        errors.append(f"{path}.required must be a boolean.")
    validate_string_list(reasons, f"{path}.reasons", errors)
    if status == "completed" and required is not False:
        errors.append(f"{path}.required must be false when status is completed.")
    if status == "completed" and isinstance(reasons, list) and len(reasons) > 0:
        errors.append(f"{path}.reasons must be empty when status is completed.")
    if status != "completed" and required is not True:
        errors.append(f"{path}.required must be true when status is not completed.")
    if status != "completed" and isinstance(reasons, list) and len(reasons) == 0:
        errors.append(f"{path}.reasons must explain why review is required.")


def validate_aggregate_status(
    status: Any,
    results: Any,
    path: str,
    errors: list[str],
) -> None:
    if not isinstance(results, list) or not results:
        return
    expected = "completed"
    if all(is_object(result) and result.get("status") == "unable_to_assess" for result in results):
        expected = "unable_to_assess"
    elif any(not is_object(result) or result.get("status") != "completed" for result in results):
        expected = "manual_review_required"
    expect_equal(status, expected, path, errors)


def validate_cause_finding(finding: Any, path: str, errors: list[str]) -> None:
    if not is_object(finding):
        errors.append(f"{path} must be an object.")
        return
    reject_unknown_keys(
        finding,
        {"id", "presence", "severity", "confidence", "evidence", "qualifiers"},
        path,
        errors,
    )
    presence = finding.get("presence", MISSING)
    severity = finding.get("severity", MISSING)
    expect_enum(finding.get("id", MISSING), CAUSE_IDS, f"{path}.id", errors)
    expect_enum(presence, FINDING_ENUMS["presence"], f"{path}.presence", errors)
    if severity is not None:
        expect_enum(severity, FINDING_ENUMS["severity"], f"{path}.severity", errors)
    expect_enum(
        finding.get("confidence", MISSING),
        FINDING_ENUMS["confidence"],
        f"{path}.confidence",
        errors,
    )
    validate_string_list(finding.get("evidence", MISSING), f"{path}.evidence", errors)
    validate_qualifiers(finding.get("qualifiers", MISSING), f"{path}.qualifiers", errors)
    if presence == "present" and severity is None:
        errors.append(f"{path}.severity is required when presence is present.")
    if presence in {"absent", "not_assessable"} and severity is not None:
        errors.append(f"{path}.severity must be null for {presence}.")


def validate_qualifiers(qualifiers: Any, path: str, errors: list[str]) -> None:
    if not is_object(qualifiers):
        errors.append(f"{path} must be an object.")
        return
    keys = ["realism", "detail", "frequency", "framing", "evidenceSource"]
    reject_unknown_keys(qualifiers, set(keys), path, errors)
    for key in keys:
        expect_enum(
            qualifiers.get(key, MISSING),
            FINDING_ENUMS[key],
            f"{path}.{key}",
            errors,
        )
