// Extract the supported local-reference syntax without claiming full Markdown parsing.

export function extractMarkdownReferences(markdown) {
    const source = stripUtf8Bom(String(markdown));
    const masked = maskCode(source);
    const references = [
        ...extractReferenceDefinitions(masked),
        ...extractInlineReferences(masked)
    ];

    return references.sort((left, right) => (
        left.offset - right.offset
        || compareText(left.kind, right.kind)
    ));
}

export function stripUtf8Bom(value) {
    return value.charCodeAt(0) === 0xFEFF ? value.slice(1) : value;
}

function extractReferenceDefinitions(markdown) {
    const references = [];
    const linePattern = /^( {0,3})\[([^\]\n]+)\]:[ \t]*(?:<([^>\n]+)>|([^\s]+))/gm;

    for (const match of markdown.matchAll(linePattern)) {
        if (match[2].trim().startsWith("^")) {
            continue;
        }

        const destination = match[3] ?? match[4] ?? "";
        const destinationOffset = match.index + match[0].lastIndexOf(destination);
        references.push({
            kind: "reference-definition",
            destination,
            line: lineNumberAt(markdown, destinationOffset),
            offset: destinationOffset
        });
    }

    return references;
}

function extractInlineReferences(markdown) {
    const references = [];

    for (let index = 0; index < markdown.length; index += 1) {
        const isImage = markdown[index] === "!" && markdown[index + 1] === "[";
        const bracketIndex = isImage ? index + 1 : index;
        if (markdown[bracketIndex] !== "[" || isEscaped(markdown, bracketIndex)) {
            continue;
        }

        const labelEnd = findBalancedEnd(markdown, bracketIndex, "[", "]");
        if (labelEnd < 0 || markdown[labelEnd + 1] !== "(") {
            continue;
        }

        const destination = readInlineDestination(markdown, labelEnd + 1);
        if (!destination) {
            continue;
        }

        references.push({
            kind: isImage ? "image" : "inline-link",
            destination: destination.value,
            line: lineNumberAt(markdown, destination.offset),
            offset: destination.offset
        });
        index = destination.closingIndex;
    }

    return references;
}

function readInlineDestination(markdown, openingParenthesis) {
    let cursor = openingParenthesis + 1;
    while (markdown[cursor] === " " || markdown[cursor] === "\t" || markdown[cursor] === "\n") {
        cursor += 1;
    }

    if (markdown[cursor] === ">") {
        return null;
    }

    if (markdown[cursor] === "<") {
        const start = cursor + 1;
        cursor = start;
        while (cursor < markdown.length && markdown[cursor] !== ">") {
            if (markdown[cursor] === "\n" || markdown[cursor] === "<") {
                return null;
            }
            cursor += 1;
        }
        if (markdown[cursor] !== ">") {
            return null;
        }

        const closingIndex = findClosingParenthesis(markdown, cursor + 1);
        if (closingIndex < 0) {
            return null;
        }
        return {
            value: markdown.slice(start, cursor),
            offset: start,
            closingIndex
        };
    }

    const start = cursor;
    let nestedParentheses = 0;
    while (cursor < markdown.length) {
        const character = markdown[cursor];
        if (character === "\\") {
            cursor += 2;
            continue;
        }
        if (character === "(") {
            nestedParentheses += 1;
        } else if (character === ")") {
            if (nestedParentheses === 0) {
                return {
                    value: markdown.slice(start, cursor),
                    offset: start,
                    closingIndex: cursor
                };
            }
            nestedParentheses -= 1;
        } else if ((character === " " || character === "\t" || character === "\n") && nestedParentheses === 0) {
            const closingIndex = findClosingParenthesis(markdown, cursor);
            if (closingIndex < 0) {
                return null;
            }
            return {
                value: markdown.slice(start, cursor),
                offset: start,
                closingIndex
            };
        }
        cursor += 1;
    }

    return null;
}

function findClosingParenthesis(markdown, start) {
    let cursor = start;
    while (markdown[cursor] === " " || markdown[cursor] === "\t" || markdown[cursor] === "\n") {
        cursor += 1;
    }

    if (markdown[cursor] === ")") {
        return cursor;
    }

    const quote = markdown[cursor];
    const pairedClose = quote === "(" ? ")" : quote;
    if (quote !== '"' && quote !== "'" && quote !== "(") {
        return -1;
    }

    cursor += 1;
    while (cursor < markdown.length && markdown[cursor] !== pairedClose) {
        if (markdown[cursor] === "\\") {
            cursor += 2;
        } else {
            cursor += 1;
        }
    }
    if (markdown[cursor] !== pairedClose) {
        return -1;
    }

    cursor += 1;
    while (markdown[cursor] === " " || markdown[cursor] === "\t" || markdown[cursor] === "\n") {
        cursor += 1;
    }
    return markdown[cursor] === ")" ? cursor : -1;
}

function findBalancedEnd(markdown, start, opening, closing) {
    let depth = 0;
    for (let cursor = start; cursor < markdown.length; cursor += 1) {
        if (isEscaped(markdown, cursor)) {
            continue;
        }
        if (markdown[cursor] === opening) {
            depth += 1;
        } else if (markdown[cursor] === closing) {
            depth -= 1;
            if (depth === 0) {
                return cursor;
            }
        }
    }
    return -1;
}

function maskCode(markdown) {
    const characters = markdown.split("");
    maskFencedCode(markdown, characters);

    // Blank paragraphs and masked fence lines bound inline-code matching.
    const prose = characters.join("");
    let blockStart = 0;
    for (const blank of prose.matchAll(/(?:^|\n)[ \t]*\r?(?=\n|$)/g)) {
        maskInlineCode(prose, characters, blockStart, blank.index);
        blockStart = blank.index + blank[0].length;
    }
    maskInlineCode(prose, characters, blockStart, prose.length);

    return characters.join("");
}

function maskFencedCode(markdown, characters) {
    let fence = null;
    let lineStart = 0;

    while (lineStart <= markdown.length) {
        const newlineIndex = markdown.indexOf("\n", lineStart);
        const lineEnd = newlineIndex < 0 ? markdown.length : newlineIndex;
        const line = markdown.slice(lineStart, lineEnd);
        const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})([^\n]*)$/);

        if (fence) {
            maskRange(characters, lineStart, lineEnd);
            if (
                fenceMatch
                && fenceMatch[1][0] === fence.character
                && fenceMatch[1].length >= fence.length
                && /^[ \t]*\r?$/.test(fenceMatch[2])
            ) {
                fence = null;
            }
        } else if (fenceMatch) {
            fence = {
                character: fenceMatch[1][0],
                length: fenceMatch[1].length
            };
            maskRange(characters, lineStart, lineEnd);
        }

        if (newlineIndex < 0) {
            break;
        }
        lineStart = newlineIndex + 1;
    }
}

function maskInlineCode(markdown, characters, blockStart, blockEnd) {
    const runs = [...markdown.slice(blockStart, blockEnd).matchAll(/`+/g)];
    const nextByLength = new Map();
    const closingRuns = [];

    // Index complete runs once: a longer run cannot close a shorter span.
    for (let index = runs.length - 1; index >= 0; index -= 1) {
        const length = runs[index][0].length;
        closingRuns[index] = nextByLength.get(length);
        nextByLength.set(length, index);
    }

    for (let index = 0; index < runs.length; index += 1) {
        const runStart = blockStart + runs[index].index;
        const closingIndex = closingRuns[index];
        if (closingIndex === undefined || isEscaped(markdown, runStart)) {
            continue;
        }

        const closing = runs[closingIndex];
        maskRange(characters, runStart, blockStart + closing.index + closing[0].length);
        index = closingIndex;
    }
}

function maskRange(characters, start, end) {
    for (let index = start; index < end; index += 1) {
        if (characters[index] !== "\n" && characters[index] !== "\r") {
            characters[index] = " ";
        }
    }
}

function isEscaped(markdown, index) {
    let backslashes = 0;
    for (let cursor = index - 1; cursor >= 0 && markdown[cursor] === "\\"; cursor -= 1) {
        backslashes += 1;
    }
    return backslashes % 2 === 1;
}

function lineNumberAt(markdown, offset) {
    let line = 1;
    for (let index = 0; index < offset; index += 1) {
        if (markdown[index] === "\n") {
            line += 1;
        }
    }
    return line;
}

function compareText(left, right) {
    return left === right ? 0 : (left < right ? -1 : 1);
}
