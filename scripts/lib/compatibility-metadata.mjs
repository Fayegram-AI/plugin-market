// Validate the existing compatibility formats against the canonical Codex metadata.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { readMarketInfo } from "./market-info.mjs";

export async function validateCompatibilityMetadata(root) {
    const errors = [];
    const resolved = await readMarketInfo(root, { optional: true });
    async function read(relative) {
        try {
            const value = JSON.parse(await readFile(path.join(root, relative), "utf8"));
            if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("expected object");
            return value;
        } catch {
            errors.push(`${relative} must contain a readable JSON object.`);
            return null;
        }
    }
    function equal(label, actual, expected) {
        if (actual !== expected || expected === undefined) errors.push(`${label} must match canonical metadata (${expected}).`);
    }
    const canonical = await read(".agents/plugins/marketplace.json");
    const market = await read(".grok-plugin/marketplace.json");
    if (!canonical || !market) return errors;
    equal("Grok marketplace name", market.name, canonical.name);
    if (!Array.isArray(canonical.plugins) || !Array.isArray(market.plugins)) {
        errors.push("Both marketplace registries must contain plugins arrays.");
        return errors;
    }
    const names = canonical.plugins.map(entry => entry?.name);
    const grokNames = market.plugins.map(entry => entry?.name);
    if (new Set(grokNames).size !== grokNames.length
        || JSON.stringify([...grokNames].sort()) !== JSON.stringify([...names].sort())) {
        errors.push("Grok registry must cover each Codex plugin exactly once.");
    }
    for (const name of names) {
        // Never resolve an unvalidated registry name into a filesystem path.
        if (typeof name !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(name)) {
            errors.push("Canonical plugin names must be safe lowercase path segments.");
            continue;
        }
        const prefix = `plugins/${name}`;
        const manifest = await read(`${prefix}/.codex-plugin/plugin.json`);
        const grok = await read(`${prefix}/.grok-plugin/plugin.json`);
        const compatibility = await read(`${prefix}/plugin.json`);
        if (!manifest) continue;
        for (const [label, value] of [[`${prefix}/.grok-plugin/plugin.json`, grok], [`${prefix}/plugin.json`, compatibility]]) {
            if (!value) continue;
            for (const field of ["name", "version", "description"]) equal(`${label} ${field}`, value[field], manifest[field]);
            for (const field of ["name", "url"]) equal(`${label} author.${field}`, value.author?.[field], manifest.author?.[field]);
        }
        if (grok) equal(`${prefix} Grok homepage`, grok.homepage, manifest.homepage);
        if (compatibility) equal(`${prefix} compatibility license`, compatibility.license, manifest.license);
        const entry = market.plugins.find(value => value?.name === name);
        if (entry) {
            for (const field of ["version", "description", "homepage"]) equal(`Grok registry ${name} ${field}`, entry[field], manifest[field]);
            equal(`Grok registry ${name} author`, entry.author?.name, manifest.author?.name);
            equal(`Grok registry ${name} source.type`, entry.source?.type, "local");
            equal(`Grok registry ${name} source.path`, entry.source?.path, `./plugins/${name}`);
            equal(`Grok registry ${name} category`, entry.category, "productivity");
        }
        if (!resolved) {
            equal("Grok marketplace owner.name", market.owner?.name, manifest.author?.name);
            equal("Grok marketplace owner.url", market.owner?.url, manifest.author?.url);
        }
    }
    if (resolved) {
        equal("Grok marketplace owner.name", market.owner?.name, resolved.publisher.name);
        equal("Grok marketplace owner.url", market.owner?.url ?? null, resolved.publisher.url);
    }
    return errors;
}
