# Verification

## Source And Contract Checks

Select checks for the actual screen or changed contract. Shared-layer and adapter checks apply only when those roles exist; they do not require adding them.

Use [general UI principles](ui-principles.md) to identify the decision being verified. A stateless layout or copy change does not require persistence, asynchronous-operation, or system-extraction checks. Apply those checks only to contracts the surface actually has; missing optional capabilities are not automatically defects.

- Run the narrowest relevant type, lint, unit, and component tests.
- Confirm variants, sizes, slots, and semantic state attributes.
- Verify no unintended framework or UI-package dependency was added.
- Preserve stable test IDs and public behavior unless replacement was approved.
- Check that obsolete code is removed only when no consumer remains.
- Verify lower system layers import no domain, feature-adapter, view, or laboratory module.
- Verify domain modules import no UI module and production imports no laboratory module.
- Confirm feature terminology, selectors, normalization, and commands remain in the feature adapter rather than primitives or patterns.
- Exercise every migrated placement to prove it uses the same adapter contract.
- Confirm public inputs and outputs use the host framework's native conventions and reject invalid combinations.
- For changed visual foundations, check actual consumers, foreground/surface pairings, supported themes/densities, combined states, and scoped overrides. Use [visual foundations](visual-foundations.md) to decide the correction's owner.

## State Architecture Checks

When state is in scope:

- Name one authority and source of truth for every writable value.
- Confirm derived state cannot drift and editable drafts have explicit initialize, commit, cancel, conflict, and reset behavior.
- Verify primitives and patterns import no feature, application, server-cache, or persistence implementation.
- Justify global state with cross-feature consumers and a defined lifecycle.
- Exercise loading, empty, error, permission, stale, optimistic, cancellation, retry, and out-of-order completion paths that apply to the workflow.
- Verify URL history and deep links, persistence versions and recovery, hydration precedence, logout or account switching, and disposal where used.
- Confirm subscriptions are narrow enough to avoid unrelated UI updates.
- For presentation/query/sort changes, verify the actual data effects, host navigation behavior, and relevant context retention. Check any item-position fallback without requiring new anchors or persistence.
- For editable pending submissions, exercise submitted A followed by draft B, late acknowledgment, and further edits. Confirm which revision feedback describes and that current work is retained.
- For operations with uncertain delivery, distinguish confirmed rejection from an unknown outcome; verify recovery against actual status, retry, and cancellation guarantees. Exercise dismissal separately from draft discard or operation cancellation where supported.
- When first-use messaging exists, test its established evidence alongside initial loading, no matches, and a returning user's empty collection. An empty array alone must not select onboarding.

## Interaction Checks

Verify with keyboard and pointer:

- Tab order and visible focus
- Mixed pointer/keyboard input, text-entry focus, and supported user focus preferences; no global last-input rule should suppress required indication
- Arrow-key behavior for composite widgets
- Enter, Space, Escape, Home, and End where applicable
- Disabled and read-only behavior
- Pattern-appropriate overlay focus, keyboard exit, dismissal, and restoration; modal dialogs also require focus containment and an inaccessible background
- Accessible names, descriptions, errors, and relationships
- Drag, resize, and pointer-capture cleanup
- Commit and cancel payloads, prevented defaults, retained or restored focus, and listener disposal where editable controls expose those contracts
- Native form submission, useful label activation, paste/autofill, and retained input on recovery when forms change
- Interrupted, reversed, or repeated animated actions and reduced-motion behavior when motion changes; observe input responsiveness rather than inferring it
- For deferred focus changes, move to another control or workflow before the callback completes and verify that obsolete work cannot reclaim focus; also verify legitimate initial and return focus
- For changed entry flows, compare already known context with a genuinely unresolved choice and confirm that each uses the supported operation without redundant selection steps

## Layout Matrix

Choose representative viewport and container widths from the selected web profile. Test them independently:

- Wide content or application surface
- Typical browser viewport
- Narrow content region, application panel, or editor inspector
- Minimum supported web-surface width
- Zoomed text or browser zoom

Look for overflow, clipped labels, collapsing inputs, inaccessible controls, content starvation, accidental wrapping, and unstable scroll ownership. Include representative long/unbroken/localized content and relevant font or media fallbacks. For affected mobile flows, check sticky controls, overlays, and the on-screen keyboard on a supported surface; desktop resizing alone is insufficient.

## Visual QA

For changed composition and copy, assess both overapplication and underapplication. Check that grouping, reading order, priority, and action placement express actual relationships; excessive gaps must not detach related information, and compression must not impair reading or operation. Verify content-driven sizes with actual text, controls, and gaps rather than treating a minimum height as an exact height.

For each supporting explanation, identify the specific information it contributes and whether a heading or container adds meaning. Check both redundant copy and missing constraints, consequences, or recovery. Retain substantive content, meaningful labels, and accessible relationships. Design rationale and review annotations should remain distinguishable from product copy. Judge task consequences rather than rewarding a lower word count or a cleaner screenshot alone.

Implementation checks the changed consumer slice. For a requested rendered assessment, use [inspection-workflow.md](inspection-workflow.md). Select relevant checks instead of requiring a whole-product audit for every change.

When a runnable web UI and browser-control capability are available:

1. Keep visual QA read-only unless implementation is explicitly requested.
2. Capture the baseline before implementation.
3. Exercise the changed workflow and all meaningful states.
4. Inspect at the relevant layout matrix sizes.
5. Compare information hierarchy, composition, type/rhythm, assets/surfaces, density, and state clarity with the design specification and actual content. Use [visual language](visual-language.md) and [UI usability](ui-usability.md) to diagnose differences. Explain necessary departures.
6. Re-run after fixes and retain reproducible evidence.

Use equivalent content, state, theme, size, and loading conditions for comparisons where possible. Verify the diagnosed issue and affected shared placements, not just a more attractive after-image. Treat optional aesthetic alternatives as preferences; do not continue polishing beyond the authorized change by default.

Preview images are supporting evidence, not a substitute for interaction tests. For necessary temporary captures, follow [evidence-storage.md](evidence-storage.md): use managed project-local storage, clean task-owned captures, and disclose cleanup failures. Explicit no-filesystem-writes instructions forbid captures that require a file. Durable reports require a report request.

## Completion Evidence

Report:

- Commands run and their results
- Surfaces and sizes inspected
- Keyboard and accessibility paths exercised
- Preserved behavior
- Skipped checks and why
- Residual risks and the next safe migration slice
