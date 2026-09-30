// Managed-output checks using Node built-ins; ordinary analysis stays read-only.
import { execFileSync } from "node:child_process";
import { lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { isAbsolute, join, parse, relative, resolve, sep } from "node:path";
import { homedir } from "node:os";
import { createHash } from "node:crypto";

const validated = new Map();

function checkPath(base, target) {
    const part = relative(base, target);
    if (isAbsolute(part) || part === ".." || part.startsWith(`..${sep}`)) {
        throw new Error("Managed output must stay inside the selected workspace .faye directory.");
    }
    let current = base;
    for (const segment of ["", ...part.split(sep).filter(Boolean)]) {
        current = segment ? join(current, segment) : current;
        try {
            // Node reports Windows junctions as symbolic links too.
            const info = lstatSync(current);
            if (info.isSymbolicLink() || (info.isFile() && info.nlink > 1)) {
                throw new Error(`Managed storage cannot contain links or junctions: ${current}`);
            }
        } catch (error) {
            if (error.code !== "ENOENT") throw error;
        }
    }
}

function stamp(path) {
    try {
        const info = lstatSync(path, { bigint: true });
        return `${info.mtimeNs}:${info.size}:${info.ino}:${info.mode}`;
    } catch (error) {
        if (error.code === "ENOENT") return null;
        throw error;
    }
}

export function guardManagedOutput(outputPath) {
    const target = resolve(outputPath);
    const parts = target.split(sep).map(part => process.platform === "win32" ? part.toLowerCase() : part);
    if (!parts.includes(".faye")) return target;
    const selected = process.env.FAYE_WORKSPACE_ROOT;
    if (!selected || !isAbsolute(selected)) {
        throw new Error("Set FAYE_WORKSPACE_ROOT to the absolute active project directory for managed output.");
    }
    const root = realpathSync(selected);
    const projectRelative = relative(root, target);
    if (!isAbsolute(projectRelative) && projectRelative !== ".." && !projectRelative.startsWith(`..${sep}`)) {
        const projectParts = projectRelative.split(sep).map(part => process.platform === "win32" ? part.toLowerCase() : part);
        if (!projectParts.includes(".faye")) return target;
    }
    const base = join(root, ".faye");
    checkPath(base, target);
    mkdirSync(base, { recursive: true });
    const ignore = join(base, ".gitignore");
    checkPath(base, ignore);
    try {
        writeFileSync(ignore, "*\n", { flag: "wx" });
    } catch (error) {
        if (error.code !== "EEXIST") throw error;
        // A concurrent exclusive creator can briefly expose an empty file.
        let contents = readFileSync(ignore, "utf8");
        for (let retry = 0; contents === "" && retry < 10; retry += 1) {
            Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10);
            contents = readFileSync(ignore, "utf8");
        }
        if (!/^\*\r?\n?$/.test(contents)) {
            throw new Error("Conflicting .faye/.gitignore; resolve it explicitly.");
        }
    }
    const marker = join(base, "state/workspace.json");
    checkPath(base, marker);
    try {
        const metadata = JSON.parse(readFileSync(marker, "utf8"));
        if (metadata.owner !== "faye-workspace" || metadata.policy_version !== 1) {
            throw new Error("Conflicting workspace metadata; resolve it explicitly.");
        }
    } catch (error) {
        if (error.code !== "ENOENT") throw error;
    }
    const previous = validated.get(root);
    const identity = createHash("sha256").update(JSON.stringify(Object.entries(process.env)
        .filter(([key]) => key.startsWith("GIT_") || ["PATH", "HOME", "USERPROFILE", "XDG_CONFIG_HOME", "FAYE_SESSION_ID"].includes(key))
        .sort())).digest("hex");
    if (previous?.identity === identity && [...previous.watched].every(([path, value]) => stamp(path) === value)) return target;
    const watched = new Set([ignore, join(homedir(), ".gitconfig"), join(homedir(), ".config/git/ignore")]);
    for (let parent = root; ; parent = resolve(parent, "..")) {
        watched.add(join(parent, ".gitignore"));
        watched.add(join(parent, ".git"));
        if (parent === parse(parent).root) break;
    }
    function git(...args) {
        return execFileSync("git", ["-C", root, ...args], {
            encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, LC_ALL: "C" }
        });
    }
    try {
        const [top, gitDir, commonDir] = git("rev-parse", "--show-toplevel", "--absolute-git-dir", "--git-common-dir").trim().split(/\r?\n/);
        for (const folder of [gitDir, resolve(root, commonDir)]) {
            for (const name of ["index", "config", "config.worktree", "info/exclude"]) watched.add(join(folder, name));
        }
        for (const line of git("config", "--show-origin", "--name-only", "--list").split(/\r?\n/)) {
            const origin = line.split("\t")[0];
            if (origin.startsWith("file:")) watched.add(resolve(root, origin.slice(5)));
        }
        try {
            watched.add(resolve(root, git("config", "--path", "--get", "core.excludesFile").trim()));
        } catch (error) {
            if (error.status !== 1) throw error;
        }
        if (git("ls-files", "-z", "--", `:(top,literal)${relative(top, base).split(sep).join("/")}`)) {
            throw new Error("Managed .faye files are tracked; do not automatically untrack them.");
        }
        git("check-ignore", "--no-index", "--", ignore);
    } catch (error) {
        if (error.code !== "ENOENT" && !String(error.stderr).includes("not a git repository")) throw error;
    }
    validated.set(root, { identity, watched: new Map([...watched].map(path => [path, stamp(path)])) });
    return target;
}
