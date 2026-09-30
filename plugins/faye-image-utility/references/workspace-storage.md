# Faye Workspace Storage — Policy 1

This protocol ships unchanged with each release plugin. Plugins work independently.
Instruction-only workflows use the host AI's existing file and shell tools; do
not install Python or Node just to create notes. Executable tools enforce these
boundaries in their existing runtime. No scheduler or background service is used.

## Workspace and destinations

Obtain the active project's absolute root from host context. Pass it as
`FAYE_WORKSPACE_ROOT` to image commands and `workspace_root` in agent handoffs.
Never infer it from cwd, plugin installation, inputs, or a parent Git repository.
If missing or unwritable, request a usable project; never use an external fallback.
Canonicalize the root and reject symlinks, junctions, and other reparse points
inside `.faye/`. Check containment and recheck affected paths before mutations.
Treat installed plugin code as read-only.

Create directories only when needed:

| Path below `.faye/` | Contents | Retention |
| --- | --- | --- |
| `tmp/<plugin>/<session>/` | Intermediates, routine screenshots, installer scratch | Temporary |
| `cache/<plugin>/` | Rebuildable cached downloads | Explicitly clearable |
| `runtime/<plugin>/` | Isolated dependencies | Rebuildable |
| `state/<plugin>/<utility>/` | Prompt notes, ledgers, resumable context | Persistent |
| `artifacts/<plugin>/<utility>/` | Finished images, reports, retained evidence | Persistent |

Use bounded lowercase single-segment identifiers and unique session suffixes.
Preserve explicit user destinations, including external paths, and overwrite
rules. Relative explicit outputs retain invocation-directory semantics. Explicit
`.faye/` targets still require managed checks. Leave legacy `faye/` untouched.

## Lazy setup and Git

Before the first managed write in a task/session:

1. Validate workspace identity and containment. Exclusively create `.faye/` and
   `.faye/.gitignore` if absent. The ignore file contains exactly `*` with an
   optional final newline, ignoring itself and all children. Different existing
   contents are a conflict; never overwrite unknown configuration.
2. If Git is available, inspect the containing repository with `git -C
   <workspace> rev-parse`. Support non-Git projects; other errors are failures.
3. Use `git ls-files` with a literal repository-relative `.faye` pathspec to
   detect tracked files and `git check-ignore --no-index` to verify exclusion.
   Tracked managed files are a conflict. Never automatically untrack files or
   edit root ignore files, Git metadata, or global settings.
4. Record policy version, canonical root, session identity, and verification.
   Use exclusive creation and atomic replacement of owned metadata. Retry
   concurrent incomplete initialization; never steal a lock on age alone.

Reuse successful verification in the task. Revalidate on new/resumed tasks,
workspace/policy/Git changes, or relevant ignore changes. Watch cheap file-state
signals for ancestor `.git` and `.gitignore` entries and Git index/config/exclude
files, detecting git-init and worktree changes without Git commands per write.
A marker alone is not proof. Pass a fresh opaque `FAYE_SESSION_ID` at task start
or resume to reuse verification across image subprocesses.

Executable metadata at `state/workspace.json` contains owner `faye-workspace`,
`policy_version`, `workspace_root`, `session_id`, `git_available`, `git_environment`
(a hash of relevant environment inputs), and `watched`
(absolute file paths mapped to file-state stamps). Instruction-only workflows
may keep evidence in task context instead; do not invent executable metadata.
Unknown or malformed owned-configuration records require explicit resolution.

## Temporary sessions and cleanup on next use

Seven days is an eligibility threshold checked at the next initialization, not
a deletion deadline. Never create scheduled tasks, automations, or timed wakeups.
Inspect only the current plugin's temporary sessions.

Record `.session.json` with `owner` (plugin), `session_id`, `workspace_root`,
`status` (`active`/`closed`), `last_activity` (UTC Unix seconds), and ownership
evidence. Executable sessions include `host` and `pid`; AI sessions record their
host task identifier, never invented process IDs. `owned_siblings` defaults to
an empty array and contains registered paths relative to `.faye/` only.

Update activity at use and close sessions on completion. Remove successful
operation intermediates immediately. Retain screenshots needed by an ongoing
browser session; copy selected delivery evidence into artifacts before closing.
Keep resumable context in state.

Remove only identifiable owned sessions inactive for more than seven days which
are closed or whose owner is verifiably inactive. Preserve uncertain ownership,
unavailable process/task status, malformed records, future timestamps, and links.
Age alone never proves that an owner is dead. Before deletion validate the final
absolute target and every child; never follow links. Use one native shell
end-to-end for Windows recursive operations.

Never age-delete state, artifacts, caches, or runtimes. Never scan external
destinations for temporary-looking names. Preserve sibling temporaries for
atomic replacement; recover only registered, contained `.faye-image-*.tmp`
siblings owned by eligible sessions. Report actual cleanup briefly, otherwise
remain quiet.

## Dependency setup

Image Utility automatically creates an isolated project-local environment using
existing Python >=3.10 with venv/ensurepip. `FAYE_PYTHON` selects the base
interpreter, never the installation target. Locked binary Pillow wheels install
under runtime, with installer scratch and caches inside `.faye/`. Never install
system Python, OS packages, or user application dependencies automatically.
Report missing prerequisites and setup failures clearly.

Reuse verified environments offline. Changed dependency locks, interpreters,
platforms, or locations select fresh environments. Do not relocate venvs or
schedule upgrades. Setup diagnostics use stderr; preserve target stdin,
arguments, stdout, and exit status. Browser and AI capabilities remain host-owned.
