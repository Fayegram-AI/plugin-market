# Migration Workflow

Read [web-platform.md](web-platform.md) and
[web-profiles.md](web-profiles.md) before choosing a slice. The profile
determines whether a coherent slice is content and navigation, an application
workflow, or an editor or workspace workflow.

## Choose A Vertical Slice

Select one real workflow that exercises the contracts being changed. Do not add
missing layers solely to satisfy a sequence. Prefer a bounded surface such as one navigation group, content
section, form, application command surface, toolbar group, inspector section,
dialog, tree, or property workflow.

Record:

- Preserved behavior and selectors
- Changed contracts and existing components that can be reused
- State authority, lifetime, source of truth, and reset boundaries
- Responsive and accessibility acceptance criteria
- Tests and manual verification

When the slice includes shared stores, URL or session state, async or server
data, persistence, hydration, or state migration, read
[state-architecture.md](state-architecture.md). Inventory every writable,
derived, persisted, and asynchronous value before moving code.

## Implement The Necessary Dependencies First

1. Reuse existing tokens and controls; add or normalize only what the slice needs.
2. Change primitive or behavior contracts only when the consumer requires it.
3. Extract a pattern when shared composition or coordinated behavior justifies it.
4. Keep domain mapping and commands at the feature boundary. Use a feature adapter
   when this mapping needs a reusable owner; local stateless composition needs none.
5. Migrate every affected placement in the bounded slice to the chosen contract.
6. Remove duplicate writable state and superseded code only after proving no
   consumer remains.
7. Verify source contracts, reset and disposal boundaries, and the running
   interface.

Keep compatibility shims narrow, documented, and temporary. Do not run two
independent behavior implementations behind the same public control.

Skip unneeded steps. The dependency sequence is logical, not a required folder
template or an obligation to build every layer:

```text
behavior + primitive -> pattern -> feature adapter -> view
```

A content screen can use existing controls directly. A local disclosure may need
only native markup and styles. A domain property edited in several placements
may justify a shared adapter. Choose from actual ownership and reuse needs.

Read [public-api-contracts.md](public-api-contracts.md) before expanding props,
events, attributes, slots, or other public surfaces.

## Web Framework Routing

- Vanilla DOM: centralize factories and behavior controllers; use native custom
  events or existing project signals consistently.
- React: preserve state ownership and composition conventions; do not add React
  to a non-React host.
- Vue or Svelte: preserve their native reactivity and component composition;
  avoid framework-agnostic wrappers that erase useful semantics.
- Web components: define attribute, property, event, slot, and lifecycle
  contracts explicitly.

Use CSS custom properties for semantic runtime theming unless the host has an
established equivalent. Keep component CSS colocated according to project
conventions.

## Prevent Migration Drift

- Do not redesign unrelated features during system extraction.
- Do not rename public commands or product terminology without approval.
- Do not add, remove, or update dependencies, package-manager metadata, or
  lockfiles without separate explicit authority.
- Preserve focus behavior, keyboard shortcuts, automation selectors, and saved
  layout state.
- Keep commits and releases outside scope unless requested.
- Stop broad migration when the first slice disproves the proposed contract;
  revise the contract before continuing.
