# Scanner Rule Contract

Scanner findings are heuristic review leads, not correctness verdicts.
`warning` identifies a higher-risk accessibility or ownership signal; `info`
identifies architecture or consistency evidence that requires confirmation.

The dependency-free analyzer recognizes active style declarations, style-rule
nesting, multiline opening elements, common React, Vue, Svelte, and HTML
attribute forms, and explicit DOM factory calls. Comments and ordinary string
literals are excluded from those structures. When malformed source prevents
complete structural analysis, the report includes a
`source-analysis-incomplete` diagnostic and continues safely.

Runtime behavior, data flow, imported styles, spread attributes, delegated
handlers, framework compilation, and product intent remain agent-verification
responsibilities. These are explicit limits of static evidence, not claims of
unimplemented scanner correctness.

## Style Rules

These rules inspect parsed declarations in `.css`, `.less`, and `.scss` files
and in `<style>` blocks in `.htm`, `.html`, `.vue`, and `.svelte` files.

### `raw-color-value` — info

- Detects: hex and `rgb`/`rgba`/`hsl`/`hsla` literals in declaration values.
- Positive: `.item { color: #123456; }`
- Negative: `.item { color: var(--text); }`
- Verification boundary: token-definition intent and runtime-generated styles.

### `raw-spacing-value` — info

- Detects: nonzero `px`, `em`, or `rem` values on spacing and inset properties.
- Positive: `.item { margin: 8px; }`
- Negative: `.item { margin: 0; }`
- Verification boundary: shorthand meaning, fluid-expression intent, and
  runtime-generated styles.

### `raw-font-size` — info

- Detects: numeric `px`, `em`, or `rem` `font-size` declaration values.
- Positive: `.item { font-size: 14px; }`
- Negative: `.item { font-size: var(--text-size); }`
- Verification boundary: fluid-expression intent and runtime-generated styles.

### `raw-border-radius` — info

- Detects: numeric `px`, `em`, or `rem` `border-radius` declaration values.
- Positive: `.item { border-radius: 6px; }`
- Negative: `.item { border-radius: var(--radius); }`
- Verification boundary: shape intent and runtime-generated styles.

### `numeric-z-index` — warning

- Detects: signed or unsigned integer `z-index` declaration values.
- Positive: `.overlay { z-index: +10; }`
- Negative: `.overlay { z-index: var(--layer-overlay); }`
- Verification boundary: layer ownership and runtime-generated styles.

### `important-override` — warning

- Detects: `!important` in a declaration value.
- Positive: `.item { color: red !important; }`
- Negative: `.item { color: red; }`
- Verification boundary: justified compatibility overrides and cascade
  ownership.

### `focus-outline-removed` — warning

- Detects: `outline` declaration values set to `0` or `none`.
- Positive: `.item:focus { outline: none; }`
- Negative: `.item:focus { outline: 2px solid currentColor; }`
- Verification boundary: replacement focus treatments elsewhere and their
  runtime visibility.

### `global-element-selector` — info

- Detects: a top-level selector-list entry beginning with a supported bare
  interactive element.
- Positive: `button { color: inherit; }`
- Negative: `.toolbar button { color: inherit; }`
- Verification boundary: selector intent and cascade ownership.

### `repeated-style-cluster` — info

- Detects: at least three identical declarations under two or more parsed
  selectors, independent of declaration order.
- Positive: two selectors with the same three declarations.
- Negative: declaration sets that differ.
- Verification boundary: semantic equivalence, cascade ownership, and
  runtime-generated styles.

## Markup Rules

These rules inspect structurally recognized multiline opening elements in
HTML, JavaScript, TypeScript, JSX, TSX, Vue, and Svelte source.

### `inline-style` — info

- Detects: static, bound, or directive-style inline style attributes.
- Positive: `<div style={{ color: "red" }} />`
- Negative: `<div className="item" />`
- Verification boundary: spread attributes, component abstraction, and
  dynamic-geometry intent.

### `nonsemantic-click-target` — warning

- Detects: an explicit click handler on `div` or `span` without all three
  evident contracts: an actionable ARIA widget or composite role,
  focusability, and a keyboard handler.
- Positive: `<div onClick={save}>Save</div>`
- Negative:
  `<div role="button" tabIndex={0} onClick={save} onKeyDown={key}>Save</div>`
- Static fallback role lists use the first recognized current concrete role.
  Vue `:role`, including same-name shorthand, and `v-bind:role` follow the same
  static-value and dynamic-boundary rules as ordinary role attributes.
- Verification boundary: spread attributes, delegated handlers, unresolved
  dynamic role or handler values, component abstraction, and runtime behavior.

### `image-without-alt` — warning

- Detects: an `img` element without an explicit static or bound `alt`
  attribute.
- Positive: `<img src="/item.png" />`
- Negative: `<img src="/item.png" alt="Item" />`
- Verification boundary: spread attributes, framework transforms, and
  runtime-provided accessibility.

### `positive-tabindex` — warning

- Detects: a static `tabindex` or `tabIndex` integer greater than zero.
- Positive: `<div tabIndex="2" />`
- Negative: `<div tabIndex="0" />`
- Verification boundary: dynamic expressions and runtime values.

## File And Aggregate Rules

### `large-ui-source` — warning

- Detects: a supported source file with more than 600 physical lines.
- Positive: a 601-line source file.
- Negative: a 600-line source file.
- Verification boundary: line count does not establish whether responsibilities
  are mixed.

### `repeated-control-factory` — info

- Detects: three or more active, explicit `document.createElement` calls for
  supported native controls.
- Positive: three button, input, select, or textarea factory calls.
- Negative: two matching calls.
- Verification boundary: aliases, wrappers, imported factories, and runtime
  ownership.

### `viewport-only-responsive` — info

- Detects: at least one active `@media` token and no active `@container` token
  across parsed style regions.
- Positive: a media query with no container query.
- Negative: both media and container queries.
- Verification boundary: imported styles and whether independently resizable
  panels require container queries.
