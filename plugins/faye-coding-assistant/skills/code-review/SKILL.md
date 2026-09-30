---
name: code-review
description: Use for a requested general review of a diff, PR, branch, module, or named code surface, including when fixes are also requested; not for phased review, concrete-failure diagnosis, or suite health. Establish findings before authorized remediation.
---

# Code Review

A request that also asks to fix resulting findings still begins with this review; after findings are established, the parent may continue directly into the authorized remediation stage in the same turn.

Use `$phase-implementation-review` instead for current-phase, cumulative, or final review framed by the same phased implementation run. Read the [shared review contract](../../references/review-contract.md) before conducting the review.

## Steps

1. Identify the requested general review surface: current diff, branch diff, PR patch, named files, module, subsystem, or implementation.
2. Read surrounding code, tests, and contracts needed to understand behavior.
3. Check locally whether existing tests cover the changed behavior and material regression risks. `$verification-planning` is a separate, non-automatic skill for a user-requested test or verification plan; do not invoke it merely because a review mentions tests or test selection is uncertain.
4. Confirm the findings and report them using the shared review contract.

## Rules

- Establish and preserve findings without editing files, creating tests, or delegating write work from the review stage. For an explicitly authorized compound request, follow the shared contract into remediation without an intermediate completion announcement or repeated approval.
- For diff, patch, or PR reviews, report issues introduced by or directly relevant to the reviewed change. For named-file reviews, assess the complete requested file surface.
- A standalone request to select tests, decide coverage, or plan verification belongs to verification planning. Assess coverage locally when it is only one part of reviewing the named code surface.
- Review of named test code remains here. A suite-wide assessment of test cost, flakiness, overlap, isolation, or maintainability belongs to `$test-suite-health`.
- Ordinary repository tracing needed to understand the review stays in this workflow and does not activate `$codebase-exploration`.

## Optional Delegation

Use a bundled agent only when the user requests delegation or a cleanly bounded slice has a material benefit by reducing parent context, enabling useful parallel work, or adding independent review. Otherwise complete the workflow in the parent.

Use `faye_coding_analyst` in `review` mode for a bounded read-only review slice. Do not delegate write work from this skill. If the analyst is unavailable, retain the same review boundaries in the parent.
