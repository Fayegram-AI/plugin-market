# Set up Faye plugins: agent instructions

Choose your app, install the plugins you need, and start using their skills.

Marketplace: `faye-plugin-market`. Target: `release`. Channel: `public`.

Read [setup.json](setup.json) and [manifest.json](manifest.json) from this same checkout. Their identities, versions, inclusion and source addresses are authoritative.

Repository: https://github.com/Fayegram-AI/plugin-market.git

## Available plugins

- **Faye Coding Assistant**: `faye-coding-assistant`, version `0.1.0-beta.7`. Skills: `code-review`, `codebase-exploration`, `coding-goal-guardrails`, `coding-handoff`, `phase-implementation-review`, `reconcile-repository-docs`, `refactor-planning`, `report-coding-goal-progress`, `repository-change-planning`, `repository-debugging`, `repository-implementation`, `source-file-token-estimation`, `test-suite-health`, `verification-planning`.
- **Faye Image Utility**: `faye-image-utility`, version `0.1.0-beta.6`. Skills: `faye-image-age-rating`, `faye-image-artifact-audit`, `faye-image-format-converter`, `simple-paint-n-annotation`.
- **Faye UI System Engineer**: `faye-ui-system-engineer`, version `0.1.0-beta.4`. Skills: `ui-inspection`, `ui-system-architecture`, `ui-system-implementation`, `ui-system-review`, `ui-visual-design`.

## Operating rules

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

## Select one procedure

Choose only the requested product, interface, source method, and plugins. A needs-input procedure is a request for clarification, not permission to invent installation steps.

## Codex

- [app / Git repository](setup/codex/app/git.md) — needs owner input.
- [app / Local copy](setup/codex/app/local.md) — needs owner input.
- [terminal / Git repository](setup/codex/terminal/git.md) — procedure documented.
- [terminal / Local copy](setup/codex/terminal/local.md) — procedure documented.

## Grok Build

- [terminal / Git repository](setup/grok/terminal/git.md) — procedure documented.
- [terminal / Local copy](setup/grok/terminal/local.md) — procedure documented.

## Antigravity

- [app / Git repository](setup/antigravity/app/git.md) — needs owner input.
- [app / Local copy](setup/antigravity/app/local.md) — needs owner input.
- [ide / Git repository](setup/antigravity/ide/git.md) — needs owner input.
- [ide / Local copy](setup/antigravity/ide/local.md) — needs owner input.
- [terminal / Git repository](setup/antigravity/terminal/git.md) — needs owner input.
- [terminal / Local copy](setup/antigravity/terminal/local.md) — procedure documented.

## Report the result

State the selected procedure, exact packages and versions installed or reused, observed installation/enabled/discovery state, and the next action. Do not claim a skill executed without observing an authorized functional request.
