# Ownership And Scope

## Establish The Boundary

Name the browser-rendered UI surface and its web profile before judging it:

- Site or application chrome: navigation, account, settings, routing surfaces,
  and global dialogs.
- Editor chrome: toolbars, inspectors, panels, trees, timelines, status bars.
- Authored content: document, canvas, diagram, preview, or 3D scene.
- Browser surface: viewport, document, top layer, history, focus, and other
  browser-owned behavior.

Treat these as separate ownership domains. A request about site, application,
or editor chrome does not authorize changes to authored content rendered
inside it.

## Find The Owners

Inspect:

- UI entry points and composition roots
- Routes, document boundaries, hydration roots, and application shells
- State stores, commands, events, and feature controllers
- Shared style sheets and token definitions
- DOM or component factories
- Focus, overlay, shortcut, and drag-resize helpers
- Tests, stable selectors, and user-facing documentation

Map each behavior to one owner. Keep feature decisions with features and
reusable interaction mechanics with the UI system.

## Preserve The Host

- Follow repository instructions and existing package boundaries.
- Preserve the current framework unless migration is explicit.
- Reuse established helpers when their ownership is sound.
- Keep adapters thin and avoid parallel implementations.
- Treat unrelated dirty files as user work.

## Preserve The Authority Boundary

- Read-only modes may inspect files, repository state, and a running interface.
  Necessary temporary evidence follows [evidence-storage.md](evidence-storage.md);
  explicit no-filesystem-writes instructions forbid even temporary captures.
- A verb such as "improve," "update," or "clean up" is not write authority when
  the requested outcome remains materially ambiguous.
- A mixed request may authorize implementation, but diagnosis must establish a
  bounded change before edits begin.
- UI-source authority does not include dependencies, package-manager metadata,
  lockfiles, framework replacement, or ownership migration.
- Preserve staged, unstaged, untracked, and adjacent user changes.
- Use managed project-local temporary storage only for necessary captures;
  clean task-owned captures after use and disclose cleanup failures. Durable
  reports require a report request; source edits require implementation authority.

## Define Success

Record:

- In-scope surfaces and excluded surfaces
- Behaviors and selectors that must remain stable
- Target container sizes and input methods
- Accessibility and browser expectations
- Selected web profile for each in-scope surface
- The first vertical slice and its acceptance checks

If the boundary cannot be proven from source or runtime evidence, state the
assumption before recommending structural changes.
