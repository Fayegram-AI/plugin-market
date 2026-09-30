# Audit Workflow

## Collect Evidence

1. Read instructions, manifests, entry points, and worktree status.
2. Select the content-website, web-application, or browser-editor/workspace
   profile for each in-scope surface.
3. Identify the authorized surface. For chrome-only work, preserve authored
   content such as a document, canvas, diagram, preview, or 3D scene.
4. Run the web surface at relevant viewport and container sizes when the finding
   needs runtime evidence and access is available. Source-only reviews remain useful.
5. Inventory tokens, primitives, behaviors, patterns, feature-specific styles,
   and tests.
6. Optionally run the bundled web-source scanner when its supported scope adds
   useful leads; it is not a prerequisite for a bounded source or diff review.
7. Confirm important leads with the available source and runtime evidence; state
   what remains unverified when the necessary runtime evidence is unavailable.

## Evaluate

Check:

- Ownership and duplication
- Semantic tokens and raw style values
- Variants, sizes, slots, and state representation
- Focus order, keyboard operation, accessible names, and error relationships
- Overlay dismissal and focus restoration
- Panel resizing, toolbar overflow, narrow containers, and content starvation
- Pointer, touch, zoom, reduced-motion, and high-contrast behavior
- Test coverage for contracts rather than incidental markup

## Report

For every material finding, include:

- Evidence: file and line, runtime measurement, or reproducible interaction
- Impact: what the user or maintainer experiences
- Cause: observed ownership or contract failure
- Recommendation: the owning layer and intended behavior
- Confidence: observed fact or stated inference

Prioritize user impact and affected scope: a local blocked action can outrank
widespread cosmetic drift. Group repeated symptoms only when source or runtime
evidence establishes a shared cause; otherwise retain their separate diagnoses.
Cite representative evidence for a confirmed shared finding rather than assuming
that similar appearances require one architectural repair.

## Scanner Interpretation

The audit command intentionally uses heuristics. Raw values can be valid inside
token definitions, inline styles can be required for geometry, and nonsemantic
click handlers can be backed by other accessibility logic. Never convert a
scanner match directly into a defect without confirmation.

Use JSON output for tooling and text output for human review. Findings do not
change the command's exit status.

Read [scanner-rules.md](scanner-rules.md) for the exact rule contract. The
command scans only its documented extensions, applies its reported effective
file-size and exact-name directory policy, requires valid UTF-8 text, does not
interpret ignore files, and reports coverage or input problems as diagnostics
rather than findings. Use repeatable `--include-dir` and `--exclude-dir` flags
or `--max-file-size` only when the requested audit scope requires an override;
the scanner does not read repository configuration or environment policy.
