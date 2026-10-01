# Grok Build: terminal setup — Local copy

[All procedures and operating rules](../../../SETUP.md) · [Machine-readable setup](../../../setup.json) · [Distribution manifest](../../../manifest.json)

Procedure: `grok-terminal-local`. Status: `ready`. Marketplace: `faye-plugin-market`. Target: `release`.

Add the marketplace from a local copy on your computer.

## Before making changes

- Identify the selected product, interface, Git or local method, operating system/shell, and desired plugins. Ask only for missing decisions; reuse the user's existing authorization.
- Read this target's setup.json, manifest.json, and native registry. Use their actual marketplace identity, repository URL, available plugin IDs, versions, and skills. Do not borrow facts from another target.
- A route marked needs-input is not executable guidance. Describe the missing procedure and ask for the user's demonstration or confirmation. Never guess app controls or treat a placeholder as evidence.
- Inspect existing registrations and installed packages using supported read-only commands. Reuse a matching source and installed version. Explain conflicts before replacing anything.
- Choose the declared shell variant. Run only the selected route and plugins, using automation output flags where provided. Interactive slash commands belong in the product, not the operating-system shell.
- Keep authentication in the application's supported sign-in flow. Never ask for credentials in a prompt. Respect existing trust authorization; do not silently add automatic trust flags.
- Preserve unrelated settings and working installations. Do not clear caches, remove unrelated packages, rewrite global configuration wholesale, or weaken permissions to make setup pass.
- Verify installed identity, version, enabled state where exposed, and skill discovery. A zero exit code or copied files alone do not establish successful setup.
- Start or request a fresh session when needed. Run a functional skill request only if the user authorizes that execution; installation does not require a model call.
- Report the selected route, packages installed or reused, observed verification, and the next user action. Separate documented behavior, observations, and untested or blocked work.

- Install Grok Build and sign in before running skills. Use the official documentation if the application is not yet available.
- Check the chosen plugin's requirements; some skills need additional tools or runtimes.
- Use PowerShell on Windows or Bash/zsh on macOS/Linux. Interactive slash commands are entered inside the application.

## Selection and source facts

Source method: Local copy. Channel: public.

Repository: https://github.com/Fayegram-AI/plugin-market.git

Confirm the requested application, interface, source method, shell and plugins before changing anything. Example filesystem paths are placeholders: resolve the user's actual absolute path and never execute a placeholder path.

## Inspect first and reuse matching state

Use `grok plugin list --json` to inspect the existing installation. Compare selected package names, versions, and enabled state where exposed.

Use `grok plugin marketplace list` to compare registered source locations. Reuse the intended source; ask about conflicting sources before replacing them.

## Prepare the local copy — choose one option

These are alternatives, not consecutive steps. Reuse an appropriate existing copy before obtaining another. Resolve the actual marketplace root, check its registry identity and selected package manifests, and compare versions with this guide. Explain any mismatch before updating or replacing the source.

### Use an existing copy

Find the marketplace folder already on your computer. It contains plugins and the hidden .agents/plugins/marketplace.json registry. A plugin folder inside plugins is not the marketplace root.

Keep this copy in a stable location. Do not overwrite it or change its Git branch just to follow this guide.

Expected: You know the full path to the marketplace root.

### Clone the repository

Git must be installed. Run this from the parent folder where you want to keep the copy. faye-plugin-market is an example destination name; choose another unused name if needed.

If the destination already exists, use that copy or choose a different destination. Do not overwrite it. After cloning, use the full path to the new folder in the next step.

Clone into a new folder — PowerShell or Bash/zsh:

```text
git clone https://github.com/Fayegram-AI/plugin-market.git faye-plugin-market
```

Expected: A new local copy exists in the chosen destination.

### Download and extract the repository

Open the repository: https://github.com/Fayegram-AI/plugin-market

Use its source archive download option, then extract the archive into a stable location. Open the extracted folder containing plugins and .agents/plugins/marketplace.json, not the archive or a surrounding downloads folder.

An extracted archive is a local copy without Git history; git pull cannot update it.

Expected: The extracted marketplace root is available on your computer.

## Interactive steps and handoff

The Marketplace tab and its trust prompt require interaction inside Grok. If you cannot operate that interface, ask the user to complete the named step and report what they observe. Do not claim you selected or installed anything you did not observe. The direct CLI route below is an alternative: do not silently replace the requested marketplace workflow with it.

## Install through the selected method

### Open the marketplace folder

Replace the entire quoted example path below with the full path to your marketplace root. Keep the quotes, especially when the path contains spaces. Choose the command for your terminal shell.

All following relative paths use this folder. The single dot means this marketplace root; ./plugins/<plugin-id> means one plugin folder inside it.

Open your local copy — replace the example path

PowerShell:

```powershell
Set-Location -LiteralPath 'C:\path\to\Faye Plugin Market'
```

Bash/zsh:

```bash
cd -- '/path/to/Faye Plugin Market'
```

Expected: Your terminal is in the folder containing plugins and .agents/plugins/marketplace.json.

### Add Faye Plugin Market

Run this once for the selected source. If the same source is already registered, reuse it. Adding a marketplace makes its plugins available to choose; it does not install them all.

Add marketplace — PowerShell or Bash/zsh:

```text
grok plugin marketplace add .
```

Expected: The source is registered. Its native marketplace identity is faye-plugin-market. Grok may display the local folder name; match its source path when choosing the catalog.

### Open Grok's plugin catalog

Start Grok in your terminal, enter /plugins, and select the Marketplace tab. Choose the source you just registered. The slash command below belongs inside Grok, not your operating-system terminal.

Start Grok — PowerShell or Bash/zsh:

```text
grok
```

Inside Grok — enter inside the application:

```text
/plugins
```

Expected: The Faye packages in this guide appear in the selected catalog.

### If requested: Faye Coding Assistant

Identity: `faye-coding-assistant`; expected version: `0.1.0-beta.7`.

Choose Faye Coding Assistant in the selected Marketplace tab and install it. Review Grok's trust prompt before accepting.

Expected: Faye Coding Assistant appears in the installed plugin list. Compare its version with 0.1.0-beta.7 shown by this marketplace.

### If requested: Faye Image Utility

Identity: `faye-image-utility`; expected version: `0.1.0-beta.6`.

Choose Faye Image Utility in the selected Marketplace tab and install it. Review Grok's trust prompt before accepting.

Expected: Faye Image Utility appears in the installed plugin list. Compare its version with 0.1.0-beta.6 shown by this marketplace.

### If requested: Faye UI System Engineer

Identity: `faye-ui-system-engineer`; expected version: `0.1.0-beta.4`.

Choose Faye UI System Engineer in the selected Marketplace tab and install it. Review Grok's trust prompt before accepting.

Expected: Faye UI System Engineer appears in the installed plugin list. Compare its version with 0.1.0-beta.4 shown by this marketplace.

## Confirm installation and start a new session

Check the plugins you selected are installed and enabled where the application exposes that state. The list command below is a quick confirmation, not a test of every skill.

Start a new Grok Build session, open its skill picker or Plugins interface, and choose a task from the installed plugin's skill guides. Read that skill's inputs and requirements before sending your request.

Use the product's native skill picker or slash-command guidance. Read the selected skill's guide rather than translating another application's example yourself.

List installed plugins — PowerShell or Bash/zsh:

```text
grok plugin list --json
```

Expected: Your selected plugins are installed and their applicable skills can be found or explicitly invoked in a fresh session.

## Optional alternatives — do not run by default

### Direct CLI installation: Faye Coding Assistant

Optional alternative to installing through the Marketplace tab. This installs one plugin directly and does not require marketplace registration. Do not use both routes for the same installation.

Review the interactive trust prompt. Automatic trust is not enabled by this example.

Install directly — PowerShell or Bash/zsh:

```text
grok plugin install ./plugins/faye-coding-assistant
```

Expected: Faye Coding Assistant appears in the installed list.

### Direct CLI installation: Faye Image Utility

Optional alternative to installing through the Marketplace tab. This installs one plugin directly and does not require marketplace registration. Do not use both routes for the same installation.

Review the interactive trust prompt. Automatic trust is not enabled by this example.

Install directly — PowerShell or Bash/zsh:

```text
grok plugin install ./plugins/faye-image-utility
```

Expected: Faye Image Utility appears in the installed list.

### Direct CLI installation: Faye UI System Engineer

Optional alternative to installing through the Marketplace tab. This installs one plugin directly and does not require marketplace registration. Do not use both routes for the same installation.

Review the interactive trust prompt. Automatic trust is not enabled by this example.

Install directly — PowerShell or Bash/zsh:

```text
grok plugin install ./plugins/faye-ui-system-engineer
```

Expected: Faye UI System Engineer appears in the installed list.

### Check an existing installation

Use this before adding a second source or when setup reports that the plugin already exists. Compare the names and source locations; reuse a matching installation.

Installed plugins — PowerShell or Bash/zsh:

```text
grok plugin list --json
```

Registered marketplaces — PowerShell or Bash/zsh:

```text
grok plugin marketplace list
```

Expected: The intended source and installed package are identified without removing other registrations.

## Later management — requires the corresponding user request

### Update a local copy later

Updating the source is separate from installing a plugin. git pull updates an existing Git checkout; it does not create one and cannot update an extracted archive.

Before updating a checkout, check its branch and local changes. For an archive, obtain a newer copy separately and compare versions. Do not overwrite the existing folder or change an installed plugin without deciding to update it.

Expected: You have identified the source and version you intend to use before making an update.

### Update or toggle Faye Coding Assistant

Choose only the operation you intend to perform. Check the installed source and version before updating. Disabling keeps the plugin installed; enabling makes its capabilities available again. Start a fresh session after changing its state.

Update selected plugin — PowerShell or Bash/zsh:

```text
grok plugin update faye-coding-assistant
```

Disable selected plugin — PowerShell or Bash/zsh:

```text
grok plugin disable faye-coding-assistant
```

Enable selected plugin — PowerShell or Bash/zsh:

```text
grok plugin enable faye-coding-assistant
```

Expected: The installed plugin list shows the intended version and enabled state.

### Update or toggle Faye Image Utility

Choose only the operation you intend to perform. Check the installed source and version before updating. Disabling keeps the plugin installed; enabling makes its capabilities available again. Start a fresh session after changing its state.

Update selected plugin — PowerShell or Bash/zsh:

```text
grok plugin update faye-image-utility
```

Disable selected plugin — PowerShell or Bash/zsh:

```text
grok plugin disable faye-image-utility
```

Enable selected plugin — PowerShell or Bash/zsh:

```text
grok plugin enable faye-image-utility
```

Expected: The installed plugin list shows the intended version and enabled state.

### Update or toggle Faye UI System Engineer

Choose only the operation you intend to perform. Check the installed source and version before updating. Disabling keeps the plugin installed; enabling makes its capabilities available again. Start a fresh session after changing its state.

Update selected plugin — PowerShell or Bash/zsh:

```text
grok plugin update faye-ui-system-engineer
```

Disable selected plugin — PowerShell or Bash/zsh:

```text
grok plugin disable faye-ui-system-engineer
```

Enable selected plugin — PowerShell or Bash/zsh:

```text
grok plugin enable faye-ui-system-engineer
```

Expected: The installed plugin list shows the intended version and enabled state.

### Uninstall Faye Coding Assistant

Only use this when you intend to remove this plugin. It removes the selected installation and its capabilities; it is not a troubleshooting prerequisite. Leave other plugins and marketplace sources intact.

Uninstall selected plugin — PowerShell or Bash/zsh:

```text
grok plugin uninstall faye-coding-assistant
```

Expected: Faye Coding Assistant is no longer listed as installed.

### Uninstall Faye Image Utility

Only use this when you intend to remove this plugin. It removes the selected installation and its capabilities; it is not a troubleshooting prerequisite. Leave other plugins and marketplace sources intact.

Uninstall selected plugin — PowerShell or Bash/zsh:

```text
grok plugin uninstall faye-image-utility
```

Expected: Faye Image Utility is no longer listed as installed.

### Uninstall Faye UI System Engineer

Only use this when you intend to remove this plugin. It removes the selected installation and its capabilities; it is not a troubleshooting prerequisite. Leave other plugins and marketplace sources intact.

Uninstall selected plugin — PowerShell or Bash/zsh:

```text
grok plugin uninstall faye-ui-system-engineer
```

Expected: Faye UI System Engineer is no longer listed as installed.

## Evidence boundary

tested; recorded 2026-09-27 with Grok Build 1.0.41 on Windows. Local installation and one representative skill were checked on the recorded version. This does not certify every workflow, operating system, or app interface.

Source: https://docs.x.ai/build/features/skills-plugins-marketplaces

Finish with what was installed or reused, actual verification observations, anything untested, and the next user action. Do not execute a skill or claim model/tool success unless that functional check was authorized and observed.
