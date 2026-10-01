# Faye Plugin Market

Faye Plugin Market is a collection of Fayegram plugins for coding, image work, and
browser UI work. Install the packages you need, then use their focused skills
to give your assistant a clear task, workflow, and expected result.

The repository carries Codex, Grok, and Antigravity-compatible marketplace
formats. Your host supplies the model, tools, account, and execution permissions;
each skill explains the additional requirements for its workflow.

Repository: https://github.com/Fayegram-AI/plugin-market.git

Distribution channel: **public**. The channel label is separate from native
package versions and does not establish whether this candidate is published.
Use the [setup website](https://plugin-market.fayegram.com/setup/) to choose your app and installation method, or read the [agent setup guide](market-info/SETUP.md) in this checkout. App procedures marked as needing input are not confirmed installation instructions.

## Choose a Plugin

| Plugin | Purpose | Version | Skills |
| --- | --- | --- | ---: |
| [Faye Coding Assistant](plugins/faye-coding-assistant/README.md) | Focused, scope-preserving coding skills. | `0.1.0-beta.7` | 14 |
| [Faye Image Utility](plugins/faye-image-utility/README.md) | Image auditing, editing, conversion, and rating estimates. | `0.1.0-beta.6` | 4 |
| [Faye UI System Engineer](plugins/faye-ui-system-engineer/README.md) | Web UI design, implementation, review, and inspection. | `0.1.0-beta.4` | 5 |

Each package includes its own instructions, requirements, usage guidance, and
license. Follow a package link above for its workflows and examples, or browse
the [complete skill inventory](plugins/README.md). Coming-soon website listings
are not installable packages.

<details>
<summary>Complete skill inventory</summary>

| Plugin | Version | Packaged skills |
| --- | --- | --- |
| `faye-coding-assistant` | `0.1.0-beta.7` | `code-review`, `codebase-exploration`, `coding-goal-guardrails`, `coding-handoff`, `phase-implementation-review`, `reconcile-repository-docs`, `refactor-planning`, `report-coding-goal-progress`, `repository-change-planning`, `repository-debugging`, `repository-implementation`, `source-file-token-estimation`, `test-suite-health`, `verification-planning` |
| `faye-image-utility` | `0.1.0-beta.6` | `faye-image-age-rating`, `faye-image-artifact-audit`, `faye-image-format-converter`, `simple-paint-n-annotation` |
| `faye-ui-system-engineer` | `0.1.0-beta.4` | `ui-inspection`, `ui-system-architecture`, `ui-system-implementation`, `ui-system-review`, `ui-visual-design` |

</details>

## Getting Started

1. Choose your app, its desktop or terminal interface, and the source method in the setup guide. Grok Build uses a terminal interface.
2. Follow one confirmed procedure and install only the plugins you need. **Git repository** registers a source URL; **Local copy** uses a folder on your computer, whether cloned, downloaded and extracted, or already available. Resolve the marketplace folder before running relative-path commands. App procedures awaiting confirmation are clearly marked.
3. Start a fresh session when required, confirm the selected plugins are available, and open their skill guides for examples and requirements.

- [Codex setup](market-info/SETUP.md#codex)
- [Grok Build setup](market-info/SETUP.md#grok-build)
- [Antigravity setup](market-info/SETUP.md#antigravity)

The [agent setup guide](market-info/SETUP.md) links to focused procedures for each app, interface, and source method. It explains how to reuse existing installations, interpret verification, and stop when an app procedure needs confirmation.

Install the host and sign in before using its native installation commands.
Plugin installation supplies package files; it does not supply host tools,
accounts, or optional runtimes. Each skill documents the tools it needs and
whether explicit invocation is required.

## Use a Skill

Choose a skill for the task you actually want to perform. Skills distinguish
analysis, planning, implementation, review, and other workflows; an analysis
request does not authorize changes. Provide the relevant repository, files,
images, or running UI, your desired result, and any constraints.

For example, select Coding Assistant's [codebase exploration skill](plugins/faye-coding-assistant/skills/codebase-exploration/SKILL.md) in your host and ask:

```text
Explain the structure of this repository and trace how a request reaches its handler. Keep this read-only.
```

This asks for understanding of the supplied repository. To change code afterward, choose the appropriate planning or implementation skill and explicitly describe the change.

Use your host's native skill selection or invocation syntax. Codex examples may
use `$skill-name`; other hosts have their own interfaces and syntax. Follow the
specific skill's activation rules rather than copying another host's command.
The website's skill pages offer practical examples and requirements.

Bundled agents, scripts, and reference files support their owning skills. They
are not separate plugins or interchangeable user commands. Installation and
discovery alone do not prove that a host can execute every packaged workflow.

Website invocation guidance is described by the resolved presentation policy in
`market-info/manifest.json`. A platform with undocumented examples is not a claim
of incompatibility. Website examples cannot override a package's explicit
activation requirements, and selecting a platform does not change package files.

## Updates and Troubleshooting

When updating, compare the installed package's source and version with the
repository source you intend to use, then follow your host's supported update or import
procedure. Keep unrelated registrations and settings intact. A fresh session may
be needed to discover new skills.

<details>
<summary>The terminal does not recognize the command</summary>

The application may be missing, unavailable in this terminal, or too old for plugin commands.

1. Open a new terminal after installing the application.
2. Check its version and plugin help against the official command reference.
3. Do not paste interactive slash commands into the system terminal.

Expected: The application starts and its plugin commands or Plugins interface are available.

</details>

<details>
<summary>The Git repository cannot be added</summary>

The URL, network connection, or Git access may prevent fetching the marketplace.

1. Compare the source with the repository address in your selected guide.
2. Confirm access through your normal Git authentication flow; private repositories require access.
3. Retry after resolving access. Do not disable certificate checks or paste a token into the guide.

Expected: The intended marketplace is listed without an access error.

</details>

<details>
<summary>The local folder is not recognized</summary>

Marketplace registration uses the repository root; direct plugin installation uses an individual plugin folder.

1. For Codex or Grok registration, open the directory containing the marketplace registry and plugins folder.
2. For Antigravity terminal installation, select plugins/&lt;plugin-id&gt; inside that checkout.
3. Keep the existing checkout; do not delete it to retry registration.

Expected: The source is recognized and the desired packages are available.

</details>

<details>
<summary>The plugin is installed but its skills are missing</summary>

The session may predate installation, the plugin may be disabled, or a skill may require explicit invocation.

1. Check the plugin's installed and enabled state.
2. Start a fresh session and open the skill picker or the selected plugin's skill guide.
3. Check invocation and tool requirements. Installation does not grant extra tools or permissions.

Expected: Applicable skills can be discovered or explicitly invoked in the new session.

</details>

<details>
<summary>Grok does not show a newly installed skill</summary>

Discovery output can distinguish an unloaded package from a skill requiring an explicit request.

1. Check the plugin is enabled in /plugins, then start a new session.
2. Run the optional discovery command below and look for the selected plugin and its expected skill names.
3. If the package is present but a skill is not offered automatically, read its invocation requirements.

Inspect skill discovery (PowerShell or Bash/zsh):

```text
grok inspect --json
```

Expected: The applicable skill names appear, or an explicit-invocation requirement explains the difference.

</details>

<details>
<summary>The same plugin is already installed</summary>

A matching installation can be reused; another source may create ambiguity.

1. Compare the installed identity, source, and version with this guide.
2. Reuse a matching installation.
3. For another version or source, follow the product's update procedure after deciding which source to keep.

Expected: The intended source and version are identified without removing unrelated registrations.

</details>

Include your host and version, plugin ID and version, the requested skill, and
the observed error when reporting a problem. Remove private files and credentials
from diagnostic material. See [SECURITY.md](SECURITY.md) for private security
reporting; repository maintenance follows [CONTRIBUTING.md](CONTRIBUTING.md).

## Repository Layout

- `.agents/plugins/marketplace.json`: canonical marketplace registry
- `.grok-plugin/marketplace.json`: compatibility registry for the same packages
- `plugins/`: complete included packages with their existing native manifests
- `skills/` and `agents/`: intentionally distributed standalone extensions
- `market-info/`: resolved public presentation, channel, provenance, and inventory
- `scripts/`: standalone validation and maintained documentation templates

Standalone skills: 0. Standalone agents: 0.

## Validation

Run from this checkout:

```powershell
npm run validate
```

Validation checks registry/package alignment, metadata, package instructions,
assets, current inventories, licensing boundaries, and forbidden artifacts.

## Documentation, Website, and Licensing

- This README helps you choose a package and find its setup instructions.
- [Installation and agent setup](market-info/SETUP.md) covers native host installation and verification.
- [Plugin and skill inventory](plugins/README.md) lists the packages actually included in this checkout.
- Each linked package README covers its workflows, tools, and license; its `skills/` directory contains the actual skill instructions.

Website: https://plugin-market.fayegram.com

This repository does not grant a repository-wide open-source license. Each
plugin has its own MIT `LICENSE` and `FAYEGRAM_ASSETS.md` identity-asset policy.
See [LICENSING.md](LICENSING.md). Website source and rendered pages are separate;
resolved presentation information is carried in this repository.
