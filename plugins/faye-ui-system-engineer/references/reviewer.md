# Optional UI Reviewer

The bundled `agents/ui-reviewer.toml` defines `ui_reviewer`, an independent
read-only reviewer. Use it only when a second assessment adds value and delegation
is available and authorized. Ordinary design and implementation do not require it.

## Activation

The package includes a definition, not a promise of automatic plugin-agent
discovery. To opt in, place a copy of the bundled TOML in the consuming project's
`.codex/agents/ui-reviewer.toml`, following that project's configuration authority.
Do not overwrite an existing role. Start a session that loads that project and
confirm `ui_reviewer` is available before requesting it. No global configuration
change or particular model is required.

If the host cannot select custom agent types, skip delegation and complete the
requested assessment in the parent. State that the independent role was not used.

## Handoff

Give the reviewer the task and acceptance criteria, bounded source paths or actual
captures, relevant constraints, and evidence provenance. Do not seed the desired
verdict or substitute an implementation summary for the raw material. If helpful,
provide absolute paths to the package's relevant references.

For visual judgment, supply the intended language or specification and
[visual language](visual-language.md). For rendered inspection, supply
[inspection workflow](inspection-workflow.md) and [UI usability](ui-usability.md).
For shared token, theme, variant, or density concerns, supply
[visual foundations](visual-foundations.md) and the affected consumers. For browser
interaction or rendering concerns, supply [web platform](web-platform.md) and the
available source/live evidence.
For source contracts, supply the relevant architecture/state/API guidance and
[audit workflow](audit-workflow.md). Do not load every lens for every request.

The assessment should explain how a finding affects the task, identify a supported
cause or explicit hypothesis, propose a bounded correction, and name a recheck.
It must not turn a style preference into a defect or require a system extraction
for a simple local UI. Evaluate the supplied result against its intent rather
than rewarding the implementation's own claims.

The parent controls browsers, capture storage, source changes, and final acceptance.
The reviewer may read supplied source and images, but may not drive the browser,
write files, install dependencies, or delegate. The read-only sandbox is a default;
its behavioral restrictions still apply if the host supplies broader permissions.

Return supported findings with locations, evidence, impact, and uncertainty, or
state that no actionable issue was found within the inspected scope. The parent
checks findings against the evidence before taking an authorized action.
