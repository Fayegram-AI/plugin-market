/** Shared setup contract and deterministic human/agent instructions. Never executes commands. */
const methods = ["codex-cli", "grok-cli", "antigravity-cli"];
const statuses = ["tested", "documented", "pending"];
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const isIdentity = value => typeof value === "string" && slug.test(value);

function object(value, allowed, label) {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Invalid ${label}`);
    for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new Error(`Unknown ${label}.${key}`);
}
function text(value, label) {
    if (typeof value !== "string" || !value.trim() || /[\u0000-\u0008\u000b-\u001f]/u.test(value)) throw new Error(`Invalid ${label}`);
}
function texts(value, label) {
    if (!Array.isArray(value) || value.length === 0) throw new Error(`Missing ${label}`);
    value.forEach(item => text(item, label));
}

export function validateSetupPolicy(value) {
    if (value === undefined) return; // Older distribution metadata remains readable.
    object(value, ["schemaVersion", "title", "summary", "prerequisites", "agentRules", "troubleshooting", "platforms"], "setup");
    if (value.schemaVersion !== 1) throw new Error("Unsupported setup schema");
    for (const field of ["title", "summary"]) text(value[field], `setup.${field}`);
    for (const field of ["prerequisites", "agentRules", "troubleshooting"]) texts(value[field], `setup.${field}`);
    if (!Array.isArray(value.platforms) || !value.platforms.length) throw new Error("Missing setup platforms");
    const seen = new Set();
    for (const platform of value.platforms) {
        object(platform, ["id", "label", "method", "documentationUrl", "requirements", "notes", "verification"], "setup platform");
        if (!isIdentity(platform.id) || seen.has(platform.id) || !methods.includes(platform.method)) throw new Error("Invalid/duplicate setup platform");
        seen.add(platform.id);
        text(platform.label, "platform label");
        const url = new URL(platform.documentationUrl);
        if (url.protocol !== "https:" || url.username || url.password) throw new Error("Unsafe setup documentation URL");
        for (const field of ["requirements", "notes"]) texts(platform[field], field);
        const evidence = platform.verification;
        object(evidence, ["date", "hostVersion", "installation", "activation", "scope"], "setup verification");
        if (typeof evidence.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/u.test(evidence.date)
            || !Number.isFinite(Date.parse(evidence.date)) || new Date(evidence.date).toISOString().slice(0, 10) !== evidence.date) throw new Error("Invalid setup verification date");
        for (const field of ["hostVersion", "scope"]) text(evidence[field], field);
        for (const field of ["installation", "activation"]) if (!statuses.includes(evidence[field])) throw new Error(`Invalid setup ${field} status`);
        if (evidence.activation === "tested" && evidence.installation !== "tested") throw new Error("Tested activation requires tested installation");
    }
}

const command = (label, value) => ({ label, text: value, language: "powershell" });
const step = (title, paragraphs, commands = []) => ({ title, paragraphs, commands });

/** Commands use validated native identifiers and repository-relative paths, never local maintainer paths. */
export function buildSetupGuide(metadata) {
    validateSetupPolicy(metadata.setup);
    if (!metadata.setup) return undefined;
    const name = metadata.marketplace.name;
    if (!isIdentity(name)) throw new Error("Unsafe setup marketplace identity");
    const plugins = metadata.plugins.filter(plugin => metadata.listings.some(listing => listing.id === plugin.id && listing.status === "available"));
    for (const plugin of plugins) if (!isIdentity(plugin.id)) throw new Error("Unsafe setup plugin identity");
    return {
        schemaVersion: 1,
        ...metadata.setup,
        target: metadata.target,
        release: metadata.release,
        marketplace: { ...metadata.marketplace },
        repositoryUrl: metadata.addresses.repositoryUrl,
        repositoryNote: metadata.addresses.repositoryUrl
            ? "Clone the configured repository with Git, then open a terminal at the checkout root. The commands below run from that directory."
            : "This build uses a local marketplace checkout. Open a terminal at its root, where the plugins folder is located. A public repository address has not been configured.",
        plugins: plugins.map(({ id, name: title, version }) => ({ id, name: title, version })),
        platforms: metadata.setup.platforms.map(platform => ({
            ...platform,
            steps: platformSteps(platform.method, name, plugins)
        }))
    };
}

function platformSteps(method, marketplace, plugins) {
    if (method === "codex-cli") return [
        step("Check your existing setup", ["Check the installed CLI and its marketplace sources. If this checkout is already registered, reuse that registration."], [
            command("Codex version", "codex --version"),
            command("Configured Codex marketplaces", "codex plugin marketplace list --json")
        ]),
        step("Add this marketplace", ["Run this only if the checkout is not already registered. Adding a marketplace does not install its plugins."], [command("Register with Codex", "codex plugin marketplace add . --json")]),
        step("Choose your plugins", ["Install only the plugins you want. These commands use the identity declared by this marketplace."], plugins.map(plugin => command(`Install ${plugin.name} with Codex`, `codex plugin add ${plugin.id}@${marketplace} --json`))),
        step("Verify and start a new session", ["Confirm the selected plugins are installed and enabled, then start a new Codex session so their skills can be discovered. Open a skill guide for its requirements and usage examples."], [command("Verify Codex plugins", `codex plugin list --marketplace ${marketplace} --available --json`)])
    ];
    if (method === "grok-cli") return [
        step("Check your existing setup", ["Check the installed CLI and the source paths already configured. Grok reports an error when the same marketplace is added again; reuse the existing source."], [command("Grok version", "grok --version"), command("Configured Grok marketplaces", "grok plugin marketplace list")]),
        step("Add this marketplace", ["Run from the checkout root only if this source is not already registered. Grok may label a local source using its folder name."], [command("Register with Grok", "grok plugin marketplace add .")]),
        step("Choose and trust your plugins", ["Review each package before installing. The trust flag explicitly trusts that package in Grok. Relative paths select this checkout even when another marketplace offers the same plugin name."], plugins.map(plugin => command(`Install ${plugin.name} with Grok`, `grok plugin install ./plugins/${plugin.id} --trust`))),
        step("Verify and start a new session", ["Check the selected plugins and the skills Grok discovers. Start a new session, or reload the Plugins panel, to use newly installed skills."], [command("Verify Grok plugins", "grok plugin list --json"), command("Inspect Grok discovery", "grok inspect --json")])
    ];
    return [
        step("Check the Antigravity CLI", ["These instructions apply to the CLI. Desktop and IDE registrations use separate discovery paths and do not prove a CLI import."], [command("Antigravity CLI version", "agy --version"), command("Imported CLI plugins", "agy plugin list")]),
        step("Choose your plugins", ["Validate and install only the packages you want from this checkout. Installation stages plugin files in the Antigravity CLI profile. Inspect existing imports before replacing a package."], plugins.flatMap(plugin => [command(`Validate ${plugin.name} with Antigravity`, `agy plugin validate ./plugins/${plugin.id}`), command(`Install ${plugin.name} with Antigravity`, `agy plugin install ./plugins/${plugin.id}`)])),
        step("Verify and start a new session", ["Confirm the plugin appears in the CLI list, then start a new CLI session and inspect its skills. Use the native host's skill discovery rather than assuming another platform's invocation syntax."], [command("Verify Antigravity CLI plugins", "agy plugin list")])
    ];
}

/** The agent-readable artifact has the same steps and commands as the human page. */
export function renderSetupMarkdown(guide) {
    if (!guide) return undefined;
    const lines = [`# ${guide.title}`, "", guide.summary, "", `Marketplace: ${guide.marketplace.name}. Channel: ${guide.release}.`, "", "## Before you begin", "", ...guide.prerequisites.map(value => `- ${value}`), "", guide.repositoryNote, ""];
    if (guide.repositoryUrl) lines.push(`Repository: ${guide.repositoryUrl}`, "");
    const packages = guide.plugins.length ? guide.plugins.map(plugin => `- ${plugin.name}: \`${plugin.id}\`, version \`${plugin.version}\`.`) : ["No plugins are currently available to install from this marketplace."];
    lines.push("## Instructions for an assisting agent", "", ...guide.agentRules.map(value => `- ${value}`), "", "## Available packages", "", ...packages, "");
    for (const platform of guide.platforms) {
        const evidence = platform.verification;
        lines.push(`## ${platform.label}`, "", `Installation: ${evidence.installation}. Skill check: ${evidence.activation}. Checked ${evidence.date} with ${evidence.hostVersion}.`, "", evidence.scope, "", `Documentation: ${platform.documentationUrl}`, "", ...platform.requirements.map(value => `- ${value}`), "");
        for (const [index, current] of platform.steps.entries()) {
            lines.push(`### ${index + 1}. ${current.title}`, "", ...current.paragraphs.flatMap(value => [value, ""]));
            for (const example of current.commands) lines.push(example.label, "", `\`\`\`${example.language}`, example.text, "```", "");
        }
        lines.push(...platform.notes.map(value => `- ${value}`), "");
    }
    lines.push("## If setup is incomplete", "", ...guide.troubleshooting.map(value => `- ${value}`), "");
    return lines.join("\n");
}
