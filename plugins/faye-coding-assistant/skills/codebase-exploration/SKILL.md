---
name: codebase-exploration
description: Use only when a repository map, trace, explanation, or pre-change impact analysis is a requested deliverable; not for reads that merely support another workflow. Covers ownership, architecture, execution or data flow, dependencies, and configuration.
---

# Codebase Exploration

## Steps

1. State the question and the smallest repository area likely to answer it.
2. Read project instructions, relevant manifests, and a shallow directory map.
3. Search for concrete symbols, routes, commands, configuration keys, or error text; open only the files needed to follow the path.
4. Trace the path from entry point through important calls, state transitions, data boundaries, and side effects.
5. Locate the tests, configuration, and public contracts that constrain the behavior. Mark gaps or uncertain links as inference.
6. Return a compact map with relative file references. Include a next useful read or question only when it adds material value and the user has not excluded it. Do not add an unsolicited implementation or refactor plan.

## Rules

- Remain read-only. Do not edit files or run commands expected to write builds, generated output, snapshots, dependencies, or caches.
- Prefer targeted search and progressive file reads over broad repository dumps.
- Supporting file reads, symbol searches, and local call tracing remain inside the owning workflow and do not activate this skill. Add exploration alongside another workflow only for a separately requested explanation or impact analysis.
- A request to review completed implementation belongs to `$code-review` or `$phase-implementation-review`, even when the reviewer must trace affected dependencies or execution paths.
- Separate verified evidence from inference and identify unresolved questions.
- Explain current ownership and flow before suggesting changes.
- Move to implementation or fix-authorized debugging only when the request authorizes edits; supporting investigation does not broaden that authority.

## Optional Delegation

Use `faye_coding_analyst` in `exploration` mode only for a bounded read-only slice where delegation reduces context load. If it is unavailable, complete the exploration in the parent.

## Output

```text
Answer:
- concise answer to the exploration question

Map:
- relative path or symbol: responsibility and connection

Evidence:
- file, symbol, or command: verified fact

Unknowns:
- unresolved link or none

Next (optional):
- next useful read or question; omit when excluded or unnecessary
```
