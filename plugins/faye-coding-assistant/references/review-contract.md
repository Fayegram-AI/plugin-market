# Shared Review Contract

Use this contract only after `$code-review` or
`$phase-implementation-review` has been selected from the current request.
It defines their common evidence and reporting behavior; it does not route
between the two skills.

## Evidence Standard

- Establish the requested review surface before drawing conclusions.
- Read surrounding source, tests, configuration, and public contracts only as
  needed to understand the reviewed behavior.
- Prioritize correctness, regressions, data loss, security, performance,
  concurrency, error handling, accessibility, and material test gaps.
- Confirm each finding against repository evidence and a credible triggering
  condition. Put unresolved correctness questions under `Open questions`.
- Avoid style-only findings unless they conceal a material risk.
- Identify the smallest credible correction for each actionable finding.

## Findings and Remediation Boundary

The review stage establishes and preserves findings without editing files,
creating tests, delegating write work, or owning remediation. Any delegated
analyst remains read-only.

For a review-only request, stop after reporting findings, open questions, and
material test gaps. Do not infer authorization to fix them.

When the same request explicitly authorizes review and fixes, preserve the
confirmed findings before any edit, then let the parent continue immediately
in the same turn. Use `$repository-implementation` for a confirmed correction
that needs no further diagnosis, or `$repository-debugging` when a concrete
failure still needs root-cause diagnosis. Do not announce an intermediate
review completion, ask for approval already granted, or require another user
turn. The final response may combine findings addressed, changes, verification,
and remaining risk.

If there are no actionable findings, do not enter remediation. Open questions
and unconfirmed risks do not authorize speculative fixes. Findings do not
authorize unrelated changes or enlarge the reviewed surface; report any needed
scope expansion instead.

## Verification and Test Gaps

- Inspect existing coverage and validation evidence relevant to the reviewed
  surface.
- Run only proportionate existing checks when they materially improve review
  confidence; do not add tests or create new validation machinery.
- If a useful existing check cannot run inside a delegated read-only sandbox
  because it writes transient artifacts, the parent may run that bounded check
  as evidence collection. Do not intentionally change tracked source during
  the review stage or treat the sandbox limitation as a product failure.
- Classify a material test gap as `blocking`, `recommended`, or
  `informational`. Do not add a classification when there is no material gap.
- Stop when the requested surface has credible evidence and remaining
  uncertainty is stated honestly.

## Output

For a review-only request, lead with findings ordered by severity. If there are
none, say `No actionable findings` and mention only material residual risk or
test gaps.

```text
Findings:
- [severity] file:line - issue, impact, suggested correction

Open questions:
- only correctness-relevant unresolved questions

Test gaps:
- classification: missing evidence that materially affects confidence
```

Omit `Open questions` and `Test gaps` when they add no material information.
For an authorized compound request, the parent may instead provide one final
response that summarizes findings addressed, changes, verification, and any
unresolved risk.
