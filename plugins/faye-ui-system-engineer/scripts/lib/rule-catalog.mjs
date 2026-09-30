/**
 * Public finding-rule contract used by the scanner and verification suite.
 */

const catalog = [
    {
        ruleId: "raw-color-value",
        severity: "info",
        scope: "Parsed CSS-family files and HTML, Vue, or Svelte style-block declarations",
        detection: "Hex, rgb/rgba, or hsl/hsla color literals in declaration values.",
        limitations: "Token-definition intent, CSS-in-JS objects, and runtime value flow are not inferred.",
        message: "Raw color literal; confirm it belongs at the semantic-token boundary."
    },
    {
        ruleId: "raw-spacing-value",
        severity: "info",
        scope: "Parsed CSS-family files and HTML, Vue, or Svelte style-block declarations",
        detection: "Nonzero px, em, or rem values assigned to spacing or inset properties.",
        limitations: "Shorthand meaning, fluid expressions, CSS-in-JS objects, and runtime value flow are not inferred.",
        message: "Raw spacing value; consider a semantic spacing or layout contract."
    },
    {
        ruleId: "raw-font-size",
        severity: "info",
        scope: "Parsed CSS-family files and HTML, Vue, or Svelte style-block declarations",
        detection: "Numeric px, em, or rem font-size declarations.",
        limitations: "Fluid-expression intent, CSS-in-JS objects, and runtime value flow are not inferred.",
        message: "Raw font size; confirm it belongs to the typography scale."
    },
    {
        ruleId: "raw-border-radius",
        severity: "info",
        scope: "Parsed CSS-family files and HTML, Vue, or Svelte style-block declarations",
        detection: "Numeric px, em, or rem border-radius declarations.",
        limitations: "Shape intent, CSS-in-JS objects, and runtime value flow are not inferred.",
        message: "Raw radius; confirm it belongs to the shape scale."
    },
    {
        ruleId: "numeric-z-index",
        severity: "warning",
        scope: "Parsed CSS-family files and HTML, Vue, or Svelte style-block declarations",
        detection: "Integer z-index declarations.",
        limitations: "Layer ownership and runtime-generated styles are not inferred.",
        message: "Numeric z-index bypasses an explicit layer contract."
    },
    {
        ruleId: "important-override",
        severity: "warning",
        scope: "Parsed CSS-family files and HTML, Vue, or Svelte style-block declarations",
        detection: "The !important token in a declaration value.",
        limitations: "Justified compatibility overrides and cascade ownership are not inferred.",
        message: "Important override may indicate an ownership or specificity conflict."
    },
    {
        ruleId: "inline-style",
        severity: "info",
        scope: "Structurally recognized HTML, JSX, Vue, and Svelte opening elements",
        detection: "Static, bound, or directive-style inline style attributes, including multiline markup.",
        limitations: "Spread attributes, component abstraction, and dynamic geometry intent are not inferred.",
        message: "Inline style; confirm it represents dynamic geometry rather than reusable UI styling."
    },
    {
        ruleId: "nonsemantic-click-target",
        severity: "warning",
        scope: "Structurally recognized HTML, JSX, Vue, and Svelte div and span opening elements",
        detection: "Explicit click handlers without an evident role, focusability, and keyboard-handler contract.",
        limitations: "Spread attributes, delegated handlers, component abstraction, and runtime behavior are not inferred.",
        message: "Clickable nonsemantic element lacks an evident role, focus, or keyboard contract."
    },
    {
        ruleId: "image-without-alt",
        severity: "warning",
        scope: "Structurally recognized HTML, JSX, Vue, and Svelte img opening elements",
        detection: "Image elements with no explicit static or bound alt attribute, including multiline markup.",
        limitations: "Spread attributes, framework transforms, and runtime-provided accessibility are not inferred.",
        message: "Image lacks an evident alt attribute."
    },
    {
        ruleId: "positive-tabindex",
        severity: "warning",
        scope: "Structurally recognized HTML, JSX, Vue, and Svelte opening elements",
        detection: "Static tabindex or tabIndex integer assignments greater than zero.",
        limitations: "Dynamic expressions and runtime values remain verification responsibilities.",
        message: "Positive tabindex creates a manual focus order."
    },
    {
        ruleId: "focus-outline-removed",
        severity: "warning",
        scope: "Parsed CSS-family files and HTML, Vue, or Svelte style-block declarations",
        detection: "outline declarations set to zero or none.",
        limitations: "Replacement focus treatments elsewhere and their runtime visibility are not evaluated.",
        message: "Focus outline is removed; confirm an equally visible focus treatment exists."
    },
    {
        ruleId: "global-element-selector",
        severity: "info",
        scope: "Parsed top-level CSS-family files and HTML, Vue, or Svelte style-block rules",
        detection: "Selector-list entries beginning with a supported bare interactive element.",
        limitations: "Cascade ownership, selector intent, and framework-generated styles are not inferred.",
        message: "Global element selector may couple unrelated UI features."
    },
    {
        ruleId: "large-ui-source",
        severity: "warning",
        scope: "Whole supported source file",
        detection: "Files with more than 600 lines.",
        limitations: "Line count does not establish whether responsibilities are actually mixed.",
        message: "UI source exceeds 600 lines; confirm it has one cohesive responsibility."
    },
    {
        ruleId: "repeated-style-cluster",
        severity: "info",
        scope: "Parsed CSS-family files and HTML, Vue, or Svelte style-block rules",
        detection: "Three or more identical declarations under at least two selectors, independent of declaration order.",
        limitations: "Semantic equivalence, cascade ownership, and runtime-generated styles are not inferred.",
        message: "Repeated declaration cluster may indicate missing primitive ownership."
    },
    {
        ruleId: "repeated-control-factory",
        severity: "info",
        scope: "Active JavaScript-family source structure",
        detection: "Three or more explicit document.createElement calls for supported native controls.",
        limitations: "Aliases, wrappers, imported factories, and runtime ownership are not inferred.",
        message: "Repeated native control factories may indicate missing primitive ownership."
    },
    {
        ruleId: "viewport-only-responsive",
        severity: "info",
        scope: "Aggregate parsed style-region metrics",
        detection: "One or more @media tokens and no @container token.",
        limitations: "Imported styles and whether independently resizable panels require container queries are not inferred.",
        message: "Media queries were found without container queries; verify independently resizable panels."
    }
];

export const RULE_CATALOG = Object.freeze(
    catalog.map((rule) => Object.freeze(rule))
);

const rulesById = new Map(
    RULE_CATALOG.map((rule) => [rule.ruleId, rule])
);

export function getRuleDefinition(ruleId) {
    const rule = rulesById.get(ruleId);

    if (!rule) {
        throw new Error(`Unknown scanner rule: ${ruleId}`);
    }

    return rule;
}
