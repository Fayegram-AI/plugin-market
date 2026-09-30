---
name: ui-system-architecture
description: Design or restructure browser UI system layers, tokens, component contracts, state ownership, feature adapters, and migration strategy. Use for architecture proposals; exclude visual-direction-only work, implementation-only tasks, and non-browser systems.
---

# UI System Architecture

Specify a project-owned UI system with clear contracts and real consumers. Architecture remains read-only unless implementation is also requested.

## Define The System

1. Read [ownership and scope](../../references/ownership-and-scope.md), [web platform](../../references/web-platform.md), and the applicable [web profile](../../references/web-profiles.md). Map current entry points, consumers, framework conventions, and the boundary under discussion.
2. Read [system architecture](../../references/system-architecture.md) and [public API contracts](../../references/public-api-contracts.md). Define logical layers, dependency direction, reusable behaviors, component surfaces, patterns, feature adapters, and the contracts justified by actual consumers. State which roles can remain local or are unnecessary for this surface.
3. For state ownership, async coordination, URL/session state, persistence, or migration, read [state architecture](../../references/state-architecture.md). Name each value's authority, source of truth, lifetime, scope, and lifecycle before selecting an owner or proposing a store.
4. For shared tokens, themes, variants, density, or visual overrides, read [visual foundations](../../references/visual-foundations.md). Specify semantic roles, surface/state relationships, supported combinations, override ownership, and the first real consumers. Read [visual language](../../references/visual-language.md) for the visual reasoning; use `ui-visual-design` if the direction needs definition.
5. Specify a complete first consumer slice and compatibility strategy using [migration guidance](../../references/migration-workflow.md). Derive acceptance checks from [verification](../../references/verification.md).

## Deliver The Specification

Cover the proposed ownership and dependency model, public inputs and outputs, interaction and state contracts, responsive/accessibility behavior, migration sequence, and acceptance evidence. Distinguish current facts from proposals and record unresolved constraints. Scale the document to the requested change.

Keep the host framework and native API conventions. Logical layers are not a requirement to create six directories. Do not introduce a dependency, global store, or generalized component without a consumer and justified ownership. For an authorized design-and-build task, continue with `ui-system-implementation`. Follow [evidence storage](../../references/evidence-storage.md) for file outputs; a proposal does not imply permission to write a durable report.
