# Objects and Built Scenes

Use this reference for props, tools, instruments, containers, barriers, vehicles, machines, furniture, architecture, and other designed structures. Apply the contract and judgment rules from [audit-framework.md](audit-framework.md).

## Contents

- [1. Activation and priorities](#1-activation-and-priorities)
- [2. General object integrity](#2-general-object-integrity)
- [3. Object identity, persistence, and state](#3-object-identity-persistence-and-state)
- [4. Contact, support, and containment](#4-contact-support-and-containment)
- [5. Tools, utensils, instruments, and accessories](#5-tools-utensils-instruments-and-accessories)
- [6. Barriers, openings, and containers](#6-barriers-openings-and-containers)
- [7. Vehicles and machines](#7-vehicles-and-machines)
- [8. Architecture, interiors, and furniture](#8-architecture-interiors-and-furniture)
- [9. Repetition, perspective, and scale](#9-repetition-perspective-and-scale)
- [10. Fictional and stylized design](#10-fictional-and-stylized-design)
- [11. False-positive guards](#11-false-positive-guards)
- [12. High-value finding patterns](#12-high-value-finding-patterns)

## 1. Activation and priorities

Inspect an object according to its role:

- **Focal product or prop:** geometry, materials, state, text, contact, and functional details are usually strict.
- **Object used in an interaction:** grip, attachment, layer order, support, and state matter even when fine detail is flexible.
- **Vehicle, tool, instrument, or machine:** visible functional relationships matter when the image presents the object as usable or technically credible.
- **Architecture or furniture:** perspective, traversability, support, repeated structures, and open/closed states usually matter.
- **Minor background object:** inspect only clear silhouette, scale, or state failures that affect the scene.
- **Decorative or symbolic form:** function may not apply, but internal design language, attachment, and continuity still can.

Do not infer hidden mechanisms or require every real component. Audit what the image visibly claims.

## 2. General object integrity

For each important object, identify its intended type, visible parts, material, orientation, and current state. Check:

- coherent silhouette and volume;
- attachment between visible components;
- edges and surfaces continuing through occlusion;
- symmetry only where design implies symmetry;
- stable perspective and scale;
- openings, seams, hinges, handles, fasteners, controls, and supports;
- whether the object fuses into a hand, body, surface, or background;
- whether a part branches, duplicates, disappears, or changes material without an explained boundary;
- whether foreground resolution and detail are consistent with nearby regions at the same depth;
- whether crop at the frame edge explains a partial object.

An unfamiliar design is not defective merely because its construction is not recognized. Prefer relational evidence: a handle with no connection, a lid intersecting its container, or a cable that changes endpoints is stronger than “the object looks odd.”

## 3. Object identity, persistence, and state

Track distinctive objects through the visible scene. Useful state pairs include:

- worn / removed;
- held / resting;
- attached / detached;
- open / closed;
- capped / uncapped;
- full / empty;
- intact / broken;
- folded / unfolded;
- on / off;
- inside / outside;
- connected / disconnected;
- dry / wet;
- clean / damaged;
- present / absent across a series.

A contradiction requires evidence that two appearances represent the same object or the same stateful feature. Consider duplicates, paired items, reflections, repeated product units, background copies, and deliberate motifs.

High-confidence persistence failures include:

- one unique object appearing in mutually exclusive states;
- a visible removed component still attached in the same configuration;
- a broken part appearing intact elsewhere in the same continuous view without a reflection or duplicate;
- a cable or chain changing endpoints along one visible path;
- a state transition with no compatible opening, separation, or intermediate geometry.

Prompt counts and repeated objects belong to prompt conformance unless the duplicates also create a visible structural or state defect.

## 4. Contact, support, and containment

### Contact and support

Check contact only when the relevant surfaces are visible. Use:

- overlap and occlusion;
- compression or tension;
- grip or support geometry;
- contact shadow when lighting and exposure make it expected;
- gravity and center-of-mass cues;
- deformation of soft material;
- consistent hand, foot, wheel, furniture, or ground relationship.

Absence of a contact shadow is not sufficient by itself. Soft studio light, ambient fill, transparent supports, compositing style, shallow depth of field, or deliberate floating can explain it. Report contact when multiple cues show detachment or penetration.

### Containment

For a container, identify:

- interior and exterior;
- wall or shell;
- opening, closure, lid, cap, or seal;
- contents and fill level;
- transparent versus opaque surfaces;
- pouring, leaking, entering, or exiting path.

Contents should remain inside unless a visible opening, break, permeability, or world rule explains passage. A capped bottle cannot visibly pour through an intact cap. A straw can enter through the top opening but should not cross a solid side wall without an opening.

## 5. Tools, utensils, instruments, and accessories

Judge functional affordance when the object is meant to be recognizable or usable.

### Tools and utensils

Check:

- handle-to-working-end attachment;
- blade, tip, jaw, bristle, bowl, or head orientation;
- grip area and hand contact;
- hinge, pivot, trigger, guard, or fastener when visible;
- whether the tool can reach or affect the depicted target;
- consistency of repeated teeth, tines, holes, or segments;
- material separation at metal, wood, plastic, rubber, or fabric.

A fantasy tool can be fictional while retaining a usable handle, coherent working end, and intentional articulation.

### Musical instruments

Check the visible relationships central to identity and playability:

- strings connecting appropriate anchors;
- neck, bridge, body, keys, valves, frets, holes, pedals, or drum hardware;
- bow, pick, stick, mouthpiece, or hand contact;
- repeated key or string spacing;
- cable, strap, and stand attachment;
- perspective across long straight elements.

Do not require exact instrument construction in loose background art. Central product, performance, educational, or technical imagery warrants more strictness.

### Chains, cables, ropes, and straps

Trace continuity, endpoints, tension, and layer order. Check:

- link or segment repetition;
- attachment points;
- whether the path passes in front of and behind surfaces coherently;
- whether tension and sag match support and gravity;
- whether the path merges into texture or changes material unexpectedly.

Fine links may be unresolved at small scale. A focal chain that has missing connections, impossible branches, or floating endpoints is stronger evidence.

## 6. Barriers, openings, and containers

Transparent does not mean passable. Identify the boundary type:

- solid wall or panel;
- open doorway, window, hatch, gate, or lid;
- transparent glass or plastic;
- mesh, bars, fabric, membrane, or permeable screen;
- broken or missing section;
- deliberate portal or fictional field.

Then test:

- inside/outside relationship;
- opening size and path;
- open/closed/partially open state;
- hinge, track, latch, frame, and panel geometry;
- objects or limbs crossing only through a compatible opening;
- continuity of frame and wall around the opening;
- visible damage when passage requires breakage;
- rain, liquid, smoke, light, or reflection behavior appropriate to the boundary.

### Doors

Check door leaf, frame, hinge side, handle, swing or slide direction, and open versus closed geometry. Perspective can hide a thin open door edge. A doorway can be open while another visible door panel is closed; establish object identity before reporting a contradiction.

### Windows

Distinguish open aperture, closed glass, reflection, view through glass, curtain/blind, screen, and frame. A view through glass can look uninterrupted; use frame, glare, droplets, and boundary cues rather than assuming no pane.

### Cabinets, boxes, bags, and vessels

Check opening, closure, contents, wall continuity, handle/strap attachment, and inside/outside state. Soft bags can fold and deform; rigid boxes and vessels usually preserve stronger edges and volume.

Optical behavior of glass and transparent barriers is covered in [optics-materials-and-environment.md](optics-materials-and-environment.md).

## 7. Vehicles and machines

Inspect only visible and relevant systems. Fictional machines need internal design logic, not compliance with a real model unless a reference requires it.

### Cars and trucks

Check:

- wheel-to-axle and wheel-well relationship;
- wheel ellipse, orientation, and ground contact;
- chassis, body panels, doors, windows, mirrors, lights, grille, and handles;
- perspective and scale between near and far wheels;
- windshield, wiper, reflection, and interior/exterior boundaries;
- steering and seating relationships when visible;
- repeated details such as lights or vents;
- shadow, reflection, and wetness under the applicable contract.

Do not count hidden far-side wheels. A wheel can be occluded by bodywork, perspective, mud, shadow, motion blur, or crop.

### Bicycles and motorcycles

Check:

- wheel alignment and frame topology;
- fork, handlebars, seat, pedals, crank, chain/belt, and rear connection;
- suspension and engine components when central;
- rider hand/foot contact;
- support from tires, kickstand, or motion;
- cables and brake components where visible.

Thin spokes and chains may disappear at resolution or motion. Report coherent topology failures, not every missing fine line.

### Aircraft, ships, trains, and robots

Activate the relevant relationships:

- wings, tail, rotors, engines, landing gear, or control surfaces;
- hull, deck, mast, propeller, rudder, rail, carriage, or coupling;
- cockpit/cabin glass and interior/exterior boundaries;
- repeated windows, doors, wheels, tracks, and segments;
- robot torso, limb articulation, joints, cables, tools, and contact;
- scale and perspective across the whole machine.

### Mechanical affordance

A central hinge should articulate connected parts; an axle should align with wheels; a handle, trigger, control, or port should attach to the object it operates. Do not require hidden engineering. Require visible design coherence.

## 8. Architecture, interiors, and furniture

### Perspective and spatial layout

Check:

- horizon and vanishing behavior where linear perspective is claimed;
- floor, wall, ceiling, and room boundary relationships;
- scale of people, doors, windows, furniture, vehicles, and repeated bays;
- whether openings connect plausible spaces;
- mirror and window views relative to room layout;
- stairs, corridors, ramps, and paths being traversable;
- foreground and background depth order.

Multiple vanishing points, wide-angle curvature, tilt-shift, panorama stitching, isometric drawing, and stylized perspective can be intentional. Report local contradictions that cannot be explained by the chosen projection.

### Structural logic

When architectural credibility matters, inspect:

- walls, columns, beams, roofs, railings, balconies, stairs, and supports;
- load path and attachment where visible;
- door/window frames and open/closed state;
- intersections between furniture and room surfaces;
- floor contact and support of tables, chairs, beds, shelving, and fixtures;
- repeated tiles, bricks, posts, balusters, lights, or panels;
- interior/exterior continuity.

Do not certify engineering or code compliance. Visible structural incoherence can be reported; technical adequacy may require expert review.

### Furniture

Check usable seat/table surfaces, legs or bases, backs, arms, joints, symmetry where designed, contact with floor, and occlusion behind the object. Hidden legs are common. A chair may use a pedestal, cantilever, transparent support, wall mounting, or unusual design.

## 9. Repetition, perspective, and scale

Repeated structures often reveal drift. Inspect:

- spacing and orientation;
- count only where clearly visible or prompted;
- gradual perspective compression;
- identity versus intentional variation;
- pattern continuity across corners, folds, and occlusion;
- duplicated partial objects;
- changes in scale or topology that exceed projection effects.

Perfect repetition is not always expected. Handmade, natural, damaged, historical, and stylized structures may vary. Conversely, exact product arrays, keyboards, technical panels, or architectural systems may be strict.

Use relational anchors for scale: people, doors, handles, wheels, furniture, known references, and repeated modules. Avoid declaring an isolated fictional object “wrong size” without a contract or comparison.

## 10. Fictional and stylized design

Fantasy and science-fiction objects may violate ordinary technology or physics. Audit whether they look deliberately designed:

- components share a coherent shape language;
- joints and interfaces connect;
- grips, access points, controls, or supports exist when function is central;
- symmetry or asymmetry is intentional and stable;
- materials remain distinguishable;
- repetition is controlled;
- object state and scene interaction remain legible.

Surreal architecture may be impossible while compositionally coherent. Escher-like space, floating furniture, impossible machines, symbolic tools, or nonfunctional sculpture are not artifacts when supported by prompt and visual language. Accidental-looking local collapse can still be reported with careful contract evidence.

Pixel art, low-poly work, and minimalist design require grid, facet, edge, and shape-language consistency rather than fine real-world detail. Do not punish deliberate pixel stair-stepping or polygon simplification.

## 11. False-positive guards

Before confirming an object or built-scene finding, consider:

- crop, occlusion, rear or far-side placement;
- soft shadow, transparent support, suspension, or deliberate floating;
- wide-angle, fisheye, panorama, isometric, or stylized projection;
- motion blur or shallow depth of field;
- flexible, folded, transparent, reflective, or soft material;
- multiple real copies, paired objects, repeated product units, or reflection;
- unusual industrial, historical, cultural, artistic, adaptive, or fictional design;
- hidden mechanism or connection outside the visible view;
- partial construction, damage, disassembly, or transition requested by the prompt;
- background abstraction or intentionally loose concept art.

Do not equate unfamiliarity with impossibility. Prefer positive evidence of a broken visible relationship.

## 12. High-value finding patterns

These patterns justify close inspection but still require the artifact gate:

- a focal object part begins or ends in empty space;
- an object changes identity, material, or state along one continuous path;
- a held or supported object visibly floats or penetrates without explanation;
- a container, barrier, cap, wall, or door fails its visible boundary state;
- a tool, instrument, or machine has a central disconnected working part;
- a wheel, axle, frame, hinge, string, cable, or support has incompatible endpoints;
- repeated product or architectural elements mutate in a strict focal region;
- stairs, doors, furniture, or interior paths are visibly unusable under the claimed design;
- vehicle or architecture perspective conflicts across connected components;
- a removed, broken, open, closed, on, or off state appears simultaneously in an incompatible form.

Describe the location and relationship, not a generic category. Recommend the smallest repair that restores geometry, state, contact, or function.
