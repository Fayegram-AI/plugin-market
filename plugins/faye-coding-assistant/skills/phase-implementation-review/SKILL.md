---
name: phase-implementation-review
description: Use when the current request asks to review a completed phase, cumulative phased work, or the final phased result, including when fixes are requested; not for accepted-plan self-review or checkpoints. Establish findings before authorized remediation.
---

# Phase Implementation Review

The review stage establishes findings without editing; the parent may then continue directly into authorized remediation in the same turn.

Select by the requested outcome, not by the presence of review language in a plan. Review, validation, and phase-closure checkpoints already included in an accepted plan are implementation-owned self-review. They neither activate this skill nor create a completion boundary during plan execution.

Read the [shared review contract](../../references/review-contract.md) before conducting the review.

## Select the Review Mode

- **Current phase:** review the just-completed phase. This is the default for an otherwise unqualified request to review what was just implemented.
- **Cumulative:** review implementation from the beginning of the phased run through the identified current phase when the request asks for all work so far.
- **Final phased review:** review the complete cumulative implementation when the request is made at the end of the same phased run.

Use `$code-review` instead when the request is a general review independent of an identifiable phased implementation.

## Establish the Surface

1. Honor an explicit user-provided phase, baseline, file, module, service, or subsystem boundary first.
2. Otherwise derive the boundary from the accepted implementation plan, authoritative goal ledger or phase record, known phase-start baseline, and files attributable to the phase.
3. Exclude unrelated dirty or pre-existing user changes.
4. If the phase boundary cannot be established safely, ask for the missing scope. Do not silently fall back to a branch-wide or repository-wide review.

Review the touched modules, services, packages, or feature boundaries and the integration paths materially exercised by the phase. This is a risk-focused subsystem review, not an exhaustive audit of every unrelated file. Read surrounding unchanged code as evidence, but report only issues introduced by or made materially relevant by the reviewed phase or cumulative implementation.

`Full` in this workflow means the cumulative implementation within the same phased run. It does not mean a repository-wide audit or permission to report unrelated pre-existing defects.

## Rules

- Establish and preserve findings without editing files, creating tests, or delegating write work from the review stage. For an explicitly authorized compound request, follow the shared contract into remediation without an intermediate completion announcement or repeated approval.
- Ordinary repository mapping and call tracing needed for review remain inside this workflow and do not activate `$codebase-exploration`.
- `$verification-planning` is a separate, non-automatic skill for a separately requested verification plan; never invoke it because this review assesses existing tests.

## Optional Delegation

Use `faye_coding_analyst` in `review` mode for a bounded read-only review slice when delegation reduces context load or improves independence. Do not use the write-capable agent from this skill.
