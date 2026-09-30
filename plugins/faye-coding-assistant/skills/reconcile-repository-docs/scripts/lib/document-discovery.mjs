// Discover Markdown documents without escaping or mutating the requested root.

import { readdirSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

import { discoverGitVisiblePaths } from "../../../../scripts/lib/git-file-discovery.mjs";
import {
    comparePaths,
    toDisplayPath
} from "../../../../scripts/lib/repository-paths.mjs";

const DOCUMENT_EXTENSIONS = new Set([".md", ".mdx"]);
const FALLBACK_EXCLUDED_DIRECTORIES = new Set([
    ".faye",
    ".cache",
    ".codex",
    ".codex-temp",
    ".git",
    ".gradle",
    ".next",
    ".nuxt",
    ".parcel-cache",
    ".pytest_cache",
    ".ruff_cache",
    ".svelte-kit",
    ".turbo",
    ".venv",
    "build",
    "coverage",
    "dist",
    "node_modules",
    "out",
    "target",
    "test-results",
    "tmp"
]);

export function discoverDocumentPaths(root, options = {}) {
    const absoluteRoot = resolve(root);
    const gitResult = discoverGitVisiblePaths(absoluteRoot, {
        runGit: options.runGit,
        errorLabel: "Git document discovery failed"
    });

    if (gitResult.paths) {
        return {
            paths: gitResult.paths
                .filter((candidate) => isDocumentPath(candidate))
                .sort(comparePaths),
            discovery: gitResult.discovery
        };
    }

    return {
        paths: walkDocumentPaths(absoluteRoot).sort(comparePaths),
        discovery: gitResult.discovery
    };
}

export function walkDocumentPaths(root) {
    const absoluteRoot = resolve(root);
    const paths = [];

    function visit(current) {
        for (const entry of readdirSync(current, { withFileTypes: true })) {
            if (entry.isSymbolicLink()) {
                continue;
            }

            const absolutePath = join(current, entry.name);
            const relativePath = toDisplayPath(relative(absoluteRoot, absolutePath));

            if (entry.isDirectory()) {
                if (!isExcludedFallbackDirectory(entry.name)) {
                    visit(absolutePath);
                }
            } else if (entry.isFile() && isDocumentPath(relativePath)) {
                paths.push(relativePath);
            }
        }
    }

    visit(absoluteRoot);
    return paths;
}

export function isDocumentPath(candidate) {
    return DOCUMENT_EXTENSIONS.has(extname(String(candidate)).toLowerCase());
}

export { toDisplayPath };

function isExcludedFallbackDirectory(name) {
    const normalized = name.toLowerCase();
    return FALLBACK_EXCLUDED_DIRECTORIES.has(normalized) || normalized.startsWith(".tmp");
}
