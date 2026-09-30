---
name: reconcile-repository-docs
description: Use to reconcile repository-wide documentation with current repository state, typically after development or before release; not for incidental docs work or a bounded document edit. It may update docs within scope.
---

# Reconcile Repository Docs

Keep the work bounded to documentation and necessary documentation-discovery metadata; inspecting source for evidence does not authorize behavioral code changes.

## Preserve Scope and Establish Current State

- Follow the user's requested coverage and the repository's applicable instructions and documentation conventions.
- For a post-development pass, use the accepted change set as the initial impact map, then check repository-level entry docs, indexes, and status records for affected or contradictory claims.
- Treat explicit user direction and accepted project decisions as authoritative. Check factual claims against current source, manifests, configuration, validation evidence, and release state.
- When evidence conflicts about intended behavior or status, retain the affected material and report the ambiguity instead of silently choosing a version of truth.
- Keep any inventory internal unless the user requests a durable artifact. For a small repository, inspect and update directly without introducing a formal process.

## Classify Before Changing

Classify each relevant document or entry by its continuing purpose:

- **Current:** retain without churn.
- **Missing:** add only when supported current behavior or status would otherwise remain undocumented within the requested scope.
- **Stale but useful:** update to the supported current state.
- **Active development material:** move only when the requested cleanup covers organization and a managed development location is appropriate.
- **Historical record:** preserve its original decision or snapshot; clarify historical status when readers could mistake it for current guidance.
- **Obsolete:** remove only when it has no continuing reference or historical value and version control makes recovery practical.
- **Ambiguous:** retain and report rather than guessing.

A broad reconciliation request authorizes coherent documentation edits within its stated scope. It does not independently authorize policy changes, code fixes, commits, or external publication.

## Organize and Move Safely

- Use an explicit destination exactly when the user provides one. Otherwise, follow the repository's established documentation root and taxonomy.
- If active development material needs a managed location and no such folder exists, use `development/` beneath the established documentation root. Do not rename `doc/` to `docs/`, or create a parallel documentation root, merely to follow a generic convention.
- Do not invent an archive hierarchy for ambiguous historical material. Keep it in place with a clear historical label unless the repository already has an archive convention or the user requests one.
- Preserve file history where practical and update affected indexes, relative links, and path metadata whose purpose is documentation discovery.
- Treat generated documentation as output. Update its source or generator when that work is authorized; otherwise leave the output unchanged and report the mismatch.

## Handle Instruction Files Deliberately

Read applicable `AGENTS.md` and equivalent instruction files for constraints, but do not treat them as ordinary status documentation. Edit an instruction file only when the user requested instruction alignment and a persistent repository rule is demonstrably stale or missing. Keep it concise and exclude temporary status, duplicated guidance, and one-off implementation details.

## Check Markdown References When Material

Prefer an existing repository Markdown or link validator when it covers the requested surface. Otherwise, use the bundled read-only checker only when the reconciliation includes repository-wide reference integrity or documentation moves or renames:

```text
node <skill-root>/scripts/check-document-references.mjs --root <repo-root>
node <skill-root>/scripts/check-document-references.mjs --root <repo-root> --target <repo-relative-path>
node <skill-root>/scripts/check-document-references.mjs --root <repo-root> --strict
```

Use the ordinary audit while locating issues or inbound references and `--strict` after authorized repairs. The checker reads `.md` and `.mdx` files, prints to stdout, and does not edit the repository or check external URLs, heading anchors, HTML links, MDX imports, reference-label usage, or complete Markdown conformance. Its results are reference evidence only; they do not decide whether documentation is current, historical, obsolete, removable, or ready to archive. Do not run it for every bounded documentation edit.

## Verify, Commit, and Stop

- Use existing Markdown, link, schema, generated-content, and repository validators that cover the changed surfaces. Do not create new testing machinery for a routine documentation pass.
- Search for affected old paths, names, versions, and contradictory current-status claims when those checks provide useful evidence.
- Stop when the documentation in scope agrees with the supported repository state, authorized moves and removals are resolved, affected references are repaired, and the cheapest suitable validation passes.
- Commit only when the user asks. Preserve unrelated changes, stage only the documentation pass and necessary reference or metadata updates, inspect the staged diff, and do not push without separate authorization.

Report added, updated, moved, removed, intentionally retained, or unresolved material only when those categories are present. Include validation evidence and the commit hash when applicable; do not create another report file by default.
