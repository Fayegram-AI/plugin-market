# Faye UI System Engineer

Five focused skills for designing, building, and reviewing browser UI screens,
components, and project-owned web UI systems. Supports browser-based websites,
web applications, PWAs, and browser-based editors or workspaces. Includes
framework-neutral web state architecture, a read-only source scanner, and an optional
independent reviewer.

Design guidance connects composition, typography, spacing, content, icons, imagery,
and motion to the task and product character. Shared visual foundations cover
semantic roles, themes, variants, and density; implementation and inspection use
the same guidance to make decisions and diagnose problems.

Plugin ID: `faye-ui-system-engineer` · Version: `0.1.0-beta.4` · Publisher: [Fayegram](https://fayegram.com)

- Website: [Faye Plugin Market](https://plugin-market.fayegram.com)
- Repository: [plugin-market](https://github.com/Fayegram-AI/plugin-market)

## Choose A Skill

| Skill | Purpose |
| --- | --- |
| `ui-visual-design` | Develop or critique a product-specific visual direction and an implementable specification. |
| `ui-system-architecture` | Specify layers, component contracts, state ownership, and migration strategy. |
| `ui-system-implementation` | Build or refine browser screens, components, and reusable UI systems. |
| `ui-system-review` | Audit UI source and changes for supported system, state, and accessibility findings. |
| `ui-inspection` | Inspect rendered screens and observable interactions using screenshots or a live browser. |

Skills support natural requests and explicit invocation. For example:

- "Use `$ui-visual-design` to refine this screen while preserving its brand."
- "Use `$ui-system-implementation` to build this responsive screen from the agreed design."
- "Use `$ui-system-implementation` to migrate this shared control and its consumers."
- "Use `$ui-inspection` to check this screenshot for visual and usability issues."

Mixed requests can combine skills. An authorized design-and-build request carries
the visual direction through implementation and verification. Design,
architecture, review, and inspection remain read-only unless implementation is
requested. Screenshot-based work does not require a repository and cannot
establish unobserved runtime behavior.

## Boundaries

Preserve the host framework, established ownership, and user changes. The plugin
does not prescribe a framework, component package, or state library. Dependencies
and framework migrations need their own authority. Editor chrome and authored
document, canvas, diagram, preview, or scene content remain distinct scopes.
Build only the abstractions justified by actual consumers; an individual screen
or component does not require extracting a shared system.

Visual choices follow the product's tasks and character. The optional Precision
Workspace profile requires an explicit request or approval; it is not a default.
Native UI, backend development, general application scaffolding, general code
review, and non-UI image critique are outside this package.

## Source Scanner

From the plugin root, run with Node.js:

```text
node scripts/audit-ui-system.mjs --root <project-path>
node scripts/audit-ui-system.mjs --root <project-path> --scope packages/web --format json
node scripts/audit-ui-system.mjs --root <project-path> --max-file-size 2MiB --include-dir generated --exclude-dir snapshots
```

The command writes nothing. Findings are heuristic leads to confirm; diagnostics
identify incomplete coverage. Exit `0` means a report was produced, including
reports with findings; exit `2` means invalid input or an operational failure
prevented a report. See the [scanner contract](references/scanner-contract.md)
for source formats, limits, containment, and flags, and
[scanner rules](references/scanner-rules.md) for individual rule limitations.

## Package Contents

- `skills/`: the five skill entrypoints and their UI metadata.
- `references/`: shared design, engineering, inspection, and evidence guidance.
- `scripts/`: the scanner and its dependency-free modules.
- `agents/ui-reviewer.toml`: optional `ui_reviewer` definition; see
  [activation and handoff](references/reviewer.md). Automatic plugin-agent
  discovery is not assumed.
- Codex and compatibility manifests, identity assets, and licensing files.

The `0.1.0-beta.2` skills replace `$faye-ui-system-engineer`; choose the relevant
skill above. The scanner moved from `skills/faye-ui-system-engineer/scripts/`
to `scripts/` with the same CLI contract. No old-name skill alias is included.

## Licensing

This package is licensed under the MIT License; see [LICENSE](LICENSE).
Copyright (c) 2026 Semicolon, LLC. The separate
[FAYEGRAM_ASSETS.md](FAYEGRAM_ASSETS.md) policy covers Fayegram identity assets.
Use of this plugin does not claim or change ownership of a project, its inputs,
or outputs.

From the marketplace repository root, run `npm run validate` to check the
distributed package structure, skill and agent metadata, registry alignment,
managed-file integrity, licensing boundaries, and forbidden artifacts. It does
not execute UI workflows or the development test suites.
