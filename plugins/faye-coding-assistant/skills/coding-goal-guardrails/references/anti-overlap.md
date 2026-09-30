# Anti-Overlap Rules

This skill is a guardrail layer, not a replacement for the plugin's focused coding skills.

## Defer To Focused Coding Skills

Use only the focused skill matching the current requested outcome:

- `$codebase-exploration`: directly requested repository ownership, flow, or impact mapping, not supporting reads for another outcome.
- `$repository-change-planning`: read-only creation, assessment, or material revision of a repository-backed feature or behavior-change plan, including remaining work after partial implementation. It does not own plan briefings or accepted-plan execution. A requested plan may precede authorized parent implementation in the same turn.
- `$repository-implementation`: authorized bounded changes, including accepted-plan execution and its embedded self-review. Internal review checkpoints are not separate phase-review deliverables or completion boundaries.
- `$repository-debugging`: concrete failures and root-cause analysis.
- `$code-review`: general review independent of phased implementation.
- `$phase-implementation-review`: current, cumulative, or final review of an identifiable phased implementation when the current request makes that review a deliverable.
- `$refactor-planning`: repository restructuring or compatibility migration planning. Primary new product behavior remains `$repository-change-planning` work. A requested refactor plan may precede authorized parent implementation in the same turn.
- `$verification-planning`: read-only recommendations for tests, commands, coverage, or manual QA. It does not run proposed checks. Authorized test edits remain parent-owned `$repository-implementation` work and may follow the recommendation in the same turn.
- `$test-suite-health`: read-only suite-wide cost, stability, overlap, isolation, or maintainability assessment, not ordinary test work. Supported findings may precede authorized parent remediation in the same turn.
- `$coding-handoff`: requested PR, implementation, migration, release, incident, or task/session continuation packages. Ordinary goal completion keeps the concise parent-owned final handoff instead of activating this skill.

The presence of a coding goal does not automatically invoke any of these skills. This guardrail may point to a focused skill when its own trigger applies, but it must not duplicate the skill or load the complete set.

## Defer To Existing Agents

- Use `faye_coding_analyst` for bounded read-only exploration, diagnosis, general or phased review, change, refactor or verification planning, test-suite health, and bounded handoff synthesis.
- Use `faye_coding_assistant` only for bounded implementation or fix work with write authority.
- Exploration, diagnosis, review, requested change or refactor planning, verification planning, and test-suite health establish their analytical result without editing. For an already-authorized compound request, let the parent route bounded execution after that result is established, including immediately in the same turn, through the appropriate implementation or debugging workflow. Do not broaden the authorized scope or proceed from an unsupported concern.
- For explicitly requested large-source-file token estimation, invoke `$source-file-token-estimation`; that skill decides whether its optional read-only agent is useful.
- Use `faye_goal_fresh_review` only when an independent read-only completion review materially improves confidence.

## Defer To Faye Codex Utility

Use Faye Codex Utility for:

- Browser/CUA offloading.
- Multi-perspective plan decision teams.
- Personal prompt notes.
- Other general Codex utility workflows.

## Defer To GitHub Workflows

When a dedicated GitHub plugin is available, use it for connected GitHub state: PR and issue triage, unresolved review threads, GitHub Actions failures, and explicit publish/push/PR workflows. Keep local repository implementation, local diff review, and local verification in Faye unless the chosen GitHub workflow delegates an authorized fix back to the workspace.

## Avoid Process Drag

Do not require:

- A durable ledger for every small goal.
- Separate progress, decision, validation, and risk files by default.
- Branch creation for trivial work.
- Commits without explicit authorization.
- Subagents for work the parent can do cheaply.
- A perfect plan before implementation when local exploration is more useful.

The guardrail should reduce drift and improve handoff quality without becoming a project-management system.
