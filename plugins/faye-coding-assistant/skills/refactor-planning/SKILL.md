---
name: refactor-planning
description: Use for a requested restructuring or compatibility migration plan, including before authorized execution; not when new behavior is primary or for verification-only planning. The planning stage does not edit.
---

# Refactor Planning

This is a read-only planning workflow. It does not edit the repository or implement the refactor.

## Steps

1. Define the refactor goal: which observable behavior and public contracts remain stable, which structural or compatibility changes are intentional, and what becomes easier, safer, or clearer.
2. Map current ownership, call sites, exports, tests, data contracts, and runtime entry points.
3. Identify compatibility constraints and migration risks.
4. Split the refactor into reviewable steps with verification gates at meaningful risk boundaries rather than after every mechanical edit. For phased plans, prefer "Phase completion criteria" over "Exit". These define readiness for the next authorized phase, not a pause or whole-plan completion. Identify required pauses or approvals separately.
5. Choose whether to preserve old APIs temporarily, add adapters, or migrate all call sites in one pass.
6. Call out rollback points and sequencing dependencies.

## Rules

- Preserve observable behavior and public contracts unless the requested refactor explicitly includes a compatibility migration.
- New product behavior belongs to `$repository-change-planning` when it is primary and restructuring is incidental.
- Keep renames, movement, and logic changes separate when practical.
- Add abstractions only when they remove real complexity or match an established local pattern.
- Identify the cheapest existing evidence that proves preserved behavior without duplicating coverage. `$verification-planning` is a separate, non-automatic skill for a user-requested test or verification plan; do not invoke it merely because a refactor plan mentions tests or verification is uncertain.
- Direct refactor execution without a separately requested planning deliverable belongs to `$repository-implementation`.
- When one request explicitly asks for both a plan and execution, establish and preserve the read-only plan first. Present it before editing when the user asks to see it first. The parent may then continue in the same turn through bounded `$repository-implementation` under the user's existing write authorization, without an artificial checkpoint or repeated approval.
- This planning skill never edits files or automatically invokes an implementation workflow. Stop after the plan when planning is the only requested outcome or the user asks to approve it before execution.
- If the requested deliverable is only a test, coverage, command, or manual-QA plan for a refactor, keep that outcome with verification planning.

## Optional Delegation

Use a bundled agent only when the user requests delegation or a cleanly bounded slice has a material benefit by reducing parent context, enabling useful parallel work, or adding independent review. Otherwise complete the workflow in the parent.

Use `faye_coding_analyst` in `refactor_plan` mode only for a bounded read-only planning slice. If it is unavailable, prepare the plan in the parent.

## Output

Describe the structural or compatibility outcome, such as module moves or splits, API renames, migrations, duplication removal, shared-logic consolidation, or architecture cleanup.

Keep single-stage plans brief and use only as many phases as the work needs. Expand substantive phases as below, including prerequisites and boundaries only where they affect sequencing or ownership. Keep shared constraints, exclusions, and whole-plan acceptance at plan level, not repeated per phase.

```text
Goal:
- refactor outcome, shared constraints and exclusions, and whole-plan acceptance

Current shape:
- key modules, contracts, and call sites

Plan:
- ordered phase: deliverable, affected scope, and observable completion criteria
- material prerequisites or boundaries, and verification at meaningful risk points

Risks:
- compatibility, sequencing, or test gaps
```
