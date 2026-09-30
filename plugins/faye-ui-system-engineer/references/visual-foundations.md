# Visual Foundations

Use this guidance when defining or changing shared tokens, themes, variants,
density, or visual overrides. Preserve the host system's naming and styling
mechanism. A coherent local layout does not require a token framework.

## Define Roles And Relationships

Start with what a value means and which consumers share that meaning. A palette
value answers which color; a semantic role answers where and why it is used.
Existing palette, semantic, and component aliases may be useful, but do not add
all three layers merely to reproduce that structure.

| Contract | Decisions to keep together |
| --- | --- |
| Surfaces and foregrounds | Identify page, grouped, raised, and selected surfaces actually needed, with readable primary/secondary text and icons on each. A muted foreground is still information, not permission for illegibility. |
| Interaction and status | Separate action emphasis from success, warning, error, and selection. Specify applicable hover, pressed, focus, selected, invalid, busy, and disabled treatments; do not replace every state with the brand accent. |
| Borders and elevation | Define whether an edge separates groups, bounds an input, signals a state, or distinguishes an overlay. Reserve elevation for a meaningful layer relationship rather than applying shadows to every component. |
| Typography | Share roles with compatible family, size, weight, line height, and wrapping behavior. Changing only font size can break a control's baseline, height, and neighboring roles. |
| Spacing and density | Relate internal padding, gaps, row height, and text metrics. Compact density may reduce redundant framing and gaps while preserving readable content, focus, and usable hit areas. |
| Shape, icons, and motion | Keep related controls' radii, icon optical size/weight, and transition behavior coherent. Deliberate exceptions need a role, not a new token for every observed number. |

Map these roles onto the existing system before introducing values. Reuse a token
because its meaning matches, not because its current value happens to match.
Conversely, two roles need not be merged merely because today's values are equal.
Keep focus and status distinguishable through appropriate non-color cues as well.

## Themes, Surfaces, And Variants

A theme changes the values assigned to roles while preserving their meaning.
For each supported theme, consider foreground/background pairs, control edges,
selected and invalid states, focus, and overlays together. Inverting colors or
replacing a page background alone does not establish a working theme. Contrast
claims require measurement of the actual applicable combinations.

Nested surfaces need context: a control on a page and the same control in a raised
panel may need different surface values while retaining the same action and state
contract. Use the host's scoped variables, theme context, or established equivalent.
Check inheritance and portals/overlays that may render outside that scope. Do not
hide assumptions about a feature's DOM ancestry inside reusable component CSS.

Variants express meaningful alternatives such as action priority; sizes and
density express supported geometry. Define the combinations actually consumed,
including state precedence when selected, focused, invalid, or disabled states
coexist. Avoid independent switches that admit incoherent combinations. Keep
business rules determining those states outside the visual foundation.

## Locate The Correction

| Finding in source and consumers | Appropriate owner |
| --- | --- |
| A consumer hardcodes a value for a role the system already has | Adopt the existing role and verify that its meaning fits. |
| Several consumers need the same meaning but no role represents it | Add the smallest reusable role and migrate those consumers together. |
| One component renders an existing role or state inconsistently | Correct that component or supported variant; do not change the whole palette to compensate. |
| An intentional theme or embedded region needs different role values | Use a scoped override with explicit foreground, state, and inheritance relationships. |
| A screen needs different column proportions, image crop, or local optical alignment | Keep the composition value local unless actual reuse establishes a shared contract. |
| Similar-looking screens have different underlying causes | Diagnose separately; appearance alone does not establish a common token defect. |

For shared changes, identify affected consumers and supported themes/densities
before migration. Remove superseded values only after those consumers use the
replacement. Use [system architecture](system-architecture.md) and
[migration guidance](migration-workflow.md) for ownership and compatibility.

## Worked Shared-Control Decision

A project has an outlined filter control on both a page and a raised work panel,
with light and dark themes. The panel copy uses a hardcoded white background and
the brand color for both selection and errors. Its text disappears in dark mode.

Keep one control contract. Bind its resting surface and foreground to the host's
appropriate contextual roles; use its selection role for selection and its invalid
role plus an error association for invalid input. Preserve a visible focus cue
when the control is also selected or invalid. Let the panel's scope provide the
needed surface values rather than adding a panel-specific branch to the control.
If the project lacks contextual roles, introduce only those justified by these
placements; the example does not require these particular token names or layers.

Check both placements in both supported themes, relevant combined states, long
labels, and the supported compact density. Include a popup if it escapes the
panel's theme scope. Reject changing the global page foreground to rescue this
single control: unrelated content already depends on that role. A one-off icon
optical adjustment remains local and does not become a theme token.
