# Artifact Audit Reporting

This document defines the output modes and presentation vocabulary for Faye Image Utility artifact audits. [audit-framework.md](audit-framework.md) owns the judgment model and canonical scales. Topical references determine what to inspect; this document determines what to return.

## 1. Reporting principles

Reports must be:

- evidence-based and location-specific for visual findings;
- concise for the selected mode;
- explicit about visibility and missing context;
- clear about visual artifact versus conformance mismatch;
- calibrated for intended use;
- free of origin claims;
- actionable without inventing a repair method that cannot preserve the rest of the image.

Use supplied image/reference labels in the report. If a label is absent, assign a neutral ordinal such as “Image 1” or “Reference 1.” Never expose target, reference, or protocol file paths in user-facing output.

Do not dump the inspection taxonomy, every activated check, or internal reasoning records. Include non-findings only when they resolve a specific concern, prevent a likely false positive, or support a high-stakes decision.

The assessor’s requested-mode report is the authoritative visual judgment. The parent may add source context or adapt presentation, but must not silently change findings, severity, confidence, or acceptability without another assessor pass.

## 2. Output vocabulary

### Finding status

- confirmed artifact;
- probable artifact;
- possible issue/manual review;
- style-consistent anomaly;
- not assessable;
- not an artifact.

Confirmed and probable artifacts belong in the findings table. Possible issues, style-consistent anomalies, not-assessable concerns, and relevant non-findings belong under ambiguity. Material conformance mismatches have their own section.

### Severity

Use only:

- 1 — Minor;
- 2 — Moderate;
- 3 — Major;
- 4 — Critical.

Severity 0 is a top-level absence of a reportable artifact, not a finding row.

### Confidence

Use Low, Medium, High, or Very high by default. Numeric confidence is permitted only in deep mode and only when explicitly requested, using the 0–1 bands in [audit-framework.md](audit-framework.md).

Overall confidence means confidence in the top-level verdict and acceptability decision given image quality, context, and the decisive evidence. Do not average finding confidences. If one unresolved issue controls the decision, overall confidence should reflect that limitation.

### Verdict

Use one of:

- No significant visible artifacts detected.
- Minor artifacts detected.
- Moderate artifacts detected.
- Major artifacts detected.
- Critical artifacts detected.
- Assessment limited; manual review required.

Keep conformance in its separate field. A clean artifact verdict can coexist with a material prompt, declared-context, reference, continuity, or delivery mismatch.

### Acceptability

Use one of:

- Acceptable as-is.
- Acceptable as-is; optional minor retouching.
- Needs targeted repair.
- Needs regeneration.
- Unusable for intended purpose.
- Manual review required.

These labels are defined in [audit-framework.md](audit-framework.md). Do not combine mutually exclusive acceptability labels. Select by the framework’s manual-review, targeted-repair, regeneration, unusable, then acceptable decision order.

### Conformance

Use exactly:

- Satisfied.
- Material mismatch.
- Ambiguous interpretation or correspondence.
- Not assessable.
- Not provided or not applicable.

Use only the canonical sources **prompt**, **declared_context**, **reference**, **continuity**, and **delivery** from [audit-framework.md](audit-framework.md). Apply the framework's overall-outcome precedence and retain per-source outcomes when they differ. Preserve the stable requirement ID whenever reporting an item supplied through `declared_requirements`. Conformance does not change visual-artifact severity. It can independently change acceptability.

### Output preferences

- `max_findings` is a positive integer used only by compact mode and each per-image compact subsection in batch comparison.
- `include_repair_guidance: false` omits repair-target fields and prioritized edit steps, but retains acceptability and repairability rationale.
- `include_non_findings: true` adds only decision-relevant non-findings under the reporting principles. False never hides ambiguity, visibility limits, or manual-review needs.
- `confidence_format: numeric_and_labels` is honored only in deep mode. All other modes use labels even when that value is sent.

## Select reporting details

Read exactly the requested mode before composing its report; omitted mode is compact:

- `triage`: [triage](reporting-modes/triage.md).
- `compact`: [compact](reporting-modes/compact.md).
- `targeted`: [targeted](reporting-modes/targeted.md).
- `deep`: [deep](reporting-modes/deep.md).
- `batch_compare`: [batch_compare](reporting-modes/batch_compare.md).

Also read [aggregation](reporting-modes/aggregation.md) when ranking or selecting variants, and [repair](reporting-modes/repair.md) when including repair guidance. Read [calibrated examples](reporting-modes/examples.md) only when a concrete interpretation needs calibration. Resolve these paths from this reporting file. If a required mode or supporting file is unreadable, report the protocol blocker; do not reconstruct its requirements from memory.

## 11. Final quality check

Before returning a report, verify:

- the target image and requested mode are correct;
- the contract distinguishes declared and inferred context;
- every finding passed visibility and false-positive review;
- each artifact row is confirmed or probable;
- conformance mismatches are separate from artifact severity;
- severity uses None/Minor/Moderate/Major/Critical consistently;
- confidence uses canonical labels and no origin probability;
- artifact evidence is visible and location-specific; delivery evidence is a reliable measured property;
- important visibility limits are stated;
- findings are deduplicated by root cause;
- acceptability matches intended use and repairability;
- repair targets are concrete;
- the report does not claim intent, provenance, expert correctness, or certification it cannot establish.
