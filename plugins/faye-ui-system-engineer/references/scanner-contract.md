# Scanner Contract

- Supported extensions: `.css`, `.htm`, `.html`, `.js`, `.jsx`, `.less`,
  `.mjs`, `.scss`, `.svelte`, `.ts`, `.tsx`, and `.vue`.
- The default maximum file size is 1 MiB. `--max-file-size` accepts a positive
  integer number of bytes or an integer with a `KiB` or `MiB` suffix. Files
  larger than the effective limit are skipped with a diagnostic.
- Default excluded directories: `.cache`, `.git`, `.next`, `.nuxt`,
  `.svelte-kit`, `build`, `coverage`, `dist`, `dist-types`, `generated`,
  `node_modules`, `out`, `temp`, `tmp`, and `vendor`. `--exclude-dir` adds an
  exact name and `--include-dir` removes an exact name from this default set.
- An explicit `--scope` may target a directory whose name is excluded. That
  scope root is inspected, while matching nested directories remain excluded.
- JSON reports expose the normalized effective policy as `sourcePolicy`; text
  reports print the same maximum byte count and sorted exclusion names.
- The root and explicit scopes are resolved to canonical paths. Explicit links
  are accepted only when both their supplied and resolved paths stay inside the
  root. Links found during directory traversal are skipped.
- Source text must be valid UTF-8. Content is treated as binary-like when it
  contains a NUL byte or more than 10% disallowed ASCII control bytes.
- Ignore files are not interpreted. Built-in exclusions apply, but a source
  named by `.gitignore` or another ignore file is still scanned.
- Source policy is CLI-only. Repository configuration files and environment
  variables are not read as policy controls.
- Findings describe inspected UI-source signals. Diagnostics describe
  incomplete coverage or scanner input problems and do not contribute to
  finding totals.
- Missing `package.json` files are valid. Stack detection merges the root
  manifest with manifests applicable to explicit scopes and discovered source
  files. Invalid or unreadable manifests emit path-specific diagnostics and
  contribute no dependency-derived signals.
- Discovered package manifests follow the traversal link policy: internal,
  external, and dangling manifest links are skipped. Regular manifests must
  resolve inside the canonical root. Skips emit an
  `unsafe-package-manifest-skipped` warning diagnostic without dependency
  signals, external target paths, or a failing exit status.
- Analysis uses a dependency-free structural model for active style
  declarations, multiline markup, common React/Vue/Svelte/HTML attributes, and
  explicit DOM factory calls. Malformed structures produce
  `source-analysis-incomplete` diagnostics. The scanner does not claim
  framework-compiler, data-flow, product-intent, or runtime understanding. See
  [scanner-rules.md](scanner-rules.md)
  for every finding rule and its limitations.
- Named framework syntax above describes source forms the scanner recognizes;
  it does not prescribe a framework, component package, or state library.
