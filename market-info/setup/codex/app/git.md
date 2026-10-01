# Codex: desktop app setup — Git repository

[All procedures and operating rules](../../../SETUP.md) · [Machine-readable setup](../../../setup.json) · [Distribution manifest](../../../manifest.json)

Procedure: `codex-app-git`. Status: `needs-input`. Marketplace: `faye-plugin-market`. Target: `release`.

This route is awaiting the owner’s confirmation of the app-specific installation procedure.

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

## Stop: procedure needs confirmation

Do not execute or invent installation steps for this route. Ask for the specific missing procedure below, or offer the confirmed terminal/local alternative when it meets the user's intent.

### Confirm Codex desktop app git setup

- Show how to open the controls for adding this custom marketplace in Codex (Desktop app). Record exact menu and button labels.
- Confirm whether this interface accepts our Git repository URL directly, the required source format, and the registration result. A curated listing alone does not establish custom Git registration.
- Show how to install one Faye plugin, identify its installed/enabled state, and find its skills in a new session. Record the application version.
- If this interface needs a different supported workflow, provide that procedure instead; do not infer it from another interface.

### Screenshots for Codex desktop app

- Capture the marketplace/source entry point before adding anything, with the relevant control visible.
- Capture the Git source input with the repository URL and the marketplace after successful registration.
- Capture one Faye plugin's installation/details screen, its installed state, and the skill-discovery view. Keep the relevant labels readable.
- Exclude account details, credentials, private projects, and unrelated windows. Use real captures, not simulated screens.
