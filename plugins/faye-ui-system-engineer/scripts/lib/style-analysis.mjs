/**
 * Structural CSS-family and component style-block analysis.
 *
 * The parser remains dependency-free and deliberately limited to the style
 * structures required by the public scanner rule catalog.
 */

import { createLineLocator } from "./source-locations.mjs";

const STYLE_EXTENSIONS = new Set([".css", ".less", ".scss"]);
const COMPONENT_EXTENSIONS = new Set([".htm", ".html", ".svelte", ".vue"]);

export function analyzeStyleSource(options) {
    const lineAt = options.lineAt ?? createLineLocator(options.source);
    const collection = collectStyleRegions(
        options.source,
        options.activeSource,
        options.extension,
        lineAt
    );
    const result = analyzeStyleRegions(collection.regions, lineAt);

    return {
        rules: result.rules,
        issues: [
            ...collection.issues,
            ...result.issues
        ],
        metrics: createMetrics(result.regions)
    };
}

function collectStyleRegions(source, activeSource, extension, lineAt) {
    if (STYLE_EXTENSIONS.has(extension)) {
        return {
            regions: [{
                content: source,
                offset: 0,
                supportsLineComments: extension === ".less"
                    || extension === ".scss"
            }],
            issues: []
        };
    }

    if (!COMPONENT_EXTENSIONS.has(extension)) {
        return {
            regions: [],
            issues: []
        };
    }

    const regions = [];
    const issues = [];
    const pattern = /<style\b[^>]*>/giu;
    let match;

    while ((match = pattern.exec(source)) !== null) {
        if (activeSource.slice(match.index, match.index + 6).toLowerCase()
            !== "<style") {
            continue;
        }

        const openingTag = match[0];
        const contentOffset = match.index + openingTag.length;
        const supportsLineComments = /\blang\s*=\s*["']?(?:less|sass|scss)\b/iu
            .test(openingTag);
        const remainingSource = source.slice(contentOffset);
        const activeStyle = maskStyleCommentsAndStrings(
            remainingSource,
            supportsLineComments
        );
        const closingMatch = /<\/style\s*>/iu.exec(activeStyle);

        if (!closingMatch) {
            issues.push(
                `Unterminated <style> element at line ${lineAt(match.index)}.`
            );
            continue;
        }

        const contentEnd = contentOffset + closingMatch.index;
        regions.push({
            content: source.slice(contentOffset, contentEnd),
            offset: contentOffset,
            supportsLineComments
        });
        pattern.lastIndex = contentEnd + closingMatch[0].length;
    }

    return {
        regions,
        issues
    };
}

function analyzeStyleRegions(regions, lineAt) {
    const rules = [];
    const issues = [];
    const analyzedRegions = [];

    for (const region of regions) {
        const result = extractStyleRules(region, lineAt);
        rules.push(...result.rules);
        issues.push(...result.issues);
        analyzedRegions.push({
            ...region,
            activeContent: maskStyleCommentsAndStrings(
                region.content,
                region.supportsLineComments
            )
        });
    }

    return {
        rules,
        issues,
        regions: analyzedRegions
    };
}

function extractStyleRules(region, lineAt) {
    const commentMasked = maskStyleComments(
        region.content,
        region.supportsLineComments
    );
    const masked = maskStyleCommentsAndStrings(
        region.content,
        region.supportsLineComments
    );
    const stack = [];
    const rules = [];
    const issues = [];

    for (let index = 0; index < masked.length; index += 1) {
        if (masked[index] === "{") {
            const headerStart = findStyleHeaderStart(masked, index);
            const header = compact(commentMasked.slice(headerStart, index));

            stack.push({
                openIndex: index,
                headerStart,
                header,
                topLevel: stack.every((block) => block.header.startsWith("@")),
                childRanges: []
            });
            continue;
        }

        if (masked[index] !== "}") {
            continue;
        }

        const block = stack.pop();
        if (!block) {
            issues.push(
                `Unexpected style closing brace at line ${lineAt(region.offset + index)}.`
            );
            continue;
        }

        if (stack.length > 0) {
            stack.at(-1).childRanges.push({
                start: block.headerStart,
                end: index + 1
            });
        }

        if (block.header.startsWith("@")) {
            continue;
        }

        const contentStart = block.openIndex + 1;
        const content = maskStyleRanges(
            region.content.slice(contentStart, index),
            contentStart,
            block.childRanges
        );
        const declarationResult = parseDeclarations(
            content,
            region.offset + contentStart,
            region.supportsLineComments,
            lineAt
        );
        issues.push(...declarationResult.issues);

        if (declarationResult.declarations.length > 0) {
            rules.push({
                selector: block.header,
                line: lineAt(region.offset + block.openIndex),
                topLevel: block.topLevel,
                declarations: declarationResult.declarations
            });
        }
    }

    return {
        rules,
        issues: [
            ...issues,
            ...(stack.length === 0 ? [] : ["Unterminated style block."])
        ]
    };
}

function maskStyleRanges(content, contentStart, ranges) {
    const active = content.split("");

    for (const range of ranges) {
        const start = Math.max(0, range.start - contentStart);
        const end = Math.min(active.length, range.end - contentStart);

        for (let index = start; index < end; index += 1) {
            blank(active, index);
        }
    }

    return active.join("");
}

function findStyleHeaderStart(source, openIndex) {
    for (let index = openIndex - 1; index >= 0; index -= 1) {
        if (new Set(["{", "}", ";"]).has(source[index])) {
            return index + 1;
        }
    }

    return 0;
}

function parseDeclarations(
    content,
    globalOffset,
    supportsLineComments,
    lineAt
) {
    const declarations = [];
    const issues = [];
    const clean = maskStyleComments(content, supportsLineComments);
    let statementStart = 0;
    let separator = null;
    const parenthesisStack = [];
    const bracketStack = [];
    let quote = null;
    let quoteStart = null;
    let escaped = false;

    for (let index = 0; index <= clean.length; index += 1) {
        const character = clean[index] ?? ";";

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
            quoteStart = index;
            continue;
        }
        if (character === "(") {
            parenthesisStack.push(index);
            continue;
        }
        if (character === ")") {
            if (parenthesisStack.length === 0) {
                issues.push(
                    `Unexpected style declaration closing parenthesis at line ${lineAt(globalOffset + index)}.`
                );
            } else {
                parenthesisStack.pop();
            }
            continue;
        }
        if (character === "[") {
            bracketStack.push(index);
            continue;
        }
        if (character === "]") {
            if (bracketStack.length === 0) {
                issues.push(
                    `Unexpected style declaration closing bracket at line ${lineAt(globalOffset + index)}.`
                );
            } else {
                bracketStack.pop();
            }
            continue;
        }
        if (parenthesisStack.length > 0 || bracketStack.length > 0) {
            continue;
        }
        if (character === ":" && separator === null) {
            separator = index;
            continue;
        }
        if (character !== ";") {
            continue;
        }

        appendDeclaration({
            declarations,
            content,
            clean,
            statementStart,
            statementEnd: index,
            separator,
            globalOffset,
            supportsLineComments,
            lineAt
        });
        statementStart = index + 1;
        separator = null;
    }

    if (quote !== null) {
        issues.push(
            `Unterminated style declaration string at line ${lineAt(globalOffset + quoteStart)}.`
        );
    }
    if (parenthesisStack.length > 0) {
        issues.push(
            `Unterminated style declaration parenthesis at line ${lineAt(globalOffset + parenthesisStack[0])}.`
        );
    }
    if (bracketStack.length > 0) {
        issues.push(
            `Unterminated style declaration bracket at line ${lineAt(globalOffset + bracketStack[0])}.`
        );
    }

    return {
        declarations,
        issues
    };
}

function appendDeclaration(options) {
    if (options.separator === null
        || options.separator < options.statementStart
        || options.separator >= options.statementEnd) {
        return;
    }

    const activeProperty = options.clean
        .slice(options.statementStart, options.separator)
        .trim();
    if (!/^[-\w]+$/u.test(activeProperty)) {
        return;
    }

    const propertyOffset = options.clean
        .slice(options.statementStart, options.separator)
        .search(/\S/u);
    const propertyStart = options.statementStart + propertyOffset;
    const original = options.content.slice(propertyStart, options.statementEnd);
    const localSeparator = options.separator - propertyStart;
    const value = original.slice(localSeparator + 1).trim();

    if (!value) {
        return;
    }

    options.declarations.push({
        property: activeProperty.toLowerCase(),
        value,
        activeValue: maskStyleCommentsAndStrings(
            value,
            options.supportsLineComments
        ),
        line: options.lineAt(options.globalOffset + propertyStart),
        evidence: compact(original)
    });
}

function maskStyleCommentsAndStrings(source, supportsLineComments) {
    return maskStyleSource(source, supportsLineComments, true);
}

function maskStyleComments(source, supportsLineComments) {
    return maskStyleSource(source, supportsLineComments, false);
}

function maskStyleSource(source, supportsLineComments, maskStrings) {
    const active = source.split("");
    let comment = null;
    let quote = null;
    let escaped = false;
    let urlDepth = 0;

    for (let index = 0; index < active.length; index += 1) {
        const character = active[index];
        const next = active[index + 1] ?? "";

        if (comment === "block") {
            blank(active, index);

            if (character === "*" && next === "/") {
                blank(active, ++index);
                comment = null;
            }
            continue;
        }

        if (comment === "line") {
            blank(active, index);

            if (character === "\n") {
                active[index] = "\n";
                comment = null;
            }
            continue;
        }

        if (!quote && character === "/" && next === "*") {
            blank(active, index);
            blank(active, ++index);
            comment = "block";
            continue;
        }

        if (!quote && character === "(") {
            if (urlDepth > 0) {
                urlDepth += 1;
            } else if (source.slice(Math.max(0, index - 3), index)
                .toLowerCase() === "url") {
                urlDepth = 1;
            }
        } else if (!quote && character === ")" && urlDepth > 0) {
            urlDepth -= 1;
        }

        if (!quote
            && supportsLineComments
            && urlDepth === 0
            && character === "/"
            && next === "/") {
            blank(active, index);
            blank(active, ++index);
            comment = "line";
            continue;
        }

        if (!quote && (character === "'" || character === "\"")) {
            quote = character;
            if (maskStrings) {
                blank(active, index);
            }
            continue;
        }

        if (!quote) {
            continue;
        }

        if (maskStrings) {
            blank(active, index);
        }
        if (escaped) {
            escaped = false;
        } else if (character === "\\") {
            escaped = true;
        } else if (character === quote) {
            quote = null;
        }
    }

    return active.join("");
}

function createMetrics(regions) {
    const metrics = {
        tokenDefinitions: 0,
        tokenReferences: 0,
        mediaQueries: 0,
        containerQueries: 0
    };

    for (const region of regions) {
        metrics.tokenDefinitions += countMatches(
            region.activeContent,
            /--[\w-]+\s*:/gu
        );
        metrics.tokenReferences += countMatches(
            region.activeContent,
            /var\(\s*--[\w-]+/gu
        );
        metrics.mediaQueries += countMatches(
            region.activeContent,
            /@media(?=\s|\()/giu
        );
        metrics.containerQueries += countMatches(
            region.activeContent,
            /@container(?=\s|\()/giu
        );
    }

    return metrics;
}

function countMatches(value, pattern) {
    return [...value.matchAll(pattern)].length;
}

function blank(characters, index) {
    if (characters[index] !== "\n" && characters[index] !== "\r") {
        characters[index] = " ";
    }
}

function compact(value) {
    return value.replace(/\s+/gu, " ").trim().slice(0, 160);
}
