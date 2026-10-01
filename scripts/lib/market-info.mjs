/** Self-contained validation for the public resolved distribution record. */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { readManagedSnapshot } from "./managed-files.mjs";
import { prioritize, validateSkillOrder } from "./skill-order.mjs";
import { validatePresentation } from "./presentation.mjs";
import { validateSetupPolicy, buildSetupGuide, renderSetupFiles } from "./setup-guide.mjs";
import { validateHostingPolicy } from "./hosting-policy.mjs";
export async function readMarketInfo(root, { optional = false } = {}) {
    try { return JSON.parse(await readFile(path.join(root, "market-info/manifest.json"), "utf8")); }
    catch (error) { if (optional && error.code === "ENOENT") return null; throw error; }
}

export async function validateMarketInfo(root, metadata, registry, { snapshot } = {}) {
    const errors = [];
    try { validateHostingPolicy(metadata?.addresses?.hosting, { target: metadata?.target, websiteUrl: metadata?.addresses?.websiteUrl }); } catch (error) { errors.push(error.message); }
    try { validatePresentation(metadata?.presentation); } catch (error) { errors.push(error.message); }
    try {
        validateSetupPolicy(metadata?.setup);
        if (metadata?.setup) {
            const guide = buildSetupGuide(metadata);
            const actual = JSON.parse(await readFile(path.join(root, "market-info/setup.json"), "utf8"));
            if (JSON.stringify(actual) !== JSON.stringify(guide)) errors.push("Resolved setup guide differs from target metadata");
            for (const [name, markdown] of renderSetupFiles(guide)) {
                if (await readFile(path.join(root, name), "utf8") !== markdown) errors.push(`Agent setup guide differs from maintained instructions: ${name}`);
            }
        }
    } catch (error) { errors.push(`Setup guide: ${error.message}`); }
    if (metadata?.schemaVersion !== 1 || !["prod", "release"].includes(metadata.target)) return ["Invalid resolved market-info schema/target"];
    if (metadata.release !== (metadata.target === "prod" ? "staging" : "public")) errors.push("Invalid release label");
    if (metadata.marketplace?.name !== registry.name || metadata.marketplace?.displayName !== registry.interface?.displayName) errors.push("Resolved marketplace identity differs from native registry");
    if (!Array.isArray(metadata.plugins) || !Array.isArray(metadata.listings) || !Array.isArray(registry.plugins)) return ["Invalid resolved repository inventory"];
    const records = metadata.plugins;
    const names = records.map(record => record.id);
    if (new Set(names).size !== names.length || JSON.stringify(names) !== JSON.stringify(registry.plugins.map(entry => entry.name))) errors.push("Resolved package inventory differs from native registry");
    const listings = metadata.listings ?? [];
    if (new Set(listings.map(item => item.id)).size !== listings.length) errors.push("Duplicate listing identities");
    for (const listing of listings) {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(listing.id) || (typeof listing.name !== "string" || !listing.name.trim())) errors.push("Invalid listing identity/name");
        if (!["available", "coming-soon", "hidden"].includes(listing.status)) errors.push(`Invalid status: ${listing.id}`);
        if (listing.include !== names.includes(listing.id)) errors.push(`Listing inclusion mismatch: ${listing.id}`);
        if (listing.status === "available" && !listing.include || listing.status === "coming-soon" && listing.include) errors.push(`Invalid inclusion/status: ${listing.id}`);
    }
    for (const listing of listings) {
        try { validateSkillOrder(listing.skillOrder); } catch (error) { errors.push(error.message); }
        if (!listing.include && listing.skillOrder !== undefined) errors.push(`Excluded listing exposes skill order: ${listing.id}`);
    }
    for (const record of records) {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(record.id)) { errors.push("Unsafe package ID"); continue; }
        const manifest = JSON.parse(await readFile(path.join(root, `plugins/${record.id}/.codex-plugin/plugin.json`), "utf8"));
        if (record.id !== manifest.name || record.version !== manifest.version || record.release !== metadata.release) errors.push(`Version/channel mismatch: ${record.id}`);
        if (!listings.some(listing => listing.id === record.id && listing.include)) errors.push(`Missing package listing record: ${record.id}`);
        const skills = (await readdir(path.join(root, `plugins/${record.id}/skills`), { withFileTypes: true })).filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
        const order = listings.find(listing => listing.id === record.id)?.skillOrder;
        try {
            validateSkillOrder(order, skills, `${record.id}.skillOrder`);
            if (JSON.stringify(record.skills) !== JSON.stringify(prioritize(skills, order))) errors.push(`Resolved skill inventory/order differs from package: ${record.id}`);
        } catch (error) { errors.push(error.message); }
    }
    try { if (!snapshot) await readManagedSnapshot(root); }
    catch (error) { errors.push(error.message); }
    return errors;
}
