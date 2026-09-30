---
name: repository-change-planning
description: "Use for a requested repository change plan: create, assess, or materially revise it, including before authorized execution. Exclude briefings, accepted-plan execution, incidental planning, and refactor/verification-only plans. Planning does not edit."
---

# Repository Change Planning

Create, assess, or propose material revisions without changing repository files. This skill does not execute the plan.

## Steps

1. Define the requested behavior, constraints, non-goals, and acceptance conditions.
2. Inspect only the repository instructions, ownership, contracts, and dependencies needed to ground the plan.
3. Separate confirmed repository facts from unresolved product or design decisions.
4. Sequence the smallest coherent implementation stages and identify material compatibility, data, configuration, or rollout dependencies. For phased plans, prefer "Phase completion criteria" over "Exit". These define readiness for the next authorized phase, not a pause or whole-plan completion. Identify required pauses or approvals separately.
5. Place proportionate verification at meaningful risk boundaries rather than after every plan step.
6. Finish planning when the plan is actionable and its remaining decisions are explicit.

## Rules

- Keep supporting repository reads inside this workflow. Do not add `$codebase-exploration` unless a repository map or trace is a separately requested deliverable.
- When new or changed behavior is primary, retain ownership even if the plan includes an incidental refactor. When restructuring, migration, renaming, or behavior preservation is primary, use `$refactor-planning` instead.
- `$verification-planning` is a separate, non-automatic skill for a standalone test, coverage, command, or manual-QA plan. Do not invoke it merely because a change plan includes proportionate verification.
- Do not turn an implementation request into a separate planning deliverable. If implementation is primary and planning is only a supporting step, keep it with `$repository-implementation`.
- A briefing, summary, status question, or next-step discussion about an accepted plan does not activate this skill.
- When partial implementation reveals a material constraint during requested replanning, revise the remaining work. Treat completed implementation, including completed phases of ongoing work, as planning context, not as an automatic code-review target.
- Remain read-only. When the same request asks to persist or execute the plan, establish and preserve the requested plan before any edit. The parent may then continue in the same turn through bounded `$repository-implementation` under the user's existing authorization, without an artificial checkpoint or repeated approval. This skill neither edits nor automatically invokes the implementation workflow.
- Stop after the plan when planning is the only requested outcome or the user asks to approve it before execution.
- Do not prescribe a new test for every stage. Use existing evidence where it is sufficient and identify only material verification gaps.

## Optional Delegation

Use a bundled agent only when the user requests delegation or a cleanly bounded slice has a material benefit by reducing parent context, enabling useful parallel work, or adding independent review. Otherwise complete the workflow in the parent.

Use `faye_coding_analyst` in `change_plan` mode only for a bounded read-only planning slice. If it is unavailable, prepare the plan in the parent.

## Output

Keep single-stage plans brief and use only as many phases as the work needs. Expand substantive phases as below, including prerequisites and boundaries only where they affect sequencing or ownership. Keep shared constraints, exclusions, and whole-plan acceptance at plan level, not repeated per phase.

```text
Outcome:
- requested behavior, shared constraints and exclusions, and whole-plan acceptance

Repository facts:
- relevant ownership, contract, or dependency

Plan:
- ordered phase: deliverable, affected scope, and observable completion criteria
- material prerequisites or boundaries, and verification at meaningful risk points

Decisions and risks:
- unresolved decision, dependency, or material risk
```
