---
name: coding-handoff
description: Prepare requested handoffs, including PR descriptions and continuation context, from supplied facts or bounded change evidence. Exclude ordinary status/completion/plan briefings, delivery, implementation, and independent diagnosis or review. Read-only.
---

# Coding Handoff

Work from supplied facts first. If material facts are missing and the user names a bounded change surface, collect only the read-only evidence needed from that surface, such as Git status, diffs, commit metadata, named files, and already-recorded validation evidence.

This is a read-only formatting and synthesis workflow that prepares transferable content. It does not deliver the handoff or manage coding tasks or sessions. Do not use it as an ordinary progress, status, completion, or next-step response layer.

## Steps

1. Identify the audience: user, future implementer, reviewer, release owner, or incident follow-up.
2. Summarize durable facts appropriate to the artifact. For continuation context, cover the objective, current state, completed work, remaining work, validation evidence, risks, and next safe resume action.
3. Include supplied or already-recorded commands and results when verification matters.
4. Separate completed work from recommended next steps.
5. Keep notes concise enough to paste into a PR, issue, continuation prompt, or operational handoff.

## Rules

- Mention files or modules by path when helpful.
- Do not invent test results, approvals, or deployment status.
- Do not run tests, builds, lint, type checks, or other fresh verification merely to populate a handoff. If the same request explicitly asks the parent to run a named check, the parent completes that bounded step before this workflow formats the recorded result.
- Do not diagnose failures, perform code review, or broadly explore the repository merely to fill evidence gaps.
- Never edit repository files. Identify unavailable verification, deployment, or other material facts explicitly instead of inferring them.
- Prepare handoff content only. Do not create, select, navigate to, or message another coding task or session. When the user separately requests delivery, the parent may use native task-management capabilities after the content is prepared; delivery remains outside this skill.
- Flag partial work explicitly.
- Keep speculative analysis under risks or next steps.
- Treat recommendations and next steps as non-authorizing; they do not enlarge the accepted scope or done condition.
- Avoid long chronology unless the user asks for an audit trail.

## Optional Delegation

Use `faye_coding_analyst` in `handoff` mode only when the user requests delegation or synthesizing a substantial, bounded evidence set materially reduces parent context. Otherwise complete the workflow in the parent. Keep simple PR descriptions, supplied-fact handoffs, and small continuation packages in the parent unless the user requests delegation. Delegation must follow the same evidence boundary and must not introduce independent review or new investigation.

## Outputs

Adapt the artifact to its audience: PR descriptions, implementation notes, migration notes, release handoffs, incident follow-ups, or portable continuation context for another coding task or session.

Implementation handoff:

```text
Changed:
- path: concise behavior summary

Verified:
- command: result

Risks:
- remaining concern or none known

Next:
- concrete follow-up, if needed
```

PR notes:

```text
Summary:
- user-facing or reviewer-facing change

Testing:
- commands and outcomes

Notes:
- migration, compatibility, rollout, or residual risk
```

Task or session continuation:

```text
Objective:
- intended outcome and relevant boundary

Current:
- present state and active work

Completed:
- durable completed work

Remaining:
- ordered high-level work still required

Evidence:
- recorded validation and relevant repository state

Risks:
- unresolved concern or unavailable fact

Resume:
- next safe action for the receiving task or session
```
