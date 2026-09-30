---
name: ui-visual-design
description: Establish, refine, or critique the visual direction of a browser UI, screen, or component, including hierarchy, composition, typography, spacing, density, and color. Exclude exact-value style edits, source architecture reviews, and non-UI image critique.
---

# UI Visual Design

Turn visual judgment into a product-specific design that can be implemented and evaluated. A brief, screenshot, reference, or existing interface is enough to start; a repository is not required.

## Develop The Design

1. Establish the audience, primary task, surface, constraints, and available evidence. Read [ownership and scope](../../references/ownership-and-scope.md) for authority and chrome/content boundaries; inspect source only when relevant.
2. Read [visual language](../../references/visual-language.md). Identify whether the task preserves an established language, matches a supplied reference, or creates a requested new direction. Preserve what already works and make material assumptions explicit instead of silently inventing a brand.
3. Use [design specification](../../references/design-specification.md) to turn direction into layout, hierarchy, typography, spacing, semantic color, imagery, icon, shape, and motion decisions. Compare consequential alternatives against the task and critique the direction before implementation. Use the worked decisions for preservation, reference adaptation, density, or creating a direction from the task and content.
4. Check action priority, labels, navigation, feedback, and recovery using [UI usability](../../references/ui-usability.md). Exercise the design with realistic content, available assets, and relevant states, not only an ideal empty composition. Specify reflow and content fallbacks alongside the layout.
5. Define observable acceptance criteria at relevant sizes and input methods. Use the applicable [web profile](../../references/web-profiles.md); read [web platform](../../references/web-platform.md) when specifying interactive controls or browser behavior.

When the design defines shared tokens, themes, variants, or density, read [visual foundations](../../references/visual-foundations.md) to connect the choices into reusable visual contracts. Keep purely local composition local.

## Boundaries And Result

- Deliver a scoped visual specification or prioritized critique with concrete decisions, reasons, preserved constraints, and acceptance criteria. Scale the detail to the surface; do not require every specification field for a button. Carry the consequential choices into an authorized build and check its render; explain departures instead of silently replacing the design during implementation.
- A design request alone does not authorize source edits or a durable document. When building is also requested, continue with the sibling `ui-system-implementation` workflow without asking for authority already given.
- Use `ui-system-architecture` when ownership or reusable contracts need design; use `ui-inspection` for a requested assessment of the rendered result.
- Do not treat personal preference as a defect, assign a universal taste score, or activate a preset style from the product category. Distinguish visible evidence, inference, and proposed direction.
- Follow [evidence storage](../../references/evidence-storage.md) when captures require files. An explicit no-filesystem-writes instruction takes precedence.
