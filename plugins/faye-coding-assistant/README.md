# Faye Coding Assistant

Faye Coding Assistant is a Codex plugin package for focused, evidence-first
repository skills, separated read-only and write-capable coding delegation,
lightweight coding goal guardrails, authoritative progress reporting, bounded
fresh review, focused documentation reconciliation, and explicit read-only
source-file token estimation.

## Identity

- Stable plugin ID: `faye-coding-assistant`
- Display name: `Faye Coding Assistant`
- Version: `0.1.0-beta.7`
- Publisher: [Fayegram](https://fayegram.com)
- Publishing team: `Fayegram`
- Legal owner: `Semicolon, LLC`
- Website: [Faye Plugin Market](https://plugin-market.fayegram.com)
- Repository: [plugin-market](https://github.com/Fayegram-AI/plugin-market)

## Contents

```text
<plugin-root>/
    .codex-plugin/plugin.json
    .grok-plugin/plugin.json
    plugin.json
    LICENSE
    FAYEGRAM_ASSETS.md
    agents/faye-coding-analyst.toml
    agents/faye-coding-assistant.toml
    agents/faye-goal-fresh-review.toml
    agents/faye-goal-reporter.toml
    agents/source-file-token-estimator.toml
    assets/icon.png
    references/review-contract.md
    references/workspace-storage.md
    scripts/lib/git-file-discovery.mjs
    scripts/lib/repository-paths.mjs
    scripts/lib/workspace-storage.mjs
    skills/coding-goal-guardrails/
        SKILL.md
        agents/openai.yaml
        references/anti-overlap.md
        references/git-handling-policy.md
        references/goal-ledger-template.md
        references/handoff-template.md
        references/subagent-routing.md
    skills/code-review/
        SKILL.md
        agents/openai.yaml
    skills/phase-implementation-review/
        SKILL.md
        agents/openai.yaml
    skills/codebase-exploration/
        SKILL.md
        agents/openai.yaml
    skills/repository-change-planning/
        SKILL.md
        agents/openai.yaml
    skills/coding-handoff/
        SKILL.md
        agents/openai.yaml
    skills/refactor-planning/
        SKILL.md
        agents/openai.yaml
    skills/repository-debugging/
        SKILL.md
        agents/openai.yaml
    skills/repository-implementation/
        SKILL.md
        agents/openai.yaml
    skills/verification-planning/
        SKILL.md
        agents/openai.yaml
    skills/test-suite-health/
        SKILL.md
        agents/openai.yaml
    skills/report-coding-goal-progress/
        SKILL.md
        agents/openai.yaml
        references/reporter-handoff.md
    skills/reconcile-repository-docs/
        SKILL.md
        agents/openai.yaml
        scripts/check-document-references.mjs
        scripts/lib/document-discovery.mjs
        scripts/lib/markdown-references.mjs
        scripts/lib/reference-validation.mjs
    skills/source-file-token-estimation/
        SKILL.md
        agents/openai.yaml
        scripts/lib/analysis-options.mjs
        scripts/common-workspace-analysis.mjs
        scripts/lib/workspace-discovery.mjs
        scripts/source-file-token-estimate.mjs
        scripts/workspace-file-inventory.mjs
```

The private `scripts/lib/` modules centralize cross-platform repository-path
operations and Git-visible file discovery. Each consuming skill retains its own
file filters, filesystem fallback policy, and domain behavior. The scripts use
Node.js built-ins only. Their workflows remain independently invoked, but the
scripted skill entrypoints require the complete plugin package because they
import these private shared modules.

## Included Skills

The general coding surface is split into ten independent skills:

- `$codebase-exploration` answers directly requested repository-understanding
  questions, including ownership, execution or data flow, dependencies, and
  pre-change impact analysis. Exact trigger verbs are not required. Plan or
  status briefings, planning, concrete-failure debugging, review, test-suite
  health, and handoff do not activate it when repository reads only support
  that owning workflow.
- `$repository-change-planning` creates, assesses, or proposes material
  revisions to repository-backed implementation plans when planning is the
  requested outcome, including revision of remaining work after partial
  implementation reveals a material constraint. It remains read-only, does
  not execute plans, and excludes plan briefings, approved-plan execution,
  refactor-only plans, and verification-only plans. A requested plan may
  precede already-authorized parent implementation in the same turn.
- `$repository-implementation` handles direct, bounded code, configuration,
  test, documentation, script, frontend, backend, or extension changes when
  implementation is requested, including accepted-plan execution, its
  embedded self-review, and remediation after review or suite assessment.
- `$repository-debugging` owns concrete test, build, type, lint, runtime, CI,
  regression, command, or behavior-failure diagnosis and requested fixes.
  A repair request does not need to separately ask for diagnosis. Applying an
  already-established correction needs no new debugging investigation.
- `$code-review` performs general review of named diffs, patches, branches,
  PRs, changed files, modules, subsystems, and implementation quality outside
  an identifiable phased implementation. It establishes findings without
  editing before any authorized remediation.
- `$phase-implementation-review` performs current-phase, cumulative, or final
  review only when the current request makes review of an identifiable phased
  implementation a deliverable. Review and validation already included in an
  accepted plan remain nonterminal `$repository-implementation` self-review.
- `$refactor-planning` maps and sequences repository restructuring or
  compatibility migrations, including module moves or splits, API renames,
  duplication removal, shared-logic consolidation, and architecture cleanup.
  It is read-only and never implements the plan. New product behavior remains
  with change planning when it is primary. Direct execution belongs to
  `$repository-implementation`; an explicitly requested plan may precede that
  authorized parent stage in the same turn.
- `$verification-planning` recommends proportionate tests, coverage, commands,
  or manual QA when verification planning is a requested deliverable.
  It does not run proposed commands or edit tests; authorized test
  edits remain bounded `$repository-implementation` work and may follow the
  recommendation in the same turn.
- `$test-suite-health` performs read-only suite-wide assessment of material
  execution cost, flakiness evidence, overlapping coverage, isolation, and
  maintainability, even when one command runs the suite. Specific failure or
  slowdown diagnosis, change-specific verification, named test-code correctness
  review, and test edits keep their existing owners. Supported findings may
  precede authorized parent remediation in the same turn.
- `$coding-handoff` drafts requested PR descriptions, implementation notes,
  migration notes, release handoffs, incident follow-ups, and portable context
  for another coding task or session from supplied facts or a named branch,
  diff, commit, or file set. Missing facts may be collected only through bounded
  read-only inspection of that surface; the workflow does not run fresh
  verification, diagnose, review, or broadly explore merely to populate the
  artifact. It prepares content but does not manage or deliver to another task.
  Ordinary status, plan, completion, and next-step responses stay in the parent
  workflow.

These skills remain implicitly discoverable through narrow current-request
descriptions. They do not route through a shared skill or automatically invoke
one another. Review, requested change or refactor planning, verification
planning, and test-suite health establish their analytical result without
editing. When the same request already authorizes bounded execution, the parent
may continue under implementation or debugging in the same turn and provide one
combined final response; no artificial checkpoint or repeated approval is
required. Analysis-only or approval-first requests stop before edits, and
unsupported concerns do not trigger remediation. Exploration may accompany
another focused skill only when the current request separately asks for
repository explanation or impact analysis.
Goal guardrails may accompany the primary outcome skill only when a multi-step
coding `/goal` is created or explicitly resumed or reopened from an interrupted,
paused, or blocked state.

Change and refactor plans keep single-stage work brief; substantive phases
identify deliverables, affected scope, observable completion criteria, and
material sequencing or ownership boundaries. Shared constraints and acceptance
stay at plan level. Phase completion means readiness for the next authorized
phase, distinct from whole-plan completion and required pauses or approvals.

The bundled `faye_coding_analyst` remains the shared read-only helper for
bounded exploration, diagnosis, review, change, refactor or verification
planning, test-suite health, and bounded handoff synthesis. Review leads with
confirmed findings while preserving material open questions and test gaps;
refactor and verification modes retain their distinct planning outputs. Simple
handoffs stay in the parent unless the user requests delegation; otherwise
handoff delegation is reserved for substantial, bounded evidence synthesis that
materially reduces parent context, and it cannot introduce review or new
investigation.
The compatible `faye_coding_assistant` remains the shared write-capable helper
for bounded authorized implementation or fixes. The focused skill owns the
workflow; the agent enforces the read or write authority boundary. If a bundled
agent is unavailable, follow the selected skill directly in the parent instead
of substituting an unrelated agent.

`$coding-goal-guardrails` is the lightweight guardrail skill for
coding-focused Codex `/goal` runs.

Use it when the current turn creates a new multi-step repository coding goal,
explicitly resumes or reopens an interrupted, paused, or blocked goal, or
directly asks for those guardrails. Do not invoke it for ordinary continuation
turns inside an active goal. The parent goal workflow remains the authority for
scope, lifecycle state, and final acceptance.

The bundled `faye_goal_fresh_review` subagent is optional read-only review
support when a broad or risky diff, sensitive boundary, material validation
gap, user-edit concern, or conflicting evidence warrants an independent pass.
Its findings are advice to the parent and do not redefine the goal or its
lifecycle.

`$report-coding-goal-progress` is the concise reporting skill for an active or
blocked coding-focused Codex `/goal`, or its just-completed final report.

Use it only when the current request asks for a milestone, status, or completion
report from an authoritative goal snapshot. Do not invoke it automatically at
implementation or validation checkpoints or lifecycle transitions. The parent
formats trivial snapshots directly; the Luna-based `faye_goal_reporter` is a
read-only, formatting-focused editor for richer milestone or completion snapshots
that benefit from consistency checks, or for explicitly requested delegation.
A completion label alone does not require delegation. Rich reports or explicit position
questions can show the supplied current stage and full remaining high-level
horizon; trivial reports stay brief. The reporter preserves supplied facts and
flags direct conflicts without inferring stages, investigating, or changing
goal state.

`$reconcile-repository-docs` is the focused repository-wide documentation
maintenance and finalization skill.

Use it when the current request directly asks for repository-wide
reconciliation after development or before release, when maintained
documentation, development records, organization, and affected references need
to be aligned with the supported repository state. It classifies stale and
historical material before changing it, treats generated docs and instruction
files deliberately, and commits only when requested. Ordinary single-document
edits remain outside this skill's scope. It does not require a bundled agent.
When repository-wide reference integrity or documentation moves require it and
no adequate project validator exists, the skill can use its bundled read-only
Markdown reference checker. The checker validates supported local file
destinations without checking external URLs or deciding documentation status.

`$source-file-token-estimation` is a read-only skill that runs only on explicit
requests to estimate the approximate token footprint of large script/source-
like files or compare hypothetical line-chunk splits. It scans non-ignored
files, classifies production/test/debug scripts, and uses the rough `bytes / 4`
proxy. It does not measure actual Codex usage, billing, or monetary cost. Its
bundled `source_file_token_estimator` subagent is read-only and must not modify
the workspace. Only the parent saves a report to an explicit user destination;
for `.faye/` output, it passes the active absolute project root through
`FAYE_WORKSPACE_ROOT`, independently of the directory selected for scanning.

## Licensing

The plugin software and documentation are licensed under the MIT License. See
`LICENSE` for the complete terms and the required Semicolon, LLC copyright and
permission notice.

The Fayegram name, the Faye Coding Assistant name, and `assets/icon.png` are
identity assets outside the MIT grant. `FAYEGRAM_ASSETS.md` defines the limited
permission for authentic package display and unmodified redistribution.

This package license does not claim or change ownership of user prompts,
repositories, source files, generated files, reports, or other inputs and
outputs handled or created while using the plugin.

## Validation

From the marketplace repository root, run:

```powershell
npm run validate
```

This checks the distributed package structure, skill and agent metadata,
registry alignment, managed-file integrity, licensing boundaries, and forbidden
artifacts. It does not execute coding workflows or the development test suites.

## Workspace storage

Managed files use `.faye/` under the explicitly selected project. Read
`references/workspace-storage.md` for lazy Git protection, persistent versus
temporary storage, and seven-day cleanup on next use without scheduling.
Legacy `faye/` content is not migrated or removed.
