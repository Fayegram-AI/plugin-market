/**
 * Dependency-free structural source analysis for scanner rule evaluation.
 *
 * This is intentionally not a compiler. It recognizes the source structures
 * needed by the public rule catalog while preserving offsets and reporting
 * incomplete lexical or style structure as coverage diagnostics.
 */

import { analyzeStyleSource } from "./style-analysis.mjs";
import { createLineLocator } from "./source-locations.mjs";

const MARKUP_EXTENSIONS = new Set([
    ".htm",
    ".html",
    ".js",
    ".jsx",
    ".mjs",
    ".svelte",
    ".ts",
    ".tsx",
    ".vue"
]);
const MARKUP_DOCUMENT_EXTENSIONS = new Set([
    ".htm",
    ".html",
    ".svelte",
    ".vue"
]);

export function analyzeSourceStructure(options) {
    const lineAt = createLineLocator(options.source);
    const lexical = MARKUP_DOCUMENT_EXTENSIONS.has(options.extension)
        ? maskMarkupSource(options.source)
        : maskInactiveSource(options.source);
    const styleResult = analyzeStyleSource({
        source: options.source,
        activeSource: lexical.activeSource,
        extension: options.extension,
        lineAt
    });
    const markupResult = MARKUP_EXTENSIONS.has(options.extension)
        ? collectMarkupElements(options.source, lexical.activeSource, lineAt)
        : {
            elements: [],
            issues: []
        };
    const domFactories = collectDomFactories(
        options.source,
        lexical.activeSource,
        lineAt
    );

    return {
        source: options.source,
        extension: options.extension,
        relativePath: options.relativePath,
        lines: options.source.split(/\r?\n/u).length,
        markupElements: markupResult.elements,
        styleRules: styleResult.rules,
        domFactories,
        metrics: styleResult.metrics,
        issues: [
            ...lexical.issues,
            ...styleResult.issues,
            ...markupResult.issues
        ]
    };
}

function maskInactiveSource(source) {
    const characters = source.split("");
    const active = source.split("");
    const issues = [];
    let state = "code";
    let escaped = false;

    for (let index = 0; index < characters.length; index += 1) {
        const character = characters[index];
        const next = characters[index + 1] ?? "";

        if (state === "code") {
            if (character === "/"
                && next === "/"
                && !hasUrlSchemeBefore(source, index)) {
                blank(active, index);
                blank(active, ++index);
                state = "line-comment";
            } else if (character === "/" && next === "*") {
                blank(active, index);
                blank(active, ++index);
                state = "block-comment";
            } else if (character === "<"
                && characters.slice(index, index + 4).join("") === "<!--") {
                for (let offset = 0; offset < 4; offset += 1) {
                    blank(active, index + offset);
                }
                index += 3;
                state = "html-comment";
            } else if (character === "'") {
                blank(active, index);
                state = "single-quote";
                escaped = false;
            } else if (character === "\"") {
                blank(active, index);
                state = "double-quote";
                escaped = false;
            } else if (character === "`") {
                blank(active, index);
                state = "template";
                escaped = false;
            }
            continue;
        }

        blank(active, index);

        if (state === "line-comment") {
            if (character === "\n") {
                active[index] = "\n";
                state = "code";
            }
            continue;
        }

        if (state === "block-comment") {
            if (character === "*" && next === "/") {
                blank(active, ++index);
                state = "code";
            }
            continue;
        }

        if (state === "html-comment") {
            if (characters.slice(index, index + 3).join("") === "-->") {
                blank(active, index + 1);
                blank(active, index + 2);
                index += 2;
                state = "code";
            }
            continue;
        }

        if (character === "\n") {
            active[index] = "\n";
        }

        if (escaped) {
            escaped = false;
            continue;
        }

        if (character === "\\") {
            escaped = true;
            continue;
        }

        if (
            (state === "single-quote" && character === "'")
            || (state === "double-quote" && character === "\"")
            || (state === "template" && character === "`")
        ) {
            state = "code";
        }
    }

    if (state !== "code" && state !== "line-comment") {
        issues.push(`Unterminated ${formatState(state)}.`);
    }

    return {
        activeSource: active.join(""),
        issues
    };
}

/**
 * Preserve markup text and attributes while masking comments, raw script/style
 * bodies, and strings or comments inside brace expressions. This prevents
 * ordinary prose apostrophes from being interpreted as JavaScript strings.
 */
function maskMarkupSource(source) {
    const active = source.split("");
    const issues = [];

    maskMarkupComments(source, active, issues);
    maskRawElementBodies(source, active, issues);
    maskMarkupExpressions(source, active);

    return {
        activeSource: active.join(""),
        issues
    };
}

function maskMarkupComments(source, active, issues) {
    let start = source.indexOf("<!--");

    while (start !== -1) {
        const closing = source.indexOf("-->", start + 4);
        const end = closing === -1 ? source.length : closing + 3;

        blankRange(active, start, end);
        if (closing === -1) {
            issues.push("Unterminated html comment.");
            return;
        }
        start = source.indexOf("<!--", end);
    }
}

function maskRawElementBodies(source, active, issues) {
    const pattern = /<(script|style)\b/giu;
    let match;

    while ((match = pattern.exec(source)) !== null) {
        if (active[match.index] !== "<") {
            continue;
        }

        const openingEnd = findMarkupTagEnd(
            source,
            match.index + match[0].length
        );
        if (openingEnd === null) {
            continue;
        }

        const closingPattern = new RegExp(`</${match[1]}\\s*>`, "giu");
        closingPattern.lastIndex = openingEnd;
        const closing = closingPattern.exec(source);

        if (!closing) {
            blankRange(active, openingEnd, source.length);
            issues.push(`Unterminated ${match[1].toLowerCase()} element.`);
            return;
        }

        blankRange(active, openingEnd, closing.index);
        pattern.lastIndex = closing.index + closing[0].length;
    }
}

function maskMarkupExpressions(source, active) {
    for (let index = 0; index < active.length; index += 1) {
        if (active[index] !== "{") {
            continue;
        }

        const end = consumeBalanced(source, index, "{", "}");
        const masked = maskInactiveSource(source.slice(index, end)).activeSource;

        for (let offset = 0; offset < masked.length; offset += 1) {
            active[index + offset] = masked[offset];
        }
        index = Math.max(index, end - 1);
    }
}

function blankRange(characters, start, end) {
    for (let index = start; index < end; index += 1) {
        blank(characters, index);
    }
}

function hasUrlSchemeBefore(source, separatorIndex) {
    const prefix = source.slice(
        Math.max(0, separatorIndex - 32),
        separatorIndex
    );

    return /[a-z][a-z\d+.-]*:$/iu.test(prefix);
}

function blank(characters, index) {
    if (characters[index] !== "\n" && characters[index] !== "\r") {
        characters[index] = " ";
    }
}

function formatState(state) {
    return state.replaceAll("-", " ");
}

function collectMarkupElements(source, activeSource, lineAt) {
    const elements = [];
    const issues = [];
    const pattern = /<([A-Za-z][\w:.-]*)(?=\s|\/?>)/gu;
    let match;

    while ((match = pattern.exec(activeSource)) !== null) {
        const end = findMarkupTagEnd(
            activeSource,
            match.index + match[0].length
        );

        if (end === null) {
            issues.push(
                `Unterminated <${match[1]}> opening element at line ${lineAt(match.index)}.`
            );
            continue;
        }

        const original = source.slice(match.index, end);
        const attributes = parseAttributes(original, match[1]);
        elements.push({
            name: match[1].toLowerCase(),
            attributes: attributes.values,
            hasSpread: attributes.hasSpread,
            line: lineAt(match.index),
            evidence: compact(original)
        });
        pattern.lastIndex = end;
    }

    return {
        elements,
        issues
    };
}

function findMarkupTagEnd(activeSource, start) {
    let quote = null;
    let escaped = false;

    for (let index = start; index < activeSource.length; index += 1) {
        const character = activeSource[index];

        if (quote) {
            if (escaped) {
                escaped = false;
            } else if (character === "\\") {
                escaped = true;
            } else if (character === quote) {
                quote = null;
            }
            continue;
        }

        if (character === "'" || character === "\"") {
            quote = character;
        } else if (character === "{") {
            index = consumeBalanced(activeSource, index, "{", "}") - 1;
        } else if (character === ">") {
            return index + 1;
        } else if (character === "<") {
            return null;
        }
    }

    return null;
}

function parseAttributes(tagSource, tagName) {
    const values = new Map();
    let hasSpread = false;
    let index = tagSource.indexOf(tagName) + tagName.length;

    while (index < tagSource.length) {
        index = skipWhitespace(tagSource, index);

        if (tagSource.startsWith("/>", index) || tagSource[index] === ">") {
            break;
        }

        if (tagSource.startsWith("{...", index)) {
            hasSpread = true;
            index = consumeBalanced(tagSource, index, "{", "}");
            continue;
        }

        if (tagSource[index] === "{") {
            const end = consumeBalanced(tagSource, index, "{", "}");
            const shorthandName = tagSource
                .slice(index + 1, Math.max(index + 1, end - 1))
                .trim();

            if (/^[A-Za-z_$][\w$]*$/u.test(shorthandName)) {
                values.set(shorthandName.toLowerCase(), {
                    name: shorthandName,
                    value: shorthandName,
                    dynamic: true
                });
            }

            index = end;
            continue;
        }

        const nameStart = index;
        while (index < tagSource.length
            && !/[\s=/>]/u.test(tagSource[index])) {
            index += 1;
        }

        const name = tagSource.slice(nameStart, index);
        if (!name) {
            index += 1;
            continue;
        }

        index = skipWhitespace(tagSource, index);
        let value = null;
        let dynamic = false;

        if (tagSource[index] === "=") {
            index = skipWhitespace(tagSource, index + 1);
            const result = readAttributeValue(tagSource, index);
            value = result.value;
            dynamic = result.dynamic
                || name.startsWith(":")
                || name.startsWith("v-bind:");
            index = result.end;
        } else if (/^:[A-Za-z_$][\w$-]*$/u.test(name)) {
            // Vue same-name shorthand, such as :role, binds the attribute to
            // the identically named expression.
            value = name.slice(1);
            dynamic = true;
        }

        values.set(name.toLowerCase(), {
            name,
            value,
            dynamic
        });
    }

    return {
        values,
        hasSpread
    };
}

function readAttributeValue(source, index) {
    const quote = source[index];

    if (quote === "'" || quote === "\"") {
        let end = index + 1;
        while (end < source.length && source[end] !== quote) {
            end += source[end] === "\\" ? 2 : 1;
        }
        return {
            value: source.slice(index + 1, end),
            dynamic: false,
            end: Math.min(end + 1, source.length)
        };
    }

    if (quote === "{") {
        const end = consumeBalanced(source, index, "{", "}");
        return {
            value: source.slice(index + 1, Math.max(index + 1, end - 1)).trim(),
            dynamic: true,
            end
        };
    }

    let end = index;
    while (end < source.length && !/[\s>]/u.test(source[end])) {
        end += 1;
    }
    return {
        value: source.slice(index, end),
        dynamic: false,
        end
    };
}

function consumeBalanced(source, start, open, close) {
    let depth = 0;
    const frames = [{
        type: "code",
        interpolationDepth: null,
        previousSignificant: null
    }];

    for (let index = start; index < source.length; index += 1) {
        const character = source[index];
        const next = source[index + 1] ?? "";
        const frame = frames.at(-1);

        if (frame.type === "line-comment") {
            if (character === "\n") {
                frames.pop();
            }
            continue;
        }

        if (frame.type === "block-comment") {
            if (character === "*" && next === "/") {
                index += 1;
                frames.pop();
            }
            continue;
        }

        if (frame.type === "regex") {
            if (frame.escaped) {
                frame.escaped = false;
            } else if (character === "\\") {
                frame.escaped = true;
            } else if (character === "[") {
                frame.characterClass = true;
            } else if (character === "]") {
                frame.characterClass = false;
            } else if (character === "/" && !frame.characterClass) {
                frames.pop();
                frames.at(-1).previousSignificant = "/";
            }
            continue;
        }

        if (frame.type === "single-quote" || frame.type === "double-quote") {
            if (frame.escaped) {
                frame.escaped = false;
            } else if (character === "\\") {
                frame.escaped = true;
            } else if ((frame.type === "single-quote" && character === "'")
                || (frame.type === "double-quote" && character === "\"")) {
                frames.pop();
                frames.at(-1).previousSignificant = character;
            }
            continue;
        }

        if (frame.type === "template") {
            if (frame.escaped) {
                frame.escaped = false;
            } else if (character === "\\") {
                frame.escaped = true;
            } else if (character === "`") {
                frames.pop();
                frames.at(-1).previousSignificant = "`";
            } else if (character === "$" && next === "{") {
                depth += 1;
                index += 1;
                frames.push({
                    type: "code",
                    interpolationDepth: depth,
                    previousSignificant: null
                });
            }
            continue;
        }

        if (character === "/" && next === "/") {
            index += 1;
            frames.push({ type: "line-comment" });
            continue;
        }
        if (character === "/" && next === "*") {
            index += 1;
            frames.push({ type: "block-comment" });
            continue;
        }
        if (character === "'") {
            frames.push({ type: "single-quote", escaped: false });
            continue;
        }
        if (character === "\"") {
            frames.push({ type: "double-quote", escaped: false });
            continue;
        }
        if (character === "`") {
            frames.push({ type: "template", escaped: false });
            continue;
        }
        if (character === "/" && canStartRegex(frame.previousSignificant)) {
            frames.push({
                type: "regex",
                characterClass: false,
                escaped: false
            });
            continue;
        }

        if (character === open) {
            depth += 1;
        } else if (character === close) {
            depth -= 1;
            if (depth === 0) {
                return index + 1;
            }
            if (frame.interpolationDepth !== null
                && depth === frame.interpolationDepth - 1) {
                frames.pop();
                continue;
            }
        }

        if (!/\s/u.test(character)) {
            frame.previousSignificant = character;
        }
    }

    return source.length;
}

function canStartRegex(previousSignificant) {
    return previousSignificant === null
        || /[([{=,:;!?&|+\-*%^~<>]/u.test(previousSignificant);
}

function skipWhitespace(source, index) {
    while (index < source.length && /\s/u.test(source[index])) {
        index += 1;
    }
    return index;
}

function collectDomFactories(source, activeSource, lineAt) {
    const occurrences = [];
    const pattern = /document\.createElement\(\s*["'](?:button|input|select|textarea)["']\s*\)/gu;
    let match;

    while ((match = pattern.exec(source)) !== null) {
        if (activeSource.slice(match.index, match.index + 8) !== "document") {
            continue;
        }

        occurrences.push({
            line: lineAt(match.index),
            evidence: match[0]
        });
    }

    return occurrences;
}

function compact(value) {
    return value.replace(/\s+/gu, " ").trim().slice(0, 160);
}
