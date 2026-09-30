# System Architecture

Build the smallest owned web UI system that supports real consumers. Apply
these shared layers through the selected profile in
[web-profiles.md](web-profiles.md) and the browser contracts in
[web-platform.md](web-platform.md).

## Layers

1. Foundations: semantic color, typography, spacing, radius, elevation, motion,
   density, and z-order tokens.
2. Primitives: native-HTML-first controls with stable variants, sizes, slots,
   and state attributes.
3. Behaviors: DOM focus, keyboard navigation, dismissal, overlays, positioning,
   selection, resizing, and ARIA coordination.
4. Patterns: toolbar groups, inspectors, trees, property rows, command surfaces,
   forms, panels, and split views composed from primitives.
5. Product features: feature adapters combine system patterns with domain
   state, commands, validation, terminology, and content decisions.
6. UI laboratory: isolated states, combinations, density, themes, and responsive
   behavior used for development and regression review.

## Dependency Direction

- Foundations import no higher UI layer.
- Primitives and behaviors depend only on foundations and host platform or
  framework APIs.
- Patterns depend on primitives and behaviors.
- Feature adapters depend on system patterns or primitives and on their owning
  domain interfaces.
- Views depend on feature adapters. They may use primitives or patterns
  directly for genuinely generic local chrome.
- Domain modules do not depend on UI modules.
- Production modules do not depend on the UI laboratory.

Lower system layers never import domain code, feature adapters, or views. The
feature adapter is the explicit boundary where domain values and commands enter
UI composition.

These are logical roles. Preserve a coherent host-project layout instead of
requiring one directory, file, module, or wrapper for every layer. A screen need
not instantiate all roles: retain local stateless composition and existing native
controls where they already meet the contract. Extract a boundary for actual
shared behavior or domain mapping, not merely to reproduce this layer list.

## Primitive Contracts

For each primitive, define:

- Semantic element or role
- Variants and sizes
- Slots and composition rules
- Controlled and uncontrolled state, where applicable
- Disabled, invalid, busy, selected, expanded, and pressed states
- Keyboard and focus behavior
- Accessible name and relationship requirements
- Container and overflow behavior
- Test selectors and compatibility expectations

Expose states through semantic attributes such as `disabled`, `aria-*`, or
`data-*`. Avoid contextual selectors that require knowledge of a feature's DOM
ancestry.

Read [public-api-contracts.md](public-api-contracts.md) when defining module
boundaries, component props, DOM properties, events, slots, adapters, or other
public UI surfaces.

Read [state-architecture.md](state-architecture.md) when the system includes
shared stores, async or server data, URL or session state, persistence,
hydration, cross-feature coordination, or state migration. State ownership
follows the same dependency direction: reusable UI reports intent, feature
adapters bridge to domain state and commands, and application composition owns
only genuinely cross-feature concerns.

## Architectural Lessons

- Separate reusable interaction behavior from visual treatment.
- Keep reusable component source and semantic tokens owned by the host project.
- Define variants, sizes, slots, density, and theme contracts explicitly.

For shared visual contracts, read [visual foundations](visual-foundations.md).
Name roles and their foreground/surface/state relationships, supported theme and
density combinations, scope of overrides, and the first actual consumers. Keep
local composition values local when they do not represent a shared contract.

Do not copy reference-package internals or install reference systems by
default. Translate useful principles into the host project's language and
constraints.

## Native-First Boundary

Use native controls when they already provide correct semantics. Centralize
custom behavior for dialogs, menus, listboxes, toolbars, trees, tooltips,
popovers, splitters, and composite widgets because their keyboard and focus
contracts span multiple elements.

## Avoid False Systems

Do not create:

- Tokens with no semantic role
- Generic components with no migrated consumer
- A second event or state model
- Wrapper components that only rename native attributes
- Feature-specific exceptions hidden inside primitives
- Global CSS that depends on accidental DOM structure
