# Agent Instructions

This repository is the self-contained, Git-addressable source for the Faye
Plugin Market distribution.

## Required Layout

- Keep `.agents/plugins/marketplace.json` as the marketplace registry.
- Keep `.grok-plugin/marketplace.json` aligned with the Codex registry.
- Preserve each package's `.grok-plugin/plugin.json` and root `plugin.json`
  compatibility manifests with the same identity and version as its Codex manifest.
- Register plugins with relative `./plugins/<plugin-name>` source paths.
- Keep plugin packages under `plugins/<plugin-name>/`.
- Keep plugin-packaged skills and agents inside their plugin package.
- Use top-level `skills/` and `agents/` only for intentional standalone
  extensions.
- Keep repository validation scripts under `scripts/` and workflows under
  `.github/workflows/`.

## Repository Rules

- Preserve required marketplace policy fields and package-to-registry coverage.
- Keep package manifests, folder names, versions, and public inventories
  synchronized.
- Do not add routine tests, fixtures, caches, build output, logs, scratch files,
  secrets, or private paths.
- Keep website source and generated website pages outside this repository.
- Generated public metadata belongs in `market-info/`; never hand-edit it.
- All distribution files must match the generated managed inventory. Reuse
  `scripts/lib/distribution-safety.mjs` for artifact checks; keep root automation
  and exclude development state and credential files.
- Plugin versions and bytes are unchanged between staging and public channels.
- Do not add a root open-source `LICENSE`; preserve individual plugin licenses
  and the boundary documented in `LICENSING.md`.
- Treat `CONTRIBUTING.md` as an authorized-maintainer policy.

## Validation

Run from the repository root:

```powershell
npm run validate
```

For changed plugin packages, also run the applicable Codex plugin and skill
validators when available.
