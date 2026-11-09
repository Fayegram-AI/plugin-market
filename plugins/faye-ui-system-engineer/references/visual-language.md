# Visual Language

Derive the visual language from the product unless the user requests a new direction. Architecture should support multiple coherent styles without becoming visually anonymous.

## Establish The Direction

Identify the audience, intended use and experience, actual content, established brand, and frequency of use. Name what should attract or sustain attention, be compared together, remain within reach, or emerge through exploration. Inspect existing type roles, spacing, surfaces, controls, assets, and interaction behavior before proposing a replacement language.

Describe character through coordinated decisions. Type, imagery, color, spatial rhythm, and the response to an action can each carry the experience throughout use. An interface need not have a new brand or an animated moment to have character. Use [web profiles](web-profiles.md) for surface requirements and [design specification](design-specification.md) to make the direction implementable.

Taste is choosing among workable alternatives for this product. Explain how a choice shapes attention, understanding, action, or experience. Novelty, restraint, symmetry, density, and familiarity can each be useful; none is a universal quality target. Evaluate useful conventions and distinctive treatments against the same brief.

## Product Identity When The Brief Calls For It

When the brief calls for a new identity, distinctive expression, or recognizable brand character, check how the direction expresses this particular product. Ground the intended character in the audience, subject, supplied content, and brand evidence. Missing references alone do not call for a prescribed style or establish brand facts; identify material assumptions as proposals.

Identify the visible choices carrying that character: composition, typography, imagery, color relationships, shape, or purposeful motion. Ask whether those choices could transfer unchanged to an unrelated product. If they could, examine whether they express the requested character or merely fill an undecided part of the brief. Retain shared conventions that help users read, compare, and act; revise unsupported expressive choices rather than making every control unusual. This is a diagnostic for the proposal, not proof of originality or recognition.

A coordinated set of treatments can carry identity without a signature hero, unusual layout, animation, or single memorable element. Resolve competition where it contradicts the intended attention; deliberate contrast or tension can carry character. Preserve an established identity unless replacement is requested, along with accessible operation and supported behavior. A bounded refinement needs no separate identity exercise. Use [design specification](design-specification.md) for applicable decisions and acceptance.

## Composition, Grouping, And Attention

Use [general UI principles](ui-principles.md) to relate visual choices to the task and evidence. Structure should express grouping, sequence, comparison, priority, and action scope without implying relationships the product does not have. Do not force unrelated items into equal cards, independent tasks into a sequence, or an action beside content it does not affect. Keep these relationships coherent in semantic reading order as well as visual arrangement; revise naming or structure before adding prose to explain an avoidable ambiguity.

Choose structure from the relationships in the information. Comparable records benefit from stable fields and alignment; an article needs a sustained reading path; discovery may benefit from an image or title that establishes a focal point. Do not turn every surface into a centered hero followed by interchangeable cards. Cards are useful when items are independent destinations or contain distinct actions; rows, lists, tables, or plain sections may communicate relationships better.

Allocate space by content and importance. Equal columns can waste room beside a short status while starving a long title. A large introductory block can displace the work on a frequently used screen. Keep context and actions near the material they affect rather than scattering them to satisfy a symmetrical composition.

Compare the weight of size, contrast, position, imagery, and surrounding space. Decide whether attention should concentrate, alternate, remain distributed, or unfold gradually. Reduce competing emphasis when it obscures that relationship; several centers can be appropriate for comparison, simultaneous control, or exploration. A primary action is relative to the current task, not a requirement for every composition.

Use proximity and repeated alignment to establish groups before adding containers. Repeated boxes, nested cards, and borders around every field can imply distinctions that do not exist. Retain framing where it clarifies ownership, interaction, or a layer boundary. Use [UI usability](ui-usability.md) when the clutter comes from redundant content or unclear decisions rather than layout alone.

## Typography

Assign roles such as page title, section heading, body, label, supporting text, and comparable value. Keep repeated roles consistent. Establish differences large enough to perceive through a deliberate combination of size, weight, spacing, or color; making every role bold or uppercase removes that hierarchy.

Choose families from the existing identity and required glyphs/weights. An expressive display face need not govern body copy or dense controls. Additional families should contribute a useful distinction rather than compensate for an unclear hierarchy. No particular family is universally required or forbidden.

Judge measure and line height with actual text. Long body lines make returning to the next line harder; narrow columns can break a title into disconnected fragments. Adjust available width, role size, or composition before clipping important text. Body paragraphs generally need more leading than short display text; controls need room for their actual glyphs, focus, and supported wrapping. Do not force a fixed height that only fits the sample language.

Use tabular figures and consistent units/precision when comparing numeric values; align the values by their comparison role without requiring monospace everywhere. Distinguish absence from zero. Check long names, punctuation, translated labels, and fallback fonts, not just attractive sample headings. Browser loading and fallback mechanics belong in [web platform](web-platform.md).

## Rhythm, Alignment, And Density

Choose spacing for readability, association, meaningful separation, supported input, or an explicitly justified compositional purpose. Judge the amount with real content and available space. Neither spaciousness nor compactness is a quality target; avoid fixed empty regions or oversized padding that displace the task, and compression that makes reading or operation difficult. A spacing choice may have an intended benefit without proving reduced cognitive load or improved usability.

Use the host spacing scale to express relationships: label/control/error within one field, fields within a section, and sections within a page should not all have the same gap. Related elements normally belong closer together than unrelated groups. Correct the relationship before adding another isolated spacing value.

Align comparable information along shared edges or baselines. Short text/value rows often benefit from baseline alignment; multiline titles and descriptions usually need a stable top or first-line relationship to neighboring content. Center alignment suits compact controls and deliberate centered compositions, but can make a list of variable-height records difficult to scan. Match the rule to the relationship rather than centering everything vertically by default.

Use layout structure for repeated alignment. Per-item margins, manual spaces, or absolute offsets that rescue one screenshot often drift when content wraps. After geometric alignment, inspect icon/text balance and asymmetric glyphs; a small local optical adjustment is legitimate and need not become a system token.

Density is the amount of useful information within reach, not simply smaller text and gaps. Remove redundant framing and repeated explanation before squeezing controls. Keep frequently compared values close and preserve usable hit areas. Do not impose a universal gap ratio or require all content above the fold. Increase separation where groups are indistinguishable and reduce it where related information becomes detached; preserve usable controls and room for content growth in either direction.

Increasing every gap may split a form into unrelated fragments or push its action away. Establish supported compact/comfortable relationships rather than shrinking one component ad hoc; use [visual foundations](visual-foundations.md) for shared geometry and density contracts.

## Color, Shape, And Decoration

Give surfaces, text, borders, emphasis, and statuses distinct jobs. Coordinate hue, luminance, saturation, area, and repetition: a small accent and a large color field have different effects. A rich palette can organize a coherent experience; overlapping signals can obscure its priorities. Keep secondary information readable and never use color as the only signal of a consequential state.

Use tone, borders, or elevation to make groups and layers understandable; a surface rarely needs all three applied with equal strength. Keep related radii and edge treatments coherent. Oversized radii, heavy shadows, glass effects, and gradient fills on every region often erase the hierarchy they were meant to add.

Evaluate gradients, texture, illustration, and expressive shape through placement, contrast, repetition, and their relationship to content or interaction. Material appearance can establish atmosphere or suggest how an object responds; check that behavior supports the suggestion. Simplify unsupported treatment while preserving qualities that serve the intended experience. Do not reject a font, color, card, centered layout, or gradient merely because it appears in other generated interfaces.

For shared color/state roles, themes, and overrides, use [visual foundations](visual-foundations.md); do not fix a component mismatch by changing unrelated global values.

## Icons And Imagery

Use assets for a reason: recognition, explanation, evidence, navigation, or deliberate atmosphere. Decorative icons beside every heading or repeated check marks on every sentence add scanning work when they convey no new information. Text is often clearer than an unfamiliar symbol. An accessible name does not by itself make an ambiguous visible icon understandable.

Prefer the project's established icon family for conventional UI controls. Keep stroke/fill treatment, optical size, and placement coherent; use the appropriate existing glyph rather than approximating it with hand-drawn SVG paths, ASCII, emoji, or mismatched symbols. SVG is a valid asset format, and intentionally bespoke illustration or icon design remains appropriate when requested. Do not install a new icon package solely to avoid checking available assets.

Distinguish decorative icons from controls, and retain visible labels when users cannot reasonably recognize the action. Use real brand assets rather than guessed logos. Choose imagery that explains the actual subject; generic photos should not replace meaningful product evidence. Coordinate crop, aspect ratio, focal point, and surrounding text. Specify missing-asset treatment without losing the information or action the image supports. See [design specification](design-specification.md) for content truth and asset handling, and [UI usability](ui-usability.md) for names and relationships.

## Interaction And Time

When behavior carries character, specify the action-response relationship rather than adding a generic effect. Select only variables relevant to supported inputs and operations:

| Relationship | Decisions and checks |
| --- | --- |
| Gesture and material | Travel, gain, thresholds, pressure response, friction, elasticity, or damping where supported. Exercise small and broad gestures, pauses, and reversals; check control and the intended material response. |
| Timing and continuity | Feedback onset, duration, overlap, persistence, and spatial continuity. Distinguish deliberate unfolding from input latency; check realistic tempo, interruption, and repeated use. |
| Pattern and variation | What recurs, evolves, or surprises, and under what conditions. Check that variation stays within its intended scope and preserves dependable operation. |
| Adaptation | Which relationships define the experience across size, input, and preferences. Translate the treatment when needed; retaining every control alone may not preserve simultaneous control, pacing, or discovery. |

Coordinate appearance and response: a deforming surface, its movement, and any supported sound can express one material. Static composition can fully carry the direction. Do not require motion, sensory channels, or device capabilities the brief and product do not support. Use [web platform](web-platform.md) for interruption, reduced motion, and rendering.

## Judge The Whole

Judge choices together: type and imagery may reinforce or deliberately contrast; gesture and response may establish a material's character. Identify which relationships support or contradict the direction before replacing it. Preserve qualities the interface already achieves when correcting a defect. Distinguish usability defects, intended-experience mismatches, and preferences among acceptable designs. Explain the consequence and proportionate correction; do not assign a universal taste score.

## Optional Precision Workspace

Apply this profile only when the user explicitly requests it or explicitly approves a proposal. Never infer activation from the product category, an editor context, or missing visual direction.

- Graphite or slate surfaces with clear tonal hierarchy
- Restrained teal accent
- Compact but readable controls
- 12–13px UI text and 16px primary icons
- Low corner radius and crisp borders
- Minimal shadows outside overlays
- Strong focus, selected, invalid, and disabled states
- Container-aware toolbars and inspectors

Precision Workspace is a profile, not the plugin's mandatory style. Preserve or derive the product language unless the activation gate has been satisfied.

The profile applies to the authorized UI surface. Do not rebrand authored content when only editor chrome is in scope.
