---
name: verification-planning
description: Plan requested test coverage, checks/commands, or manual QA, including before authorized execution. Exclude suite health, named-command execution, already-specified test edits, and incidental verification. Planning does not edit or run checks.
---

# Verification Planning

Address material, ambiguous, or high-risk verification decisions inside the requested planning outcome. Do not invoke this skill merely because another coding workflow mentions tests or encounters verification uncertainty.

This workflow is read-only. Inspect existing coverage and recommend tests, commands, or manual QA, but do not create or modify repository files.

## Steps

1. Identify changed behavior, public contracts, and highest-risk failure modes.
2. Map existing test layers and commands from manifests, CI config, and nearby tests.
3. Recommend the narrowest command or check and state what it would prove.
4. Recommend the smallest coverage addition only when existing tests cannot catch a credible regression. Otherwise recommend preserving current tests.
5. Escalate the proposed checks only when the changed boundary or demonstrated risk requires it. Stop once they cover the material risks and any residual gaps are explicit.
6. Report what each proposed check would prove and only material residual gaps.

## Test Policy

- Test a concrete behavior, contract, defect, or credible regression that is not already covered.
- Prefer extending existing coverage. Avoid duplicate test layers or new test-only machinery unless they protect a distinct behavior or failure mode.
- Keep the test layer, setup, and breadth proportional to the risk.
- Stop when the proposed checks provide the smallest sufficient coverage of material behavior and any residual gaps are explicit.

Fixtures, mocks, snapshots, test helpers, and coverage at multiple layers are valid when they protect independent behavior; their presence alone is not a reason to test or expand them. Do not reproduce the production algorithm inside a test merely to compare identical logic.

Recommend coverage without editing. When a material gap remains, classify it as `blocking`, `recommended`, or `informational`. Omit gap classifications when no material gap exists.

A direct request to run named existing commands is execution, not verification planning. Run those commands in the parent or the owning execution workflow without invoking this skill.

A direct request to add or update already-specified tests without choosing a test layer, coverage boundary, command, or QA strategy is implementation rather than verification planning.

A request to assess execution cost, flakiness, overlap, isolation, or maintainability across an existing suite belongs to `$test-suite-health`.

Do not run proposed commands as part of this planning workflow. If the same request asks both to select and run checks, complete the recommendation first, then let the parent run only the selected commands as a bounded execution step. If the same request also authorizes test creation or modification, those edits belong to `$repository-implementation`. Complete and preserve the recommendation first, then let the parent continue with only that bounded coverage in the same turn under the user's existing authorization, without a repeated approval. This skill does not load or invoke implementation automatically. If no material coverage gap remains, do not enter test implementation.

## Selection Guide

- Unit tests: pure logic, parsing, validation, and edge cases.
- Integration tests: database, network, filesystem, service, and module boundary behavior.
- E2E or browser checks: user workflows, frontend rendering, and accessibility sensitive UI.
- Type checks and lint: typed contracts, generated code, and broad API shape.
- Build or package checks: bundling, exports, deployment, and asset paths.
- Manual smoke checks: missing or costly automation; state exact steps and expected results.

## Optional Delegation

Use a bundled agent only when the user requests delegation or a cleanly bounded slice has a material benefit by reducing parent context, enabling useful parallel work, or adding independent review. Otherwise complete the workflow in the parent.

Use `faye_coding_analyst` in `verification` mode for bounded read-only planning. Do not delegate test or repository edits from this skill. If the analyst is unavailable, retain the same read-only boundary in the parent.

## Output

```text
Recommended checks:
- command or manual steps: expected result and what it establishes

Coverage to add (recommendation only):
- file or behavior: reason

Residual risk:
- [blocking | recommended | informational] what remains unverified, when material
```
