---
name: repository-implementation
description: Use for a bounded repository edit, including accepted-plan execution, its embedded self-review, or remediation after review or suite assessment; not for the preceding analysis, concrete-failure debugging, or repository-wide docs reconciliation.
---

# Repository Implementation

Carry out the authorized implementation stage within the established repository scope. Preserve the accepted plan, findings, or recommendations that define the work.

## Steps

1. Read the relevant project instructions, manifests, nearby source, existing tests, and helper APIs.
2. Inspect `git status` before editing. Preserve unrelated user changes.
3. Identify the smallest file set and behavior boundary needed for the request.
4. Implement with existing naming, structure, error handling, and test style.
5. Check existing coverage. Add or update the smallest relevant test only when it cannot catch a meaningful regression. Choose the narrowest suitable verification locally. `$verification-planning` is a separate, non-automatic skill for a user-requested test or verification plan; do not invoke it merely because implementation mentions tests or a verification decision is ambiguous. A known existing command does not require that skill.
6. Stop verification when the cheapest suitable evidence covers the touched behavior and passes.
7. Report changed files, behavior, verification, and residual risk.

## Rules

- Prefer existing helpers over new abstractions.
- Do not reformat unrelated code.
- Do not rename APIs, move files, or change public contracts unless required.
- Leave comments only where they clarify non-obvious logic.
- For frontend work, verify runtime layout and interaction when practical.
- Supporting exploration or debugging does not expand the requested outcome or authorize adjacent cleanup.
- Keep ordinary repository reads and searches inside this workflow. Do not add codebase exploration unless a repository map or trace is an explicit additional deliverable.
- A separately requested general or phased review establishes findings without editing. When the same request already authorizes fixes, begin this bounded remediation stage as soon as findings are established; it may continue in the same turn without repeating the review or asking for approval already granted. Use debugging instead when a concrete failure still needs root-cause diagnosis.
- Review findings constrain the remediation surface; they do not authorize unrelated fixes or make the review skill responsible for implementation.
- When a verification plan recommends test changes and the same request already authorizes them, begin only that bounded coverage after the recommendation is established; this stage may continue in the same turn without repeated approval. A later authorization may do the same. Verification planning does not own the edits.
- When a requested change or refactor plan precedes authorized execution, begin this stage after the plan is established, including in the same turn. An accepted-plan execution request uses this workflow directly and does not cause a planning skill to reload. Review, validation, and phase-closure steps already specified by that plan remain internal self-review. Do not treat completion of those checkpoints as completion of the requested plan; continue through remaining authorized work unless the user requested that stopping point or a concrete blocker prevents further authorized work. If specified work is complete but a measured acceptance target fails, investigate and pursue supported in-scope fixes. Report implementation and acceptance separately; the failed target alone does not authorize open-ended changes. Persist a plan file only when explicitly asked.
- When a test-suite health assessment establishes actionable findings and the same request already authorizes remediation, begin only that bounded work here, including in the same turn without repeated approval. Use debugging instead when a concrete failure still needs root-cause diagnosis. The health skill does not own edits.
- Repository-wide documentation reconciliation remains with its directly requested specialist. Direct bounded documentation edits remain here.

## Optional Delegation

Use a bundled agent only when the user requests delegation or a cleanly bounded slice has a material benefit by reducing parent context, enabling useful parallel work, or adding independent review. Otherwise complete the workflow in the parent.

Use `faye_coding_assistant` only for a bounded implementation slice with explicit write authority. If it is unavailable, implement directly in the parent without substituting an unrelated agent.

## Output

```text
Changed:
- path: behavior summary

Verified:
- command: result

Notes:
- risk, skipped check, or follow-up that matters
```
