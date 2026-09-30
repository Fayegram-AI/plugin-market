// Resolve Markdown destinations against the repository with portable path checks.

import {
    lstatSync,
    readdirSync,
    realpathSync
} from "node:fs";
import {
    dirname,
    join,
    posix,
    relative,
    resolve,
    sep
} from "node:path";

import {
    fromDisplayPath,
    isContainedPath,
    toDisplayPath
} from "../../../../scripts/lib/repository-paths.mjs";

const URI_SCHEME = /^[A-Za-z][A-Za-z0-9+.-]*:/;

export function validateReference(root, sourceRelativePath, destination) {
    const absoluteRoot = realpathSync(resolve(root));
    const rawDestination = String(destination).trim();

    if (!rawDestination) {
        return skipped("empty-destination", "Empty destinations are not file references.");
    }
    if (rawDestination.startsWith("#")) {
        return skipped("fragment-only", "Heading fragments are outside this checker.");
    }
    const portableDestination = unescapeMarkdownPunctuation(rawDestination);
    if (/^file:/i.test(portableDestination)) {
        return issue("non-portable-file-url", "Machine-local file URLs are not portable.");
    }
    if (isWindowsAbsolute(portableDestination)) {
        return issue("non-portable-absolute-path", "Windows absolute and UNC paths are not portable.");
    }
    if (portableDestination.startsWith("~")) {
        return issue("non-portable-home-path", "Home-relative paths are not portable.");
    }
    if (portableDestination.includes("\\")) {
        return issue("non-portable-backslash", "Local Markdown paths must use forward slashes.");
    }
    if (portableDestination.startsWith("//")) {
        return skipped("external-reference", "Protocol-relative external references are not checked.");
    }
    if (URI_SCHEME.test(portableDestination)) {
        return skipped("external-reference", "External and custom-scheme references are not checked.");
    }
    if (posix.isAbsolute(portableDestination)) {
        return skipped("site-root-reference", "Site-root and POSIX-root references cannot be distinguished safely.");
    }

    const filePortion = destinationFilePortion(portableDestination);
    if (!filePortion) {
        return skipped("fragment-only", "Heading fragments are outside this checker.");
    }

    let decodedPath;
    try {
        decodedPath = decodeURIComponent(filePortion);
    } catch {
        return issue("invalid-percent-encoding", "The destination contains invalid percent encoding.");
    }
    if (isWindowsAbsolute(decodedPath)) {
        return issue("non-portable-absolute-path", "Windows absolute and UNC paths are not portable.");
    }
    if (decodedPath.startsWith("~")) {
        return issue("non-portable-home-path", "Home-relative paths are not portable.");
    }
    if (decodedPath.includes("\\")) {
        return issue("non-portable-backslash", "Local Markdown paths must use forward slashes.");
    }
    if (posix.isAbsolute(decodedPath)) {
        return skipped("site-root-reference", "Site-root and POSIX-root references cannot be distinguished safely.");
    }

    const sourceAbsolutePath = resolve(absoluteRoot, fromDisplayPath(sourceRelativePath));
    const candidateAbsolutePath = resolve(dirname(sourceAbsolutePath), fromDisplayPath(decodedPath));
    const attemptedTarget = toDisplayPath(relative(absoluteRoot, candidateAbsolutePath)) || ".";

    if (!isContainedPath(absoluteRoot, candidateAbsolutePath)) {
        return issue(
            "outside-repository",
            "The destination escapes the requested repository root.",
            attemptedTarget,
            attemptedTarget
        );
    }

    const resolved = resolvePathSegments(absoluteRoot, candidateAbsolutePath);
    if (resolved.status === "missing") {
        return issue(
            "missing-target",
            "The local destination does not exist.",
            attemptedTarget,
            attemptedTarget
        );
    }
    if (resolved.status === "ambiguous-case") {
        return issue(
            "ambiguous-case",
            "The destination has multiple case-insensitive matches.",
            attemptedTarget,
            attemptedTarget
        );
    }
    if (resolved.status === "symlink-escape") {
        return issue(
            "symlink-escape",
            "The destination resolves outside the requested repository root.",
            attemptedTarget,
            attemptedTarget
        );
    }

    const resolvedTarget = resolved.displayPath;
    if (resolved.caseMismatch) {
        return issue(
            "case-mismatch",
            `The destination case differs from the filesystem path: ${resolvedTarget}`,
            resolvedTarget,
            attemptedTarget
        );
    }

    return {
        status: "valid",
        category: "valid-local-reference",
        message: "The local destination exists.",
        resolvedTarget,
        attemptedTarget
    };
}

export function normalizeTargetArgument(root, target) {
    const rawTarget = String(target).trim();
    if (!rawTarget || isWindowsAbsolute(rawTarget) || posix.isAbsolute(rawTarget) || rawTarget.startsWith("~")) {
        throw new Error("--target values must be non-empty repository-relative paths");
    }

    const normalizedInput = rawTarget.replaceAll("\\", "/");
    const absoluteRoot = realpathSync(resolve(root));
    const absoluteTarget = resolve(absoluteRoot, fromDisplayPath(normalizedInput));
    if (!isContainedPath(absoluteRoot, absoluteTarget)) {
        throw new Error("--target values must stay inside the repository root");
    }
    return toDisplayPath(relative(absoluteRoot, absoluteTarget)) || ".";
}

export { isContainedPath };

function resolvePathSegments(root, candidate) {
    const relativePath = relative(root, candidate);
    const segments = relativePath ? relativePath.split(sep).filter(Boolean) : [];
    const actualSegments = [];
    let current = root;
    let caseMismatch = false;

    for (const segment of segments) {
        let entries;
        try {
            entries = readdirSync(current, { withFileTypes: true });
        } catch (error) {
            if (isMissingPathError(error)) {
                return { status: "missing" };
            }
            throw error;
        }

        let matched = entries.find((entry) => entry.name === segment);
        if (!matched) {
            const caseInsensitiveMatches = entries.filter((entry) => (
                entry.name.toLowerCase() === segment.toLowerCase()
            ));
            if (caseInsensitiveMatches.length === 0) {
                return { status: "missing" };
            }
            if (caseInsensitiveMatches.length > 1) {
                return { status: "ambiguous-case" };
            }
            [matched] = caseInsensitiveMatches;
            caseMismatch = true;
        }

        actualSegments.push(matched.name);
        const lexicalPath = join(current, matched.name);
        let stat;
        try {
            stat = lstatSync(lexicalPath);
        } catch (error) {
            if (isMissingPathError(error)) {
                return { status: "missing" };
            }
            throw error;
        }

        if (stat.isSymbolicLink()) {
            const realTarget = realpathSync(lexicalPath);
            if (!isContainedPath(root, realTarget)) {
                return { status: "symlink-escape" };
            }
            current = realTarget;
        } else {
            current = lexicalPath;
        }
    }

    return {
        status: "resolved",
        caseMismatch,
        displayPath: actualSegments.join("/") || "."
    };
}

function destinationFilePortion(destination) {
    const queryIndex = destination.indexOf("?");
    const fragmentIndex = destination.indexOf("#");
    const boundaries = [queryIndex, fragmentIndex].filter((index) => index >= 0);
    const end = boundaries.length > 0 ? Math.min(...boundaries) : destination.length;
    return destination.slice(0, end);
}

function isWindowsAbsolute(candidate) {
    return /^[A-Za-z]:/.test(candidate) || /^\\\\/.test(candidate);
}

function isMissingPathError(error) {
    return error?.code === "ENOENT" || error?.code === "ENOTDIR";
}

function unescapeMarkdownPunctuation(candidate) {
    return candidate.replace(/\\([!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~])/g, "$1");
}

function issue(category, message, resolvedTarget = null, attemptedTarget = null) {
    return {
        status: "issue",
        category,
        message,
        resolvedTarget,
        attemptedTarget
    };
}

function skipped(category, message) {
    return {
        status: "skipped",
        category,
        message,
        resolvedTarget: null,
        attemptedTarget: null
    };
}
