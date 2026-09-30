# Reporter Handoff

Read only when preparing a richer report or explicitly requested delegation. The parent supplies authoritative facts; missing fields are not an invitation to investigate or invent them.

```yaml
faye_goal_reporter_request:
    report_kind: milestone | completion
    goal_snapshot:
        objective: exact goal objective
        status: exact value from the goal snapshot
        tokens_used: exact value from the goal tool
        token_budget: exact value or not_set
        tokens_remaining: exact value or not_available
    checkpoint:
        done_condition: concise completion condition
        scope_boundaries:
            - relevant constraint or non-goal, when available
        position:
            stage_name: exact current stage name, when available
            stage_index: exact current stage index, when available
            stage_total: exact total stage count, when available
        completed:
            - completed step or deliverable
        completed_high_level:
            - completed high-level stage, when useful
        current:
            - current step, if any
        remaining:
            - immediate remaining step, if any
        remaining_high_level:
            - every supplied remaining high-level stage in order, when useful
        next_checkpoint: next authoritative checkpoint, when available
    evidence:
        validation:
            - command or check and result
        changed_scope:
            - relevant file or behavior summary
        git_state: concise branch and worktree state, when relevant
        blockers_or_risks:
            - evidence-backed concern
        alignment:
            state: aligned | concern | not_assessed
            explanation: optional parent-owned explanation
```
