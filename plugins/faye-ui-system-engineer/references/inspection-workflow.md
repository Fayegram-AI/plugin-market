# UI Inspection Workflow

## Choose Evidence

| Available evidence | Supported conclusions | Limits |
| --- | --- | --- |
| Screenshot or capture | Visible hierarchy, alignment, density, wrapping, clipping, and depicted state. | No proof of focus order, keyboard operation, accessible names, persistence, or runtime transitions. |
| Live browser | Observed layout and exercised interactions at recorded states and sizes. | Unvisited paths and untested input methods remain unverified. |
| Source plus rendered UI | Connect implementation causes to visible or reproduced behavior. | Static heuristics are leads, not proof of every runtime state. |

Record the supplied or observed viewport/container size when known; do not infer
an exact viewport from a cropped image. Identify stale or mismatched captures
before comparing them. Separate content changes from styling changes.

## Inspect

1. Establish the intended task, design language, surface, and comparison basis.
   For a single screenshot, assess only the depicted surface without demanding
   source or a runnable application.
2. Examine the relevant relationships below, using [visual language](visual-language.md)
   and [UI usability](ui-usability.md) for decisions and corrections. Compare with
   the supplied design specification when one exists. Do not mechanically report
   on every category or turn absent evidence into a finding.
3. When live access is available, exercise the important path and relevant
   failure states with the requested input methods. Use
   [verification](verification.md) to select responsive, keyboard, focus, and
   state checks; do not turn every inspection into its full matrix.
4. Compare baseline and changed views under equivalent conditions where possible.
   Reproduce suspected failures before attributing them to the implementation.
5. Return findings with location, state, size, evidence, impact, and suggested
   correction. Identify preferences separately from defects and unverified risks.

Use existing browser capabilities. If the surface cannot be run, report that
limit and complete the supported screenshot/source assessment. Do not fabricate
interaction results or build a replacement mockup and treat it as the product.
Follow [evidence storage](evidence-storage.md) for any captures.

## Examine From Task To Detail

| Pass | Questions that guide diagnosis |
| --- | --- |
| Task and information | Can users locate the information needed to decide and the action it supports? Are important comparisons preserved, terms understandable, and explanations useful rather than repeated? |
| Composition | Does the allocation of space and emphasis match the task? Do groups, rows, columns, or cards express real relationships? Identify competing focal points, detached context, and unnecessary framing before polishing individual controls. |
| Type and rhythm | Do repeated roles, gaps, edges, and baselines stay coherent with actual content? Inspect long labels, multiline records, numeric comparison, body measure, and density without assuming more whitespace is better. |
| Assets and surfaces | Do icons and imagery contribute meaning, and do crop, optical weight, shape, color, and elevation support the same language? Does decoration obscure information or state? |
| Interaction and adaptation | With suitable evidence, check state feedback, recovery, focus, input, reflow, overlays, and motion. A static picture can show a depicted problem, not establish the unobserved behavior. |
| System consistency and finishing | Compare repeated components, states, and supported themes/densities. Use source and [visual foundations](visual-foundations.md) to locate shared versus local causes. Check optical details after larger task and composition problems. |

This order helps avoid spending the review on tiny offsets while the information
structure remains unclear. Select only the passes relevant to the request. An
intentional expressive style is not a failure; explain the mismatch with the task
or agreed language when recommending a change.

## Diagnose And Prioritize

For each material issue, connect observation, supported cause or hypothesis,
user consequence, bounded correction, and a recheck. Do not infer a CSS rule,
component owner, or missing token from appearance alone. Source can establish
those causes; without it, describe the relationship that needs to change.

Prioritize blocked tasks, lost information, and inaccessible controls ahead of
friction or visual refinement. Consider frequency and affected users as well as
severity. A repeated source defect may justify one shared fix; several similar
screenshots alone do not prove a common implementation. Group confirmed repeated
symptoms and cite representative instances rather than inflating finding counts.

| Observation | Useful diagnosis and correction | Recheck |
| --- | --- | --- |
| Two actions visually compete although one advances the task | Explain the task conflict; propose reducing secondary emphasis while retaining access. If intent is unknown, frame this as a design question rather than a defect. | Compare the same content and state with the intended action hierarchy. |
| Long labels detach visually from their controls | Check grouping and wrapping. Propose keeping each label/control/error together rather than shrinking all text. Confirm the source cause only when available. | Long and short labels at the affected container width, with an error present. |
| Multiple panels clip the same action | Confirm whether a shared width or overflow rule causes it before proposing a system-wide repair. Keep genuinely two-dimensional content scrollable where needed. | Every affected placement, narrow containers, and reachable keyboard focus. |
| Multiline rows place comparable values at inconsistent heights | Inspect top/baseline versus center alignment and text-role metrics. Restore a repeated relationship rather than adding per-item offsets. | Short, long, and translated content in adjacent rows. |
| A heading, introduction, and icon cards repeat the same instruction | Identify the decision each piece supports. Consolidate redundant wording and framing while retaining required guidance and approved facts. | The complete task path, including less familiar users' required context. |
| Gradients, shadows, badges, and images all compete with the task | Locate the competing emphasis; retain meaningful brand expression and quiet the redundant treatments. Do not replace the whole style merely because it is expressive. | The same information hierarchy and relevant state contrast after correction. |
| One shared control becomes unreadable on a raised dark surface | Inspect foreground/surface roles, state combinations, and inherited theme scope in source. Correct the responsible role mapping or component rather than changing unrelated global colors. | Actual placements, supported themes, focus/selection/invalid combinations, and any popup outside the scope. |
| Icons look inconsistent and some actions require guessing their meaning | Check the established family, optical weight, accessible names, and visible labels. Replace approximations with available conventional glyphs or clear text; preserve intentional custom artwork. | Recognition and alignment at the actual size; names require source/tree evidence. |

Keep aesthetic preferences separate from defects and intended-language mismatches.
Recommend the smallest correction that resolves the diagnosed cause while
preserving useful behavior. Recheck under equivalent conditions after requested
fixes; a prettier after-image does not prove the reported failure was corrected.
Stop when the requested findings are assessed or the supported corrections are
rechecked. Label optional aesthetic alternatives as such rather than extending a
bounded repair into an open-ended redesign.
