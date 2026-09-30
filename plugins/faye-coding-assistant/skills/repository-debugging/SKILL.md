---
name: repository-debugging
description: Use to diagnose concrete failures, unexpected behavior, or unusually slow tests, builds, runtime, CI, or commands, including requests to fix them; not for speculative review or suite health. Fix only when explicitly requested.
---

# Repository Debugging

## Steps

1. Capture the failing command, error text, environment, and expected behavior.
2. Reproduce the failure when practical. If reproduction is too costly, inspect the failing path directly and state the limitation.
3. Trace from the first meaningful error frame or assertion to the responsible code, fixture, configuration, or data boundary.
4. Form a specific hypothesis and check it against source, tests, logs, or a reduced command.
5. If the request authorizes a fix, patch the smallest responsible surface. For diagnosis-only requests, stop after establishing the root cause and recommend the smallest fix without editing.
6. After a fix, rerun the failing command or cheapest targeted check that covers the failure. Choose that check locally. `$verification-planning` is a separate, non-automatic skill for a user-requested test or verification plan; do not invoke it merely because debugging mentions tests or the appropriate test layer is uncertain. For diagnosis only, run only the read-only checks needed to support the conclusion.
7. Report root cause, any fix made, verification, and remaining uncertainty.

## Rules

- Do not patch by guessing from the last error line when earlier context identifies the real failure.
- Prefer one tight diagnostic command over broad test runs until the cause is known.
- Separate local setup problems from code defects.
- A suite-wide request to assess test cost, flakiness, overlap, isolation, or maintainability belongs to `$test-suite-health`; root-cause investigation of a specific failure or slowdown stays here.
- Avoid masking failures with broad catches, skipped tests, or weakened assertions unless explicitly requested.
- A request to fix the failure authorizes the responsible fix, not unrelated cleanup or broader refactoring.
- This workflow owns an explicitly requested fix to the diagnosed failure and its targeted verification. Do not add the general implementation workflow for the same fix.
- A request only to apply an already-established correction belongs to `$repository-implementation`; it does not require a new debugging investigation.

## Optional Delegation

Use a bundled agent only when the user requests delegation or a cleanly bounded slice has a material benefit by reducing parent context, enabling useful parallel work, or adding independent review. Otherwise complete the workflow in the parent.

Use `faye_coding_analyst` in `debugging` mode for bounded diagnosis-only work. Use `faye_coding_assistant` in `debugging` mode only for a bounded fix with explicit write authority. If neither is available, keep the same authorization boundary in the parent.

## Output

```text
Root cause:
- concise cause and affected path

Changed:
- path: fix summary, or none for diagnosis-only requests

Verified:
- command: result

Notes:
- remaining uncertainty or wider test recommended
```
