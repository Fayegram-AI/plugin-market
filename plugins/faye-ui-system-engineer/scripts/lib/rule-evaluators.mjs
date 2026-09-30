/**
 * Evaluate the public rule catalog against structural source models.
 */

const CLICK_ATTRIBUTES = new Set([
    "@click",
    "onclick",
    "on:click",
    "v-on:click"
]);
const KEYBOARD_ATTRIBUTES = new Set([
    "@keydown",
    "@keyup",
    "onkeydown",
    "onkeyup",
    "on:keydown",
    "on:keyup",
    "v-on:keydown",
    "v-on:keyup"
]);
const TABINDEX_ATTRIBUTES = new Set([
    ":tabindex",
    "tabindex",
    "v-bind:tabindex"
]);
const ROLE_ATTRIBUTES = new Set([
    ":role",
    "role",
    "v-bind:role"
]);
const ALT_ATTRIBUTES = new Set([
    ":alt",
    "alt",
    "v-bind:alt"
]);
const STYLE_ATTRIBUTES = new Set([
    ":style",
    "style",
    "v-bind:style"
]);
const GLOBAL_ELEMENTS = new Set([
    "a",
    "button",
    "dialog",
    "input",
    "label",
    "select",
    "textarea"
]);
const INTERACTIVE_ROLES = new Set([
    "button",
    "checkbox",
    "combobox",
    "grid",
    "gridcell",
    "link",
    "listbox",
    "menu",
    "menubar",
    "menuitem",
    "menuitemcheckbox",
    "menuitemradio",
    "option",
    "radio",
    "radiogroup",
    "scrollbar",
    "searchbox",
    "separator",
    "slider",
    "spinbutton",
    "switch",
    "tab",
    "tablist",
    "textbox",
    "tree",
    "treegrid",
    "treeitem"
]);
const RECOGNIZED_ROLES = new Set([
    ...INTERACTIVE_ROLES,
    "alert",
    "alertdialog",
    "application",
    "article",
    "banner",
    "blockquote",
    "caption",
    "cell",
    "code",
    "columnheader",
    "comment",
    "complementary",
    "contentinfo",
    "definition",
    "deletion",
    "dialog",
    "directory",
    "document",
    "emphasis",
    "feed",
    "figure",
    "form",
    "generic",
    "group",
    "heading",
    "image",
    "img",
    "insertion",
    "list",
    "listitem",
    "log",
    "main",
    "marquee",
    "mark",
    "math",
    "meter",
    "navigation",
    "none",
    "note",
    "paragraph",
    "presentation",
    "progressbar",
    "region",
    "row",
    "rowgroup",
    "rowheader",
    "search",
    "status",
    "strong",
    "subscript",
    "suggestion",
    "superscript",
    "table",
    "tabpanel",
    "term",
    "time",
    "timer",
    "toolbar",
    "tooltip"
]);

export function evaluateFileRules(analysis) {
    return [
        ...evaluateStyleRules(analysis),
        ...evaluateMarkupRules(analysis),
        ...evaluateFileRulesOnly(analysis)
    ];
}

export function styleClusterOccurrences(analysis) {
    const occurrences = [];

    for (const rule of analysis.styleRules) {
        if (rule.declarations.length < 3) {
            continue;
        }

        occurrences.push({
            signature: rule.declarations
                .map((item) => `${item.property}:${item.value}`)
                .sort((left, right) => left.localeCompare(right))
                .join(";"),
            line: rule.line,
            selector: rule.selector
        });
    }

    return occurrences;
}

function evaluateStyleRules(analysis) {
    const matches = [];

    for (const rule of analysis.styleRules) {
        for (const declaration of rule.declarations) {
            appendDeclarationMatches(matches, declaration);
        }

        if (rule.topLevel && hasGlobalElementSelector(rule.selector)) {
            matches.push(match(
                "global-element-selector",
                rule.line,
                rule.selector
            ));
        }
    }

    return matches;
}

function appendDeclarationMatches(matches, declaration) {
    const property = declaration.property;
    const value = declaration.activeValue;
    const colorValue = maskCssUrlFunctions(value);
    const exactValue = withoutTerminalImportant(value);

    if (/#[\da-f]{3,8}\b|(?:rgb|hsl)a?\([^)]*\)/iu.test(colorValue)) {
        matches.push(match("raw-color-value", declaration.line, declaration.evidence));
    }

    if (new Set([
        "bottom",
        "column-gap",
        "gap",
        "inset",
        "left",
        "margin",
        "padding",
        "right",
        "row-gap",
        "top"
    ]).has(property)
        && hasNonzeroLength(value)) {
        matches.push(match("raw-spacing-value", declaration.line, declaration.evidence));
    }

    if (property === "font-size" && /\d*\.?\d+(?:px|r?em)\b/iu.test(value)) {
        matches.push(match("raw-font-size", declaration.line, declaration.evidence));
    }

    if (property === "border-radius" && /\d*\.?\d+(?:px|r?em)\b/iu.test(value)) {
        matches.push(match("raw-border-radius", declaration.line, declaration.evidence));
    }

    if (property === "z-index" && /^[+-]?\d+$/u.test(exactValue)) {
        matches.push(match("numeric-z-index", declaration.line, declaration.evidence));
    }

    if (/!important\b/iu.test(value)) {
        matches.push(match("important-override", declaration.line, declaration.evidence));
    }

    if (property === "outline"
        && /^(?:none\b|0(?:\.0+)?(?:[a-z%]+)?(?:\s|$))/iu.test(exactValue)) {
        matches.push(match("focus-outline-removed", declaration.line, declaration.evidence));
    }
}

function evaluateMarkupRules(analysis) {
    const matches = [];

    for (const element of analysis.markupElements) {
        if (hasAttribute(element, STYLE_ATTRIBUTES)
            || [...element.attributes.keys()].some((name) => name.startsWith("style:"))) {
            matches.push(match("inline-style", element.line, element.evidence));
        }

        if (new Set(["div", "span"]).has(element.name)
            && hasActiveHandler(element, CLICK_ATTRIBUTES)
            && !hasCompleteInteractiveContract(element)) {
            matches.push(match(
                "nonsemantic-click-target",
                element.line,
                element.evidence
            ));
        }

        if (element.name === "img" && !hasAttribute(element, ALT_ATTRIBUTES)) {
            matches.push(match("image-without-alt", element.line, element.evidence));
        }

        const tabindex = findAttribute(element, TABINDEX_ATTRIBUTES);
        if (staticPositiveInteger(tabindex)) {
            matches.push(match("positive-tabindex", element.line, element.evidence));
        }
    }

    return matches;
}

function evaluateFileRulesOnly(analysis) {
    if (analysis.lines <= 600) {
        return [];
    }

    return [
        match("large-ui-source", 1, `${analysis.lines} lines`)
    ];
}

function hasCompleteInteractiveContract(element) {
    const role = findAttribute(element, ROLE_ATTRIBUTES);
    const tabindex = findAttribute(element, TABINDEX_ATTRIBUTES);
    const contentEditable = element.attributes.get("contenteditable");
    const focusable = isContentEditable(contentEditable)
        || isFocusableTabindex(tabindex);

    return isInteractiveRole(role)
        && Boolean(focusable)
        && hasActiveHandler(element, KEYBOARD_ATTRIBUTES);
}

function isInteractiveRole(attribute) {
    if (!attribute || attribute.value === null) {
        return false;
    }

    const staticValue = staticStringAttributeValue(attribute);
    if (staticValue === null) {
        // An unresolved expression remains a verification boundary. Treat it as
        // potentially valid rather than fabricating a warning.
        return true;
    }

    const firstRecognizedRole = staticValue
        .trim()
        .toLowerCase()
        .split(/\s+/u)
        .find((role) => RECOGNIZED_ROLES.has(role));

    return INTERACTIVE_ROLES.has(firstRecognizedRole);
}

function staticStringAttributeValue(attribute) {
    const value = attribute.value.trim();
    if (!attribute.dynamic) {
        return value;
    }

    const quoted = value.match(/^(["'])([\s\S]*)\1$/u);
    if (quoted) {
        return quoted[2];
    }

    const template = value.match(/^`([^`$]*)`$/u);
    if (template) {
        return template[1];
    }

    if (/^(?:false|true|null|undefined|void\s+0|NaN|[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?)$/iu.test(value)) {
        return "";
    }

    return null;
}

function hasActiveHandler(element, names) {
    return isStaticallyActiveAttribute(findAttribute(element, names));
}

function isStaticallyActiveAttribute(attribute) {
    if (!attribute) {
        return false;
    }
    if (attribute.value === null) {
        return true;
    }

    const value = attribute.value.trim();
    return value.length > 0
        && !/^(?:false|null|undefined|void\s+0|["']\s*["']|`\s*`)$/iu.test(value);
}

function isFocusableTabindex(attribute) {
    if (!attribute || attribute.value === null) {
        return false;
    }

    const value = attribute.value.trim();
    if (/^-?\d+$/u.test(value)) {
        return Number(value) >= 0;
    }

    if (attribute.dynamic
        && /^(?:false|null|undefined|void\s+0)$/iu.test(value)) {
        return false;
    }

    return attribute.dynamic;
}

function isContentEditable(attribute) {
    if (!attribute) {
        return false;
    }

    if (attribute.value === null) {
        return true;
    }

    return !/^(?:false|null|undefined)$/iu.test(attribute.value.trim());
}

function hasGlobalElementSelector(selector) {
    return selector.split(",").some((part) => {
        const first = part.trim().match(/^([a-z][\w-]*)/iu)?.[1];
        return first ? GLOBAL_ELEMENTS.has(first.toLowerCase()) : false;
    });
}

function findAttribute(element, names) {
    for (const name of names) {
        const attribute = element.attributes.get(name);
        if (attribute) {
            return attribute;
        }
    }

    for (const [name, attribute] of element.attributes) {
        if (names.has(baseDirectiveName(name, attribute.name))) {
            return attribute;
        }
    }

    return null;
}

function baseDirectiveName(name, originalName) {
    if (name.startsWith("@") || name.startsWith("v-on:")) {
        return name.split(".", 1)[0];
    }

    if (name.startsWith("on:")) {
        return name.split("|", 1)[0];
    }

    if (/^on(?:Click|KeyDown|KeyUp)Capture$/u.test(originalName)) {
        return name.slice(0, -"capture".length);
    }

    return name;
}

function hasAttribute(element, names) {
    return Boolean(findAttribute(element, names));
}

function staticPositiveInteger(attribute) {
    if (!attribute) {
        return false;
    }

    const pattern = attribute.dynamic ? /^\+?[1-9]\d*$/u : /^[1-9]\d*$/u;
    return pattern.test(attribute.value ?? "");
}

function maskCssUrlFunctions(value) {
    const active = value.split("");
    const pattern = /(?<![-\w])url\s*\(/giu;
    let match;

    while ((match = pattern.exec(value)) !== null) {
        let depth = 1;
        let index = pattern.lastIndex;

        while (index < value.length && depth > 0) {
            if (value[index] === "(") {
                depth += 1;
            } else if (value[index] === ")") {
                depth -= 1;
            }
            index += 1;
        }

        for (let offset = match.index; offset < index; offset += 1) {
            active[offset] = " ";
        }
        pattern.lastIndex = index;
    }

    return active.join("");
}

function withoutTerminalImportant(value) {
    return value.replace(/\s*!important\s*$/iu, "").trim();
}

function hasNonzeroLength(value) {
    const pattern = /([+-]?(?:\d+(?:\.\d*)?|\.\d+))(px|r?em)\b/giu;

    return [...value.matchAll(pattern)].some((item) => Number(item[1]) !== 0);
}

function match(ruleId, line, evidence) {
    return {
        ruleId,
        line,
        evidence: compact(evidence)
    };
}

function compact(value) {
    return value.replace(/\s+/gu, " ").trim().slice(0, 160);
}
