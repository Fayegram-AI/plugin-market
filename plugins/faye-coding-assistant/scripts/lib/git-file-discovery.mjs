// Git-visible repository file discovery shared by plugin scripts.

import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

import { toDisplayPath } from "./repository-paths.mjs";

const GIT_OUTPUT_LIMIT_BYTES = 64 * 1024 * 1024;

export function discoverGitVisiblePaths(root, options = {}) {
    const absoluteRoot = resolve(root);
    const runGit = options.runGit ?? execFileSync;
    const errorLabel = options.errorLabel ?? "Git file discovery failed";

    try {
        const output = runGit(
            "git",
            ["-C", absoluteRoot, "ls-files", "-co", "--exclude-standard", "-z"],
            {
                encoding: "utf8",
                maxBuffer: GIT_OUTPUT_LIMIT_BYTES,
                stdio: ["ignore", "pipe", "pipe"]
            }
        );

        return {
            paths: output
                .split("\0")
                .filter(Boolean)
                .map(toDisplayPath),
            discovery: {
                mode: "git",
                gitIgnoreApplied: true,
                fallbackReason: null
            }
        };
    } catch (error) {
        const fallbackReason = expectedGitFallbackReason(error);
        if (!fallbackReason) {
            throw new Error(`${errorLabel}: ${gitErrorDetail(error)}`, {
                cause: error
            });
        }

        return {
            paths: null,
            discovery: {
                mode: "filesystem",
                gitIgnoreApplied: false,
                fallbackReason
            }
        };
    }
}

function expectedGitFallbackReason(error) {
    if (error?.code === "ENOENT") {
        return "git-unavailable";
    }

    const detail = `${error?.stderr ?? ""}\n${error?.message ?? ""}`.toLowerCase();
    if (detail.includes("not a git repository")) {
        return "not-a-git-repository";
    }

    return null;
}

function gitErrorDetail(error) {
    const stderr = String(error?.stderr ?? "").trim();
    return stderr || String(error?.message ?? error);
}
