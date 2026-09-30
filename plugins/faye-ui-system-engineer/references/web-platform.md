# Web Platform

Apply the shared UI-system architecture only to browser-rendered surfaces.
Preserve the host project's rendering model, web framework, styling approach,
package boundaries, and browser-support policy.

## Platform Contracts

- Prefer semantic HTML and native controls before custom roles or interaction
  models.
- Use CSS and the project's established styling system for visual contracts.
- Expose reusable state through native attributes, ARIA, and stable `data-*`
  attributes where appropriate.
- Preserve the host framework's properties, events, bindings, slots,
  composition, reactivity, refs, and lifecycle conventions.
- Keep DOM listeners, observers, pointer capture, timers, and overlay resources
  paired with explicit cleanup.
- Respect document, focus, history, top-layer, scrolling, and form behavior
  owned by the browser.
- Do not force a client-only, server-rendered, hydrated, single-page, or
  multi-page architecture. Follow the host project.

## Web Layout And Interaction

Choose breakpoints when content relationships stop working, not solely from
device names. Decide what wraps, stacks, moves, or scrolls while preserving
reading order, important comparisons, and reachable actions. Treat
viewport and container size separately for resizable panels. A compact view need
not reproduce desktop geometry, but it must retain the essential task.

Let flexible text regions shrink and wrap deliberately. Long URLs, unbroken names,
translated labels, and user content may expose intrinsic-size constraints that
ordinary copy does not. Fix the responsible grid/flex sizing or wrapping rule
rather than hiding page overflow. Keep tables and other genuinely two-dimensional
content in accessible local scrolling when linear reflow would destroy meaning;
do not convert all tables to cards automatically.

Preserve browser zoom, enlarged text, and user style preferences. Viewport width
does not establish input method: touch can occur on a wide screen and a keyboard
on a small one. Use supported pointer/hover capabilities where a distinction is
needed, retain keyboard access, and give hover-only content an alternative path.
Dragging should have a suitable non-drag alternative when the operation requires
it for supported users; use the existing command contract rather than inventing
a second behavior.

Sticky headers, bottom actions, and overlays must leave focused controls and
essential content reachable. Account for browser chrome, safe areas where relevant,
and the on-screen keyboard on supported mobile surfaces. Use the host's viewport
sizing approach and check actual scrolling/focus; a desktop resize alone does not
establish keyboard behavior. Avoid nested scroll regions without a task need.

Overlays need deliberate clipping, stacking, placement, dismissal, and focus
behavior. Prefer the host's established primitive and native top-layer mechanisms
where appropriate. Increasing z-index does not solve clipping or a misplaced
containing block. Verify theme scope if an overlay is rendered elsewhere in the DOM.

Choose focus behavior from the interaction pattern, not the fact that something
floats above the page. A modal dialog needs intentional initial focus, containment,
background inaccessibility, dismissal, and a logical return destination. Do not
apply modal trapping to menus, tooltips, or non-modal popovers: preserve their
appropriate keyboard exit and access to the surrounding task. Reuse the host's
primitive and check that its behavior matches its declared modality.

## Native Controls And Input

Prefer native navigation, form submission, validation, and activation semantics
when they meet the product contract. Use ARIA for missing semantics and
relationships, not to replace correct native elements. Avoid handling both native
activation and a custom keyboard path in a way that fires the same action twice.

- Use an actual label and an appropriate input type, name, autocomplete purpose,
  and input mode. A numeric keyboard can help digit entry, but identifiers such
  as account numbers are not quantities to increment or parse as arithmetic.
- Preserve paste, selection, browser/password-manager assistance, and supported
  native submission. Do not block them to enforce formatting; normalize through
  the existing input contract without surprising caret movement or lost input.
- Distinguish disabled from read-only and use the correct button type inside a
  form. Label activation should reach the associated control; decorative wrappers
  must not intercept its interaction.
- Validate at a useful point rather than displaying errors before users can
  reasonably complete entry. Keep error associations, entered values, and the
  supported recovery intact. Do not invent validation or permission policy.

Use [UI usability](ui-usability.md) for labels, feedback, and recovery decisions,
and the host's existing patterns for composite keyboard and focus contracts.

## Motion And Rendering

Choose motion only after its purpose is clear in
[visual language](visual-language.md). Repeated controls need prompt feedback;
do not delay input or hold users behind a decorative transition. Coordinate
related transitions so position, emphasis, and state tell the same story.

Define what happens when a transition is interrupted, reversed, or triggered
again. Settle into the current state rather than queueing stale visual feedback.
Keep essential content visible if animation fails or is disabled. Reduced-motion
behavior must preserve the state change, often through an immediate update or a
less spatial transition. Avoid perpetual decorative movement competing with work;
provide appropriate control when sustained motion is part of the experience.

Animate only the properties that need to change; broad transitions can animate
layout or colors unintentionally. Transform and opacity are often economical,
but are not a universal prescription. Avoid repeated layout reads/writes,
expensive full-surface effects, and work on every pointer or input event when a
cheaper local update meets the contract. Check typing, scrolling, and repeated
interaction before claiming smoothness. Follow host performance requirements;
ordinary UI work does not authorize whole-application optimization.

## Fonts And Media

Use available font weights and required glyph coverage. Account for fallback
metrics, language, and late loading so text remains readable and controls do not
clip or jump unexpectedly. Use the host's font-loading policy; avoid downloading
unneeded families/weights or making essential text depend on a decorative font.
Specify full text roles rather than changing only one size value.

Reserve appropriate image/video dimensions or aspect ratios and supply useful
responsive sources where the host supports them. Choose sufficient resolution
without serving oversized media for a small placement. Do not lazy-load a known
critical first-view asset by habit; defer offscreen media when appropriate. Keep
missing/failed assets from removing their accompanying information or action.
Alternative text depends on the image's purpose; decorative media should not
repeat nearby content to assistive technology. Asset selection and crop decisions
belong in [visual language](visual-language.md).

## Source And Runtime Evidence

The bundled scanner analyzes documented HTML, CSS, JavaScript, TypeScript,
React, Vue, and Svelte source forms. It supplies static leads only. Confirm
important accessibility, layout, lifecycle, state, and interaction claims in
source and a running browser surface.

Framework recognition never authorizes a dependency, framework migration,
rendering-model change, or a particular web product profile.
