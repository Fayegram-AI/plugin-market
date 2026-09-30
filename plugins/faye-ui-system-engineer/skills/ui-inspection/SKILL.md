---
name: ui-inspection
description: Inspect a running browser UI, screenshots, or before-and-after captures for visual quality, usability, responsiveness, and observable interactions. Supports individual screens and components; exclude source-only architecture review and non-UI image-artifact review.
---

# UI Inspection

Assess the rendered experience against its task, design intent, and supported behavior. A screenshot is a valid input; a repository is not required.

## Inspect The Surface

1. Establish the target, task, comparison basis, and available evidence. Read [ownership and scope](../../references/ownership-and-scope.md), then [inspection workflow](../../references/inspection-workflow.md) to choose screenshot, live, or combined inspection.
2. Use [visual language](../../references/visual-language.md) and [UI usability](../../references/ui-usability.md) to assess hierarchy, reading order, composition, control clarity, realistic content, feedback, and recovery. Compare against the project's design intent rather than a preferred style. Follow the inspection workflow from task and composition to system consistency and finishing details. When source is available for a shared visual concern, use [visual foundations](../../references/visual-foundations.md) to distinguish token, component, theme-scope, and local causes.
3. Select the relevant [web profile](../../references/web-profiles.md). For a live surface, read [web platform](../../references/web-platform.md) and the relevant checks in [verification](../../references/verification.md). Use available browser capabilities for representative sizes and interaction paths.
4. For stateful behavior such as drafts, URL/history, async results, persistence, or disposal, read [state architecture](../../references/state-architecture.md). Do not load it for stateless or purely visual work.
5. Record each observed issue with surface, state, size, evidence, and impact. Connect it to a supported cause or explicit hypothesis, bounded correction, and recheck. Group confirmed shared causes and prioritize user impact. Recheck reported fixes where requested. Mark checks that the evidence cannot support; screenshots do not prove focus, keyboard, or runtime behavior.

## Boundaries And Result

- Remain read-only unless implementation is requested. Parent browser control and final judgment remain with the caller when using the optional [UI reviewer](../../references/reviewer.md).
- Use in-memory evidence when sufficient. Follow [evidence storage](../../references/evidence-storage.md) before saving captures; explicit no-filesystem-writes instructions override capture permission.
- Report prioritized findings, inspected states/sizes, evidence type, and skipped checks. Do not fabricate a contrast measurement, accessible name, or successful interaction from appearance alone.
- For source diagnosis use `ui-system-review`; for a requested design direction use `ui-visual-design`; for authorized repairs use `ui-system-implementation`. Continue mixed requests without adding an unnecessary approval stage.
