/** Shared distribution policy; standalone repositories require only Node built-ins. */
import { lstat, readdir } from "node:fs/promises";
import path from "node:path";

const ignoredDirectories = new Set([
    ".faye", ".git", ".github", ".idea", ".vscode", ".venv", ".tox", ".nox",
    ".cache", ".firebase", "__pycache__", ".pytest_cache", ".mypy_cache", ".ruff_cache",
    ".pnpm-store", ".npm", ".yarn", ".codex-cache", ".codex-tmp", "node_modules",
    "venv", "coverage", "htmlcov", "dist", "build", "logs", "tmp", "temp",
    "secrets", "scratch", "tests", "test"
]);
const ignoredFiles = new Set([".coverage", ".ds_store", ".gitignore", "desktop.ini", "thumbs.db"]);
const transientFile = /\.(?:pyc|pyo|tmp|bak|orig|log|zip|tar|tgz|7z|swp|swo|local|secret)$/iu;
const sensitiveFiles = [
    /^\.env(?:\.|$)/iu, /^\.(?:netrc|npmrc|pypirc)$/iu,
    /^(?:application_default_)?credentials\.json$/iu,
    /^firebase[-_.]?adminsdk.*\.json$/iu, /^service[-_.]?account.*\.json$/iu,
    /^id_(?:dsa|ecdsa|ed25519|rsa)$/iu, /\.(?:key|p12|pem|pfx)$/iu
];

export const isSensitiveFileName = name => sensitiveFiles.some(pattern => pattern.test(name));
export const isIgnoredPackageDirectory = name => ignoredDirectories.has(name.toLowerCase());
export const isIgnoredPackageFile = name => ignoredFiles.has(name.toLowerCase()) || transientFile.test(name) || isSensitiveFileName(name);
// Hosting omits repository automation/placeholders, but preserves root Git policy files.
export const isIgnoredHostedDirectory = isIgnoredPackageDirectory;
export const isIgnoredHostedFile = name => name.toLowerCase() === ".gitkeep"
    || (name.toLowerCase() !== ".gitignore" && isIgnoredPackageFile(name));

/** Reject aliases/traversal before using an inventory path on any supported host. */
export function assertDistributionPath(value) {
    if (typeof value !== "string" || !value || /[\\:<>"|?*\u0000-\u001f]/u.test(value)
        || value.split("/").some(part => !part || /[. ]$/u.test(part) || part.toLowerCase() === ".git"
            || /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu.test(part))) {
        throw new Error(`Unsafe distribution path: ${value}`);
    }
    return value;
}

export function isHostedRepositoryPath(name) {
    assertDistributionPath(name);
    const parts = name.split("/");
    return !parts.slice(0, -1).some(isIgnoredHostedDirectory) && !isIgnoredHostedFile(parts.at(-1));
}

/** Report forbidden entries without reading their contents or descending into them. */
export async function validateRepositoryArtifacts(root) {
    const errors = [];
    if ((await lstat(root)).isSymbolicLink()) return ["Linked repository root is forbidden"];
    async function visit(directory, prefix = "") {
        for (const entry of await readdir(directory, { withFileTypes: true })) {
            if (!prefix && entry.name === ".git") continue;
            const name = `${prefix}${entry.name}`;
            try { assertDistributionPath(name); } catch (error) { errors.push(error.message); continue; }
            if (entry.isSymbolicLink()) { errors.push(`Linked repository entry: ${name}`); continue; }
            if (entry.isDirectory()) {
                const rootAutomation = !prefix && entry.name === ".github";
                if (!rootAutomation && isIgnoredPackageDirectory(entry.name)) {
                    errors.push(`${name} must not be present in the marketplace repository.`);
                } else await visit(path.join(directory, entry.name), `${name}/`);
            } else if (entry.isFile()) {
                if (!(name === ".gitignore") && isIgnoredPackageFile(entry.name)) errors.push(`${name} must not be present in the marketplace repository.`);
            } else errors.push(`Unsupported repository entry: ${name}`);
        }
    }
    await visit(root);
    return errors;
}
