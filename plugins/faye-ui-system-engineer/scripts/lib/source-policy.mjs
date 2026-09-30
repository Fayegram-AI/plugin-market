/**
 * Own filesystem boundaries and source-discovery policy for the audit.
 */

import { readFile, realpath, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { createDiagnostic } from "./report-model.mjs";

export const DEFAULT_MAX_FILE_BYTES = 1024 * 1024;
export const BINARY_CONTROL_THRESHOLD = 0.1;
const ALLOWED_TEXT_CONTROLS = new Set([0x09, 0x0a, 0x0c, 0x0d]);
export const SUPPORTED_EXTENSIONS = new Set([
    ".css",
    ".htm",
    ".html",
    ".js",
    ".jsx",
    ".less",
    ".mjs",
    ".scss",
    ".svelte",
    ".ts",
    ".tsx",
    ".vue"
]);
export const DEFAULT_EXCLUDED_DIRECTORIES = new Set([
    ".cache",
    ".git",
    ".next",
    ".nuxt",
    ".svelte-kit",
    "build",
    "coverage",
    "dist",
    "dist-types",
    "generated",
    "node_modules",
    "out",
    "temp",
    "tmp",
    "vendor"
]);

/**
 * Resolve CLI or programmatic overrides into the exact policy used by a scan.
 * Include names remove matching defaults; explicit include/exclude conflicts
 * are rejected rather than made order-dependent.
 */
export function createSourcePolicy(overrides = {}) {
    const includedDirectories = normalizeDirectoryNames(
        overrides.includeDirectories ?? [],
        "include"
    );
    const additionalExcludedDirectories = normalizeDirectoryNames(
        overrides.excludeDirectories ?? [],
        "exclude"
    );

    for (const name of includedDirectories) {
        if (additionalExcludedDirectories.has(name)) {
            throw new Error(
                `Directory policy conflict: ${name} is both included and excluded.`
            );
        }
    }

    const maxFileBytes = overrides.maxFileBytes ?? DEFAULT_MAX_FILE_BYTES;
    if (!Number.isSafeInteger(maxFileBytes) || maxFileBytes < 1) {
        throw new Error("Maximum file size must be a positive safe integer.");
    }

    const excludedDirectories = new Set(DEFAULT_EXCLUDED_DIRECTORIES);
    for (const name of includedDirectories) {
        excludedDirectories.delete(name);
    }
    for (const name of additionalExcludedDirectories) {
        excludedDirectories.add(name);
    }

    return Object.freeze({
        maxFileBytes,
        excludedDirectories: Object.freeze(
            [...excludedDirectories].sort((left, right) => (
                left.localeCompare(right)
            ))
        )
    });
}

export async function resolveAuditTargets(rootInput, requestedScopes) {
    const lexicalRoot = path.resolve(rootInput);
    await assertDirectory(lexicalRoot, "root");
    const root = await realpath(lexicalRoot);

    if (requestedScopes.length === 0) {
        return {
            root,
            scopes: [root]
        };
    }

    const scopes = [];

    for (const requestedScope of requestedScopes) {
        const lexicalScope = path.resolve(lexicalRoot, requestedScope);

        if (!isInside(lexicalRoot, lexicalScope)) {
            throw new Error(`Scope must stay inside root: ${requestedScope}`);
        }

        const resolvedScope = await realpath(lexicalScope).catch(() => null);

        if (!resolvedScope) {
            throw new Error(`Scope is not readable: ${requestedScope}`);
        }

        if (!isInside(root, resolvedScope)) {
            throw new Error(
                `Scope must stay inside root after resolving links: ${requestedScope}`
            );
        }

        scopes.push(resolvedScope);
    }

    return {
        root,
        scopes: [...new Set(scopes)].sort((left, right) => left.localeCompare(right))
    };
}

export async function collectSourceFiles(
    scopes,
    sourcePolicy = createSourcePolicy()
) {
    const filePaths = new Set();
    const excludedDirectories = new Set(sourcePolicy.excludedDirectories);

    for (const scope of scopes) {
        await collectPath(scope, filePaths, excludedDirectories);
    }

    return [...filePaths].sort((left, right) => left.localeCompare(right));
}

export async function readSourceText(
    filePath,
    relativePath,
    sourcePolicy = createSourcePolicy()
) {
    const fileStat = await stat(filePath).catch((error) => ({
        error
    }));

    if (fileStat.error) {
        return skippedSourceDiagnostic(
            "source-read-failed",
            relativePath,
            "Skipped source that could not be inspected.",
            formatErrorEvidence(fileStat.error)
        );
    }

    if (fileStat.size > sourcePolicy.maxFileBytes) {
        return skippedSourceDiagnostic(
            "large-source-skipped",
            relativePath,
            `Skipped source larger than ${sourcePolicy.maxFileBytes} bytes.`,
            `${fileStat.size} bytes`
        );
    }

    const bytes = await readFile(filePath).catch((error) => ({
        error
    }));

    if (bytes.error) {
        return skippedSourceDiagnostic(
            "source-read-failed",
            relativePath,
            "Skipped source that could not be read.",
            formatErrorEvidence(bytes.error)
        );
    }

    if (isBinaryLike(bytes)) {
        return skippedSourceDiagnostic(
            "binary-source-skipped",
            relativePath,
            "Skipped binary-like content in a supported source path.",
            "NUL byte or disallowed ASCII control-byte ratio above 10%"
        );
    }

    try {
        return {
            source: new TextDecoder("utf-8", {
                fatal: true
            }).decode(bytes),
            diagnostic: null
        };
    } catch {
        return skippedSourceDiagnostic(
            "invalid-utf8-source-skipped",
            relativePath,
            "Skipped source that is not valid UTF-8.",
            "Fatal UTF-8 decoding rejected the byte sequence"
        );
    }
}

async function collectPath(target, filePaths, excludedDirectories) {
    const targetStat = await stat(target);

    if (targetStat.isFile()) {
        if (SUPPORTED_EXTENSIONS.has(path.extname(target).toLowerCase())) {
            filePaths.add(path.resolve(target));
        }
        return;
    }

    if (!targetStat.isDirectory()) {
        return;
    }

    const entries = await readdir(target, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
        if (entry.isSymbolicLink()) {
            continue;
        }

        if (entry.isDirectory() && excludedDirectories.has(entry.name)) {
            continue;
        }

        const entryPath = path.join(target, entry.name);

        if (entry.isDirectory()) {
            await collectPath(entryPath, filePaths, excludedDirectories);
        } else if (entry.isFile() && SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
            filePaths.add(path.resolve(entryPath));
        }
    }
}

function normalizeDirectoryNames(values, policyKind) {
    if (!Array.isArray(values)) {
        throw new Error(`${policyKind} directory policy must be a list.`);
    }

    const names = new Set();

    for (const value of values) {
        const containsUnsupportedCharacter = typeof value === "string"
            && (
                value.includes("/")
                || value.includes("\\")
                || value.includes("\0")
                || ["*", "?", "[", "]", "{", "}"].some((character) => (
                    value.includes(character)
                ))
            );

        if (typeof value !== "string"
            || value.length === 0
            || value !== value.trim()
            || value === "."
            || value === ".."
            || containsUnsupportedCharacter) {
            throw new Error(
                `Invalid ${policyKind} directory name: ${String(value)}. Use one directory name without path separators or glob syntax.`
            );
        }

        names.add(value);
    }

    return names;
}

function skippedSourceDiagnostic(diagnosticId, relativePath, message, evidence) {
    return {
        source: null,
        diagnostic: createDiagnostic({
            diagnosticId,
            severity: "warning",
            path: relativePath,
            message,
            evidence
        })
    };
}

function isBinaryLike(bytes) {
    if (bytes.includes(0)) {
        return true;
    }

    if (bytes.length === 0) {
        return false;
    }

    let disallowedControls = 0;

    for (const byte of bytes) {
        if ((byte < 0x20 && !ALLOWED_TEXT_CONTROLS.has(byte)) || byte === 0x7f) {
            disallowedControls += 1;
        }
    }

    return (disallowedControls / bytes.length) > BINARY_CONTROL_THRESHOLD;
}

function formatErrorEvidence(error) {
    return error.code ? `${error.code}: ${error.message}` : error.message;
}

async function assertDirectory(target, label) {
    const targetStat = await stat(target).catch(() => null);

    if (!targetStat?.isDirectory()) {
        throw new Error(`${label} is not a readable directory: ${target}`);
    }
}

function isInside(root, target) {
    const relativePath = path.relative(root, target);
    return relativePath === ""
        || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}
