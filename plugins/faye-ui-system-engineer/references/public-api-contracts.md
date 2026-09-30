# Public UI Contracts

Use the host web framework's native component and event model. Regulate
ownership and meaning rather than inventing one cross-framework prop schema.

## 1. Ownership And Dependency Direction

Assign each public surface to the lowest layer that can own it without learning
product terminology:

- Foundations define semantic values and contain no component or product logic.
- Primitives and behaviors depend on foundations and host platform APIs.
- Patterns compose primitives and behaviors into reusable UI workflows.
- Feature adapters combine system patterns with domain state, validation, and
  commands.
- Views assemble feature adapters and may use primitives or patterns directly
  for genuinely generic local chrome.
- Domain modules do not import UI modules.
- Production modules do not import the UI laboratory.

Lower UI layers must not import views, feature adapters, or domain modules.
Feature adapters are the deliberate boundary where product meaning enters UI
composition. These are logical roles, not required directories or one-file-per-
layer rules.

## 2. Native Surface, Public Target, And Host-Native Realization

Name the intended public consumer before expanding an interface: system-wide
primitive, reusable pattern, feature adapter, or local view helper.

Expose the host's useful native surface rather than translating it into a
second framework:

- Vanilla DOM uses properties, attributes, native elements, events, and
  explicit disposal.
- React preserves component composition, refs, controlled state, and callback
  conventions.
- Vue and Svelte preserve their native reactivity, bindings, events, and slots.
- Web Components define properties, attributes, events, slots, and lifecycle.

Do not forward every possible native option speculatively. Expose the semantic
surface required by real consumers, and keep framework or platform escape
hatches explicit.

## 3. State Ownership

The system layer may own interaction-local mechanics such as roving focus,
open or closed state, transient input text, dismissal, pointer capture, and
the last value needed to cancel an edit.

The owning feature retains domain state, persistence, validation policy,
permissions, commands, and business decisions. A primitive or pattern must not
accept a scene, document, account, record, product command, or feature store to
perform its work.

Controlled and uncontrolled forms may coexist only when their precedence and
change signals are explicit in the host framework. Avoid two independent
sources of truth behind one public control.

For URL, session, server, persistent, application-wide, or cross-feature state,
classify the complete ownership and lifecycle contract in
[state-architecture.md](state-architecture.md). A globally accessible value is
not automatically global state, and reusable UI must not import a product
store for convenience.

## 4. Semantic Outputs And Composition

Report user intent in terms appropriate to the public target. A system control
may report commit, cancel, select, dismiss, expand, or resize intent; it must
not invoke a product command or manufacture domain identifiers.

Use the host's native output mechanism and document:

- Payload shape and units
- Trigger and cancellation reason
- Bubbling or propagation behavior where applicable
- Keyboard and focus result
- Cleanup or disposal responsibility

Feature adapters translate these semantic outputs into domain values and
commands. Views should not repeat that translation for each placement.

## 5. Invalid Combinations And Split Triggers

Reject invalid combinations at the narrowest useful boundary. Use types,
runtime validation, or documented mutually exclusive forms according to the
host project.

Split or compose a new public target when:

- An option exists for only one feature or view.
- Boolean options interact to create ambiguous or impossible states.
- An option changes the semantic role, state owner, or event contract.
- Callers must supply unrelated domain data for a generic control.
- Multiple consumers repeat the same mapping and command behavior.

There is no universal prop-count limit. A larger coherent native surface is
safer than a smaller interface whose flags conceal multiple components.

## 6. Compatibility And Consumer Justification

Every public addition needs a current consumer and a stated ownership reason.
Preserve established exports, event names, selectors, test IDs, accessible
relationships, keyboard behavior, focus behavior, and persistence unless an
approved contract replaces them.

When extracting a shared target:

1. Record the current consumer contracts.
2. Implement the smallest coherent shared surface.
3. Migrate a complete consumer.
4. Remove the superseded path only after proving it is unused.
5. Verify the shared target and each migrated placement.

Do not keep permanent compatibility aliases, parallel behavior engines, empty
wrappers, or speculative universal components.
