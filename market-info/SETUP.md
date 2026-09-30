# Install and set up

Connect your coding host to Faye Plugin Market, choose the plugins you need, and confirm their skills are ready to use.

Marketplace: faye-plugin-market. Channel: public.

## Before you begin

- Install and sign in to the host you plan to use. Plugin installation does not install the host or supply an account.
- Use the marketplace checkout for the intended channel. Coming-soon plugins are not available to install from this release.
- Read the chosen plugin's requirements. Helpers may need local runtimes or host tools in addition to the plugin files.

Clone the configured repository with Git, then open a terminal at the checkout root. The commands below run from that directory.

Repository: https://github.com/Fayegram-AI/plugin-market.git

## Instructions for an assisting agent

- Identify the requested host and surface, the intended marketplace checkout, and the plugins the user wants before making changes.
- Inspect the checkout's market-info/manifest.json and native registry. Use its actual marketplace identity and included packages; do not invent repository addresses or install an excluded plugin.
- Check existing registrations and installations first. Reuse matching entries, preserve unrelated settings, and stop to clarify conflicting sources or versions.
- Follow the user's authorized installation and trust scope; reuse authorization already given. Never clear caches, remove plugins, rewrite global configuration wholesale, or weaken host permissions to make a check pass.
- Run the applicable native steps below. Keep authentication in the host's supported sign-in flow; never request that credentials be pasted into a prompt.
- Verify the installed identity, version, enabled state where exposed, and skill discovery. A successful exit code or copied files alone do not prove a skill works.
- Start a fresh session and use one small read-only skill request when the user authorizes a functional check. Report passed, blocked, and untested steps separately.

## Available packages

- Faye Coding Assistant: `faye-coding-assistant`, version `0.1.0-beta.7`.
- Faye Image Utility: `faye-image-utility`, version `0.1.0-beta.6`.
- Faye UI System Engineer: `faye-ui-system-engineer`, version `0.1.0-beta.4`.

## Codex CLI

Installation: tested. Skill check: tested. Checked 2026-09-27 with Codex CLI 0.155.0 on Windows.

Local marketplace installation and one read-only exploration skill were tested in isolated configuration directories. Public remote installation and every individual workflow were not tested.

Documentation: https://developers.openai.com/codex/cli/reference/

- An installed Codex CLI with the plugin command and a signed-in account for skill execution.

### 1. Check your existing setup

Check the installed CLI and its marketplace sources. If this checkout is already registered, reuse that registration.

Codex version

```powershell
codex --version
```

Configured Codex marketplaces

```powershell
codex plugin marketplace list --json
```

### 2. Add this marketplace

Run this only if the checkout is not already registered. Adding a marketplace does not install its plugins.

Register with Codex

```powershell
codex plugin marketplace add . --json
```

### 3. Choose your plugins

Install only the plugins you want. These commands use the identity declared by this marketplace.

Install Faye Coding Assistant with Codex

```powershell
codex plugin add faye-coding-assistant@faye-plugin-market --json
```

Install Faye Image Utility with Codex

```powershell
codex plugin add faye-image-utility@faye-plugin-market --json
```

Install Faye UI System Engineer with Codex

```powershell
codex plugin add faye-ui-system-engineer@faye-plugin-market --json
```

### 4. Verify and start a new session

Confirm the selected plugins are installed and enabled, then start a new Codex session so their skills can be discovered. Open a skill guide for its requirements and usage examples.

Verify Codex plugins

```powershell
codex plugin list --marketplace faye-plugin-market --available --json
```

- The marketplace's native identity is used after @ in plugin selectors. A local registration alias can be different.
- Explicit-only invocation policies remain part of the packaged skills.

## Grok Build

Installation: tested. Skill check: tested. Checked 2026-09-27 with Grok Build 1.0.41 on Windows.

Local marketplace installation, loaded-skill discovery, and one read-only exploration skill were tested in isolated configuration directories. Public remote installation and every individual workflow were not tested.

Documentation: https://docs.x.ai/build/features/skills-plugins-marketplaces

- An installed Grok Build CLI with plugin support and a signed-in account for skill execution.

### 1. Check your existing setup

Check the installed CLI and the source paths already configured. Grok reports an error when the same marketplace is added again; reuse the existing source.

Grok version

```powershell
grok --version
```

Configured Grok marketplaces

```powershell
grok plugin marketplace list
```

### 2. Add this marketplace

Run from the checkout root only if this source is not already registered. Grok may label a local source using its folder name.

Register with Grok

```powershell
grok plugin marketplace add .
```

### 3. Choose and trust your plugins

Review each package before installing. The trust flag explicitly trusts that package in Grok. Relative paths select this checkout even when another marketplace offers the same plugin name.

Install Faye Coding Assistant with Grok

```powershell
grok plugin install ./plugins/faye-coding-assistant --trust
```

Install Faye Image Utility with Grok

```powershell
grok plugin install ./plugins/faye-image-utility --trust
```

Install Faye UI System Engineer with Grok

```powershell
grok plugin install ./plugins/faye-ui-system-engineer --trust
```

### 4. Verify and start a new session

Check the selected plugins and the skills Grok discovers. Start a new session, or reload the Plugins panel, to use newly installed skills.

Verify Grok plugins

```powershell
grok plugin list --json
```

Inspect Grok discovery

```powershell
grok inspect --json
```

- Trust is a host permission decision, not a marketplace availability setting.
- Grok discovers skills in its native skill interface; these setup commands do not translate skill requests from another host.

## Antigravity CLI

Installation: tested. Skill check: tested. Checked 2026-09-27 with Antigravity CLI 1.2.4 on Windows.

The three release plugins and 23 skills were imported through the active CLI, and one read-only exploration request passed with Gemini 3.8 Flash (Medium). This was not an isolated profile or a test of every workflow; existing desktop registrations were retained.

Documentation: https://www.antigravity.google/docs/plugins?tab=cli

- An installed Antigravity CLI and a signed-in account for skill execution. Desktop and IDE setup are separate surfaces.

### 1. Check the Antigravity CLI

These instructions apply to the CLI. Desktop and IDE registrations use separate discovery paths and do not prove a CLI import.

Antigravity CLI version

```powershell
agy --version
```

Imported CLI plugins

```powershell
agy plugin list
```

### 2. Choose your plugins

Validate and install only the packages you want from this checkout. Installation stages plugin files in the Antigravity CLI profile. Inspect existing imports before replacing a package.

Validate Faye Coding Assistant with Antigravity

```powershell
agy plugin validate ./plugins/faye-coding-assistant
```

Install Faye Coding Assistant with Antigravity

```powershell
agy plugin install ./plugins/faye-coding-assistant
```

Validate Faye Image Utility with Antigravity

```powershell
agy plugin validate ./plugins/faye-image-utility
```

Install Faye Image Utility with Antigravity

```powershell
agy plugin install ./plugins/faye-image-utility
```

Validate Faye UI System Engineer with Antigravity

```powershell
agy plugin validate ./plugins/faye-ui-system-engineer
```

Install Faye UI System Engineer with Antigravity

```powershell
agy plugin install ./plugins/faye-ui-system-engineer
```

### 3. Verify and start a new session

Confirm the plugin appears in the CLI list, then start a new CLI session and inspect its skills. Use the native host's skill discovery rather than assuming another platform's invocation syntax.

Verify Antigravity CLI plugins

```powershell
agy plugin list
```

- Use agy plugin list to verify CLI imports. Filesystem locations can differ by host version; the tested CLI resolved skills under ~/.gemini/config/plugins/.
- A desktop registration alone does not prove CLI import or skill execution. The local check retained existing desktop registrations.

## If setup is incomplete

- If the host cannot find a marketplace, confirm the terminal is at the checkout root and that its native registry is present.
- If a plugin is already installed, compare its source and version before updating. Keep a working installation until the replacement is understood.
- If skills are missing, check the plugin's enabled state and restart the session. Explicit-only skills may be absent from an automatic skill list.
- If a skill cannot use a tool or runtime, check that skill's requirements and the host's permissions. Installation does not grant extra execution permissions.
- If a check is blocked, report what was observed and what remains unverified. Do not treat a local test as proof of public remote installation.
