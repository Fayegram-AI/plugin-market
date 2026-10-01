/** Focused LLM procedures, not a duplicate of the website's visual presentation. */
function blocks(commands) {
    return commands.flatMap(command => {
        const variants = command.agentVariants ?? command.variants;
        if (command.kind !== "terminal") return [`${command.label} — enter inside the application:`, "", "```text", variants.powershell, "```", ""];
        if (variants.powershell === variants.bash) return [`${command.label} — PowerShell or Bash/zsh:`, "", "```text", variants.powershell, "```", ""];
        return [command.label, "", "PowerShell:", "", "```powershell", variants.powershell, "```", "", "Bash/zsh:", "", "```bash", variants.bash, "```", ""];
    });
}
function renderStep(value, level = "###") {
    return [`${level} ${value.title}`, "", ...value.paragraphs.flatMap(text => [text, ""]), ...blocks(value.commands), `Expected: ${value.expected}`, ""];
}
const methodLabel = method => method === "git" ? "Git repository" : "Local copy";
export function renderAgentIndex(guide) {
    const lines = [`# ${guide.title}: agent instructions`, "", guide.summary, "", `Marketplace: \`${guide.marketplace.name}\`. Target: \`${guide.target}\`. Channel: \`${guide.release}\`.`, "", "Read [setup.json](setup.json) and [manifest.json](manifest.json) from this same checkout. Their identities, versions, inclusion and source addresses are authoritative.", "", ...(guide.repositoryUrl ? [`Repository: ${guide.repositoryUrl}`, ""] : ["This target has no configured Git repository. Use its Local copy procedures.", ""]), "## Available plugins", "", ...guide.plugins.map(plugin => `- **${plugin.name}**: \`${plugin.id}\`, version \`${plugin.version}\`. Skills: ${plugin.skills.map(skill => `\`${skill}\``).join(", ") || "see package instructions"}.`), ...(guide.plugins.length ? [] : ["No plugins are currently available to install."]), "", "## Operating rules", "", ...guide.agentRules.map(rule => `- ${rule}`), "", "## Select one procedure", "", "Choose only the requested product, interface, source method, and plugins. A needs-input procedure is a request for clarification, not permission to invent installation steps.", ""];
    for (const product of guide.products) {
        lines.push(`## ${product.label}`, "");
        for (const flow of guide.flows.filter(item => item.product === product.id)) lines.push(`- [${flow.interface} / ${methodLabel(flow.method)}](setup/${product.id}/${flow.interface}/${flow.method}.md) — ${flow.status === "ready" ? "procedure documented" : "needs owner input"}.`);
        lines.push("");
    }
    lines.push("## Report the result", "", "State the selected procedure, exact packages and versions installed or reused, observed installation/enabled/discovery state, and the next action. Do not claim a skill executed without observing an authorized functional request.", "");
    return lines.join("\n");
}

export function renderAgentFlow(guide, flow) {
    const lines = [`# ${flow.title} — ${methodLabel(flow.method)}`, "", `[All procedures and operating rules](../../../SETUP.md) · [Machine-readable setup](../../../setup.json) · [Distribution manifest](../../../manifest.json)`, "", `Procedure: \`${flow.id}\`. Status: \`${flow.status}\`. Marketplace: \`${guide.marketplace.name}\`. Target: \`${guide.target}\`.`, "", flow.summary, "", "## Before making changes", "", ...guide.agentRules.map(rule => `- ${rule}`), "", ...flow.prerequisites.map(value => `- ${value}`), ""];
    if (flow.status !== "ready") {
        lines.push("## Stop: procedure needs confirmation", "", "Do not execute or invent installation steps for this route. Ask for the specific missing procedure below, or offer the confirmed terminal/local alternative when it meets the user's intent.", "");
        for (const capture of flow.captures) lines.push(`### ${capture.title}`, "", ...capture.instructions.map(value => `- ${value}`), "");
        return lines.join("\n");
    }
    const app = flow.product === "antigravity" ? "agy" : flow.product;
    lines.push("## Selection and source facts", "", `Source method: ${methodLabel(flow.method)}. Channel: ${guide.release}.`, "", guide.repositoryUrl ? `Repository: ${guide.repositoryUrl}` : "This target has no configured Git repository. Use the supplied local copy.", "", "Confirm the requested application, interface, source method, shell and plugins before changing anything. Example filesystem paths are placeholders: resolve the user's actual absolute path and never execute a placeholder path.", "");
    lines.push("## Inspect first and reuse matching state", "", `Use \`${app} plugin list${app === "agy" ? "" : " --json"}\` to inspect the existing installation. ${app === "codex" ? "Read the installed entries and compare pluginId, marketplaceName, version, installed, and enabled where present." : "Compare selected package names, versions, and enabled state where exposed."}`, "");
    if (app !== "agy") lines.push(`Use \`${app} plugin marketplace list${app === "codex" ? " --json" : ""}\` to compare registered source locations. Reuse the intended source; ask about conflicting sources before replacing them.`, "");
    if (flow.preparationChoices?.length) {
        lines.push("## Prepare the local copy — choose one option", "", "These are alternatives, not consecutive steps. Reuse an appropriate existing copy before obtaining another. Resolve the actual marketplace root, check its registry identity and selected package manifests, and compare versions with this guide. Explain any mismatch before updating or replacing the source.", "");
        for (const choice of flow.preparationChoices) lines.push(...renderStep(choice));
    }
    if (app === "grok") lines.push("## Interactive steps and handoff", "", "The Marketplace tab and its trust prompt require interaction inside Grok. If you cannot operate that interface, ask the user to complete the named step and report what they observe. Do not claim you selected or installed anything you did not observe. The direct CLI route below is an alternative: do not silently replace the requested marketplace workflow with it.", "");
    lines.push("## Install through the selected method", "");
    for (const current of flow.steps) lines.push(...renderStep(current));
    for (const selection of flow.packages) {
        const plugin = guide.plugins.find(item => item.id === selection.pluginId);
        lines.push(`### If requested: ${plugin.name}`, "", `Identity: \`${plugin.id}\`; expected version: \`${plugin.version}\`.`, "", ...selection.paragraphs.flatMap(value => [value, ""]), ...blocks(selection.commands), `Expected: ${selection.expected}`, "");
    }
    if (!flow.packages.length) lines.push("No plugins are currently available. Do not install an excluded or coming-soon package.", "");
    lines.push(...renderStep(flow.start, "##"));
    lines.push("## Optional alternatives — do not run by default", "");
    for (const current of flow.alternatives) lines.push(...renderStep(current));
    lines.push("## Later management — requires the corresponding user request", "");
    for (const current of flow.management) lines.push(...renderStep(current));
    lines.push("## Evidence boundary", "", `${flow.verification.status}; recorded ${flow.verification.date}${flow.verification.version ? ` with ${flow.verification.version}` : ""}. ${flow.verification.scope}`, "", `Source: ${flow.verification.evidenceUrl}`, "", "Finish with what was installed or reused, actual verification observations, anything untested, and the next user action. Do not execute a skill or claim model/tool success unless that functional check was authorized and observed.", "");
    return lines.join("\n");
}
