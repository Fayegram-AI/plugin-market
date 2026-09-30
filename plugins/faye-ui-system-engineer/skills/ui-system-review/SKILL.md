---
name: ui-system-review
description: Audit or review browser UI source, diffs, components, and system contracts for architecture, state ownership, accessibility implementation, and consistency. Exclude rendered-only inspection, visual-direction proposals, and general non-UI code review.
---

# UI System Review

Establish actionable findings from the named UI source or change. Keep the review read-only unless fixes are also requested.

## Review The Evidence

1. Read [ownership and scope](../../references/ownership-and-scope.md), [web platform](../../references/web-platform.md), and the relevant [web profile](../../references/web-profiles.md). Bound the review to the requested source, consumers, and behavior.
2. Use [audit workflow](../../references/audit-workflow.md) and [verification](../../references/verification.md) to trace each concern to its owner and user impact. Inspect dependencies and consumers when needed to confirm a finding, not to expand into a general repository audit.
3. Load [public API contracts](../../references/public-api-contracts.md) for component/module boundaries, [system architecture](../../references/system-architecture.md) for layer ownership, and [state architecture](../../references/state-architecture.md) for state, async, persistence, or lifecycle concerns. For visual consistency, read [visual language](../../references/visual-language.md); for shared tokens, themes, variants, density, or overrides, use [visual foundations](../../references/visual-foundations.md). For controls or screen behavior, use [UI usability](../../references/ui-usability.md) with the platform guidance. Separate what source establishes from unobserved rendering.
4. Optionally run the read-only source scanner:

   ```text
   node <plugin-root>/scripts/audit-ui-system.mjs --root <project-path> --scope <path> --format json
   ```

   Read [scanner rules](../../references/scanner-rules.md) before interpreting individual rules. Findings are heuristic leads; diagnostics describe coverage. Confirm important leads in source and runtime where available.
5. If rendered or interaction evidence is needed, use the sibling `ui-inspection` workflow. Do not claim live failures from static patterns.

## Report And Continue

Lead with supported findings ordered by impact. For each, identify the source location, trigger or affected state, evidence, user consequence, and bounded correction with a useful recheck. Group confirmed shared causes rather than repeating their symptoms. Separate defects, design preferences, and unverified risks. State coverage and limitations even when no actionable findings are found.

For requested fixes, establish findings first and continue with `ui-system-implementation` within the authorized scope. An independent second assessment may use the optional [UI reviewer](../../references/reviewer.md) when delegation is available and authorized; it is not a mandatory review stage. Follow [evidence storage](../../references/evidence-storage.md) for captures and requested reports.
