# Optics, Materials, and Environment

Use this reference for glass, mirrors, reflections, refraction, lighting, shadows, camera effects, compositing, post-processing, weather, liquids, fire, smoke, natural scenes, and material behavior. Apply [audit-framework.md](audit-framework.md) first.

## Contents

- [1. Activation and evidence standard](#1-activation-and-evidence-standard)
- [2. Materials and surface continuity](#2-materials-and-surface-continuity)
- [3. Glass and transparent barriers](#3-glass-and-transparent-barriers)
- [4. Mirrors and reflections](#4-mirrors-and-reflections)
- [5. Refraction and transparent containers](#5-refraction-and-transparent-containers)
- [6. Lighting, shadows, and camera effects](#6-lighting-shadows-and-camera-effects)
- [7. Compositing and post-processing](#7-compositing-and-post-processing)
- [8. Rain, wetness, and umbrellas](#8-rain-wetness-and-umbrellas)
- [9. Windows, windshields, puddles, snow, and ice](#9-windows-windshields-puddles-snow-and-ice)
- [10. Water, liquids, fire, smoke, and particles](#10-water-liquids-fire-smoke-and-particles)
- [11. Plants, sky, food, and natural detail](#11-plants-sky-food-and-natural-detail)
- [12. False-positive guards](#12-false-positive-guards)
- [13. High-value finding patterns](#13-high-value-finding-patterns)

## 1. Activation and evidence standard

Optical and environmental effects are highly conditional. Do not report a defect solely because an expected effect is absent. Refraction, contact shadow, reflection, firelight, wetness, accumulation, ripples, and motion cues depend on angle, surface roughness, light size, exposure, duration, temperature, material, distance, and camera settings.

Prefer positive contradictions:

- an effect crosses a boundary it should remain on;
- two visible cues require incompatible light or camera geometry;
- an edited region has a clear local mismatch;
- a protected and exposed region show reversed states without explanation;
- a reflection, shadow, or liquid surface contains incompatible objects or state;
- material identity changes along one continuous surface.

Typical strictness is high for photorealistic, product, fashion, architectural, vehicle, commercial, and cinematic imagery. It is moderate for representational illustration and flexible for symbolic, painterly, surreal, glitch, or abstract work unless a specific optical effect is central.

## 2. Materials and surface continuity

Identify important materials and the visible cues that establish them:

- edge hardness and thickness;
- diffuse color and texture scale;
- highlight shape and roughness;
- reflection and transmission;
- translucency or subsurface scattering;
- weave, grain, pores, scratches, droplets, dust, or wear;
- deformation, fold, tension, fracture, or flow;
- interaction with nearby light and surfaces.

Inspect:

- material changing without a seam or boundary;
- texture scale drifting across one object;
- repeated patterns stretching or resetting incoherently;
- highlights or reflections detached from surface curvature;
- skin, hair, fabric, metal, glass, plastic, wood, ceramic, liquid, and food merging at focal boundaries;
- a local patch with different sharpness, grain, color, or rendering language;
- transparent or translucent material behaving as opaque, or the reverse, when clear cues establish the material.

A stylized material need not reproduce real microphysics. It should remain coherent with its own rendering language and the intended use.

## 3. Glass and transparent barriers

Treat glass as up to four things at once:

1. a solid barrier;
2. a transmitting surface;
3. a reflective surface;
4. a refractive surface.

Classify visible content relative to the surface:

- in front of the glass;
- behind or seen through the glass;
- reflected on the glass;
- inside a glass container;
- printed, attached, or overlaid on the surface.

Then check:

- frame, pane, edge, thickness, opening, and broken/intact state;
- objects and limbs crossing only through a visible opening or break;
- reflections and droplets remaining bound to the pane or lens;
- background transmission and occlusion;
- distortion that is compatible with curvature and viewpoint;
- consistent inside/outside relationships;
- glass objects retaining coherent rim, base, wall, and volume;
- reflection, transparency, glare, tint, dirt, fog, frost, or damage being distinguishable where the scene requires it.

An almost invisible clean pane can be physically plausible. Do not require a glare line or refraction cue merely to prove glass exists. Use frame and scene context.

Strong barrier defects include the same continuous hand or limb visibly occupying both sides of clearly closed intact glass without an opening or break, rain appearing on the wrong side of a sealed window with contradictory scene cues, or a reflection extending beyond the reflective surface without a second surface or overlay. Projected overlap with a pane, frame, or glare alone does not prove penetration; the object may remain wholly on one side or be seen through the glass.

## 4. Mirrors and reflections

A mirror is an alternate camera view, not a duplicate of the direct view. It may reveal objects outside the main frame, hide directly visible parts, change apparent overlap, and show another side of the subject.

Check invariants rather than pixelwise matching:

- reflective content stays within the mirror or reflective surface;
- the reflected viewpoint is compatible with mirror position and camera;
- identity and persistent state remain compatible;
- visible pose and object relationships are geometrically possible from the alternate view;
- mirror frame, occlusion, break, dirt, fog, and curvature are respected;
- reflected text is reversed when a direct mirror reflection requires it;
- text may remain unreversed when it is viewed through glass, digitally overlaid, re-flipped in a selfie pipeline, or not actually reflected;
- reflection strength and sharpness fit the material and rendering contract;
- repeated reflected objects do not leak into non-reflective regions.

Do not flag a different visible limb count, clothing overlap, or background solely because the mirror sees a different angle. Report only a state, identity, boundary, or geometric contradiction that survives the alternate-view explanation.

Water, polished metal, curved glass, vehicle paint, and glossy products can distort or fragment reflections. Judge them against surface curvature and roughness, not a planar-mirror model.

## 5. Refraction and transparent containers

Refraction can shift, bend, magnify, compress, or duplicate edges. Its visibility depends on curvature, thickness, refractive-index difference, background contrast, and camera angle.

Check:

- distorted content remains associated with the transparent medium;
- edge displacement changes coherently with curvature;
- an object seen partly through and partly outside the medium does not break into incompatible paths;
- liquid level, meniscus, wall, rim, base, and contents share one container volume;
- straws, utensils, fruit, ice, or hands cross only valid openings;
- bubbles and suspended particles remain inside the liquid or material;
- highlights and reflections follow the vessel surface;
- a glass or lens does not create unrelated duplicate objects outside its boundary.

Do not require obvious refraction in a thin flat pane, straight-on view, low-contrast background, or stylized image. Report incompatible displacement, containment, or boundary evidence rather than missing spectacle.

Eyeglasses and visors require lens, frame, bridge, arm, face, and reflection layering. Lens glare may hide the eye; the eye may remain visible through a clear lens. Reflections should remain associated with the lens unless another surface explains them.

## 6. Lighting, shadows, and camera effects

### Lighting and shadow

Infer only the dominant visible lighting relationships. Multiple lights, bounce, fill, ambient illumination, emissive surfaces, and post-production can produce complex shadows.

Check:

- highlight and bright-side direction across connected surfaces;
- cast-shadow direction where a clear light source exists;
- contact and grounding cues under focal objects;
- shadow shape, softness, and occlusion compatible with source size and distance;
- specular highlight shape compatible with material and curvature;
- reflected or transmitted light remaining spatially plausible;
- local lighting changes around an inserted or repaired region;
- fire, screens, signs, or magical sources affecting nearby surfaces when the image clearly presents them as meaningful illumination.

Do not report a missing contact shadow, firelight, or cast shadow from absence alone. Require a strict contract plus positive detachment or inconsistent-light cues.

### Depth of field and focus

Check:

- focal plane across subjects at comparable depth;
- plausible foreground/background blur progression;
- a focal hand, product label, face, or prop inexplicably melting while an adjacent surface at the same depth remains crisp;
- blur staying consistent at object boundaries;
- bokeh shapes not becoming prominent malformed pseudo-objects.

Deliberate selective focus can isolate only part of a face, product, or object. Do not infer anatomy or text through blur. Blur itself is reportable only when it visibly violates the photographic or compositional contract.

### Motion and lens effects

Consider:

- motion-blur direction relative to implied movement and camera pan;
- long exposure, rolling shutter, flash trails, and subject movement;
- wide-angle, fisheye, telephoto compression, panorama, and tilt-shift effects;
- lens flare, glare, bloom, vignetting, chromatic aberration, and distortion;
- bokeh and highlight shapes;
- crop and framing.

These effects can be real or intentional. Report a contradiction when direction changes inexplicably, connected geometry is locally broken, or the effect attaches to the wrong depth or surface.

## 7. Compositing and post-processing

Inspect focal and edited-looking regions for visible discontinuity without claiming how the image was made.

Possible compositing or regional consistency defects:

- halos or cutout edges;
- smeared or double boundaries;
- mismatched grain, noise, sharpness, or resolution;
- inconsistent lighting, color temperature, contrast, or shadow;
- local rendering-style or texture-scale drift;
- incomplete fill, repeated fragments, or edge residues;
- an object with incompatible depth of field;
- alpha fringes, matte color, or transparent-edge contamination;
- crop-border fragments or partial objects that terminate inside the frame.

Visible encoding or resampling defects can also matter:

- JPEG blocking or ringing in a use that requires clean delivery;
- posterization or banding in smooth gradients;
- aliasing, stair-stepping, or moiré inconsistent with the rendering mode;
- excessive sharpening halos;
- upscaling texture, repeated micro-detail, or plastic smoothing;
- channel misregistration or color fringing not explained by optics/style;
- damaged transparency or premultiplied-alpha edges;
- inconsistent color appearance across a series when a common delivery contract is supplied.

Do not confuse intentional grain, halftone, pixel art, glitch, chromatic aberration, shallow focus, or painterly edges with defects. Central watermarks, signatures, or marks can be inspected for visible corruption only when their fidelity matters; do not infer ownership or provenance.

## 8. Rain, wetness, and umbrellas

Model rain as coupled direction, occlusion, exposure, elapsed time, material, and surface response.

Check:

- local rain direction and scale;
- interaction with roof, canopy, umbrella, vehicle, window, and subject;
- protected versus exposed regions;
- wetness gradients on hair, skin, fabric, pavement, tires, and objects;
- runoff, drips, splashes, or ripples where motion and duration support them;
- wind direction across rain, clothing, hair, smoke, and foliage;
- whether rain appears inside a clearly sealed space;
- droplets or streaks staying on the relevant glass plane.

Do not require every exposed surface to be wet. A rain shower may have just started; some materials shed water; angle and lighting may hide wetness; a subject can be partly sheltered; symbolic rain may not follow detailed microphysics.

For umbrellas, check canopy continuity, shaft/handle connection, grip, open or closed state, orientation, and protected area. Strong evidence includes rain visibly passing through a solid intact canopy while adjacent occlusion cues show the canopy should block it. Windblown rain can enter from the side.

## 9. Windows, windshields, puddles, snow, and ice

### Rainy windows and windshields

Distinguish droplets on glass, rain behind glass, reflection, interior condensation, and overlaid visual effects. Check:

- droplets/streaks bound to the pane;
- correct inside/outside plane where evidence permits;
- wiper blade, pivot, sweep arc, and cleared zone;
- windshield frame and vehicle interior/exterior;
- rain not continuing unchanged through a sealed cabin;
- reflected lights and transmitted scene remaining distinguishable.

A wiper need not leave a perfectly clean arc. Speed, intermittent wiping, dirty glass, defroster, washer fluid, and shallow focus can alter the pattern.

### Puddles and wet ground

Check:

- puddle boundary following ground plane;
- reflected content compatible with surface viewpoint;
- contact, splashes, ripples, or tracks only when movement and timing support them;
- wet/dry transition around shelter, curb, tire, or footprint;
- reflected objects not appearing outside the reflective water area.

Still water may have no ripples. Rough, muddy, shallow, or low-angle water may show weak reflection.

### Snow and ice

Check:

- accumulation on upward-facing and sheltered surfaces in relation to wind and duration;
- footprints, tracks, compression, or disturbance only when movement and elapsed time make them expected;
- snow inside/outside boundaries;
- contact with footwear, tires, branches, roofs, or objects;
- ice transparency, reflection, refraction, fracture, and support;
- meltwater and cold-weather cues when visually established.

Do not require breath vapor, deep tracks, heavy accumulation, or uniform snow. Temperature, powder quality, surface warmth, time, and exposure matter.

## 10. Water, liquids, fire, smoke, and particles

### Water and liquids

Check:

- gravity and surface level under the world rules;
- container boundary, opening, and fill volume;
- stream continuity during pouring;
- splash/contact relationship;
- wetness gradient and runoff;
- reflection/refraction bound to the water surface;
- waves, wake, foam, caustics, or ripples only where scale, light, and motion support them;
- shoreline, hull, body, and object contact.

Stylized water can use symbolic shapes and highlights. A focal liquid that crosses an intact container wall, maintains incompatible levels, or disconnects from its pour source is stronger evidence.

### Fire and smoke

Check:

- visible source and attachment;
- flame or glow direction under wind and motion;
- smoke emerging from a plausible source;
- occlusion and depth order;
- interaction with nearby material when the image claims active burning;
- illumination only when exposure and source intensity make it expected;
- continuity between fire, smoke, sparks, embers, and damage.

Smoke can drift, disperse, or exist without visible flame. Flame may produce little visible cast light in daylight or a stylized rendering. Report positive causal contradictions rather than missing effects alone.

### Particles

Rain, snow, dust, sparks, confetti, leaves, bubbles, and debris should respond coherently to broad motion, depth, boundaries, and occlusion. Mechanical uniformity can conflict with a natural-particle contract, but irregularity alone is not an artifact. Inspect prominent clusters that fuse into subjects, ignore barriers, or change scale and focus incompatibly.

## 11. Plants, sky, food, and natural detail

### Plants and trees

Check trunk, branch, stem, leaf, flower, and root attachment at the level the image resolves. Repeated foliage can be loose in background painting. Focal branches should not start and stop without occlusion; vines should have coherent paths; wind response should broadly match other flexible elements.

Do not demand botanical species accuracy unless a reference or technical use requires it. Flag visible structural contradiction or route factual identity to expert/source verification.

### Sky and clouds

Check horizon and atmospheric depth, cloud occlusion, light direction, and continuity with weather. Unusual color, multiple celestial bodies, stylized clouds, or impossible astronomy may be intentional. Exact scientific accuracy requires supplied context.

### Food

Inspect food when focal, commercial, instructional, or being handled:

- coherent ingredient and container boundaries;
- utensil contact and support;
- slice, bite, peel, wrapper, or serving state;
- material texture and moisture;
- repeated garnish or ingredient patterns;
- liquid, sauce, steam, melting, and spill behavior;
- hand-food and plate/table interaction.

Food can be intentionally stylized, sculpted, decorated, or unfamiliar. Report visible fusion, impossible containment, duplicate state, or focal material collapse rather than taste, cleanliness, or cultural familiarity.

## 12. False-positive guards

Before confirming an optical, material, or environmental finding, consider:

- multiple light sources, bounce, fill, flash, grading, or exposure;
- curved, rough, tinted, fogged, dirty, scratched, shattered, or coated glass;
- alternate reflected viewpoint and off-camera reflected objects;
- thin material, low contrast, or straight-on view hiding refraction;
- wide-angle, motion, long exposure, depth of field, or lens artifacts;
- elapsed time, temperature, material absorbency, wind, and shelter;
- still water, soft light, transparent supports, or low-salience effects;
- painterly, anime, symbolic, surreal, glitch, pixel, halftone, or collage conventions;
- compression or screenshot degradation in the source rather than the target asset;
- a repaired or composited appearance that is coherent and not visibly defective.

Do not diagnose an editing method. Report the visible mismatch.

## 13. High-value finding patterns

These patterns justify close inspection but still require the artifact gate:

- a solid transparent boundary is visibly crossed without an opening;
- a reflection escapes its surface or contradicts persistent identity/state;
- a transparent container fails containment or coherent volume;
- a shadow, highlight, or reflection detaches from a focal object under clear geometry;
- a local region has incompatible grain, lighting, sharpness, texture scale, or edge treatment;
- a central alpha edge, halo, encoding block, band, or upscale pattern damages delivery quality;
- rain, wetness, snow, smoke, or liquid occupies incompatible protected and exposed states;
- a wiper, puddle, vessel, stream, flame, or smoke path breaks visible causal relationships;
- a focal natural or food structure contains unexplained fusion, repetition, or material collapse.

State what is visible, why ordinary optical or environmental alternatives are insufficient, and which local surface, state, or boundary should be repaired.
