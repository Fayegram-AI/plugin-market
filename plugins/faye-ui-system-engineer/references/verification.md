# Verification

## Source And Contract Checks

Select checks for the actual screen or changed contract. Shared-layer and adapter
checks apply only when those roles exist; they do not require adding them.

- Run the narrowest relevant type, lint, unit, and component tests.
- Confirm variants, sizes, slots, and semantic state attributes.
- Verify no unintended framework or UI-package dependency was added.
- Preserve stable test IDs and public behavior unless replacement was approved.
- Check that obsolete code is removed only when no consumer remains.
- Verify lower system layers import no domain, feature-adapter, view, or
  laboratory module.
- Verify domain modules import no UI module and production imports no laboratory
  module.
- Confirm feature terminology, selectors, normalization, and commands remain in
  the feature adapter rather than primitives or patterns.
- Exercise every migrated placement to prove it uses the same adapter contract.
- Confirm public inputs and outputs use the host framework's native conventions
  and reject invalid combinations.
- For changed visual foundations, check actual consumers, foreground/surface
  pairings, supported themes/densities, combined states, and scoped overrides.
  Use [visual foundations](visual-foundations.md) to decide the correction's owner.

## State Architecture Checks

When state is in scope:

- Name one authority and source of truth for every writable value.
- Confirm derived state cannot drift and editable drafts have explicit
  initialize, commit, cancel, conflict, and reset behavior.
- Verify primitives and patterns import no feature, application, server-cache,
  or persistence implementation.
- Justify global state with cross-feature consumers and a defined lifecycle.
- Exercise loading, empty, error, permission, stale, optimistic, cancellation,
  retry, and out-of-order completion paths that apply to the workflow.
- Verify URL history and deep links, persistence versions and recovery,
  hydration precedence, logout or account switching, and disposal where used.
- Confirm subscriptions are narrow enough to avoid unrelated UI updates.

## Interaction Checks

Verify with keyboard and pointer:

- Tab order and visible focus
- Arrow-key behavior for composite widgets
- Enter, Space, Escape, Home, and End where applicable
- Disabled and read-only behavior
- Pattern-appropriate overlay focus, keyboard exit, dismissal, and restoration;
  modal dialogs also require focus containment and an inaccessible background
- Accessible names, descriptions, errors, and relationships
- Drag, resize, and pointer-capture cleanup
- Commit and cancel payloads, prevented defaults, retained or restored focus,
  and listener disposal where editable controls expose those contracts
- Native form submission, useful label activation, paste/autofill, and retained
  input on recovery when forms change
- Interrupted, reversed, or repeated animated actions and reduced-motion behavior
  when motion changes; observe input responsiveness rather than inferring it

## Layout Matrix

Choose representative viewport and container widths from the selected web
profile. Test them independently:

- Wide content or application surface
- Typical browser viewport
- Narrow content region, application panel, or editor inspector
- Minimum supported web-surface width
- Zoomed text or browser zoom

Look for overflow, clipped labels, collapsing inputs, inaccessible controls,
content starvation, accidental wrapping, and unstable scroll ownership.
Include representative long/unbroken/localized content and relevant font or media
fallbacks. For affected mobile flows, check sticky controls, overlays, and the
on-screen keyboard on a supported surface; desktop resizing alone is insufficient.

## Visual QA

Implementation checks the changed consumer slice. For a requested rendered
assessment, use [inspection-workflow.md](inspection-workflow.md). Select relevant
checks instead of requiring a whole-product audit for every change.

When a runnable web UI and browser-control capability are available:

1. Keep visual QA read-only unless implementation is explicitly requested.
2. Capture the baseline before implementation.
3. Exercise the changed workflow and all meaningful states.
4. Inspect at the relevant layout matrix sizes.
5. Compare information hierarchy, composition, type/rhythm, assets/surfaces,
   density, and state clarity with the design specification and actual content.
   Use [visual language](visual-language.md) and [UI usability](ui-usability.md)
   to diagnose differences. Explain necessary departures.
6. Re-run after fixes and retain reproducible evidence.

Use equivalent content, state, theme, size, and loading conditions for comparisons
where possible. Verify the diagnosed issue and affected shared placements, not
just a more attractive after-image. Treat optional aesthetic alternatives as
preferences; do not continue polishing beyond the authorized change by default.

Preview images are supporting evidence, not a substitute for interaction tests.
For necessary temporary captures, follow [evidence-storage.md](evidence-storage.md):
use managed project-local storage, clean task-owned captures, and disclose
cleanup failures. Explicit no-filesystem-writes instructions forbid captures
that require a file. Durable reports require a report request.

## Completion Evidence

Report:

- Commands run and their results
- Surfaces and sizes inspected
- Keyboard and accessibility paths exercised
- Preserved behavior
- Skipped checks and why
- Residual risks and the next safe migration slice
