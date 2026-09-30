// Discover analyzable workspace files without escaping the requested root.

import {
    lstatSync,
    readdirSync,
    realpathSync
} from "node:fs";
import {
    isAbsolute,
    join,
    relative,
    resolve
} from "node:path";

import { discoverGitVisiblePaths } from "../../../../scripts/lib/git-file-discovery.mjs";
import {
    isContainedPath,
    toDisplayPath
} from "../../../../scripts/lib/repository-paths.mjs";

const NOISE_DIR_NAMES = new Set([
    ".faye",
    ".cache",
    ".codex",
    ".codex-temp",
    ".git",
    ".github",
    ".gradle",
    ".next",
    ".nuxt",
    ".parcel-cache",
    ".pytest_cache",
    ".ruff_cache",
    ".svelte-kit",
    ".turbo",
    ".vite",
    "build",
    "coverage",
    "dist",
    "node_modules",
    "out",
    "target",
    "test-results",
    "tmp"
]);

const GENERATED_DIR_NAMES = new Set([
    "__pycache__",
    "gen",
    "generated",
    "vendor",
    "vendors"
]);

const SCRIPT_EXTENSIONS = new Set([
    ".bash",
    ".bat",
    ".c",
    ".cc",
    ".cjs",
    ".clj",
    ".cljs",
    ".cmd",
    ".cpp",
    ".cs",
    ".css",
    ".dart",
    ".erl",
    ".ex",
    ".exs",
    ".fs",
    ".fsx",
    ".go",
    ".groovy",
    ".h",
    ".hpp",
    ".hrl",
    ".java",
    ".js",
    ".jsx",
    ".kt",
    ".kts",
    ".lua",
    ".mjs",
    ".php",
    ".pl",
    ".pm",
    ".ps1",
    ".psm1",
    ".py",
    ".pyw",
    ".r",
    ".rb",
    ".rs",
    ".sass",
    ".scss",
    ".sh",
    ".sql",
    ".swift",
    ".ts",
    ".tsx",
    ".vue",
    ".zsh"
]);

const SCRIPT_FILE_NAMES = new Set([
    "cmakelists.txt",
    "dockerfile",
    "gemfile",
    "jenkinsfile",
    "makefile",
    "rakefile"
]);

export function normalizeRelPath(value) {
    return String(value).replace(/^\/+|\/+$/g, "");
}

export function isNoisePath(relPath) {
    const parts = normalizeRelPath(relPath).toLowerCase().split("/").filter(Boolean);

    return parts.some((part) => (
        NOISE_DIR_NAMES.has(part)
        || GENERATED_DIR_NAMES.has(part)
        || part.startsWith(".tmp")
    ));
}

export function isScriptFile(relPath) {
    const name = normalizeRelPath(relPath).split("/").at(-1).toLowerCase();

    if (SCRIPT_FILE_NAMES.has(name)) {
        return true;
    }

    if (name.includes(".min.") || name.endsWith(".map")) {
        return false;
    }

    const dotIndex = name.lastIndexOf(".");
    const extension = dotIndex >= 0 ? name.slice(dotIndex) : "";
    return SCRIPT_EXTENSIONS.has(extension);
}

export function discoverCandidatePaths(root, options = {}) {
    const absoluteRoot = resolve(root);
    const gitResult = discoverGitVisiblePaths(absoluteRoot, {
        runGit: options.runGit,
        errorLabel: "Git file discovery failed"
    });

    if (gitResult.paths) {
        return {
            paths: gitResult.paths.sort(),
            discovery: gitResult.discovery
        };
    }

    return {
        paths: walkCandidatePaths(absoluteRoot).sort(),
        discovery: gitResult.discovery
    };
}

export function walkCandidatePaths(root) {
    const absoluteRoot = resolve(root);
    const paths = [];

    function visit(current) {
        for (const entry of readdirSync(current, { withFileTypes: true })) {
            if (entry.isSymbolicLink()) {
                continue;
            }

            const absolutePath = join(current, entry.name);
            const relPath = normalizeRelPath(toDisplayPath(relative(absoluteRoot, absolutePath)));

            if (isNoisePath(relPath)) {
                continue;
            }

            if (entry.isDirectory()) {
                visit(absolutePath);
            } else if (entry.isFile()) {
                paths.push(relPath);
            }
        }
    }

    visit(absoluteRoot);
    return paths;
}

export function resolveContainedFile(root, candidate) {
    const absoluteRoot = realpathSync(resolve(root));
    const rawCandidate = String(candidate);

    if (!rawCandidate || isAbsolute(rawCandidate)) {
        return null;
    }

    const lexicalPath = resolve(absoluteRoot, rawCandidate);
    if (!isContainedPath(absoluteRoot, lexicalPath)) {
        return null;
    }

    let stat;
    try {
        stat = lstatSync(lexicalPath);
    } catch (error) {
        if (error?.code === "ENOENT" || error?.code === "ENOTDIR") {
            return null;
        }
        throw error;
    }

    if (stat.isSymbolicLink() || !stat.isFile()) {
        return null;
    }

    const realCandidate = realpathSync(lexicalPath);
    if (!isContainedPath(absoluteRoot, realCandidate)) {
        return null;
    }

    return {
        absolutePath: realCandidate,
        relativePath: toDisplayPath(relative(absoluteRoot, realCandidate)),
        stat
    };
}

export { isContainedPath };
