# Handoff Template

Use this shape for final coding goal handoff. Keep it concise and evidence based. Omit sections that are truly not applicable, but do not omit failed or skipped validation.

Render the outcome, scope, and evidence already accepted by the parent goal workflow. Do not use handoff preparation to reopen review or add requirements.

```text
Outcome:
- completed | partially completed | blocked
- concise result

Changed:
- path: behavior or responsibility changed

Git:
- branch before:
- branch after:
- branch created:
- commit mode:
- commits made:
- uncommitted changes:
- pre-existing user edits preserved:

Validated:
- command/check: passed | failed | not run | not applicable
- what it proves:

Subagents:
- agent/task: key finding or none used

Risks:
- residual risk or none known

Next:
- next action, user decision, or none

Resume:
- current state and next safest action if work continues
```

## Rules

- Never invent test results, commit hashes, branch names, or approvals.
- Mention checks that were intentionally skipped and why.
- Separate failed validation from not-run validation.
- If the goal is incomplete, say what remains and why work is stopping.
- Do not label an obstacle as `blocked` unless the authoritative goal lifecycle already has that status; otherwise use `partially completed` and state the stop reason.
- If commits were made, list short hashes and what each milestone covered.
- If the worktree remains dirty, distinguish goal-owned changes from pre-existing user edits whenever possible.
