---
name: ui-system-implementation
description: Build or refine browser UI screens, components, and reusable systems, including visual treatment, interactions, tokens, and consumer migrations. Use when UI changes are requested; exclude review-only work, trivial exact-value CSS, backend work, and native UI.
---

# UI System Implementation

Deliver a complete working screen, component, or system slice within the host framework and ownership model. A single screen can use local composition; reusable layers need real consumers. General application scaffolding and backend implementation are outside this workflow.

## Implement The Slice

1. Read [ownership and scope](../../references/ownership-and-scope.md), inspect repository instructions and current changes, and establish the authorized surface. Preserve authored content when the task concerns surrounding chrome.
2. Read [web platform](../../references/web-platform.md) and the relevant [web profile](../../references/web-profiles.md). Reuse existing tokens, controls, patterns, and assets. Read [system architecture](../../references/system-architecture.md) when reuse or ownership crosses components; do not require extraction for a local screen.
3. For visible UI construction or refinement, read [visual language](../../references/visual-language.md) and [UI usability](../../references/ui-usability.md). Apply their composition, content, control, and visual-craft guidance to ordinary screens and components, not only to redesigns. Use [design specification](../../references/design-specification.md) when consequential design choices remain unresolved; scale the decisions to the change instead of requiring a separate proposal for every control.
4. Define the changed contract and acceptance checks. Read [public API contracts](../../references/public-api-contracts.md) before changing component inputs, events, slots, or module boundaries. For stateful work, read [state architecture](../../references/state-architecture.md). For changed shared tokens, themes, variants, density, or overrides, read [visual foundations](../../references/visual-foundations.md) and locate the correction at the appropriate shared or local owner.
5. Implement the requested surface with real content and applicable interaction states. Use [migration guidance](../../references/migration-workflow.md) when replacing existing contracts or migrating consumers. Keep domain commands and mapping at the feature boundary; retain native state, events, and lifecycle.
6. Apply [verification](../../references/verification.md) to the touched source, states, interactions, and representative viewport or container sizes. Inspect the changed running surface when available, compare it with the design intent, correct observed defects, and recheck. Report unavailable checks.

Use the sibling `ui-visual-design` workflow for a requested new direction or substantial design decision, retaining its specification and acceptance criteria through the build. Do not require a separate design approval when the request already authorizes it.

## Boundaries And Result

- A review or proposal alone grants no implementation authority. For mixed diagnosis and repair, establish the supported finding before the bounded fix.
- Preserve user changes, public behavior, selectors, and accessibility unless their replacement is authorized. Dependency, package-manager, lockfile, and framework changes require authority beyond ordinary UI-source edits.
- Verification covers this change; it does not require a whole-product audit. Follow [evidence storage](../../references/evidence-storage.md) for captures.
- Connect to existing supported operations. If a required service or data contract is absent, state the limit; do not simulate successful production behavior and call the integration complete. Clearly labelled local demos may use sample data.
- Report what changed, which consumers use it, checks and observations, preserved behavior, and remaining limitations. Do not claim runtime checks from source tests or screenshots alone.
