# UI Design Specification

Produce the decisions needed to implement the requested surface. Work from the
brief, actual content, reference images, and existing UI; label assumptions.
A repository is optional. Scale detail to the task rather than filling every
field for a small component.

## Establish And Test The Direction

1. Identify the primary task, audience, important content, and constraints. List
   what is fixed (brand, behavior, host conventions) and what may change.
2. Choose the applicable mode:
   - Preserve: extract the existing visual grammar and retain useful patterns.
     Correct accidental drift without silently changing the product identity.
   - Match: inspect the actual reference when supplied. Identify composition,
     hierarchy, proportions, density, type, color, imagery, and interaction cues.
     Separate observed relationships from guesses about fonts, values, or states.
     A visual reference does not establish the target's data model or action
     semantics. Label proposed interpretations and preserve known contracts.
   - Create: derive a direction from the audience, task, content, and brand cues.
     Missing references do not activate a preset or authorize invented brand facts.
3. Describe the direction concretely: what receives emphasis, how content groups,
   and which visual choices express the product. For a consequential unresolved
   choice, compare plausible alternatives against the same task and choose one;
   do not require variants when the brief already determines the direction.
   Start with the information relationship before selecting visual treatments:
   what must be read in sequence, compared across entries, or acted on repeatedly?
   Choose a composition that supports that relationship, then coordinate type,
   rhythm, surfaces, and assets around it. A set of unrelated attractive choices
   is not yet a direction. When the brief calls for product identity as described
   in [visual language](visual-language.md#product-identity-when-the-brief-calls-for-it),
   state the intended character, which visible choices express it, and how they
   support the task. Compare alternatives using the same content and constraints.
4. Critique the proposal against the brief and [visual language](visual-language.md)
   before building. Check whether decoration competes with the task, whether the
   content fits, and whether a familiar simpler treatment serves it better.
   Where identity is part of the brief, apply the interchangeability check from
   visual language. Revise generic expressive choices that fail the intended
   character and choices unsupported by the supplied evidence; retain familiar,
   accessible controls and useful conventions. Explain material revisions;
   do not equate uniqueness with success.

## Specify Implementable Decisions

| Dimension | Include when relevant |
| --- | --- |
| Structure | Reading order, content groups, alignment, relative space allocation, primary action, and constraints on content width. |
| Type | Family or existing role, scale, weight, line height, text measure, wrapping, and numeric alignment. Check real glyphs and labels rather than only sample headings. |
| Rhythm | Gaps within groups versus between groups, padding, density, control and target sizes, and any justified optical correction. |
| Color and shape | Surface/text/border/accent/status roles; radius and elevation relationships; focus and non-color state cues. |
| Assets | Image purpose, crop, aspect ratio, missing-image treatment, icon family, and meaningful versus decorative alternatives. |
| Behavior | Relevant states, feedback, responsive reflow, overflow, focus expectations, and motion/reduced-motion behavior. |

Map decisions to existing tokens where possible; otherwise provide concrete
values or bounded relationships that can be implemented. A new shared token needs
a reusable role. Local composition values do not require a new system layer.
Avoid leaving only adjectives such as "polished" or "modern" for the builder.
Use [visual foundations](visual-foundations.md) when these choices change shared
roles, supported themes, variants, or density. Keep styling proposals separate
from changes to the product's data model or available operations.

## Design With Content And States

Use actual labels, copy, data, and available assets early. Draft missing interface
copy around outcomes and recovery; mark sample data as illustrative. Do not invent
customer claims, testimonials, measurements, or product capabilities for polish.
Preserve user-provided facts and approved copy unless editing them is in scope.

Choose available assets for the role defined in [visual language](visual-language.md)
and specify crop, reserved proportions, and missing-asset treatment. Use existing
asset/tool capabilities only when appropriate and authorized; an image generator
is not a prerequisite. Use [web platform](web-platform.md) for loading mechanics.

Exercise the design with representative long and short content, missing images,
empty data, and applicable loading, invalid, error, busy, and completion states.
Use [UI usability](ui-usability.md) for task and interaction checks.

Choose breakpoints when content relationships stop working. Specify what wraps,
stacks, moves, remains visible, or scrolls locally, and keep semantic reading order
coherent. Independently resizable panels need container checks as well as viewport
checks. Do not solve overflow by hiding essential text or reducing every font.

## Worked Decisions

These are examples of reasoning, not required palettes, layouts, or measurements.

### Preserve A Branded Listing

A library uses cream surfaces and plum serif headings. Long event titles compete
with equally prominent date badges and booking buttons. Preserve the palette and
serif identity; give the title primary reading weight, align dates in a stable
column, group location and availability beneath the title, and quiet secondary
actions. At narrow widths move the date above the title and keep the full title
and booking/status area reachable. Reject converting every row to a large image
card: it reduces event comparison and changes the identity without a task benefit.
Verify a long title, a sold-out event with useful details, and keyboard navigation
at the narrow supported width before calling the change successful.

### Adapt A Visual Reference

An editorial catalog reference pairs large photographs with short serif titles
and fine dividers. The target has long translated titles and missing photos.
Retain the image/text proportions where content allows, serif hierarchy, and
divider rhythm; let titles wrap and use a restrained labelled missing-image
surface that retains the image slot. Stack image and text when the text column
becomes too narrow. Reject fixed-height text clipping merely to match the sample.
Verify long titles, missing imagery, useful alternative text, and the actual
narrow render. Do not claim exact fonts or pixel fidelity from an unmeasured image.

### Improve A Dense Application Panel

A property inspector repeats borders around each label/value and gives every
action equal emphasis. Keep related fields close, align labels and values, use
section spacing to separate groups, and reserve stronger emphasis for the action
that commits the edit. Maintain readable values and usable targets while reducing
redundant framing. Reject doubling all spacing: it hides useful properties below
the fold without clarifying their relationships. Verify long labels, invalid
values, keyboard operation, and independently resized panels; preserve the
authored canvas and existing command behavior.

### Create A Learning-Resource Catalog

The brief supplies learning resources with title, topic, format, level, duration,
and optional cover art. Visitors discover a topic, then compare resources before
opening one. There is no established identity. Propose an approachable editorial
direction: clear light surfaces, ink-colored reading text, an indigo action accent,
and expressive cover art with a display role confined to the page heading. Keep
record titles in a clear text family so long names remain easy to scan. These are
proposal choices, not inferred brand facts.

Compare a compact image-led grid with a tabular list. Choose cards here because
each resource is a distinct destination and meaningful cover art helps recognition
during discovery. Group by the supplied topic, and keep format, level, and duration
in the same order within every card so comparison remains possible. Use a restrained
edge or group spacing instead of layering a border, shadow, and tinted fill. If
the primary task changes to comparing many durations at once, prefer aligned rows.
Place the heading and short purpose statement above available filters and results;
do not let a decorative hero displace discovery. Use only supported filters/actions.

For this example, start body copy at 1rem with 1.5 line height, use a 2rem page
heading, and distinguish record titles by weight rather than another display
scale. Use 0.5rem gaps for related metadata and 1.5rem between major groups; adjust
to the host's scale if one exists. Use two columns only while titles and metadata
remain readable; otherwise use one. Give titles room to wrap, top-align comparable
metadata, and keep the open action associated with the full record. Reserve a
consistent cover region without cropping meaningful cover text; use a quiet
format-labelled fallback for missing art rather than an invented illustration.

Critique the whole direction: if thumbnails dominate the task, reduce their area;
if the heading's display face makes the list feel like a different product, adjust
its relationship to the text roles. Check long titles, absent covers, no matches,
and keyboard access. Do not add fabricated ratings, popularity counts, or claims
to make the page feel complete. Values above illustrate coordinated decisions,
not a required catalog style or universal type scale.

### Create A Maintenance-Work Queue

The brief supplies work-order title, identifier, priority, owner, due date, status,
and one supported next action. Staff scan the queue repeatedly and compare urgency.
Choose a quiet operational direction: neutral surfaces, strong readable text,
stable row geometry, and selective action/status emphasis. Keep priority and
status labels visible so their meaning does not depend on color.

Compare large independent cards with aligned rows. Choose rows for cross-record
comparison, keep title/identifier together, and give priority, owner, due date,
and status stable positions. Reserve the strongest action treatment for the
current task instead of making every status and row action equally saturated.
Use the same readable text family across headings and controls; establish heading
hierarchy through weight and spacing, and use tabular figures for compared dates
or quantities where supported. Keep within-row gaps smaller than section gaps.

Use top or first-line alignment for multiline titles and their metadata instead
of vertically centering values at different heights. Define comfortable padding
around the actual text and focus outlines; reduce redundant dividers before
shrinking targets. On a narrow screen, retain essential comparison fields through
contained table scrolling if simultaneous comparison remains the task. A stacked
record view is an alternative only if its repeated field labels and ordering
preserve the intended work; it is not an automatic mobile conversion.

Specify overdue, unassigned, long-title, empty, and failure states only where
the product supports them. Check selected/focused rows together with status cues
and any existing compact density. Reject using error red for every priority:
it confuses routine urgency with a failed operation. Do not invent bulk commands,
permissions, or workflow steps to complete the visual composition.

### Express A Printmaking Studio's Workshop Identity

This illustrative brief requests a distinctive workshop listing for a studio.
It supplies artwork with bold ink shapes, uneven printed edges, and generous
unprinted areas, plus workshop titles, techniques, dates, locations, and existing
detail links. Visitors need to compare workshops and open their details. Treat
those inputs as the example's evidence, not as facts to invent for other studios.

Compare uniform text cards with repeated decorative craft icons against a
listing that pairs supplied prints with aligned workshop information. Choose
the latter: the actual work expresses the studio's character and helps visitors
understand the techniques. Give artwork roughly one third of each wide row and
keep title, technique, date, location, and detail link in a consistent order
beside it. Show the full print when its edges matter; avoid cropping away the
evidence that motivated the direction. Adjust proportions for readable content.

Echo the prints' strong shapes through a weighty page-heading role and generous
space between workshops. Keep metadata in the host's readable text role, with
quiet surfaces and conventional, visibly focused detail links. Let texture remain
in the supplied artwork rather than spreading distressed treatment across labels
and controls. No special font, palette, or entrance animation is required.

Apply the identity check: the repeated craft icons could describe an unrelated
maker, while these prints and their relationship to the heading and spacing are
grounded in the supplied work. Retain the conventional information order because
it aids comparison. This reasoning supports the proposal; it does not establish
that visitors will recognize the studio or remember the page.

At narrow widths, stack each print above its information without changing reading
order or losing dates and links. Allow long titles to wrap. If artwork is missing,
use a quiet, labelled image slot and retain all workshop information and the
detail link; do not generate a substitute print and present it as the studio's.
Acceptance checks cover visible print edges, heading and spacing relationships,
legible metadata, reachable detail links, long titles, and the missing-image case.
Add no testimonials, popularity counts, availability claims, or booking controls
that the brief and existing operations do not supply.

## Handoff And Acceptance

Deliver the specification in the response unless a file is requested. Include
consequential decisions, reasons, preserved constraints, representative states,
and observable checks. For example: "At the narrow panel width, the full label
wraps, status remains associated with its field, and Save stays reachable."

When identity is part of the brief, include its consequential visual decisions
and their evidence alongside those checks. State what must remain visible or
coherent at the relevant sizes and states, including missing assets. Inspection
can assess fidelity to these decisions and task usability; it cannot establish
originality, brand recognition, or measured memorability from appearance alone.

When implementation is authorized, carry these decisions into the changed UI and
compare the render against them. Record any justified departure and recheck its
consequence. A specification is proposed behavior, not proof of a working UI.
