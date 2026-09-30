# Goal Ledger Template

Use one lightweight ledger for observability. Keep it inline in the conversation for short goals. Use a durable file only when the goal is long-running, multi-session, high-risk, or likely to survive context compaction.

The ledger records parent-owned facts and decisions. It does not independently determine scope, lifecycle status, blockers, or completion.

If this skill chooses a fallback durable path, write under:

```text
.faye/state/faye-coding-assistant/coding-goal-guardrails/
```

## Ledger Shape

```text
Goal:
- Objective:
- Done condition:
- Non-goals:
- Validation signal:
- Stop condition:

Git:
- Initial branch:
- Initial status:
- Branch authorization:
- Commit authorization:
- Pre-existing user edits:

Progress:
- [time/order] action, result, next step

Changed Files:
- path: reason, goal-owned/user-owned/mixed

Validation:
- command/check: passed | failed | not run | not applicable
- evidence:
- what it proves:

Decisions:
- decision: rationale, tradeoff, date/order

Subagents:
- agent/task: finding, uncertainty, next action

Resume Summary:
- current state:
- remaining work:
- next safest action:
- risks:
```

## Rules

- Keep entries short and factual.
- Update after meaningful scope changes, implementation milestones, validation results, git actions, subagent returns, and handoff.
- Do not preserve noisy command logs in full unless they are needed for debugging. Summarize and point to a saved artifact only when necessary.
- Separate facts from inference.
- Record alignment, blockers, risks, and completion state as parent decisions or attributed findings rather than silently promoting them.
- Use relative paths in repository notes.
- Do not create multiple process documents unless the user explicitly asks for a fuller audit trail.
