---
name: report-coding-goal-progress
description: Use for a requested milestone, status, or completion report from an authoritative active, blocked, or just-completed coding /goal snapshot; not for automatic checkpoints, plan briefings, or general project status.
---

# Report Coding Goal Progress

Produce a small status snapshot using facts and decisions already owned by the parent goal workflow. Format a trivial milestone or completion report directly. Use the bundled read-only `faye_goal_reporter` at plugin-relative path `agents/faye-goal-reporter.toml` for richer milestone or completion snapshots with several material fields that benefit from organization or an input-consistency check.

## Workflow

1. Confirm the goal context.
   - Confirm the current request asks for a coding `/goal` milestone, status,
     or completion report. Do not use this skill for an unsolicited checkpoint
     report or an ordinary implementation-plan briefing.
   - Read the authoritative goal state with `get_goal` or the runtime's
     equivalent goal-status tool to gate the report and capture its objective.
   - Require an active, blocked, or just-completed goal snapshot. Do not create
     a goal merely to make a report.
   - If no qualifying goal exists, stop with one short sentence.

2. Select the checkpoint.
   - Use `milestone` when the current request asks for progress or status from
     an active or blocked coding goal.
   - Use `completion` when the current request asks for a final or completion
     report and the parent goal workflow has established that the done condition
     is satisfied. The reporter does not make that decision.
   - Do not invoke or rerun this skill automatically after implementation or
     validation checkpoints, course corrections, blocked transitions, or goal
     completion.
   - Leave goal creation, completion, blocking, pausing, and resuming to the
     parent goal workflow.

3. Collect only the evidence needed for the snapshot.
   - Capture the objective, goal status, exact tokens used, configured budget
     and remaining tokens when the goal tool provides them.
   - Summarize completed, current, and remaining work plus stated scope
     boundaries, constraints, or non-goals from the existing context, plan, or
     ledger.
   - For a richer report or an explicit question about position, capture the
     authoritative current stage name or index and total, completed high-level
     stages, all remaining high-level stages in order, and next checkpoint when
     the parent plan, ledger, or supplied goal context provides them.
   - Include validation results, parent-accepted blockers or risks, relevant git
     state, and the parent's alignment assessment. Use `not_assessed` when the
     parent has not made one.
   - Do not infer absent stages, reconstruct goal history, investigate the
     repository, or derive missing work for the report. Resolve report facts in
     the parent workflow before asking the reporter to format them.

4. Choose the lightest formatting path.
   - Format a simple milestone or completion report directly when the snapshot
     has only a few uncontested facts.
   - Ask `faye_goal_reporter` to format a richer milestone or completion
     snapshot with several material progress, validation, risk, git, alignment,
     or usage fields, or when the user explicitly requests delegation.
     A completion label alone does not justify delegation. Pass compact summaries
     and exact evidence, not full logs or large diffs.

Read [references/reporter-handoff.md](references/reporter-handoff.md) only when preparing the delegated report.


5. Check the returned report before presenting it.
   - Keep exact command results unchanged. Replace goal-usage values only with
     newer values from the authoritative goal state.
   - Remove unsupported additions, duplicate points, and empty sections.
   - If the reporter returns `Input inconsistency`, correct the supplied facts
     and rerun it. When the conflict cannot be resolved, present the conflict
     directly instead of selecting or inventing a value.
   - Refresh the authoritative goal state after synthesis and render `Usage`
     from that latest snapshot. For a just-completed goal that is no longer
     returned by `get_goal`, use the successful completion result supplied by
     the parent workflow. Label unavailable fields instead of carrying forward
     an older value.
   - If the bundled agent is unavailable, apply the same formatting and
     consistency contract in the parent instead of substituting another agent.

## Presentation

- For a direct trivial milestone or completion report, use one short heading and three to five bullets. Include `Goal`, `Status`, and exact `Usage`; add only the progress, evidence, or next-action facts that matter.
- For a reporter-formatted result, preserve its concise shape after the authoritative checks above. Do not create a second summary.
- Use optional `Position` and `Horizon` fields for a richer snapshot or an explicit position request when authoritative stage data is supplied. `Position` identifies the current stage; `Horizon` retains all supplied remaining high-level stages in order. Do not force either field into a trivial report.
- Never estimate token usage. Write `unavailable` when the authoritative goal snapshot lacks it.
- Avoid decorative tables, banners, chronology, and full change logs.
