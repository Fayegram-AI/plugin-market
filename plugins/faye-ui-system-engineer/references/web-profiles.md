# Web Profiles

Select profiles from the purpose and behavior of each in-scope surface, not
from its framework or visual density. A product may combine profiles, but each
surface should have one stated primary profile.

## Content Website

Use when the primary experience is reading, discovering, navigating, or
submitting content.

Prioritize:

- Semantic document structure and heading hierarchy
- Links, navigation landmarks, and predictable browser history
- Content width, typography, media, and long-form reflow
- Forms that retain native submission and validation behavior when practical
- Progressive enhancement and resilient loading
- Focus order that follows the document and reading flow

Within this profile, let the task choose the composition. Sustained reading needs
a stable text measure and heading rhythm; discovery needs meaningful entry points
and selective imagery; comparison needs repeated fields that can be scanned
together. A promotional introduction should not displace the information visitors
need to decide. Do not apply one hero/card template to all these tasks.

Do not introduce application-shell, command-surface, panel, or editor
abstractions without a real website consumer.

## Web Application

Use when the primary experience is a stateful workflow performed in the
browser.

Prioritize:

- Application-shell and route ownership
- Loading, empty, error, permission, and stale-data states
- Forms, mutations, commands, dialogs, overlays, and notifications
- Focus movement and restoration across asynchronous state changes
- URL, session, local, and server state with explicit owners
- Keyboard efficiency where product workflows justify it

Keep task context, current state, and affected objects near their actions. Favor
predictable placement for repeated operations, and use emphasis to distinguish
decisions rather than decorate every module. Dense comparison and focused entry
can coexist; do not force both into the same card grid or spacing treatment.

Keep business state, validation policy, permissions, persistence, and commands
in their owning features. Reusable UI reports semantic user intent. Use
[state-architecture.md](state-architecture.md) when designing or changing these
state boundaries.

## Browser Editor Or Workspace

Use when the browser UI surrounds authored content or provides dense,
tool-oriented workflows.

Prioritize:

- Explicit separation between editor chrome and authored content
- Toolbars, inspectors, panels, trees, timelines, split views, and command
  surfaces justified by real workflows
- Container-aware layout for independently resizable regions
- Selection, resizing, shortcuts, roving focus, and overlay coordination
- Stable layout persistence, selectors, events, focus paths, and disposal
- Protection of authored document, canvas, diagram, preview, or scene content

Let chrome recede enough to keep authored content and active tools legible. Reduce
redundant framing before shrinking labels or targets. Check a property row's label,
value, error, and action together as the panel narrows; the authored canvas's visual
language does not automatically become the language of the inspector.

Do not infer this profile merely because the project contains a canvas, uses a
technical visual style, or has one dense screen.

## Mixed Web Products

Apply profiles per surface instead of forcing one product-wide classification.
For example, a public content area and an authenticated application area may
share foundations while retaining different patterns, density, navigation,
and interaction requirements. Share only contracts justified by real
consumers.
