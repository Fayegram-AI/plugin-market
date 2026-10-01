/** Resolve setup facts from one distribution; human and agent renderers share this contract. */
import { buildSetupGuide as buildV1, renderSetupMarkdown as renderV1 } from "./setup-v1.mjs";
import { validateSetupPolicy, identity } from "./setup-policy.mjs";
import { command, validateRepositoryUrl } from "./setup-commands.mjs";
import { buildFlow } from "./setup-flows.mjs";
import { renderAgentIndex, renderAgentFlow } from "./setup-markdown.mjs";
export { validateSetupPolicy } from "./setup-policy.mjs";

export function buildSetupGuide(metadata) {
    validateSetupPolicy(metadata.setup);
    if (!metadata.setup) return undefined;
    if (metadata.setup.schemaVersion === 1) return buildV1(metadata);
    if (!identity(metadata.marketplace.name)) throw new Error("Unsafe setup marketplace identity");
    const repositoryUrl = validateRepositoryUrl(metadata.addresses.repositoryUrl);
    const plugins = metadata.plugins.filter(plugin => metadata.listings.some(listing => listing.id === plugin.id && listing.status === "available"))
        .map(plugin => {
            if (!identity(plugin.id) || (plugin.skills ?? []).some(skill => !identity(skill))) throw new Error("Unsafe setup plugin identity");
            const listing = metadata.listings.find(item => item.id === plugin.id);
            return { id: plugin.id, name: plugin.name, version: plugin.version, summary: listing.summary ?? plugin.summary ?? `Skills provided by ${plugin.name}.`, skills: plugin.skills ?? [] };
        });
    const products = metadata.setup.products.map(product => ({ id: product.id, label: product.label, summary: product.summary, documentationUrl: product.documentationUrl, interfaces: product.interfaces.map(surface => ({ id: surface.id, label: surface.label, summary: surface.summary })) }));
    const flows = metadata.setup.products.flatMap(product => product.interfaces.flatMap(surface => surface.methods
        .filter(method => method.id !== "git" || repositoryUrl)
        .map(method => buildFlow(product, surface, method, metadata.marketplace.name, plugins, repositoryUrl))));
    const legacyRoutes = {};
    for (const product of products) {
        legacyRoutes[product.id] = `/setup/${product.id}/`;
        for (const method of ["git", "local"]) {
            const flow = flows.find(item => item.product === product.id && item.interface === "terminal" && item.method === method);
            if (flow) legacyRoutes[`${product.id}-${method}`] = flow.href;
        }
    }
    return {
        schemaVersion: 2, title: metadata.setup.title, summary: metadata.setup.summary,
        target: metadata.target, release: metadata.release, marketplace: { ...metadata.marketplace }, repositoryUrl,
        plugins, products, flows, agentRules: metadata.setup.agentRules,
        troubleshooting: metadata.setup.troubleshooting.map(item => ({ ...item, commands: item.id === "grok-discovery" ? [command("discovery", "Inspect skill discovery", ["grok", "inspect", "--json"])] : [] })),
        legacyRoutes
    };
}

export function renderSetupMarkdown(guide) {
    if (!guide) return undefined;
    return guide.schemaVersion === 1 ? renderV1(guide) : renderAgentIndex(guide);
}

/** Additional managed agent documents use derived safe paths, never authored filenames. */
export function renderSetupFiles(guide) {
    if (!guide) return new Map();
    const files = new Map([["market-info/SETUP.md", renderSetupMarkdown(guide)]]);
    if (guide.schemaVersion === 2) for (const flow of guide.flows) files.set(flow.agentPath, renderAgentFlow(guide, flow));
    return files;
}
