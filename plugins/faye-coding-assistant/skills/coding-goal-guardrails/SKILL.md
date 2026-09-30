---
name: coding-goal-guardrails
description: Use for a new multi-step coding /goal, explicitly resuming an interrupted, paused, or blocked goal, or a guardrails request; not for ordinary active-goal continuation, validation, milestones, or final reporting.
---

# Coding Goal Guardrails

Keep the run scoped, observable, git-conscious, and evidence-checked without replacing normal implementation judgment. Once the goal has established these guardrails, do not re-invoke the skill for routine turns inside the same active run.

This skill belongs to the Faye Coding Assistant plugin. It must not absorb codebase exploration, change planning, implementation, debugging, review, refactor or verification planning, test-suite health, or ordinary coding handoff behavior. Those outcomes belong to the plugin's focused skills and remain independently selected from the current request. An active goal does not automatically invoke them.

## Core Posture

- Guardrail the goal; do not micromanage the implementation.
- Keep process light enough that small coding goals are not slowed down.
- Keep objective, scope, done condition, lifecycle state, authorization, and final acceptance with the parent goal workflow.
- Make git state visible before meaningful edits.
- Preserve user edits and avoid destructive git operations.
- Use one lightweight ledger, not a suite of process documents.
- Route bounded side tasks to subagents only when they reduce context load or improve independent review.
- Never claim completion without evidence or explicit not-run notes.

## Responsibility Boundaries

- The normal coding workflow produces implementation and validation evidence.
- The ledger records authoritative facts and decisions; it does not reassess scope, status, or completion.
- The progress reporter formats the parent-owned snapshot and may flag conflicting input; it does not investigate or create findings.
- Fresh review independently checks the stated done condition and supplied evidence. Its findings are advice until the parent accepts them.
- Final handoff renders the parent-accepted state instead of reopening review.

## Reference Loading

- Read `references/git-handling-policy.md` before creating or switching branches, staging files, or committing.
- Read `references/goal-ledger-template.md` when a goal is long-running, multi-step, resumed after compaction, or needs durable observability.
- Read `references/subagent-routing.md` before delegating side work or using the bundled `faye_goal_fresh_review` agent.
- Read `references/handoff-template.md` before final handoff or goal completion.
- Read `references/anti-overlap.md` when scope overlaps the focused coding skills, Codex utility, or GitHub workflows.

## Workflow

1. Gate the request. Confirm the current turn creates a new multi-step coding `/goal`, explicitly resumes or reopens a previously interrupted, paused, or blocked coding goal, or directly asks to establish its guardrails. If this is an ordinary continuation inside an active goal, or the goal is not coding-focused, do not use this skill.

2. Establish the goal basics. Keep the objective, constraints, validation signal, non-goals, and stop condition visible. Ask only when ambiguity would make implementation unsafe or untestable.

3. Inspect state before edits. Read project instructions, relevant manifests, and the current git status. Treat pre-existing changes as user-owned unless the user explicitly says otherwise.

4. Keep coding outcomes separate. When its narrow trigger matches the current request, use only the relevant focused skill: `$codebase-exploration`, `$repository-change-planning`, `$repository-implementation`, `$repository-debugging`, `$code-review`, `$phase-implementation-review`, `$refactor-planning`, `$verification-planning`, `$test-suite-health`, or `$coding-handoff`. Do not invoke all focused skills merely because this guardrail is active.

5. Maintain lightweight observability. Keep a compact ledger with current status, changed files, validation, parent decisions, subagent findings, git state, and resume summary. Record facts without deriving new scope or lifecycle state. Use a durable file only when the goal is long-running or likely to span sessions. If this skill chooses a fallback path, use `.faye/state/faye-coding-assistant/coding-goal-guardrails/`. Use `$report-coding-goal-progress` only when the current request asks for a milestone, status, or completion report. Do not invoke it automatically at implementation or validation checkpoints, blocked transitions, or goal completion.

6. Apply git intentionally. Inspect and report git state automatically. Create branches only when pre-authorized with `git: branch` or after asking. Create milestone commits only when pre-authorized with `git: milestone commits` or after asking.

7. Use subagents sparingly. Use read-only side agents for repo mapping, plan critique, noisy log triage, documentation/API lookup, risk scanning, or fresh review. Use `faye_coding_analyst` for bounded read-only coding analysis and `faye_coding_assistant` only for bounded implementation or fix work with explicit write authority. Subagents do not own the whole goal. Review findings do not change scope or completion until the parent accepts them.

8. Handoff cleanly. Render the parent-accepted outcome and distinguish changed files, validation passed/failed/not run, git branch/status, commits if any, remaining risk, and the next action or stop reason. Do not conduct another review here.

## Preauthorization Phrases

Recognize these phrases in the user goal or latest instruction:

- `git: branch` grants permission for branch creation or use when useful and safe; it does not require a new branch.
- `git: milestone commits` means coherent verified milestone commits may be created when safe.
- `git: branch + milestone commits` means both are allowed when safe.
- `git: no branch` means do not create or switch branches.
- `git: no commits` means do not commit.

Natural-language permission is equivalent when explicit. A direct instruction to create a branch or commit verified milestones requires that action when safe, rather than merely granting optional permission.

## Completion Standard

Do not mark a goal complete unless the done condition has actually been met and the final handoff includes validation evidence or honest skipped-check notes. Use `blocked` only when the authoritative goal lifecycle rules permit it; otherwise report the concrete obstacle while the goal remains active.

## Project-local storage

Before managed writes or runtime setup, read `../../references/workspace-storage.md` from this skill folder. Use host tools for instruction-only setup; no new runtime is needed for notes or screenshots. Pass the active absolute `workspace_root` and a fresh task-session ID to child workflows. Image launchers require `FAYE_WORKSPACE_ROOT` and accept `FAYE_SESSION_ID` for cached setup validation.

Existing authorization applies to the exact Git action and known state; consult `references/git-handling-policy.md` before asking again solely because files are dirty. Unresolved ownership, effects, and explicit approval-first boundaries still require resolution.
