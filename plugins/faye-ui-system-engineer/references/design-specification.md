# UI Design Specification

Produce the decisions needed to implement the requested surface. Work from the brief, actual content, reference images, and existing UI; label assumptions. A repository is optional. Scale detail to the task rather than filling every field for a small component.

## Establish And Test The Direction

1. Establish the audience, intended use and experience, content, and constraints from the supplied brief or evidence. Identify what is fixed and what may change. Ask only about an unresolved choice that would materially change the result; a useful brief or screenshot is enough to begin.
2. Choose the applicable mode within the authorized brief. These describe constraints, not a preference for old or new treatments. Evaluate what works and what needs improvement against the task; a bounded refinement can change existing choices without requiring a replacement identity:
   - Preserve: extract the existing visual grammar and retain useful patterns. Correct accidental drift without silently changing the product identity.
   - Match: inspect the actual reference. Separate observed relationships, the effect they may produce, and conditions that make them work. Transfer those relationships through the target's own content and behavior; label interpretations of unknown fonts, values, or states. A visual reference does not establish data or action semantics.
   - Create: derive a direction from the audience, purpose, content, and supplied cues. Missing references do not activate a preset or authorize invented brand facts.
3. Identify the consequential design question before proposing alternatives: sequence or simultaneous availability, concentrated or distributed attention, direct control or exploration, or another relationship the brief leaves open. Vary structure, interaction, or visual relationships that affect the result; palette swaps alone may not address the question. Compare using the same content and constraints, select a coherent direction, and explain its tradeoff. Skip alternatives when the brief already determines the answer.
4. Coordinate composition, type, rhythm, color, imagery, and relevant behavior around that direction. Translate qualities such as tactile, playful, or quiet into concrete relationships; users need not supply design terminology or CSS values. Use [visual language](visual-language.md), including identity guidance when applicable, to critique the proposal against the brief. Check both what is missing and what interferes. Preserve accessible operation and useful conventions; neither uniqueness nor familiarity establishes success.

## Decision Record And Product Content

For consequential choices, connect the intended effect, supporting facts or assumptions, chosen relationship or mechanism, treatment, tradeoff, and suitable check. State what would warrant revisiting the choice. Scale the explanation to the request; a control refinement needs no formal ledger or full-screen specification. Use [general UI principles](ui-principles.md) to distinguish useful decisions from additional process.

When a choice evolves, reconcile the specification, examples, copy, states, and acceptance checks so the builder receives one current direction. Explain the material change in the handoff; do not leave abandoned choices as simultaneous instructions or keep a treatment merely because it appeared earlier.

Keep rationale, assumptions, alternatives, and implementation notes in the specification or review. Proposed product copy should help users understand the subject, perform a task, or interpret a consequence or state. Do not insert descriptions of chosen spacing, colors, or components, or claims about how intuitive the design is, into the product. Label annotations separately when an annotated review is requested. Describe intended benefits as reasoning unless evidence establishes the outcome; use [UI usability](ui-usability.md) to decide whether supporting explanation belongs in the interface.

## Specify Implementable Decisions

| Dimension | Include when relevant |
| --- | --- |
| Structure | Reading and exploration paths, groups, alignment, relative space, simultaneous relationships, action scope, and content-width constraints. |
| Type | Family or existing role, scale, weight, line height, text measure, wrapping, and numeric alignment. Check real glyphs and labels rather than only sample headings. |
| Rhythm | Gaps within groups versus between groups, padding, density, control and target sizes, and any justified optical correction. |
| Color and shape | Surface/text/border/accent/status roles; radius and elevation relationships; focus and non-color state cues. |
| Assets | Image purpose, crop, aspect ratio, missing-image treatment, icon family, and meaningful versus decorative alternatives. |
| Behavior | Supported states and inputs, action-response relationships, feedback, pacing, persistence, interruption, and intended variation. Include focus and reduced-motion behavior where relevant. |
| Adaptation | Relationships that define the experience and how to preserve them through changes in size, input, content, or preferences. Specify reflow, local scrolling, or a different representation where justified. |

Map decisions to existing tokens where possible; otherwise provide concrete values or bounded relationships that can be implemented. A new shared token needs a reusable role. Local composition values do not require a new system layer. Avoid leaving only adjectives such as "polished" or "modern" for the builder. Use [visual foundations](visual-foundations.md) when these choices change shared roles, supported themes, variants, or density. Keep styling proposals separate from changes to the product's data model or available operations.

For components with content-driven dimensions, derive sizing from their anatomy: actual text lines, controls, media, padding, and gaps. Distinguish a minimum size from the size that current content requires. Check long labels, localization, and sparse content; do not clip required text or stretch a lone item merely to preserve sample geometry. Fixed dimensions need a supported content or interaction constraint and an explicit overflow strategy.

## Design With Content And States

Use actual labels, copy, data, and available assets early. Draft missing interface copy around outcomes and recovery; mark sample data as illustrative. Do not invent customer claims, testimonials, measurements, or product capabilities for polish. Preserve user-provided facts and approved copy unless editing them is in scope.

Choose available assets for the role defined in [visual language](visual-language.md) and specify crop, reserved proportions, and missing-asset treatment. Use existing asset/tool capabilities only when appropriate and authorized; an image generator is not a prerequisite. Use [web platform](web-platform.md) for loading mechanics.

Exercise the design with representative long and short content, missing images, empty data, and applicable loading, invalid, error, busy, and completion states. Use [UI usability](ui-usability.md) for task and interaction checks.

Choose breakpoints when relevant relationships stop working. Specify what wraps, stacks, moves, remains visible, or scrolls locally, keeping semantic reading order coherent. Retaining every control alone may lose simultaneous operation or exploration; identify how the adapted form preserves the defining experience. Independently resizable panels need container checks. Do not conceal overflow or shrink every font to preserve sample geometry.

## Worked Decisions

These are examples of reasoning, not required palettes, layouts, or measurements.

### Preserve A Branded Listing

A library uses cream surfaces and plum serif headings. Long event titles compete with equally prominent date badges and booking buttons. Preserve the palette and serif identity; give the title primary reading weight, align dates in a stable column, group location and availability beneath the title, and quiet secondary actions. At narrow widths move the date above the title and keep the full title and booking/status area reachable. Reject converting every row to a large image card: it reduces event comparison and changes the identity without a task benefit. Verify a long title, a sold-out event with useful details, and keyboard navigation at the narrow supported width before calling the change successful.

### Adapt A Visual Reference

An editorial catalog reference pairs large photographs with short serif titles and fine dividers. The target has long translated titles and missing photos. Retain the image/text proportions where content allows, serif hierarchy, and divider rhythm; let titles wrap and use a restrained labelled missing-image surface that retains the image slot. Stack image and text when the text column becomes too narrow. Reject fixed-height text clipping merely to match the sample. Verify long titles, missing imagery, useful alternative text, and the actual narrow render. Do not claim exact fonts or pixel fidelity from an unmeasured image.

### Improve A Dense Application Panel

A property inspector repeats borders around each label/value and gives every action equal emphasis. Keep related fields close, align labels and values, use section spacing to separate groups, and reserve stronger emphasis for the action that commits the edit. Maintain readable values and usable targets while reducing redundant framing. Reject doubling all spacing when it separates related properties without clarifying their relationships; also increase gaps where labels, values, and actions collide. Scroll length alone does not determine usability. Verify long labels, invalid values, keyboard operation, and independently resized panels; preserve the authored canvas and existing command behavior.

### Create A Workshop Listing

A printmaking studio supplies bold ink artwork and workshop titles, techniques, dates, locations, and detail links. Compare text-only rows with image-led rows. Choose image-led rows because the supplied work communicates the techniques and character; keep comparable details aligned. Echo the prints' weight through the heading and spacing while preserving legible metadata. Stack at narrow widths without losing dates or links. Check complete print edges, long titles, missing images, and keyboard access. These supplied prints justify the direction; do not invent replacement artwork or booking capabilities.

### Compose A Static Reading Experience

A brief pairs short poems with supplied landscape photographs and requests an unhurried, textured reading experience without animation. Compare alternating poem/image spreads with a uniform thumbnail grid. Choose the spreads: variation in image area and intervening space creates a reading cadence while the text keeps a consistent measure. Preserve authored line breaks and distinguish titles from verses through weight and spacing. On narrow screens retain poem/image pairing and sequence rather than clipping verse to match the wide composition. Check a long poem, missing photograph, enlarged text, and translated prose notes. The cadence is a design intention, not proof that readers feel contemplative.

### Shape A Sustained Material Interaction

A drawing surface already supports pointer drawing, pressure where available, and undo. Its brief calls for pigment that accumulates during a stroke. Compare a fixed-width stamp trail with a continuous deposit whose coverage responds to the supported speed and pressure inputs. Choose continuous deposit; coordinate edge texture and accumulation with that response. Define the no-pressure input behavior using the existing brush setting. Keep selected-layer and undo semantics intact. Exercise light and broad strokes, pauses, reversals, pointer cancellation, repeated passes, and supported preferences. Recheck that reducing motion preserves drawing control. Do not add pressure sensing, sound, or persistence the product lacks.

## Handoff And Acceptance

Deliver the specification in the response unless a file is requested. Include consequential decisions, reasons, preserved constraints, representative states, and observable checks. For example: "At the narrow panel width, the full label wraps, status remains associated with its field, and Save stays reachable."

Include consequential experience and identity decisions alongside operational checks. State what must remain coherent across relevant sizes, states, and repeated use. Inspection can assess fidelity to these decisions; it cannot establish originality, recognition, enjoyment, or measured memorability from appearance alone.

When implementation is authorized, carry these decisions into the changed UI and compare the render against them. Record any justified departure and recheck its consequence. A specification is proposed behavior, not proof of a working UI.
