# Codex: terminal setup — Git repository

[All procedures and operating rules](../../../SETUP.md) · [Machine-readable setup](../../../setup.json) · [Distribution manifest](../../../manifest.json)

Procedure: `codex-terminal-git`. Status: `ready`. Marketplace: `faye-plugin-market`. Target: `release`.

Add the marketplace using its Git repository URL. The app fetches the source; no manual clone is needed.

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

- Install Codex and sign in before running skills. Use the official documentation if the application is not yet available.
- Check the chosen plugin's requirements; some skills need additional tools or runtimes.
- Use PowerShell on Windows or Bash/zsh on macOS/Linux. Interactive slash commands are entered inside the application.
- Git and access to the configured repository are required. Registration can run from any directory; it fetches the source for you.

## Selection and source facts

Source method: Git repository. Channel: public.

Repository: https://github.com/Fayegram-AI/plugin-market.git

Confirm the requested application, interface, source method, shell and plugins before changing anything. Example filesystem paths are placeholders: resolve the user's actual absolute path and never execute a placeholder path.

## Inspect first and reuse matching state

Use `codex plugin list --json` to inspect the existing installation. Read the installed entries and compare pluginId, marketplaceName, version, installed, and enabled where present.

Use `codex plugin marketplace list --json` to compare registered source locations. Reuse the intended source; ask about conflicting sources before replacing them.

## Install through the selected method

### Add Faye Plugin Market

Run this once for the selected source. If the same source is already registered, reuse it. Adding a marketplace makes its plugins available to choose; it does not install them all.

Add marketplace — PowerShell or Bash/zsh:

```text
codex plugin marketplace add https://github.com/Fayegram-AI/plugin-market.git --json
```

Expected: The source is registered. Its native marketplace identity is faye-plugin-market.

### If requested: Faye Coding Assistant

Identity: `faye-coding-assistant`; expected version: `0.1.0-beta.7`.

Install Faye Coding Assistant only if you want its skills. Review any permission or trust prompts shown by the application.

Install Faye Coding Assistant — PowerShell or Bash/zsh:

```text
codex plugin add faye-coding-assistant@faye-plugin-market --json
```

Expected: Faye Coding Assistant appears in the installed plugin list. Compare its version with 0.1.0-beta.7 shown by this marketplace.

### If requested: Faye Image Utility

Identity: `faye-image-utility`; expected version: `0.1.0-beta.6`.

Install Faye Image Utility only if you want its skills. Review any permission or trust prompts shown by the application.

Install Faye Image Utility — PowerShell or Bash/zsh:

```text
codex plugin add faye-image-utility@faye-plugin-market --json
```

Expected: Faye Image Utility appears in the installed plugin list. Compare its version with 0.1.0-beta.6 shown by this marketplace.

### If requested: Faye UI System Engineer

Identity: `faye-ui-system-engineer`; expected version: `0.1.0-beta.4`.

Install Faye UI System Engineer only if you want its skills. Review any permission or trust prompts shown by the application.

Install Faye UI System Engineer — PowerShell or Bash/zsh:

```text
codex plugin add faye-ui-system-engineer@faye-plugin-market --json
```

Expected: Faye UI System Engineer appears in the installed plugin list. Compare its version with 0.1.0-beta.4 shown by this marketplace.

## Confirm installation and start a new session

Check the plugins you selected are installed and enabled where the application exposes that state. The list command below is a quick confirmation, not a test of every skill.

Start a new Codex session, open its skill picker or Plugins interface, and choose a task from the installed plugin's skill guides. Read that skill's inputs and requirements before sending your request.

Codex skill requests may use $skill-name. Copy the example from the selected skill's guide, including any explicit invocation it requires.

List installed plugins — PowerShell or Bash/zsh:

```text
codex plugin list --marketplace faye-plugin-market --json
```

Expected: Your selected plugins are installed and their applicable skills can be found or explicitly invoked in a fresh session.

## Optional alternatives — do not run by default

### Check an existing installation

Use this before adding a second source or when setup reports that the plugin already exists. Compare the names and source locations; reuse a matching installation.

Installed plugins — PowerShell or Bash/zsh:

```text
codex plugin list --marketplace faye-plugin-market --json
```

Registered marketplaces — PowerShell or Bash/zsh:

```text
codex plugin marketplace list --json
```

Expected: The intended source and installed package are identified without removing other registrations.

## Later management — requires the corresponding user request

### Refresh the Git marketplace

Refresh the source when you want to check for new package versions. Compare installed versions afterward; refreshing the catalog alone is not evidence that each installed plugin was updated.

Refresh marketplace — PowerShell or Bash/zsh:

```text
codex plugin marketplace upgrade faye-plugin-market
```

Expected: The marketplace refresh succeeds; inspect the desired plugin's current and available version before changing its installation.

### Enable or disable a plugin

Open /plugins inside Codex. Select an installed plugin and use the displayed enable/disable action. Disabling keeps the installation but makes its capabilities unavailable until enabled again.

Inside Codex — enter inside the application:

```text
/plugins
```

Expected: The plugin browser shows the intended enabled state.

### Uninstall Faye Coding Assistant

Only use this when you intend to remove this plugin. It removes the selected installation and its capabilities; it is not a troubleshooting prerequisite. Leave other plugins and marketplace sources intact.

Uninstall selected plugin — PowerShell or Bash/zsh:

```text
codex plugin remove faye-coding-assistant@faye-plugin-market
```

Expected: Faye Coding Assistant is no longer listed as installed.

### Uninstall Faye Image Utility

Only use this when you intend to remove this plugin. It removes the selected installation and its capabilities; it is not a troubleshooting prerequisite. Leave other plugins and marketplace sources intact.

Uninstall selected plugin — PowerShell or Bash/zsh:

```text
codex plugin remove faye-image-utility@faye-plugin-market
```

Expected: Faye Image Utility is no longer listed as installed.

### Uninstall Faye UI System Engineer

Only use this when you intend to remove this plugin. It removes the selected installation and its capabilities; it is not a troubleshooting prerequisite. Leave other plugins and marketplace sources intact.

Uninstall selected plugin — PowerShell or Bash/zsh:

```text
codex plugin remove faye-ui-system-engineer@faye-plugin-market
```

Expected: Faye UI System Engineer is no longer listed as installed.

## Evidence boundary

documented; recorded 2026-09-30. Git syntax is documented and confirmed by CLI help. A complete Git installation has not been newly verified for this guide.

Source: https://learn.chatgpt.com/docs/developer-commands

Finish with what was installed or reused, actual verification observations, anything untested, and the next user action. Do not execute a skill or claim model/tool success unless that functional check was authorized and observed.
