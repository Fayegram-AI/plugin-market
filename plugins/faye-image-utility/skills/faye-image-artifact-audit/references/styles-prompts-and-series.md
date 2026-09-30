# Styles, Prompts, and Series

Use this reference to calibrate an audit for rendering style, theme, intended use, prompt conformance, reference images, character/product continuity, or batch comparison. The canonical contract and finding rules remain in [audit-framework.md](audit-framework.md).

## Contents

- [1. Context precedence](#1-context-precedence)
- [2. Rendering-mode modifiers](#2-rendering-mode-modifiers)
- [3. Theme and world-rule modifiers](#3-theme-and-world-rule-modifiers)
- [4. Intended-use modifiers](#4-intended-use-modifiers)
- [5. Prompt conformance](#5-prompt-conformance)
- [6. Reference purpose and correspondence](#6-reference-purpose-and-correspondence)
- [7. Series, storyboard, and batch continuity](#7-series-storyboard-and-batch-continuity)
- [8. Variant ranking](#8-variant-ranking)
- [9. False-positive guards](#9-false-positive-guards)
- [10. Scenario calibration matrix](#10-scenario-calibration-matrix)

## 1. Context precedence

Use context in this order:

1. The parent’s task and explicit constraints.
2. The supplied prompt, negative prompt, intended use, delivery requirements, declared style/theme, exact text requirements, and reference purpose.
3. Authoritative reference images or expected layout identified by the parent.
4. Strong visible evidence from the target image.
5. Cautious inference for missing context.

This is not a rule that user declarations override visible evidence. It is a rule for preserving provenance: record what was declared, what was supplied, and what was inferred. If a declared photorealistic image is visibly painterly, that can be a declared-context mismatch; do not silently relabel it painterly and erase the mismatch.

When two inputs conflict:

- preserve both;
- identify which judgment each affects;
- prefer explicit task constraints for conformance;
- prefer visible evidence for describing the current image;
- mark uncertain intent instead of guessing;
- request clarification only when the unresolved conflict changes a material decision and cannot be qualified.

A strictness override changes how demanding an inspection is. It does not turn hidden evidence into visible evidence or bypass the artifact gate.

## 2. Rendering-mode modifiers

### Photographic and hyperreal visual language

Usually strict for anatomy, contact, material boundaries, optics, local detail, lighting, perspective, state, and focal text. Inspect:

- face, hands, feet, hairline, garment/accessory state;
- material texture and local-resolution consistency;
- reflections, transparent surfaces, shadows, and depth of field;
- background pseudo-detail only where salient;
- compositing seams, halos, inconsistent grain, or edge fragments.

Allow real camera effects, body variation, unusual fashion, imperfect materials, and environmental complexity. “Looks unusual” is insufficient. Describe it as photographic or hyperreal visual language, not as proof of provenance.

### Studio product photo or render

Usually very strict for:

- product silhouette and geometry;
- label, logo, exact text, colorway, and reference fidelity;
- cap, lid, nozzle, pump, port, button, display, and package closure;
- material identity;
- reflection, shadow, contact, and clean focal edges.

Stylized advertising can exaggerate color, lighting, scale, or surrounding world rules while product identity and central claims remain strict.

### Fashion, beauty, and portrait

Usually strict for focal anatomy, pose readability, garment construction, accessory state, skin/hair boundaries, jewelry, glasses, and lighting. Allow editorial pose, makeup, retouching language, intentional asymmetry, wide-angle effects, and avant-garde clothing when coherent.

### Anime and manga

Do not apply photorealistic proportions by default. Inspect:

- line continuity and closure;
- silhouette and head-angle readability;
- eye/face alignment relative to the style;
- hair, accessory, and clothing layer order;
- hand simplification consistency and prop grip;
- costume, pattern, and character identity;
- shading direction and screentone/pattern continuity;
- central text and sound effects when they must be readable;
- background perspective at the level of finish claimed.

Large eyes, tiny nose/mouth, symbolic blush, speed lines, chibi proportion, four-finger simplification, and stylized anatomy can be valid.

### Cartoon and children’s illustration

Calibrate for clear shape language, outline closure, readable expression, intentional squash/stretch, consistent simplification, layer order, prop contact, and character continuity. Do not demand real anatomy or texture.

### Digital painting, illustration, and concept art

Respect focal hierarchy. Loose background strokes can be intentional while the focal subject, armor, costume, tool, creature, product, or interaction should remain interpretable. Inspect material separation, designed attachment, composition, and local resolution relative to the claimed finish.

### Fantasy and science fiction

Impossible premise is allowed. Inspect internal causality, creature/body design, costume and object state, fictional-mechanism affordance, material and lighting language, and prompt/reference constraints. Levitation, magic, fictional technology, non-human anatomy, unusual atmosphere, or speculative architecture are not defects by themselves.

### Surreal, horror, grotesque, collage, glitch, and abstract

Allow deliberate distortion, duplication, impossible space, fragmented bodies, symbolic weather, collage seams, or glitch offsets when coherent with the visual language. Inspect:

- motif consistency;
- local edge and layer logic;
- focal legibility if the use requires it;
- exact product/text requirements that remain strict;
- accidental-looking corruption inconsistent with neighboring regions;
- requested versus unrequested transformation.

Avoid mind-reading about intentionality. State whether the feature is supported by the declared or inferred contract and with what confidence.

### Pixel art, low-poly, and minimalist work

Judge pixel-grid, palette, edge, facet, silhouette, repetition, and shape-language consistency. Intentional aliasing, flat shading, few polygons, and omitted detail are not defects. Local anti-aliasing, resolution, or facet drift can be reportable when it breaks a consistent asset style.

### UI, diagram, and technical rendering

Prioritize structure, text, hierarchy, connectors, states, and supplied reference fidelity. Anatomy and environmental realism may be irrelevant unless depicted people or physical scenes are central.

## 3. Theme and world-rule modifiers

### Everyday realism

Ordinary support, gravity, barriers, wetness, state, scale, anatomy, and functional affordance are usually strict where visible.

### Historical

Inspect visible internal coherence and mismatch to supplied period references. Do not declare anachronism from uncertain memory. Historical facts, garments, tools, and architecture may require research or expert review rather than an artifact label.

### Commercial and advertising

Raise strictness for the advertised subject, exact text, brand/product identity, materials, focal anatomy, clean edges, and misleading geometry. Artistic surroundings can remain flexible.

### Technical and instructional

Raise strictness for labels, arrows, connections, state, topology, and supplied specification. Do not certify factual, engineering, medical, or safety correctness beyond visible evidence and authoritative context.

### Fantasy, mythological, and science fiction

Use the work’s own rules. Magic or fictional technology can explain ordinary impossibility but not every broken attachment, duplicate state, or unreadable designed object.

### Surreal, dream, horror, satire, and symbolic themes

Allow incoherence that is explicitly requested or consistently expressed. Continue to inspect whether focal distortions, motifs, text, products, and layer relationships are visually deliberate under the contract.

## 4. Intended-use modifiers

Intended use affects severity and acceptability:

| Intended use | Common strict areas |
|---|---|
| Commercial product hero | identity, label/logo, material, geometry, shadow/reflection, delivery cleanliness |
| Fashion or beauty final | focal anatomy, garment/accessory state, skin/hair boundaries, optics |
| Character design sheet | identity, silhouette, costume, marks, proportions, cross-view consistency |
| Game or production asset | silhouette, edge/crop, transparency, style consistency, functional read |
| Poster or book cover | title/text, focal subject, composition, print-scale defects |
| Social post or concept exploration | central readability; minor local defects may be acceptable |
| UI mockup | hierarchy, text, controls, alignment, exact layout |
| Diagram or instruction | labels, connectors, topology, state, expert correctness boundary |
| Architecture or vehicle presentation | perspective, geometry, material, openings, supports, reflection |
| Background/environment | focal composition and world coherence; peripheral detail can be loose |

The same visible defect can be minor in exploratory concept art and major in a final product advertisement. Confidence in the defect does not change; impact does.

## 5. Prompt conformance

Parse the prompt into explicit categories:

- required subjects and object identities;
- counts and visible attributes;
- pose, orientation, and spatial relationship;
- actions and state transitions;
- exact text;
- color and material;
- scene, weather, time, or period;
- style and rendering mode;
- camera, framing, crop, and composition;
- positive constraints;
- negative constraints;
- intended output type.

Evaluate each requirement only where the visible result can answer it.

Use distinct outcomes:

- satisfied;
- material mismatch;
- ambiguous interpretation or correspondence;
- not assessable;
- not provided or not applicable.

Record the source as prompt for these outcomes. Prompt conformance is independent of visual-artifact severity. Examples:

- The prompt requests three candles and four are clearly visible: count mismatch; the candles may be visually coherent.
- The prompt requests a raised subject-left hand and the clearly oriented subject-right hand is raised: pose mismatch.
- The prompt requests exact sign text and the sign contains clean but different text: exact-text mismatch.
- The prompt requests photorealism and the result is consistently painterly: style mismatch without necessarily containing local artifacts.
- The prompt requests six fingers on a creature: six coherent fingers satisfy the prompt; fused branches may still be a visual artifact.

Negative prompts express absence or avoidance constraints. Do not turn a negative prompt into a generic defect detector. Confirm that the prohibited feature is visibly present before reporting a mismatch.

If the prompt is absent, lower confidence in count, exact text, style, historical, and intentional-impossibility judgments. Do not invent the original prompt.

### Caller-declared requirements

A caller may impose a requirement that was not part of the original generation prompt. Use the structured `declared_requirements` handoff for each such constraint and record conformance source `declared_context`, not `prompt`. Preserve every requirement's ID, independently assessable meaning, and target scope. Examples include an exact count, pose, color, material, relationship, or state required for the current decision. Omitted `applies_to` means every target.

Do not duplicate constraints already represented by intended use, declared style/theme, exact-text context, a purpose-tagged reference, cross-image continuity context in `comparison_goal`, or delivery requirements. Do not convert a request to inspect something, a likely intent, or an inference from the image into a declared requirement. Put caller-stated cross-image rules, relevant target labels, and any stated narrative order in `comparison_goal`; preserve their wording and do not invent an unstated sequence.

## 6. Reference purpose and correspondence

Every reference image needs a purpose:

- **Identity reference:** preserve face, body design, hairstyle, marks, accessories, costume, and distinctive proportions.
- **Product reference:** preserve silhouette, label/logo, colorway, controls, ports, packaging, materials, and other identified features.
- **Style reference:** preserve rendering language, line weight, palette, lighting, texture density, and composition cues; do not assume exact identity.
- **Expected layout:** compare spatial arrangement, hierarchy, camera, crop, or interface structure.
- **Before/after:** verify the requested repair and detect regressions outside the target.
- **Continuity reference:** preserve narrative state, props, clothing, damage, weather, location, or temporal sequence.
- **Context only:** use when the caller supplied the image without an explicit comparison purpose. It can support cautious description or a benign hypothesis, but it establishes no conformance requirement.

For multiple targets, use stable target labels. A reference’s **applies_to** list names the targets it governs; if omitted, the reference applies to every target. Use a reference label or neutral ordinal in reports, never its local path.

Normalize the comparison mentally before flagging:

- camera viewpoint and lens;
- crop, framing, scale, and resolution;
- pose and expression;
- lighting and color treatment;
- reflection or image reversal;
- time, damage, wetness, and narrative change;
- intentionally alternate design or costume;
- which regions are actually corresponding.

Do not compare non-corresponding pixels or demand that a style reference match identity. Describe the specific stable feature that changed.

When caller language clearly states a purpose, the parent normalizes it to the matching canonical purpose. Otherwise normalize the reference to `context_only`; never infer purpose from its pixels. Any descriptive comparison to a context-only reference must be labeled nonbinding and cannot produce a material mismatch or change acceptability. When explicit reference purposes conflict, retain separate per-reference outcomes and explain the conflict. A batch may explore alternate costumes while preserving identity; a product reference may require exact packaging but allow a new camera angle.

## 7. Series, storyboard, and batch continuity

Use series continuity only when the task implies shared identity, product, location, narrative, or delivery style.

Check:

- face, hairstyle, body design, scars, marks, glasses, jewelry, and costume;
- product shape, label, logo, colorway, controls, ports, packaging, and material;
- line weight, rendering style, palette, lighting, grain, texture density, and background treatment;
- prop possession, hand used, orientation, and attachment;
- garment and accessory worn/removed/open/closed state;
- damage, dirt, wetness, weather, time-of-day, and transformation state;
- room, vehicle, architecture, furniture, or UI layout;
- recurring text, icon, or diagram conventions;
- repair/inpaint area versus unaffected regions;
- temporal ordering and whether a change has a narrative cause.

A continuity mismatch is not always a visual artifact within either image. Record a mismatch against a supplied `comparison_goal` rule with source `continuity`, or against a purpose-tagged continuity reference with source `reference`, unless an image also contains a local visible defect.

Strong continuity mismatches use stable correspondence:

- the same character loses a distinctive scar in a view where it should remain visible;
- a product logo or port layout changes under an exact product reference;
- a repaired image fixes the target but introduces local style, grain, lighting, or texture mismatch;
- a storyboard restores a removed object without narrative explanation;
- a UI series changes the meaning or placement of a persistent control unintentionally.

Time skips, alternate designs, costume changes, reflected views, transformations, damage progression, and exploratory variants may explain changes.

## 8. Variant ranking

Rank only when `comparison_goal` explicitly asks to select among competing alternatives. For complementary character sheets, storyboards, product sets, before/after pairs, or series, return an unranked cross-image conclusion and apply the continuity guidance above when the task implies shared continuity. Image category alone never determines ranking. If selection and continuity are both requested, rank against the stated selection goal and also report continuity conformance.

For an explicit selection, assess each image independently before ranking. Use:

- visual-artifact severity and confidence;
- prompt, declared-context, reference, continuity, and delivery conformance;
- acceptability for intended use;
- repair scope and repair risk;
- visibility limits;
- consistency with the rest of the selected series.

Do not create an opaque aggregate score. State the decisive tradeoff. A variant with fewer visual defects may rank below another if it fails the central prompt or exact product identity; explain that explicitly.

Identify:

- best candidate and why;
- strongest alternative and its tradeoff;
- images needing local repair;
- images needing regeneration;
- recurring failure patterns useful for the next generation or edit;
- whether the comparison is too close or under-resolved for a confident rank.

Use labels by default. Numeric confidence is allowed only under the rules in [audit-framework.md](audit-framework.md).

## 9. False-positive guards

Before reporting a style, prompt, declared-context, reference, continuity, or delivery issue, consider:

- declared and inferred context may differ;
- a reference may be stylistic rather than exact;
- crop, camera angle, reflection, pose, lighting, or expression may alter appearance;
- a feature may be occluded or below inspectable resolution;
- characters, products, or costumes may have deliberate variants;
- narrative time, damage, weather, or transformation may explain state change;
- fictional, symbolic, surreal, or abstract rules may satisfy the prompt;
- prompt language may admit several reasonable interpretations;
- exact factual, historical, or technical judgment may require research;
- a clean conformance mismatch may not be a visual artifact.

Avoid intent claims. Say “not supported by the supplied contract” or “consistent with the declared style,” not “accidental” or “deliberate” unless the prompt establishes it.

## 10. Scenario calibration matrix

Use this matrix as a routing aid, not a checklist to repeat in the report.

| Scenario | Prioritize | Common valid flexibility |
|---|---|---|
| Photorealistic portrait | face, hands, anatomy, garment/accessory state, contact, focal optics | pose, body variation, fashion, lens effects |
| Product image | geometry, label/logo, exact text, material, controls, reflection/shadow | stylized setting and lighting |
| Anime/manga character | line/layer order, costume, hand-prop contact, identity, central text | photorealistic proportion and physics |
| Concept art | focal design, silhouette, attachment, material separation, prop function | unresolved peripheral strokes |
| Fantasy/science fiction | internal causality, creature/mechanism design, state, prompt | impossible premise and fictional technology |
| Surreal/horror/glitch | motif and local visual-language consistency, strict focal requirements | impossible space, distortion, duplication |
| UI or diagram | text, hierarchy, controls, connectors, labels, supplied layout | illustrative decoration |
| Mirror/glass scene | boundary, alternate-view geometry, persistent state, surface-bound optics | different visibility from reflected angle |
| Rain/weather scene | direction, occlusion, exposure, boundary, wetness causality | timing, material, symbolic weather |
| Clothing transition | ownership, worn/removed/held state, openings, layer order | partial removal and duplicate real items |
| Architecture/vehicle | perspective, openings, support, mechanical topology, material | fictional or stylized design |
| Character/product series | stable corresponding identity and state under stated purpose | alternate views, planned changes, exploration |

Load only the topical references that match the selected scenario and visible content. A deep audit can activate several; a targeted audit should remain within the requested domain unless an unrelated critical defect is obvious.
