/** Validate every public repository file; Git cleanliness is intentionally irrelevant. */
import { createHash } from "node:crypto";
import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { assertDistributionPath, validateRepositoryArtifacts } from "./distribution-safety.mjs";

export const hashBytes = bytes => createHash("sha256").update(bytes).digest("hex");
const inventoryPath = "market-info/managed.json";
const object = value => value !== null && typeof value === "object" && !Array.isArray(value);

export async function readDistributionFile(root, name) {
    assertDistributionPath(name);
    let current = root;
    if ((await lstat(root)).isSymbolicLink()) throw new Error("Linked repository root");
    for (const part of name.split("/")) {
        current = path.join(current, part);
        if ((await lstat(current)).isSymbolicLink()) throw new Error(`Linked managed file: ${name}`);
    }
    return readFile(current);
}

/** Include the inventory itself in the fingerprint, without requiring a self-hash. */
export async function readManagedSnapshot(root) {
    const violations = await validateRepositoryArtifacts(root);
    if (violations.length) throw new Error(violations.join("\n"));
    const inventoryBytes = await readDistributionFile(root, inventoryPath);
    const inventory = JSON.parse(inventoryBytes);
    if (!object(inventory) || inventory.schemaVersion !== 1 || !object(inventory.files)) throw new Error("Invalid managed file inventory");
    const hashes = new Map(), aliases = new Set();
    for (const [name, expected] of Object.entries(inventory.files)) {
        assertDistributionPath(name);
        if (name.toLowerCase() === inventoryPath || aliases.has(name.toLowerCase()) || typeof expected !== "string" || !/^[a-f0-9]{64}$/u.test(expected)) throw new Error(`Invalid/aliased managed inventory entry: ${name}`);
        aliases.add(name.toLowerCase());
        hashes.set(name, expected);
    }
    const actual = new Set(), errors = [];
    async function visit(directory, prefix = "") {
        for (const entry of await readdir(directory, { withFileTypes: true })) {
            if (!prefix && entry.name === ".git") continue;
            const name = `${prefix}${entry.name}`;
            assertDistributionPath(name);
            if (entry.isSymbolicLink()) throw new Error(`Linked repository entry: ${name}`);
            if (entry.isDirectory()) await visit(path.join(directory, entry.name), `${name}/`);
            else if (entry.isFile()) {
                if (name !== inventoryPath && !hashes.has(name)) errors.push(`Uninventoried repository file: ${name}`);
                actual.add(name);
            } else throw new Error(`Unsupported repository entry: ${name}`);
        }
    }
    await visit(root);
    for (const [name, expected] of hashes) {
        if (!actual.has(name)) errors.push(`Missing managed file: ${name}`);
        else if (hashBytes(await readDistributionFile(root, name)) !== expected) errors.push(`Managed file hash mismatch: ${name}`);
    }
    if (errors.length) throw new Error(errors.join("\n"));
    hashes.set(inventoryPath, hashBytes(inventoryBytes));
    const entries = [...hashes].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
    return { root: path.resolve(root), hashes, fingerprint: hashBytes(JSON.stringify(entries)) };
}
