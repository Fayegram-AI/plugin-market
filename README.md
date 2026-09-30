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
Read the [installation and agent setup guide](market-info/SETUP.md) for host-specific steps, package selection, verification, and existing-installation handling.

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

1. Obtain this repository's checkout and open a terminal at its root.
2. Choose your host below and follow its installation steps. Install only the plugins you need.
3. Start a fresh host session, confirm skill discovery, and read the chosen skill's requirements before your first request.

- [Codex CLI installation](market-info/SETUP.md#codex-cli)
- [Grok Build installation](market-info/SETUP.md#grok-build)
- [Antigravity CLI installation](market-info/SETUP.md#antigravity-cli)

The [agent-readable setup guide](market-info/SETUP.md) contains the same maintained steps for an assistant helping with installation. It explains how to inspect an existing installation and what to verify before reporting success.

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
checkout you intend to use, then follow your host's supported update or import
procedure. Keep unrelated registrations and settings intact. A fresh session may
be needed to discover new skills.

- If the host cannot find a marketplace, confirm the terminal is at the checkout root and that its native registry is present.
- If a plugin is already installed, compare its source and version before updating. Keep a working installation until the replacement is understood.
- If skills are missing, check the plugin's enabled state and restart the session. Explicit-only skills may be absent from an automatic skill list.
- If a skill cannot use a tool or runtime, check that skill's requirements and the host's permissions. Installation does not grant extra execution permissions.
- If a check is blocked, report what was observed and what remains unverified. Do not treat a local test as proof of public remote installation.

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
