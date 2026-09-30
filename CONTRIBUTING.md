# Authorized Maintainer Guide

This public repository is a distribution source for the Faye Plugin Market.
Repository changes are managed by authorized Fayegram maintainers. Unsolicited
code, package, or documentation contributions are not accepted.

Security reports remain welcome through GitHub Security Advisories as described
in [SECURITY.md](SECURITY.md). Do not disclose credentials, exploit details, or
private user data in public issues or pull requests.

## Maintained Content

- `.agents/plugins/marketplace.json`
- plugin packages under `plugins/<plugin-name>/`
- optional standalone skills under `skills/`
- optional standalone agents under `agents/`
- repository validation, automation, public documentation, and generated `market-info/` metadata

Website pages, generated site output, SEO metadata, screenshots used only for
site presentation, routine test suites, caches, build artifacts, logs, local
scratch files, and secrets do not belong in this repository.

## Package Rules

- Plugin folder, manifest, and registry names must match exactly.
- Registry entries must use relative `./plugins/<plugin-name>` paths.
- Plugin-packaged skills and agents remain inside their plugin package.
- Routine development tests and fixtures must not ship in plugin packages.
- Generated fallback output must remain project-local and plugin-scoped.
- Destructive or overwrite behavior must require explicit user authorization.

## Validation

Authorized maintainers must run the repository gate before accepting a change:

```powershell
npm run validate
```

The repository root has no open-source license. Individual plugin package
changes remain subject to that package's MIT `LICENSE` and separate
`FAYEGRAM_ASSETS.md` policy. See [LICENSING.md](LICENSING.md).
