/** Product-specific instructions. Only confirmed terminal procedures produce commands. */
import { command, interactive, step } from "./setup-commands.mjs";
import { preparationChoices, folderStep } from "./setup-preparation.mjs";

export function buildFlow(product, surface, method, marketplace, plugins, repository) {
    const id = `${product.id}-${surface.id}-${method.id}`;
    const suffix = `${product.id}/${surface.id}/${method.id}`;
    const flow = {
        id, product: product.id, interface: surface.id, method: method.id,
        href: `/setup/${suffix}/`, agentPath: `market-info/setup/${suffix}.md`,
        title: `${product.label}: ${surface.label.toLowerCase()} setup`,
        summary: method.summary, status: method.status,
        prerequisites: [...product.requirements, ...(surface.id === "terminal" ? ["Use PowerShell on Windows or Bash/zsh on macOS/Linux. Interactive slash commands are entered inside the application."] : [])],
        steps: [], packages: [],
        start: step("start", "Start using your skills", [], ""),
        management: [], alternatives: [], verification: method.verification,
        captures: method.captures
    };
    if (method.status === "needs-input") {
        flow.start = step("await-procedure", "Procedure awaiting confirmation", ["Use a confirmed terminal guide while the app-specific instructions are prepared. The requests below describe exactly what is missing."], "This route becomes actionable after the missing procedure is confirmed.");
        return flow;
    }
    const app = product.id === "antigravity" ? "agy" : product.id;
    const local = method.id === "local";
    if (local) {
        flow.preparationChoices = preparationChoices(repository);
        flow.steps.push(folderStep());
    } else flow.prerequisites.push("Git and access to the configured repository are required. Registration can run from any directory; it fetches the source for you.");

    if (app !== "agy") {
        const args = [app, "plugin", "marketplace", "add", local ? "." : repository];
        flow.steps.push(step("register", "Add Faye Plugin Market", ["Run this once for the selected source. If the same source is already registered, reuse it. Adding a marketplace makes its plugins available to choose; it does not install them all."], `The source is registered. Its native marketplace identity is ${marketplace}.${app === "grok" && local ? " Grok may display the local folder name; match its source path when choosing the catalog." : ""}`, [command("register", "Add marketplace", args, app === "codex" ? [...args, "--json"] : args)]));
    }
    if (app === "grok") {
        flow.steps.push(step("catalog", "Open Grok's plugin catalog", ["Start Grok in your terminal, enter /plugins, and select the Marketplace tab. Choose the source you just registered. The slash command below belongs inside Grok, not your operating-system terminal."], "The Faye packages in this guide appear in the selected catalog.", [command("launch", "Start Grok", ["grok"]), interactive("catalog", "Inside Grok", "/plugins")]));
    }
    flow.packages = plugins.map(plugin => {
        const args = app === "codex" ? [app, "plugin", "add", `${plugin.id}@${marketplace}`] : [app, "plugin", "install", `./plugins/${plugin.id}`];
        return {
            pluginId: plugin.id,
            paragraphs: app === "grok" ? [`Choose ${plugin.name} in the selected Marketplace tab and install it. Review Grok's trust prompt before accepting.`] : [`Install ${plugin.name} only if you want its skills. Review any permission or trust prompts shown by the application.`],
            commands: app === "grok" ? [] : [command(`install-${plugin.id}`, `Install ${plugin.name}`, args, app === "codex" ? [...args, "--json"] : args)],
            expected: `${plugin.name} appears in the installed plugin list. Compare its version with ${plugin.version} shown by this marketplace.`
        };
    });
    const listArgs = [app, "plugin", "list", ...(app === "codex" ? ["--marketplace", marketplace] : [])];
    flow.start = step("start", "Confirm installation and start a new session", [
        "Check the plugins you selected are installed and enabled where the application exposes that state. The list command below is a quick confirmation, not a test of every skill.",
        `Start a new ${product.label} session, open its skill picker or Plugins interface, and choose a task from the installed plugin's skill guides. Read that skill's inputs and requirements before sending your request.`,
        product.id === "codex" ? "Codex skill requests may use $skill-name. Copy the example from the selected skill's guide, including any explicit invocation it requires." : "Use the product's native skill picker or slash-command guidance. Read the selected skill's guide rather than translating another application's example yourself."
    ], "Your selected plugins are installed and their applicable skills can be found or explicitly invoked in a fresh session.", [command("installed", "List installed plugins", listArgs, app === "agy" ? listArgs : [...listArgs, "--json"])]);

    if (app === "grok") {
        for (const plugin of plugins) flow.alternatives.push(step(`direct-${plugin.id}`, `Direct CLI installation: ${plugin.name}`, ["Optional alternative to installing through the Marketplace tab. This installs one plugin directly and does not require marketplace registration. Do not use both routes for the same installation.", "Review the interactive trust prompt. Automatic trust is not enabled by this example."], `${plugin.name} appears in the installed list.`, [command(`direct-${plugin.id}`, "Install directly", [app, "plugin", "install", local ? `./plugins/${plugin.id}` : `${repository}#plugins/${plugin.id}`])]));
    }
    flow.alternatives.push(step("existing", "Check an existing installation", ["Use this before adding a second source or when setup reports that the plugin already exists. Compare the names and source locations; reuse a matching installation."], "The intended source and installed package are identified without removing other registrations.", [command("existing-plugins", "Installed plugins", listArgs, app === "agy" ? listArgs : [...listArgs, "--json"]), ...(app !== "agy" ? [command("existing-markets", "Registered marketplaces", [app, "plugin", "marketplace", "list"], [app, "plugin", "marketplace", "list", ...(app === "codex" ? ["--json"] : [])])] : [])]));
    flow.management = management(app, marketplace, plugins, local);
    return flow;
}

function management(app, marketplace, plugins, local) {
    const result = [];
    if (local) result.push(step("update-copy", "Update a local copy later", ["Updating the source is separate from installing a plugin. git pull updates an existing Git checkout; it does not create one and cannot update an extracted archive.", "Before updating a checkout, check its branch and local changes. For an archive, obtain a newer copy separately and compare versions. Do not overwrite the existing folder or change an installed plugin without deciding to update it."], "You have identified the source and version you intend to use before making an update."));
    if (app === "codex" && !local) result.push(step("refresh", "Refresh the Git marketplace", ["Refresh the source when you want to check for new package versions. Compare installed versions afterward; refreshing the catalog alone is not evidence that each installed plugin was updated."], "The marketplace refresh succeeds; inspect the desired plugin's current and available version before changing its installation.", [command("refresh", "Refresh marketplace", [app, "plugin", "marketplace", "upgrade", marketplace])]));
    if (app === "codex") result.push(step("toggle", "Enable or disable a plugin", ["Open /plugins inside Codex. Select an installed plugin and use the displayed enable/disable action. Disabling keeps the installation but makes its capabilities unavailable until enabled again."], "The plugin browser shows the intended enabled state.", [interactive("plugins", "Inside Codex", "/plugins")]));
    if (app === "grok") for (const plugin of plugins) result.push(step(`manage-${plugin.id}`, `Update or toggle ${plugin.name}`, ["Choose only the operation you intend to perform. Check the installed source and version before updating. Disabling keeps the plugin installed; enabling makes its capabilities available again. Start a fresh session after changing its state."], "The installed plugin list shows the intended version and enabled state.", [
        command(`update-${plugin.id}`, "Update selected plugin", [app, "plugin", "update", plugin.id]),
        command(`disable-${plugin.id}`, "Disable selected plugin", [app, "plugin", "disable", plugin.id]),
        command(`enable-${plugin.id}`, "Enable selected plugin", [app, "plugin", "enable", plugin.id])
    ]));
    if (app === "agy") result.push(step("manage", "Manage an installed plugin", ["Open /plugins in an Antigravity CLI session and use the Installed tab to inspect or toggle a plugin. For a newer local copy, compare versions and use the documented installation procedure for that package after deciding to replace it."], "The Installed tab reflects the intended plugin and enabled state.", [interactive("plugins", "Inside Antigravity", "/plugins")]));
    for (const plugin of plugins) result.push(step(`remove-${plugin.id}`, `Uninstall ${plugin.name}`, ["Only use this when you intend to remove this plugin. It removes the selected installation and its capabilities; it is not a troubleshooting prerequisite. Leave other plugins and marketplace sources intact."], `${plugin.name} is no longer listed as installed.`, [command(`remove-${plugin.id}`, "Uninstall selected plugin", [app, "plugin", app === "codex" ? "remove" : "uninstall", app === "codex" ? `${plugin.id}@${marketplace}` : plugin.id])]));
    return result;
}
