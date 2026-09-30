# UI Usability

Evaluate the task the surface supports. Select relevant checks and use evidence
that can establish them; a screenshot cannot prove semantics or interaction.

## Orientation And Decisions

Make the current location, relevant information, and next useful action clear.
Keep the information needed for a decision near that decision: price near a
purchase action, an affected item near its destructive action, or current filters
near their results. Do not require users to remember a value from another panel
when it can remain visible. Preserve useful selection, input, and navigation
context across the supported flow.

Group by meaning and distinguish primary, secondary, and destructive actions.
Use links for destinations and buttons for actions; preserve browser navigation.
Make comparable records use consistent fields and terminology. Keep important
context available when revealing details; hiding everything behind tooltips or
menus can reduce visual clutter while increasing the work of comparing or acting.

Progressive disclosure suits optional explanation and infrequent advanced choices.
It should not conceal required input, the consequence of an action, or the main
information users repeatedly compare. Reuse familiar host patterns for navigation,
forms, and commands unless a demonstrated task benefit justifies a different one.
Do not add bulk actions, shortcuts, or onboarding merely to fill a feature list.

## Content And Message Hierarchy

Read the whole interaction path, not just individual strings. Identify what users
need to recognize, decide, enter, and understand afterward. Lead with that
information and distinguish secondary context through structure and emphasis.

| Symptom | Useful correction |
| --- | --- |
| Heading, introduction, card subtitle, and helper text repeat the same point | Keep the clearest statement at the appropriate level. Reserve helper text for constraints or uncertainty it actually resolves. |
| Every paragraph becomes a card, badge, icon, or callout | Group by decision or topic first. Use plain sections or a list where separate containers imply no useful distinction. |
| A dense paragraph mixes instructions, constraints, and consequences | Put required instructions beside the affected control; separate comparable items or steps when their relationships justify it. Do not delete essential information to meet a word quota. |
| Generic actions such as "Continue" obscure a consequential next step | Name the outcome where it matters, such as submitting a request versus saving a draft. Preserve established terminology across action and feedback. |
| Internal terms force users to translate implementation details | Use the audience's language. Retain familiar domain terms when they are more precise; explain unfamiliar ones where needed. |
| Technical failure text gives no next action | State what could not happen, what work remains intact, and the supported recovery. Avoid promising retry or undo that the product does not implement. |

Keep voice appropriate to the task. Routine success needs little ceremony; loss,
permissions, and consequential actions need clear, factual wording. Avoid vague
promotional adjectives, excessive reassurance, and jokes that obscure an error.
Preserve approved copy and factual claims unless editing them is in scope. Missing
copy may be proposed, but do not invent customers, capabilities, or measurements.

Give controls persistent labels and state units or required formats where ambiguity
matters. Placeholders can illustrate input, not replace labels. Icon-only controls
need accessible names and a recognizable visible meaning; add a visible label
when recognition is doubtful. Decorative icons should not add redundant announced
content. Keep labels, help, and errors associated with their control.

Check long names, dense and sparse data, missing assets, and empty results. Allow
content to grow without losing the action or its context. Do not build sentences
from fragments that prevent translation, or assume a label's English length.
Use the project's locale conventions for dates, numbers, units, and direction.

## Feedback And Recovery

- Distinguish an empty collection, no search matches, loading, unavailable data,
  and lack of permission. Each has a different explanation and next step. A
  loading indicator must not imply that a failed request is still progressing.
- Make progress and completion understandable without relying only on animation
  or color. Retain context during loading and prevent duplicate operations when
  necessary without disabling unrelated work.
- Associate errors with the affected control and explain a supported recovery.
  Preserve correct input on recoverable failures. Check how keyboard and assistive
  technology users discover validation and asynchronous feedback; visible text
  alone does not establish that an update is announced.
- Define relevant commit, cancel, retry, disabled, invalid, and busy behavior.
  Explain a blocked action where users need to resolve it; a disabled button
  alone may not disclose the missing condition. Completion should confirm the
  affected object or changed state without repeated disruptive notifications.
  Avoid moving focus after an async completion if the user has already moved on.
  Use confirmation or recovery appropriate to consequential actions and the host
  product's existing contract; do not impose a modal on every operation.

## Access And Layout

- Prefer native controls and inspect accessible names and relationships in source
  or the accessibility tree. Exercise keyboard operation and visible focus;
  focused elements must remain perceivable around sticky chrome and overlays.
- Check target usability with the intended input methods. Do not shrink hit areas
  just to make a dense layout fit. A hover-only explanation needs another access
  path for keyboard and touch users where those inputs are supported.
- Measure relevant text and control contrast against actual backgrounds before
  claiming a ratio or standard conformance. A palette swatch or screenshot alone
  does not establish all rendered states, image backgrounds, and transparency.
- Test text enlargement and reflow as well as viewport resizing. Preserve actions
  and information; do not hide overflow to conceal a layout defect. Tables and
  other inherently two-dimensional content may need contained scrolling while
  surrounding text and controls reflow.
- Test container resizing when panels resize independently. Maintain readable
  labels, accessible overflow, clear scroll ownership, and enough content space.
- When motion is used, respect reduced-motion preferences and preserve the state
  change without nonessential animation. Check supported themes, localization,
  RTL, or additional input methods when relevant to the product or request.

Use [verification](verification.md) for evidence collection and exercised paths.
Use [web platform](web-platform.md) for native input, responsive, and motion
mechanics; use [visual language](visual-language.md) for visual hierarchy and craft.
These checks support task-level UI evaluation, not a claim of full accessibility
certification. User research, service design, market strategy, and whole-product
information architecture changes require their own scope.
