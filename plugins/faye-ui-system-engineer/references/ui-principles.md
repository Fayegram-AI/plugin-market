# General UI Principles

Use these principles to make and assess decisions within the existing [browser UI scopes](ownership-and-scope.md). They guide judgment; they do not prescribe a product type, visual style, framework, or additional capability. Load detailed references only for the behavior being designed, implemented, or assessed.

## Task And Meaning

Start from what users need to understand or do, the actual content, and the supported operations. Make grouping, sequence, comparison, priority, and action scope understandable through structure and behavior. Do not imply relationships or capabilities merely to complete a composition. Keep visual, semantic, and reading relationships coherent as the surface adapts; appearance alone cannot establish accessible operation.

Evaluate existing and proposed choices against the authorized brief and evidence. An existing pattern may need improvement; a new treatment still needs a task-related reason. Respect explicit brand, compatibility, and scope constraints without treating preservation or replacement as a quality goal. Use [design specification](design-specification.md) to record consequential decisions and tradeoffs.

## Proportionate Treatment

Allocate attention and space according to meaning, content, interaction, and the intended character. More whitespace, greater density, stronger emphasis, and less text are not independent measures of quality. Check both excess and insufficiency: separation can clarify groups or detach related information; compression can aid comparison or impair reading and operation. Use [visual language](visual-language.md) for composition, spacing, and coordinated treatment.

## Necessary Content

Add supporting explanation only when it resolves a specific task-relevant gap that the interface does not already communicate adequately. Decide separately whether the explanation needs a heading or a container. Retain substantive content, meaningful labels, consequences, and recovery information; visual simplification does not justify withholding what users need. Use [UI usability](ui-usability.md) for placement, disclosure, and message hierarchy.

Design decisions should be expressed through the interface. Keep commentary about why spacing, colors, components, or an aesthetic were chosen in specifications or review material. Product explanations belong in the interface when they help users interpret the subject, act, or understand a consequence or state. For an annotated design deliverable, distinguish annotations from proposed product content.

## Behavior And Evidence

Represent the scope and outcome of supported operations truthfully. Preserve relevant user context where the workflow requires it, and do not let delayed work overwrite newer intent. Browser interaction mechanics belong in [web platform](web-platform.md); drafts, asynchronous operations, persistence, and other state concerns belong in [state architecture](state-architecture.md) only when present in the task. A local stateless change does not require those systems.

Explain intended benefits as reasoning unless evidence establishes an outcome. Distinguish a defect, a mismatch with an explicit design contract, a preference, and an unverified risk. Use [verification](verification.md) to select evidence for the changed behavior; source checks and screenshots each have limits. These principles do not establish measured usability, accessibility conformance, or product success by themselves.
