/** Compatibility reader/generator for previously promoted setup schema 1. */
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
const quote = value => `'${value.replaceAll("'", "''")}'`;

/** Git sources are configured addresses, quoted as one shell argument rather than executable prose. */
function repositorySource(value) {
    if (value === null || value === undefined) return null;
    text(value, "setup repository URL");
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash
        || /[\r\n]/u.test(value)) throw new Error("Unsafe setup repository URL");
    return value;
}

/** Commands use validated native identifiers and repository-relative paths, never local maintainer paths. */
export function buildSetupGuide(metadata) {
    validateSetupPolicy(metadata.setup);
    if (!metadata.setup) return undefined;
    const name = metadata.marketplace.name;
    if (!isIdentity(name)) throw new Error("Unsafe setup marketplace identity");
    const plugins = metadata.plugins.filter(plugin => metadata.listings.some(listing => listing.id === plugin.id && listing.status === "available"));
    for (const plugin of plugins) if (!isIdentity(plugin.id)) throw new Error("Unsafe setup plugin identity");
    const repository = repositorySource(metadata.addresses.repositoryUrl);
    return {
        schemaVersion: 1,
        ...metadata.setup,
        target: metadata.target,
        release: metadata.release,
        marketplace: { ...metadata.marketplace },
        repositoryUrl: repository,
        repositoryNote: repository
            ? "Codex and Grok can register this Git repository directly or use a local checkout. Choose one source method for each host; Git registration does not require a manual clone. The local method and Antigravity instructions run from a checkout's root."
            : "This build uses a local marketplace checkout. Git registration is shown only when a repository address is configured. Open a terminal at the checkout root, where the plugins folder is located.",
        plugins: plugins.map(({ id, name: title, version }) => ({ id, name: title, version })),
        platforms: metadata.setup.platforms.map(platform => ({ ...platform, ...platformInstructions(platform.method, name, plugins, repository) }))
    };
}

function platformInstructions(method, marketplace, plugins, repository) {
    if (method === "codex-cli") return {
        steps: [step("Check your existing setup", ["Check the installed CLI and its marketplace sources. Reuse a matching registration. Choose one of the source methods listed below; adding a marketplace does not install its plugins."], [
            command("Codex version", "codex --version"),
            command("Configured Codex marketplaces", "codex plugin marketplace list --json")
        ])],
        routes: sourceRoutes(repository).map(source => ({
            ...source,
            steps: [
                registrationStep("Codex", source, repository, " --json"),
                step("Choose your plugins", ["Install only the plugins you want. The selector uses the identity declared by the marketplace, for either source method."], plugins.map(plugin => command(`Install ${plugin.name} with Codex (${source.id})`, `codex plugin add ${plugin.id}@${marketplace} --json`))),
                step("Verify and start a new session", ["Confirm the selected plugins are installed and enabled, then start a new Codex session so their skills can be discovered. Open a skill guide for its requirements and usage examples."], [command(`Verify Codex plugins (${source.id})`, `codex plugin list --marketplace ${marketplace} --available --json`)])
            ]
        }))
    };
    if (method === "grok-cli") return {
        steps: [step("Check your existing setup", ["Check the installed CLI and the sources already configured. Reuse a matching registration and choose one of the source methods listed below. Adding a marketplace makes its catalog available; it does not install every package."], [command("Grok version", "grok --version"), command("Configured Grok marketplaces", "grok plugin marketplace list")])],
        routes: sourceRoutes(repository).map(source => ({
            ...source,
            steps: [
                registrationStep("Grok", source, repository),
                step("Choose and trust your plugins", [
                    "Open /plugins in Grok's terminal interface, switch to the Marketplace tab, and choose the registered source. Select the packages you want and review the host's trust decision.",
                    source.id === "git"
                        ? "CLI alternative: the commands below install individual packages directly from this Git repository's subdirectories. They do not require marketplace registration; use them instead of installing the same packages through the Marketplace tab."
                        : "CLI alternative: the commands below install individual packages directly from this checkout. They do not require marketplace registration; use them instead of installing the same packages through the Marketplace tab.",
                    "The --trust flag explicitly trusts the selected package. Run these commands only after reviewing that package."
                ], plugins.map(plugin => command(`Install ${plugin.name} with Grok (${source.id})`, `grok plugin install ${source.id === "git" ? quote(`${repository}#plugins/${plugin.id}`) : `./plugins/${plugin.id}`} --trust`))),
                step("Verify and start a new session", ["Check the selected plugins and the skills Grok discovers. Start a new session, or reload the Plugins panel, to use newly installed skills."], [command(`Verify Grok plugins (${source.id})`, "grok plugin list --json"), command(`Inspect Grok discovery (${source.id})`, "grok inspect --json")])
            ]
        }))
    };
    return { steps: [
        step("Check the Antigravity CLI", ["These instructions apply to the CLI. Desktop and IDE registrations use separate discovery paths and do not prove a CLI import."], [command("Antigravity CLI version", "agy --version"), command("Imported CLI plugins", "agy plugin list")]),
        step("Choose your plugins", ["Validate and install only the packages you want from this checkout. Installation stages plugin files in the Antigravity CLI profile. Inspect existing imports before replacing a package."], plugins.flatMap(plugin => [command(`Validate ${plugin.name} with Antigravity`, `agy plugin validate ./plugins/${plugin.id}`), command(`Install ${plugin.name} with Antigravity`, `agy plugin install ./plugins/${plugin.id}`)])),
        step("Verify and start a new session", ["Confirm the plugin appears in the CLI list, then start a new CLI session and inspect its skills. Use the native host's skill discovery rather than assuming another platform's invocation syntax."], [command("Verify Antigravity CLI plugins", "agy plugin list")])
    ] };
}

function sourceRoutes(repository) {
    return [
        ...(repository ? [{ id: "git", label: "Git marketplace", summary: "Use the configured repository URL directly. The host manages fetching it; no manual checkout is needed. Repository access uses your existing Git authentication when required." }] : []),
        { id: "local", label: "Local marketplace", summary: "Use an existing checkout on this computer. Open a terminal at its root before running the local commands." }
    ];
}

function registrationStep(host, source, repository, suffix = "") {
    const local = source.id === "local";
    return step("Add this marketplace", [
        local
            ? `Use your existing checkout${repository ? ", or clone the repository linked above if you need one" : ""}. Run the registration command at the checkout root only if that source is not already registered.`
            : "Run the registration command from any directory, using the configured Git URL. Skip it if the same source is already registered.",
        ...(local && host === "Grok" ? ["Grok may label a local source using its folder name. Confirm the source path when browsing the catalog."] : [])
    ], [command(`Register ${source.label.toLowerCase()} with ${host}`, `${host.toLowerCase()} plugin marketplace add ${local ? "." : quote(repository)}${suffix}`)]);
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
        for (const route of platform.routes ?? []) {
            lines.push(`### ${route.label}`, "", route.summary, "");
            for (const [index, current] of route.steps.entries()) {
                lines.push(`#### ${index + 1}. ${current.title}`, "", ...current.paragraphs.flatMap(value => [value, ""]));
                for (const example of current.commands) lines.push(example.label, "", `\`\`\`${example.language}`, example.text, "```", "");
            }
        }
        lines.push(...platform.notes.map(value => `- ${value}`), "");
    }
    lines.push("## If setup is incomplete", "", ...guide.troubleshooting.map(value => `- ${value}`), "");
    return lines.join("\n");
}
