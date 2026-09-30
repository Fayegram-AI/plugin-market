---
name: test-suite-health
description: Use to assess suite-wide test cost, flakiness, overlap, isolation, or maintainability, including before authorized remediation; not for failure diagnosis, test-code correctness, change verification, or source-file token estimation. Assessment does not edit.
---

# Test Suite Health

Keep the assessment read-only and evidence-led.

## Steps

1. Define the requested suite, package, or test boundary and the health concern.
2. Inspect existing timing reports, CI history, retry or failure records, configuration, fixtures, helpers, and test structure relevant to that boundary.
3. Distinguish measured facts from static indicators and inference.
4. Assess only supported dimensions: execution cost, flakiness, overlapping coverage, setup complexity, isolation, and maintainability.
5. Prioritize material findings and recommend consolidation, targeted measurement, or remediation only where evidence supports it.
6. Stop when the requested health question is answered and material evidence gaps are stated.

## Rules

- Use existing evidence first. Do not launch a broad or known-costly suite only to produce timings or statistics. When evidence is missing, propose the smallest useful measurement and state the limitation.
- Do not infer redundancy from similar filenames, test names, or file size alone. Confirm that coverage or setup materially overlaps.
- Root-cause diagnosis of a specific failure or slowdown belongs to `$repository-debugging`. A suite-wide assessment stays here even when the suite runs through one command.
- Test or manual-QA selection for one repository change belongs to `$verification-planning`. Correctness review of named test code belongs to `$code-review`.
- Test-file size and approximate token footprint belong to the explicit `$source-file-token-estimation` skill.
- Do not create, modify, delete, or weaken tests, fixtures, helpers, snapshots, or configuration during the assessment. When the same request authorizes remediation, establish the supported findings first. The parent may then continue in the same turn through bounded `$repository-implementation`, or `$repository-debugging` when a concrete failure still needs root-cause diagnosis, without an artificial checkpoint or repeated approval. This skill does not automatically invoke either workflow.
- Do not enter remediation when there are no actionable findings or the concern remains an unconfirmed inference. Stop after the assessment when it is the only requested outcome or the user asks to approve remediation first.
- Do not recommend reducing coverage merely to shorten runtime. Preserve tests that protect distinct material behavior or failure modes.

## Optional Delegation

Use a bundled agent only when the user requests delegation or a cleanly bounded slice has a material benefit by reducing parent context, enabling useful parallel work, or adding independent review. Otherwise complete the workflow in the parent.

Use `faye_coding_analyst` in `test_health` mode only for a bounded read-only suite slice. If it is unavailable, perform the assessment in the parent.

## Output

```text
Findings:
- [impact] issue: measured or inferred evidence

Recommendations:
- bounded consolidation, measurement, or remediation recommendation

Evidence gaps:
- missing evidence or none
```
