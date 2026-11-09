---
name: ui-visual-design
description: Establish, refine, or critique the visual and experiential direction of a browser UI, screen, or component through composition, typography, color, imagery, and interaction feel. Exclude exact-value style edits, source architecture reviews, and non-UI image critique.
---

# UI Visual Design

Turn visual judgment into a product-specific design that can be implemented and evaluated. A brief, screenshot, reference, or existing interface is enough to start; a repository is not required.

## Develop The Design

1. Establish what people should accomplish, understand, and experience, the surface, fixed constraints, and available evidence. Resolve only missing information that materially changes the direction. Read [ownership and scope](../../references/ownership-and-scope.md) for authority and chrome/content boundaries; inspect source only when relevant.
2. Read [general UI principles](../../references/ui-principles.md) and [visual language](../../references/visual-language.md). Identify whether the task refines an established language, matches a supplied reference, or creates a requested new direction. Evaluate existing and proposed choices against the brief and make material assumptions explicit instead of silently inventing a brand.
3. Use [design specification](../../references/design-specification.md) to resolve consequential design questions through coordinated composition, type, color, imagery, and relevant interaction or material response. Compare meaningful alternatives with the same content and constraints when the direction is open; skip variants that do not resolve a real question. Abstract relationships from references rather than copying their styling or inventing behavior.
4. Check action priority, labels, navigation, feedback, and recovery using [UI usability](../../references/ui-usability.md). Exercise the design with realistic content, available assets, and relevant states, not only an ideal empty composition. Specify reflow and content fallbacks alongside the layout.
5. Define observable acceptance criteria for the intended experience, including qualities to preserve across sizes, inputs, and relevant sustained or repeated use. Static composition is a complete design direction. Use the applicable [web profile](../../references/web-profiles.md); read [web platform](../../references/web-platform.md) when specifying interactive controls or browser behavior.

When the design defines shared tokens, themes, variants, or density, read [visual foundations](../../references/visual-foundations.md) to connect the choices into reusable visual contracts. Keep purely local composition local.

## Boundaries And Result

- Deliver a scoped visual specification or prioritized critique with concrete decisions, reasons, preserved constraints, and acceptance criteria. Keep design rationale and annotations distinct from proposed product copy. Scale the detail to the surface; do not require every specification field for a button. Carry the consequential choices into an authorized build and check its render; reconcile material changes rather than leaving contradictory directions.
- A design request alone does not authorize source edits or a durable document. When building is also requested, continue with the sibling `ui-system-implementation` workflow without asking for authority already given.
- Use `ui-system-architecture` when ownership or reusable contracts need design; use `ui-inspection` for a requested assessment of the rendered result.
- Do not treat personal preference as a defect, assign a universal taste score, or activate a preset style from the product category. Distinguish visible evidence, inference, and proposed direction.
- Follow [evidence storage](../../references/evidence-storage.md) when captures require files. An explicit no-filesystem-writes instruction takes precedence.
