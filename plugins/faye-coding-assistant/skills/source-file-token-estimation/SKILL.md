---
name: source-file-token-estimation
description: Use only when explicitly requested to estimate the approximate token footprint of large repository source, test, or debug files or compare line-chunk split scenarios. This read-only workflow does not measure actual Codex usage.
---

# Source File Token Estimation

Produce a read-only Markdown report estimating the token footprint of large script/source-like files and comparing hypothetical line-chunk splits. It does not measure which files Codex actually reads, total task token consumption, billing, or monetary cost.

The optional bundled read-only subagent is `source_file_token_estimator`, defined at plugin-relative path `agents/source-file-token-estimator.toml`.

## Read-Only Rules

- Do not modify repository source, tests, build outputs, generated files, project configuration, commits, branches, or global Codex configuration.
- Run bundled scripts in read-only mode by default. They print reports to stdout and create no temp files.
- Only the parent may write a report file, and only when the user provides an explicit output path. The optional agent returns results without writing.
- Do not create temporary files for analysis.

## Optional Subagent

Use this subagent only after an explicit source-file token-estimation request and only when bounded parallel slices materially help. For small workspaces, run the deterministic scripts in the parent thread.

Honor an explicit user model or reasoning choice when spawning. The agent file intentionally does not pin either setting so the spawn request, runtime defaults, or parent setting can apply. If an explicitly requested setting is unavailable, state the limitation and do not silently substitute another.

Give each subagent a bounded, non-overlapping slice such as one package family, top-level directory, or category. Subagents report objective data and observations only; the parent owns synthesis and recommendations.

If plugin-bundled agents are unavailable, perform the analysis in the parent thread with the bundled scripts. Do not substitute a workspace-write coding agent for this read-only analysis.

## Script Workflow

Prefer the deterministic bundled Node.js script for inventory and simulation. The scripts use only Node built-in modules and do not require Python or npm packages:

```text
node <skill-root>/scripts/source-file-token-estimate.mjs --root <repo-root>
```

Useful options:

```text
node <skill-root>/scripts/source-file-token-estimate.mjs --root <repo-root> --min-kb 20
node <skill-root>/scripts/source-file-token-estimate.mjs --root <repo-root> --chunk-sizes 200,300,400,500,700
node <skill-root>/scripts/source-file-token-estimate.mjs --root <repo-root> --output <explicit-report-path>
node <skill-root>/scripts/workspace-file-inventory.mjs --root <repo-root> --json
```

The scripts:

- Respect Git ignore rules through `git ls-files -co --exclude-standard` when available.
- Exclude repo-noise paths such as `.git`, `.github`, `.codex`, `.codex-temp`, `node_modules`, `build`, `dist`, `.vite`, `tmp`, `test-results`, `.cache`, `.turbo`, `coverage`, `.tmp*`, and common generated folders.
- Keep only script/source-like files above the configured size threshold.
- Compute package/module scope, category, KB, line count, token proxy, package totals, category totals, overall totals, largest files, and chunk-size simulation.

## Report Requirements

Produce clean Markdown with relative paths and clear numbering. Include:

1. Scope, assumptions, exclusions, and token model.
2. Overall totals.
3. Category totals for `test`, `debug`, and `production` / `real`.
4. Package-level totals.
5. Refactor impact simulation for chunk sizes `200`, `300`, `400`, `500`, and `700`, using:
   - estimated full-file tokens: `bytes / 4`;
   - lower bound: touching one chunk per split file;
   - weighted scenario: touching one, two, or three chunks at `55/30/15`;
   - overhead: `45` tokens per touched split chunk/module.
6. Per-file table sorted by package, category, and largest file first.
7. Top production and test offenders with split, defer, or ignore guidance.
8. A concise single-developer vs team judgment about possible source-context reduction, not measured development cost, build speed, or runtime speed.

## Parent Synthesis

Use subagent findings and script output as data. The final answer should avoid overstating precision: token counts use the rough `bytes / 4` proxy, package scope is path-based, and the split scenarios are hypothetical. Separate production and test recommendations because their potential refactor payoff differs. Never present these estimates as actual Codex usage or billing data.

## Project-local storage

For an explicitly requested report under the active project's `.faye/`, read `../../references/workspace-storage.md` before writing. Set `FAYE_WORKSPACE_ROOT` in the report command's environment to that project's absolute root. The script performs the managed-directory and Git-ignore checks. `--root` selects the directory to scan; it does not set the output workspace and may name a smaller repository slice.

Stdout analysis requires no managed setup. Ordinary explicit report destinations outside `.faye/` require no workspace variable. Relative output paths resolve from the command's working directory; preserve the user's destination.
