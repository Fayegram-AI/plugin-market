# General UI Principles

Use these principles to make and assess decisions within the existing [browser UI scopes](ownership-and-scope.md). They guide judgment; they do not prescribe a product type, visual style, framework, or additional capability. Load detailed references only for the behavior being designed, implemented, or assessed.

## Purpose And Meaning

Start from what people should accomplish, understand, and experience, the actual content, and the supported operations. Exploration, atmosphere, play, or expressive mastery can be central purposes. Derive their importance from the brief rather than the application category. Make relevant grouping, sequence, comparison, and action scope coherent through structure and behavior without implying unsupported relationships or capabilities. Appearance alone cannot establish accessible operation.

Evaluate existing and proposed choices against the authorized brief and evidence. Connect consequential choices to an intended effect, a concrete treatment, its tradeoff, and an appropriate check. Experience can justify a choice without an efficiency claim. Respect brand, compatibility, and scope constraints; neither preservation nor replacement establishes quality. Use [design specification](design-specification.md) for decisions that need elaboration, not a mandatory response template.

## Proportionate Treatment

Allocate attention and space according to meaning, content, interaction, and intended character. More whitespace, greater density, stronger emphasis, and less text are not independent measures of quality. Check both excess and insufficiency: separation can clarify groups or detach related information; compression can aid comparison or impair reading and operation. Distinguish accidental friction from complexity that carries the subject, supports simultaneous control, or rewards exploration. Consider what removal would lose or relocate into memory and navigation. Use [visual language](visual-language.md) for coordinated treatment.

## Necessary Content

Add supporting explanation only when it resolves a specific task-relevant gap that the interface does not already communicate adequately. Decide separately whether the explanation needs a heading or a container. Retain substantive content, meaningful labels, consequences, and recovery information; visual simplification does not justify withholding what users need. Use [UI usability](ui-usability.md) for placement, disclosure, and message hierarchy.

Design decisions should be expressed through the interface. Keep commentary about why spacing, colors, components, or an aesthetic were chosen in specifications or review material. Product explanations belong in the interface when they help users interpret the subject, act, or understand a consequence or state. For an annotated design deliverable, distinguish annotations from proposed product content.

## Behavior And Evidence

Represent the scope and outcome of supported operations truthfully. Preserve relevant user context where the workflow requires it, and do not let delayed work overwrite newer intent. Browser interaction mechanics belong in [web platform](web-platform.md); drafts, asynchronous operations, persistence, and other state concerns belong in [state architecture](state-architecture.md) only when present in the task. A local stateless change does not require those systems.

Identify what people can rely on and what may vary or remain undiscovered. Surprise, ambiguity, and irreversible marks can belong to an intended experience; they do not justify silently changing the affected object, persistence, or promised recovery. Preserve these commitments and the experience's defining relationships when adapting size, input, content, or preferences.

Explain intended benefits as reasoning unless evidence establishes an outcome. Distinguish a defect, a mismatch with an explicit design contract, a preference, and an unverified risk. Use [verification](verification.md) to select evidence for the changed behavior; source checks and screenshots each have limits. These principles do not establish measured usability, accessibility conformance, or product success by themselves.
