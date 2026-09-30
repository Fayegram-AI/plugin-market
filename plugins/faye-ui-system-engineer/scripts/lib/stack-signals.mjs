/**
 * Detect framework and styling signals without making package choices.
 */

import { lstat, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { createDiagnostic } from "./report-model.mjs";

export async function readStackSignals(
    root,
    scopes,
    sourceFiles,
    sourceExtensions
) {
    const dependencies = {};
    const diagnostics = [];
    const manifestPaths = await collectPackageManifestPaths(
        root,
        scopes,
        sourceFiles
    );

    for (const packagePath of manifestPaths) {
        const relativePath = normalizePath(path.relative(root, packagePath));
        const manifestResult = await readPackageManifest(
            root,
            packagePath,
            relativePath
        );

        if (manifestResult.packageJson) {
            Object.assign(
                dependencies,
                manifestResult.packageJson.dependencies ?? {},
                manifestResult.packageJson.devDependencies ?? {}
            );
        }

        if (manifestResult.diagnostic) {
            diagnostics.push(manifestResult.diagnostic);
        }
    }

    const packageNames = Object.keys(dependencies);
    const frameworks = detectNamedSignals(packageNames, [
        ["@angular/core", "angular"],
        ["lit", "lit"],
        ["preact", "preact"],
        ["react", "react"],
        ["solid-js", "solid"],
        ["svelte", "svelte"],
        ["vue", "vue"]
    ]);
    const styling = detectNamedSignals(packageNames, [
        ["@emotion/react", "emotion"],
        ["less", "less"],
        ["sass", "sass"],
        ["styled-components", "styled-components"],
        ["tailwindcss", "tailwind"]
    ]);
    const uiLibraries = packageNames.filter(isUiDependencySignal);

    if ((sourceExtensions[".css"] ?? 0) > 0) {
        styling.push("css");
    }

    if ((sourceExtensions[".scss"] ?? 0) > 0 && !styling.includes("sass")) {
        styling.push("sass-source");
    }

    if ((sourceExtensions[".less"] ?? 0) > 0 && !styling.includes("less")) {
        styling.push("less-source");
    }

    return {
        stackSignals: {
            frameworks: frameworks.length > 0 ? frameworks.sort() : ["vanilla-or-unknown"],
            styling: styling.sort(),
            uiLibraries: [...new Set(uiLibraries)].sort(),
            sourceExtensions: Object.fromEntries(
                Object.entries(sourceExtensions).sort(([left], [right]) => left.localeCompare(right))
            )
        },
        diagnostics
    };
}

async function collectPackageManifestPaths(root, scopes, sourceFiles) {
    const manifestPaths = new Set([path.join(root, "package.json")]);

    for (const scope of scopes) {
        const scopeStats = await stat(scope);
        const directory = scopeStats.isDirectory() ? scope : path.dirname(scope);

        addManifestAncestors(root, directory, manifestPaths);
    }

    for (const sourceFile of sourceFiles) {
        addManifestAncestors(root, path.dirname(sourceFile), manifestPaths);
    }

    return [...manifestPaths].sort((left, right) => left.localeCompare(right));
}

function addManifestAncestors(root, directory, manifestPaths) {
    let current = directory;

    while (isInsideRoot(root, current)) {
        manifestPaths.add(path.join(current, "package.json"));

        if (current === root) {
            break;
        }

        current = path.dirname(current);
    }
}

function isInsideRoot(root, target) {
    const relativePath = path.relative(root, target);

    return relativePath === ""
        || (relativePath !== ".."
            && !relativePath.startsWith(`..${path.sep}`)
            && !path.isAbsolute(relativePath));
}

function detectNamedSignals(packageNames, candidates) {
    return candidates
        .filter(([packageName]) => packageNames.includes(packageName))
        .map(([, label]) => label);
}

function isUiDependencySignal(packageName) {
    return /(?:^|[-_/])(?:ui|components?|design-system|primitives?)(?:$|[-_/])/iu
        .test(packageName);
}

async function readPackageManifest(root, packagePath, relativePath) {
    let bytes;

    try {
        // Manifests are discovered inputs, not explicitly authorized linked scopes.
        const metadata = await lstat(packagePath);
        if (metadata.isSymbolicLink()) {
            return unsafeManifestDiagnostic(relativePath, "Discovered manifest is a symbolic link.");
        }
        const resolvedPath = await realpath(packagePath);
        if (!isInsideRoot(root, resolvedPath)) {
            return unsafeManifestDiagnostic(relativePath, "Manifest resolves outside the audit root.");
        }
        bytes = await readFile(resolvedPath);
    } catch (error) {
        if (error.code === "ENOENT") {
            return {
                packageJson: null,
                diagnostic: null
            };
        }

        return manifestDiagnostic(
            relativePath,
            "unreadable-package-manifest",
            "Package manifest could not be read.",
            formatErrorEvidence(error)
        );
    }

    try {
        const source = new TextDecoder("utf-8", {
            fatal: true
        }).decode(bytes);
        const packageJson = JSON.parse(source);

        if (!isRecord(packageJson)
            || !isOptionalRecord(packageJson.dependencies)
            || !isOptionalRecord(packageJson.devDependencies)) {
            return manifestDiagnostic(
                relativePath,
                "invalid-package-manifest",
                "Package manifest has an unsupported dependency shape.",
                "Expected an object with optional object-valued dependencies and devDependencies"
            );
        }

        return {
            packageJson,
            diagnostic: null
        };
    } catch (error) {
        return manifestDiagnostic(
            relativePath,
            "invalid-package-manifest",
            "Package manifest is not valid UTF-8 JSON.",
            error.message
        );
    }
}

function unsafeManifestDiagnostic(relativePath, evidence) {
    return manifestDiagnostic(
        relativePath,
        "unsafe-package-manifest-skipped",
        "Skipped package manifest outside the discovery policy.",
        evidence
    );
}

function manifestDiagnostic(relativePath, diagnosticId, message, evidence) {
    return {
        packageJson: null,
        diagnostic: createDiagnostic({
            diagnosticId,
            severity: "warning",
            path: relativePath,
            message,
            evidence
        })
    };
}

function isOptionalRecord(value) {
    return value === undefined || isRecord(value);
}

function isRecord(value) {
    return value !== null
        && typeof value === "object"
        && !Array.isArray(value);
}

function formatErrorEvidence(error) {
    return error.code ? `${error.code}: ${error.message}` : error.message;
}

function normalizePath(target) {
    return target.replaceAll(path.sep, "/");
}
