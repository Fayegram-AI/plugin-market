# Web State Architecture

Use this reference when a web UI-system task includes state ownership, shared
stores, asynchronous or server data, URL or session state, persistence,
hydration, cross-feature coordination, or state migration. Preserve the host
project's framework and established state mechanisms. This contract does not
prescribe a store package or create a cross-framework state API.

## Contents

1. Decision procedure
2. State classes and owners
3. Dependency and data flow
4. Sources of truth and derived state
5. Async and server state
6. URL and persistent state
7. Lifecycle and reset boundaries
8. Public UI boundaries
9. Migration workflow
10. Verification and anti-patterns

## Decision Procedure

Classify state before choosing where it lives. Record:

- Authority: which layer is allowed to change the value.
- Lifetime: one interaction, one view instance, one route, one session, or
  longer.
- Scope: one element, one composed workflow, one feature, or several features.
- Source of truth: browser, server, authored-content model, domain model, or
  client-owned value.
- Shareability: whether navigation or a copied URL must reproduce it.
- Persistence: whether it survives reload, logout, account change, or schema
  evolution.
- Coordination: whether updates are synchronous, asynchronous, optimistic, or
  conflict-prone.

Choose the narrowest owner that has the required authority and lifetime.
Global state is an ownership outcome for genuinely cross-feature data, not a
default location for values that are merely convenient to access.

## State Classes And Owners

### Interaction-local state

Behaviors or primitives may own transient UI mechanics such as open state,
roving focus, draft input, drag state, pointer capture, and the value required
to cancel an edit. Dispose it with the owning interaction or element.

### View-local state

Views may own placement-specific state such as a local filter, a temporary
section expansion, or an uncommitted workflow step when no other placement
must observe it. Do not promote it solely to avoid passing an explicit input.

### URL and navigation state

The router or application composition owns state that must survive navigation,
participate in browser history, support deep links, or be shareable. Parse and
validate it at the navigation boundary; feature adapters consume normalized
values rather than raw URL strings.

### Feature and domain state

The owning feature or domain layer retains business values, validation policy,
permissions, commands, and invariants. UI modules observe it through narrow
interfaces and report intent through adapters; they do not become an alternate
domain authority.

### Server state

The host project's data-access or server-cache boundary owns remote records,
request status, freshness, invalidation, and retry policy. Do not copy server
data into a general client store unless a distinct editable snapshot or domain
workflow requires a second value with an explicit synchronization contract.

### Application and session state

Application composition may own authenticated identity, active account or
workspace, locale, runtime theme, connectivity, and other truly cross-feature
session concerns. Define which changes reset feature, URL, cache, and
persistent state.

### Persistent client state

An explicit persistence boundary owns serialization, storage keys, versions,
migration, recovery, and deletion. Features own the meaning of persisted
values. Primitives and patterns do not read browser storage directly.

### Authored-content state

Documents, canvases, diagrams, previews, and scenes remain in their owning
content or domain model. Surrounding application or editor chrome may select,
inspect, or command that model through feature interfaces, but must not create
a competing copy of authored content.

## Dependency And Data Flow

Use this direction unless the host project has an equivalent established
boundary:

```text
application composition
    -> feature or domain state + commands
    -> feature adapter
    -> patterns and primitives
```

User intent travels upward through semantic outputs. Current values and status
travel downward through explicit inputs or narrow subscriptions. Interaction-
local state stays inside the owning behavior, primitive, or composed workflow.

- Primitives and patterns do not import feature or application stores.
- Feature adapters may select domain values, convert units, provide product
  terminology, and translate semantic UI outputs into commands.
- Views compose adapters and may coordinate view-local or navigation state.
- Application composition wires cross-feature and session owners.
- Domain modules do not import UI modules.

## Sources Of Truth And Derived State

- Keep one authoritative value for each concern.
- Derive projections, counts, visibility, and formatted values when practical
  instead of synchronizing duplicate writable copies.
- If an editable draft intentionally diverges from its source, name both
  values, define initialization, commit, cancellation, conflict, and reset.
- Controlled and uncontrolled forms require explicit precedence and change
  signals. Do not hide two writable authorities behind one public value.
- Use selectors or equivalent narrow projections so consumers subscribe only
  to values that can affect them.
- Do not expose an entire store when a consumer needs one value and one intent.

## Async And Server State

For each asynchronous workflow, define:

- Loading, empty, error, permission, stale, and success representation.
- Request identity and the treatment of out-of-order responses.
- Cancellation or disposal when a view, route, account, or selection changes.
- Retry, invalidation, and refresh ownership.
- Optimistic value, rollback, reconciliation, and conflict behavior when used.
- Whether user input remains editable while work is pending.
- Focus and announcement results when completion changes the visible UI.

Do not let a primitive start business requests or infer cache policy. The
feature adapter invokes the owning command and maps its status into semantic UI
inputs such as busy, disabled, invalid, or described error state.

## URL And Persistent State

- Put reproducible navigation state in the URL when the product expects deep
  links, history, refresh continuity, or sharing.
- Keep sensitive values, credentials, and private records out of URLs and
  client persistence unless an approved security design requires them.
- Treat storage as an external boundary that can be missing, unavailable,
  malformed, stale, or written by an older schema.
- Version persisted shapes that can evolve. Define migration, fallback, and
  removal rather than silently accepting incompatible data.
- Separate persistence effects from in-memory state transitions so tests can
  verify each contract independently.
- During hydration, define which source wins and prevent a temporary default
  from overwriting an authoritative restored value.

## Lifecycle And Reset Boundaries

State architecture must define creation and disposal, not only reads and
writes. Verify behavior for route changes, view removal, logout, account or
workspace switching, permission changes, reconnect, and application reload.

Remove listeners and subscriptions with their owner. Cancel obsolete work or
ignore its result using an explicit request identity. Clear feature, cache, and
persistent state when its authority no longer applies; do not rely on a page
reload to repair ownership mistakes.

## Public UI Boundaries

Reusable UI accepts semantic values and reports semantic intent. Appropriate
inputs include selected, expanded, busy, invalid, value, and description.
Appropriate outputs include activate, select, commit, cancel, dismiss, and
resize.

Do not pass a product store, server client, account record, document model, or
business command into a primitive or pattern. Put that mapping in a feature
adapter and preserve the host framework's native input, event, subscription,
and lifecycle conventions.

## Migration Workflow

1. Inventory every readable, writable, derived, persisted, and asynchronous
   value in the bounded workflow.
2. Classify its authority, lifetime, scope, source of truth, and reset boundary.
3. Record compatibility requirements for URLs, storage keys, commands,
   selectors, events, loading states, and focus behavior.
4. Introduce the smallest missing owner or adapter without adding a parallel
   store or behavior engine.
5. Migrate every placement in the slice to the same source and command path.
6. Remove duplicate writable state only after proving no consumer remains.
7. Verify reload, navigation, async completion, cancellation, reset, and
   disposal in addition to the normal workflow.

## Verification And Anti-Patterns

Confirm that:

- Each writable value has one named authority.
- Derived values cannot drift from their source.
- Primitives and patterns import no feature, application, storage, or server
  state implementation.
- Global state has a documented cross-feature consumer and lifecycle.
- URL, server, session, and persisted values have explicit reconciliation and
  reset rules.
- Async completion cannot update an obsolete route, selection, account, or
  disposed view.
- Narrow subscriptions avoid unrelated rerenders or updates.
- Existing store, command, selector, URL, persistence, and accessibility
  contracts remain compatible unless an approved replacement exists.

Reject hidden duplicate sources of truth, one universal application store,
storage access from reusable controls, view-specific command dispatch copied
across placements, business requests started by primitives, and speculative
state abstraction with no migrated consumer.
