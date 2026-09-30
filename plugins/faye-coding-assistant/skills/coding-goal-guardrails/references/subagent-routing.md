# Subagent Routing

Use subagents as bounded sidecars. They should reduce context load, provide an independent check, or process noisy material. They must not own the whole goal.

## Use Authority-Boundary Agents

Select the focused skill matching the current requested outcome before delegating. That skill owns the workflow contract; the agents below enforce a bounded read or write authority boundary and do not replace skill selection.

- Use `faye_coding_analyst` for bounded read-only exploration, diagnosis, general or phased review, change, refactor or verification planning, test-suite health, and bounded handoff synthesis.
- Use `faye_coding_assistant` only for bounded implementation or fix work with explicit write authority. Supporting investigation and verification may occur inside that assignment but cannot enlarge its outcome or ownership.
- Read-only analysis agents do not delegate write work. For exploration, diagnosis, review, requested change or refactor planning, verification planning, or test-suite health that precedes already-authorized execution, they return the analytical result first, then let the parent route the bounded work in the same turn through the appropriate implementation or debugging workflow. Do not require an intermediate checkpoint, repeat approval already granted, or proceed from an unsupported concern.
- For explicit large-source-file token estimation or inventory analysis, invoke `$source-file-token-estimation`; that skill may use its optional read-only agent when bounded delegation helps.
- Only when the current request asks for a coding `/goal` milestone, status, or completion report, invoke `$report-coding-goal-progress`; that skill owns formatting the authoritative snapshot and any reporter use. Do not invoke it automatically at a checkpoint or lifecycle transition.
- Consider `faye_goal_fresh_review` for an independent read-only completion review when the triggers below materially improve confidence.

## Good Side Tasks

Use read-only side agents for:

- Repo mapping over a large unfamiliar area.
- Plan critique before a risky multi-step change.
- Noisy test/build/log triage.
- Documentation or API lookup summaries.
- Risk scans around security, migrations, generated files, or broad refactors.
- Fresh review before final handoff.

Avoid subagents when:

- The task is small enough to keep in the parent thread.
- The subagent would need unclear ownership or broad write access.
- The subagent would duplicate the parent thread's immediate next action.
- The output cannot be checked against files, commands, or other evidence.

## Fresh Review Agent

Use `faye_goal_fresh_review` when at least one concrete review trigger exists: a broad or risky diff, a sensitive boundary, failed or materially skipped checks, unclear user-edit preservation, or conflicting completion evidence. Do not require it merely because a goal touched multiple files or reached its final handoff.

Recommended handoff:

```yaml
faye_goal_fresh_review_request:
    goal:
        objective: concise objective
        done_condition: expected completed state
        non_goals:
            - known boundary
    git:
        branch_before: name or unknown
        branch_after: name or unknown
        commits:
            - hash or none
        dirty_status: concise status
    changed_files:
        - path: reason
    validation:
        run:
            - command: result
        not_run:
            - command or check: reason
    review_focus:
        - contract compliance
        - regression risk
        - missing validation
        - user-owned edit preservation
```

The agent returns one classified findings list followed by a verdict. If there are no issues, it says `No actionable findings`. A missing test is blocking only when required behavior or a material regression lacks credible evidence.

## Parent Responsibilities

The parent thread owns:

- User communication.
- Delegation boundaries, cross-scope decisions, and final acceptance of workspace changes.
- Branches, staging, commits, and goal status.
- Final decisions after subagent findings.
- The concise final goal handoff. A separately requested portable continuation package belongs to `$coding-handoff`; task selection and delivery remain parent-owned.

The `faye_coding_assistant` may use tools and change files only for delegated implementation or fix work inside its ownership scope. Explicit `write_authority` controls new delegations. For legacy delegations that omit it, an unambiguous request to implement, modify, or fix authorizes those bounded changes; ambiguous, diagnostic, review, or planning requests remain read-only and belong with `faye_coding_analyst`. The parent reviews all returned work before accepting it.

Subagent outputs are evidence and advice, not automatic permission to change scope, add work, or mark the goal complete. The reporter formats supplied facts; the fresh reviewer may assess them, but neither owns the goal lifecycle.
