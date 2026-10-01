/** Local-copy acquisition is a choice; entering the resolved root is a dependency. */
import { command, step } from "./setup-commands.mjs";

export function preparationChoices(repository) {
    const choices = [step("reuse", "Use an existing copy", [
        "Find the marketplace folder already on your computer. It contains plugins and the hidden .agents/plugins/marketplace.json registry. A plugin folder inside plugins is not the marketplace root.",
        "Keep this copy in a stable location. Do not overwrite it or change its Git branch just to follow this guide."
    ], "You know the full path to the marketplace root.")];
    if (!repository) return choices;
    choices.push(step("clone", "Clone the repository", [
        "Git must be installed. Run this from the parent folder where you want to keep the copy. faye-plugin-market is an example destination name; choose another unused name if needed.",
        "If the destination already exists, use that copy or choose a different destination. Do not overwrite it. After cloning, use the full path to the new folder in the next step."
    ], "A new local copy exists in the chosen destination.", [command("clone", "Clone into a new folder", ["git", "clone", repository, "faye-plugin-market"])]));
    choices.push(step("download", "Download and extract the repository", [
        `Open the repository: ${repository.replace(/\.git$/u, "")}`,
        "Use its source archive download option, then extract the archive into a stable location. Open the extracted folder containing plugins and .agents/plugins/marketplace.json, not the archive or a surrounding downloads folder.",
        "An extracted archive is a local copy without Git history; git pull cannot update it."
    ], "The extracted marketplace root is available on your computer."));
    return choices;
}

export function folderStep() {
    return step("folder", "Open the marketplace folder", [
        "Replace the entire quoted example path below with the full path to your marketplace root. Keep the quotes, especially when the path contains spaces. Choose the command for your terminal shell.",
        "All following relative paths use this folder. The single dot means this marketplace root; ./plugins/<plugin-id> means one plugin folder inside it."
    ], "Your terminal is in the folder containing plugins and .agents/plugins/marketplace.json.", [{
        id: "enter", label: "Open your local copy — replace the example path", kind: "terminal",
        variants: {
            powershell: "Set-Location -LiteralPath 'C:\\path\\to\\Faye Plugin Market'",
            bash: "cd -- '/path/to/Faye Plugin Market'"
        }
    }]);
}
