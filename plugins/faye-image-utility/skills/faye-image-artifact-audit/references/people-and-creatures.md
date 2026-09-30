# People and Creatures

Use this reference when an audit contains people, crowds, animals, non-human creatures, anatomy-like structures, clothing, footwear, or body-worn accessories. Apply the contract, visibility gate, severity, and confidence rules from [audit-framework.md](audit-framework.md).

## Contents

- [1. Activation and calibration](#1-activation-and-calibration)
- [2. Whole-body structure](#2-whole-body-structure)
- [3. Side, orientation, and proportion](#3-side-orientation-and-proportion)
- [4. Limbs, hands, and hand-held objects](#4-limbs-hands-and-hand-held-objects)
- [5. Feet, toes, footwear, and ground contact](#5-feet-toes-footwear-and-ground-contact)
- [6. Face, head, hair, and headwear](#6-face-head-hair-and-headwear)
- [7. Clothing and body-worn accessories](#7-clothing-and-body-worn-accessories)
- [8. Dressing, removal, and transition states](#8-dressing-removal-and-transition-states)
- [9. Multiple people and crowds](#9-multiple-people-and-crowds)
- [10. Animals and non-human creatures](#10-animals-and-non-human-creatures)
- [11. False-positive guards](#11-false-positive-guards)
- [12. High-value finding patterns](#12-high-value-finding-patterns)

## 1. Activation and calibration

Activate the checks that match what is visible. Do not run a full anatomy checklist on a distant silhouette or an intentionally non-representational figure.

Typical strictness:

- Photorealistic portrait, fashion, beauty, documentary, and commercial imagery: strict to very strict for focal anatomy, attachment, clothing state, skin/hair boundaries, and body-object contact.
- Semi-realistic art, character design, and representational fantasy: moderate to strict for internal structure, pose readability, costume construction, and prop contact.
- Anime and manga: flexible for photorealistic proportions; moderate to strict for clean line hierarchy, side identity where visible, layer order, hands, costume continuity, and character identity.
- Cartoon, chibi, and children’s illustration: flexible for proportion, digit count, and physics; moderate to strict for readable silhouette, consistent simplification, attachment, and body-prop layering.
- Surreal, horror, grotesque, and symbolic work: flexible for requested distortion or impossible anatomy; still inspect whether the local visual language is coherent or accidentally collapses.

Medical or technical anatomy can be inspected for visible contradictions, malformed labels, or impossible connections. Do not claim expert factual correctness without appropriate source material or expertise.

## 2. Whole-body structure

Begin with silhouette and major mass relationships before inspecting digits.

Check:

- head-to-neck and neck-to-torso attachment;
- shoulder girdle, chest, spine, pelvis, and pose relationship;
- limb origin, path, joint location, taper, and termination;
- whether the visible pose has a plausible support or balance condition under the visual contract;
- whether body parts fuse into clothing, furniture, other people, or the background without a visible occlusion boundary;
- whether an independently visible part duplicates, branches, disappears, or changes identity along its path;
- whether central skin, hair, garment, and object boundaries remain legible;
- whether cropped body parts end at the frame edge rather than terminating inside the image without explanation.

A silhouette concern is strong when a central body has an unexplained extra mass, missing structural connection, impossible branch, or merged outline. Unusual pose, foreshortening, dance, gymnastics, fashion posing, and wide-angle perspective are not defects by themselves.

For a partially hidden limb, trace only the visible path and plausible occlusion. Do not require a visible intermediate segment when another body part, garment, prop, or framing can hide it. A reappearing limb is reportable only when its two visible portions cannot plausibly belong to the same path.

## 3. Side, orientation, and proportion

Use **subject-left** and **subject-right** for anatomical identity. Use **viewer-left** and **viewer-right** only to locate a region in the image.

Before reporting a side or orientation error, require enough evidence from:

- palm versus back-of-hand cues;
- thumb side;
- nail placement;
- elbow or knee direction;
- foot arch, heel, sole, or toe direction;
- shoulder and hip rotation;
- face direction;
- garment closures or explicitly asymmetric accessories;
- a supplied identity or pose reference.

Do not infer anatomical side from screen position alone. A hand on the viewer-left may belong to either side depending on pose and camera angle. Mirrors, selfies, reflections, and image reversal require additional care.

Evaluate proportions against the visual contract:

- Photorealism expects coherent human range, subject to perspective, foreshortening, body variation, age, and lens effects.
- Fashion and character design may exaggerate height, limb length, or silhouette intentionally.
- Anime, cartoon, chibi, and fantasy bodies may depart strongly from human proportion while retaining consistent joints and attachment.
- Non-human, prosthetic, assistive, disability-related, and intentionally modified bodies must not be forced into a default anatomy template.

Report proportion only when the visible relationship is clear and the deviation breaks the declared or strongly inferred contract.

## 4. Limbs, hands, and hand-held objects

### Limb continuity

Trace each inspectable limb from parent joint to visible termination. Check:

- shoulder-to-upper-arm-to-elbow-to-forearm-to-wrist;
- pelvis-to-thigh-to-knee-to-lower-leg-to-ankle;
- joint placement and bending direction;
- consistent width and surface identity along the path;
- occlusion order at clothing, furniture, and other subjects;
- whether two visible segments can belong to one limb;
- whether contact with a prop or surface is plausible.

Strong findings include an extra branch from a forearm, a wrist joining the wrong arm path, a hand emerging from empty space, or a limb visibly passing through an intact solid boundary.

### Hand visibility gate

Do not count fingers unless the hand is sufficiently large, clear, and individually resolved. A fist, curled grip, side view, motion-blurred hand, occluded palm, mitten, or highly simplified cartoon hand may legitimately show fewer separable digits.

When the hand is inspectable, check:

- palm or hand mass;
- digit origins from the palm;
- thumb placement and orientation;
- plausible joint segmentation;
- finger taper and separation;
- nail placement on the correct surface;
- consistent overlap and depth order;
- wrist attachment;
- contact and pressure around a held object.

High-confidence hand defects include:

- a digit branches from another digit without a contract explanation;
- two digits fuse while their visible paths require separation;
- a nail appears on an incompatible side of a clearly oriented finger;
- the thumb changes side mid-hand;
- the palm dissolves into a prop or background;
- a held object crosses the hand with no grip, occlusion, or contact logic;
- an extra independently visible digit is clear enough to count and not requested or style-consistent.

Lower-confidence cases belong under ambiguity:

- blurred or tiny digits;
- a folded finger that may be hidden;
- extreme foreshortening;
- a reflected or refracted hand;
- line-art simplification;
- an unfamiliar but plausible gesture.

### Gloves, rings, nails, and wrist accessories

Check state and attachment rather than demanding generic realism:

- glove cuff and hand relationship;
- whether glove material covers or exposes the intended fingers;
- glove worn versus removed;
- ring encircling a coherent digit rather than floating or merging;
- bracelet/watch connection around the wrist;
- chain or strap continuity;
- nail orientation and attachment when visible;
- consistency between direct and reflected views when both reveal the same state.

A decorative open ring, unusual nail art, fingerless glove, prosthetic hand, or fashion accessory may look unfamiliar and still be coherent.

## 5. Feet, toes, footwear, and ground contact

First classify the visible state:

- bare foot;
- socked foot;
- fully enclosed shoe or boot;
- open-toe shoe or sandal;
- partially worn or being removed;
- footwear held or placed nearby;
- cropped, hidden, or too small to inspect.

Check:

- ankle-to-foot attachment;
- heel, sole, arch, and toe direction when visible;
- whether the foot fits inside the footwear volume;
- opening, tongue, laces, straps, and sole continuity;
- whether toes appear only where the design exposes them;
- toenail placement on clearly visible toes;
- shoe or bare-foot contact with ground;
- load, shadow, compression, and occlusion cues when the contract requires grounded realism;
- worn, removed, held, or duplicate footwear state.

Do not insist on visible toes through a closed shoe. Do not count toes in a distant, angled, shadowed, or stylized foot. A slightly raised foot, dance pose, jump, thick sole, transparent material, or deliberate floating pose can explain an unusual contact condition.

Strong defects include toes protruding through an intact closed upper, a sole that changes side along one shoe, a removed unique shoe still fully worn on the same foot, or a central foot ending in an unstructured fused mass in an otherwise strict realistic image.

## 6. Face, head, hair, and headwear

### Face and head

Evaluate the face plane and head angle before comparing individual features. Check:

- skull, jaw, neck, and ear relationship;
- eye placement relative to perspective and head turn;
- pupil/iris direction only when resolution supports it;
- nose, mouth, jaw, and facial midline;
- lip, tooth, tongue, and mouth-cavity boundaries;
- duplicated, fused, or floating features;
- face-to-hair, face-to-mask, and face-to-glasses layering;
- whether an occluded feature is actually expected to be visible.

Asymmetry, expression, makeup, facial difference, scars, dental variation, closed eyes, perspective, and stylization are not artifacts. Teeth are a high-false-positive region; report only clearly fused, repeated, displaced, or structurally contradictory forms at useful resolution.

### Hair and headwear

Check:

- hairline and scalp attachment;
- strand groups crossing face, ears, hats, clips, and garments with readable over/under order;
- hair merging into fingers, jewelry, or background;
- wet, windblown, tied, braided, or styled hair consistency;
- hat, hood, helmet, veil, mask, or clip attachment;
- worn versus held or removed headwear;
- eyeglass arms, lenses, bridge, and ear relationship.

Hair can legitimately hide ears, neck, jewelry, and facial edges. Fine strands may be soft or lost to depth of field. Report a defect when a focal boundary creates an unexplained fusion, hole, duplicate state, or incompatible layer order.

## 7. Clothing and body-worn accessories

Treat garments as stateful objects attached to a body.

Classify:

- worn, partially worn, removed, or held;
- open or closed;
- zipped or unzipped;
- buttoned or unbuttoned;
- hood up or down;
- mask covering or pulled down;
- glasses, hat, bag, jewelry, shoe, or glove worn versus held;
- dry, damp, soaked, clean, damaged, torn, or transformed when relevant.

Inspect:

- neckline, sleeves, cuffs, waist, hems, openings, and closures;
- fabric wrap, fold direction, tension, compression, and gravity;
- seams and repeated pattern continuity across visible surfaces;
- straps, belts, chains, zippers, laces, and buttons;
- attachment to shoulders, waist, hands, feet, or other garments;
- front/back layer order;
- body parts crossing intact fabric without an opening;
- whether one distinctive item appears in incompatible locations or states.

Do not treat every repeated garment as one object. Uniforms, paired gloves or shoes, duplicate products, layered garments, ornamental panels, reflections, and deliberately staged duplicates may explain repetition.

Cultural clothing, religious dress, adaptive clothing, costume construction, historical garments, and avant-garde fashion may use unfamiliar closures, layering, or silhouettes. Require a visible internal contradiction rather than relying on familiarity.

Jewelry and small accessories should be inspected when focal or contractually important:

- attachment point and support;
- chain or link continuity;
- front/back order at hair and fabric;
- clasp, pendant, ring, earring, watch, or glasses geometry;
- direct/reflected or cross-image state;
- merging, floating, or unexplained duplication.

## 8. Dressing, removal, and transition states

Transition poses deserve explicit state reasoning. An item can be:

- fully worn;
- partly worn;
- actively removed or put on;
- held after removal;
- resting nearby;
- duplicated as a separate real item.

Use visible openings, sleeves, cuffs, straps, tension, body contact, and ownership cues to distinguish these states. A jacket can remain on one arm while being removed from the other; a shoe can be loose without being fully removed; a mask can be pulled below the mouth while still attached at the ears.

Report a contradiction only when the same distinctive object appears in incompatible states. High-value patterns include:

- a unique jacket is fully worn and independently held as removed;
- glasses are held while the same pair remains on the face;
- a hat is in the hand and still on the head;
- a mask is pulled down while still covering the mouth in a second fused layer;
- one glove is clearly removed while the same hand remains fully gloved;
- one shoe is clearly off while the same shoe remains enclosed around the same foot.

If identity is uncertain, state the ambiguity. Do not convert visual similarity into object identity without distinguishing marks or strong scene logic.

## 9. Multiple people and crowds

For each important figure, establish ownership of visible limbs, garments, props, and contact points. Check:

- whether limbs attach to the intended body;
- whether two figures fuse without a clear occlusion boundary;
- whether a foreground hand or foot belongs to a plausible subject;
- whether faces or bodies unintentionally repeat in focal regions;
- whether shared objects have coherent holders and contact;
- crowd scale, ground plane, and occlusion order;
- whether uniforms or clones are intentional under the prompt;
- whether small background figures are sufficiently resolved to inspect.

Tiny crowd faces and hands commonly collapse under resolution, depth of field, or painterly treatment. Omit weak background concerns unless they disrupt the silhouette, count constraint, central narrative, or intended use.

In batch or series work, distinguish within-image crowd duplication from cross-image character identity. Use the stated reference purpose.

## 10. Animals and non-human creatures

Identify the intended body plan before applying checks. Do not impose human or familiar-animal anatomy on a fictional species.

### General animal and creature structure

Check:

- head, neck, torso, tail, wing, fin, or limb attachment;
- body symmetry only when the design implies it;
- joint direction and locomotion logic;
- paw, hoof, claw, talon, fin, or tentacle termination;
- fur, feather, scale, shell, skin, or exoskeleton boundaries;
- contact with ground, water, perch, rider, harness, or held object;
- coherent repetition of species-specific features;
- internal consistency across repeated or reference views.

Fantasy creatures can have any declared anatomy, but repeated structures should share a design logic and attach to plausible masses. A dragon may have six limbs; a wing that begins in two incompatible torso locations is still a defect.

### Birds

Inspect wing-to-shoulder attachment, left/right wing ownership, feather-group direction, beak and head connection, leg/talon structure, perch contact, and folded-versus-spread wing state. Individual feathers need not be counted unless the image or use requires it.

### Fish and aquatic creatures

Inspect fin attachment, body/tail continuity, gill or mouth placement when central, water-body boundary, and repeated-scale consistency. Refraction, surface distortion, bubbles, and motion can reduce certainty.

### Reptiles, insects, and arthropods

Use the relevant body plan: segment count, limb origin, radial or bilateral organization, wing and antenna attachment, shell/exoskeleton continuity, and repeated appendage design. Do not assume a generic mammalian skeleton.

### Stylized and symbolic creatures

Simplified paws, four-finger hands, oversized eyes, impossible color, hybrid species, and mascot-like shapes can be intentional. Preserve strictness for silhouette, layer order, attachment, expression readability, and any stated identity reference.

## 11. False-positive guards

Before confirming a people-or-creature finding, consider:

- hidden or foreshortened limbs and digits;
- motion, depth-of-field blur, compression, or small scale;
- unusual but possible pose or grip;
- wide-angle distortion;
- mirrored or reflected view;
- hair, fabric, jewelry, or another person creating an occlusion;
- disability, prosthesis, assistive device, body variation, or non-human anatomy;
- cultural, historical, religious, adaptive, or avant-garde clothing;
- intentional asymmetry, duplicate garments, twins, uniforms, or clones;
- anime, cartoon, chibi, surreal, horror, fantasy, or symbolic conventions;
- a prompt-requested mutation, transformation, duplication, or transition.

Do not infer identity, demographic traits, medical conditions, or intent from appearance. Audit only the visible structural and state evidence relevant to the request.

## 12. High-value finding patterns

These patterns often justify close inspection, but still require the artifact gate:

- a limb or appendage branches from an impossible point;
- a central hand has clear fused or independently extra digits;
- a wrist, ankle, neck, wing, tail, or head has no coherent attachment;
- one body part belongs simultaneously to incompatible subjects;
- a focal face contains duplicated or merged features;
- a garment or accessory occupies mutually exclusive visible states;
- a body part crosses intact clothing or equipment without an opening;
- a focal shoe fails to enclose the foot or changes orientation mid-form;
- a held object has no plausible hand contact or layer order;
- central jewelry, glasses, straps, or chains float, break, or merge;
- a crowd foreground contains fused bodies or unassignable limbs;
- a creature’s repeated limbs, wings, fins, or segments do not follow its own body plan.

Describe the exact location, visible relationship, benign explanation considered, contract relevance, and smallest useful repair target.
