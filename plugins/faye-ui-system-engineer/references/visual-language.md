# Visual Language

Derive the visual language from the product unless the user requests a new
direction. Architecture should support multiple coherent styles without
becoming visually anonymous.

## Establish The Direction

Identify the audience, primary task, actual content, established brand, and
expected frequency of use. Name what should be noticed first, compared together,
read at length, or kept within reach. Inspect the existing type roles, spacing,
surfaces, controls, and assets before proposing a replacement language.

Describe character through coordinated decisions: an editorial reading surface
may let type and imagery carry expression; a repeated operational task may favor
stable geometry and quiet framing. Neither implies a mandatory palette or font.
Use [web profiles](web-profiles.md) to distinguish the surface's priorities and
[design specification](design-specification.md) to make the choices implementable.

Taste is choosing among workable alternatives for this product. Explain what a
choice makes easier to notice, read, compare, or do, and how it expresses the
intended character. Novelty, restraint, symmetry, and density can each be useful;
none is a universal quality target. Preserve a familiar pattern when it serves
the task better than a distinctive replacement.

## Product Identity When The Brief Calls For It

When the brief calls for a new identity, distinctive expression, or recognizable
brand character, check how the direction expresses this particular product.
Ground the intended character in the audience, subject, supplied content, and
brand evidence. Missing references alone do not call for a prescribed style or
establish brand facts; identify material assumptions as proposals.

Identify the visible choices carrying that character: composition, typography,
imagery, color relationships, shape, or purposeful motion. Ask whether those
choices could transfer unchanged to an unrelated product. If they could, examine
whether they express the requested character or merely fill an undecided part
of the brief. Retain shared conventions that help users read, compare, and act;
revise unsupported expressive choices rather than making every control unusual.
This is a diagnostic for the proposal, not proof of originality or recognition.

A coordinated set of treatments can carry identity without a signature hero,
unusual layout, animation, or single memorable element. Keep supporting choices
quiet where they compete with the intended emphasis. Preserve an established
identity unless its replacement is requested, and retain accessible content and
familiar interactions. Routine settings and operational screens need no extra
identity exercise unless their brief calls for one. Use
[design specification](design-specification.md) to carry applicable identity
decisions into concrete choices and observable acceptance.

## Composition, Grouping, And Attention

Choose structure from the relationships in the information. Comparable records
benefit from stable fields and alignment; an article needs a sustained reading
path; discovery may benefit from an image or title that establishes a focal point.
Do not turn every surface into a centered hero followed by interchangeable cards.
Cards are useful when items are independent destinations or contain distinct
actions; rows, lists, tables, or plain sections may communicate relationships better.

Allocate space by content and importance. Equal columns can waste room beside a
short status while starving a long title. A large introductory block can displace
the work on a frequently used screen. Keep context and actions near the material
they affect rather than scattering them to satisfy a symmetrical composition.

Compare the weight of size, contrast, position, imagery, and surrounding space.
When every heading, badge, icon, and button competes, reduce secondary emphasis
before enlarging the primary element. A primary action is relative to the current
task; a comparison surface can legitimately have several equally weighted records.

Use proximity and repeated alignment to establish groups before adding containers.
Repeated boxes, nested cards, and borders around every field can imply distinctions
that do not exist. Retain framing where it clarifies ownership, interaction, or a
layer boundary. Use [UI usability](ui-usability.md) when the clutter comes from
redundant content or unclear decisions rather than layout alone.

## Typography

Assign roles such as page title, section heading, body, label, supporting text,
and comparable value. Keep repeated roles consistent. Establish differences large
enough to perceive through a deliberate combination of size, weight, spacing, or
color; making every role bold or uppercase removes that hierarchy.

Choose families from the existing identity and required glyphs/weights. An
expressive display face need not govern body copy or dense controls. Additional
families should contribute a useful distinction rather than compensate for an
unclear hierarchy. No particular family is universally required or forbidden.

Judge measure and line height with actual text. Long body lines make returning to
the next line harder; narrow columns can break a title into disconnected fragments.
Adjust available width, role size, or composition before clipping important text.
Body paragraphs generally need more leading than short display text; controls
need room for their actual glyphs, focus, and supported wrapping. Do not force a
fixed height that only fits the sample language.

Use tabular figures and consistent units/precision when comparing numeric values;
align the values by their comparison role without requiring monospace everywhere.
Distinguish absence from zero. Check long names, punctuation, translated labels,
and fallback fonts, not just attractive sample headings. Browser loading and
fallback mechanics belong in [web platform](web-platform.md).

## Rhythm, Alignment, And Density

Use the host spacing scale to express relationships: label/control/error within
one field, fields within a section, and sections within a page should not all have
the same gap. Related elements normally belong closer together than unrelated
groups. Correct the relationship before adding another isolated spacing value.

Align comparable information along shared edges or baselines. Short text/value
rows often benefit from baseline alignment; multiline titles and descriptions
usually need a stable top or first-line relationship to neighboring content.
Center alignment suits compact controls and deliberate centered compositions,
but can make a list of variable-height records difficult to scan. Match the rule
to the relationship rather than centering everything vertically by default.

Use layout structure for repeated alignment. Per-item margins, manual spaces, or
absolute offsets that rescue one screenshot often drift when content wraps.
After geometric alignment, inspect icon/text balance and asymmetric glyphs; a
small local optical adjustment is legitimate and need not become a system token.

Density is the amount of useful information within reach, not simply smaller
text and gaps. Remove redundant framing and repeated explanation before squeezing
controls. Keep frequently compared values close and preserve usable hit areas.
Increasing every gap may split a form into unrelated fragments or push its action
away. Establish supported compact/comfortable relationships rather than shrinking
one component ad hoc; use [visual foundations](visual-foundations.md) for shared
geometry and density contracts.

## Color, Shape, And Decoration

Give surfaces, text, borders, brand emphasis, and statuses distinct jobs. Start
from the product palette and establish quiet supporting roles around intentional
emphasis. Multiple saturated accents can make ordinary metadata compete with
actions or warnings. Avoid muting secondary content so far that it stops being
readable, and never use color as the only signal of a consequential state.

Use tone, borders, or elevation to make groups and layers understandable; a
surface rarely needs all three applied with equal strength. Keep related radii
and edge treatments coherent. Oversized radii, heavy shadows, glass effects, and
gradient fills on every region often erase the hierarchy they were meant to add.

Default to simpler treatment when decoration has no identifiable compositional
or brand role. An intentional gradient, texture, illustration, or expressive
shape can be appropriate: evaluate its placement, contrast, repetition, and
relationship to content. Preserve an established expressive language instead of
replacing it with generic minimalism. Do not reject a font, color, card, centered
layout, or gradient merely because it appears in other generated interfaces.

For shared color/state roles, themes, and overrides, use
[visual foundations](visual-foundations.md); do not fix a component mismatch by
changing unrelated global values.

## Icons And Imagery

Use assets for a reason: recognition, explanation, evidence, navigation, or
deliberate atmosphere. Decorative icons beside every heading or repeated check
marks on every sentence add scanning work when they convey no new information.
Text is often clearer than an unfamiliar symbol. An accessible name does not by
itself make an ambiguous visible icon understandable.

Prefer the project's established icon family for conventional UI controls. Keep
stroke/fill treatment, optical size, and placement coherent; use the appropriate
existing glyph rather than approximating it with hand-drawn SVG paths, ASCII,
emoji, or mismatched symbols. SVG is a valid asset format, and intentionally
bespoke illustration or icon design remains appropriate when requested. Do not
install a new icon package solely to avoid checking available assets.

Distinguish decorative icons from controls, and retain visible labels when users
cannot reasonably recognize the action. Use real brand assets rather than guessed
logos. Choose imagery that explains the actual subject; generic photos should
not replace meaningful product evidence. Coordinate crop, aspect ratio, focal
point, and surrounding text. Specify missing-asset treatment without losing the
information or action the image supports. See [design specification](design-specification.md)
for content truth and asset handling, and [UI usability](ui-usability.md) for names
and relationships.

## Motion And Coherence

Motion should communicate feedback, continuity, spatial relationships, or a
deliberate expressive moment. Match intensity and duration to the task: repeated
operations need responsive feedback, while an occasional editorial transition may
have more room. Do not animate merely because the interface otherwise feels plain,
or delay essential content behind entrance choreography. Use
[web platform](web-platform.md) for interruption, reduced motion, and rendering.

Judge choices together: quiet type can support expressive imagery; a dense
comparison surface can use restrained borders rather than larger gaps. If each
choice looks plausible alone but the whole feels inconsistent, identify which
roles compete or contradict the direction before replacing the entire design.
Distinguish usability defects, intended-language mismatches, and preferences
among acceptable designs. Explain the consequence and proportionate correction;
do not assign a universal taste score.

## Optional Precision Workspace

Apply this profile only when the user explicitly requests it or explicitly
approves a proposal. Never infer activation from the product category, an editor
context, or missing visual direction.

- Graphite or slate surfaces with clear tonal hierarchy
- Restrained teal accent
- Compact but readable controls
- 12–13px UI text and 16px primary icons
- Low corner radius and crisp borders
- Minimal shadows outside overlays
- Strong focus, selected, invalid, and disabled states
- Container-aware toolbars and inspectors

Precision Workspace is a profile, not the plugin's mandatory style. Preserve or
derive the product language unless the activation gate has been satisfied.

The profile applies to the authorized UI surface. Do not rebrand authored content
when only editor chrome is in scope.
