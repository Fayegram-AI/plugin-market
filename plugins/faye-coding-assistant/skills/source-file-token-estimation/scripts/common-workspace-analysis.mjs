// Shared read-only helpers for source-file token estimation.

import {
    mkdirSync,
    readFileSync,
    writeFileSync
} from "node:fs";
import { dirname, resolve } from "node:path";
import { guardManagedOutput } from "../../../scripts/lib/workspace-storage.mjs";
import {
    DEFAULT_CHUNK_SIZES,
    DEFAULT_MIN_KB,
    parseChunkSizes
} from "./lib/analysis-options.mjs";
import {
    discoverCandidatePaths,
    isNoisePath,
    isScriptFile,
    normalizeRelPath,
    resolveContainedFile
} from "./lib/workspace-discovery.mjs";

export {
    DEFAULT_CHUNK_SIZES,
    DEFAULT_MIN_KB,
    parseChunkSizes
} from "./lib/analysis-options.mjs";

export {
    discoverCandidatePaths,
    isNoisePath,
    isScriptFile,
    normalizeRelPath,
    resolveContainedFile
} from "./lib/workspace-discovery.mjs";

export const TOKEN_BYTES = 4;
export const OVERHEAD_TOKENS = 45;

const CATEGORY_ORDER = new Map([
    ["production", 0],
    ["test", 1],
    ["debug", 2]
]);

const SCOPE_MARKERS = new Set([
    "agents",
    "apps",
    "libraries",
    "libs",
    "modules",
    "packages",
    "plugins",
    "services",
    "skills"
]);

export function categorize(relPath) {
    const parts = normalizeRelPath(relPath).toLowerCase().split("/").filter(Boolean);
    const name = parts.at(-1) ?? "";
    const testParts = new Set(["__tests__", "e2e", "spec", "test", "tests"]);
    const debugParts = new Set(["dbg", "debug", "playground", "sandbox", "scratch", "temp", "tmp"]);

    if (parts.slice(0, -1).some((part) => (
        testParts.has(part)
        || /(?:^|[._-])(?:specs?|tests?)$/.test(part)
    ))) {
        return "test";
    }

    if (/(?:^|[._-])(?:e2e|spec|tests?)(?=[._-]|$)/.test(name)) {
        return "test";
    }

    if (parts.slice(0, -1).some((part) => (
        debugParts.has(part)
        || /(?:^|[._-])(?:dbg|debug|playground|sandbox|scratch|temp|tmp)$/.test(part)
    ))) {
        return "debug";
    }

    if (/(?:^|[._-])(?:dbg|debug|scratch|temp|tmp)(?=[._-]|$)/.test(name)) {
        return "debug";
    }

    return "production";
}

export function inferScope(relPath) {
    const parts = normalizeRelPath(relPath).split("/").filter(Boolean);
    const lowerParts = parts.map((part) => part.toLowerCase());

    if (parts.length <= 1) {
        return "(root)";
    }

    const markerIndex = lowerParts.findIndex((part) => SCOPE_MARKERS.has(part));
    if (markerIndex >= 0 && markerIndex + 1 < parts.length - 1) {
        return parts.slice(0, markerIndex + 2).join("/");
    }

    if (lowerParts[0] === "src" && parts.length > 2) {
        return parts.slice(0, 2).join("/");
    }

    return parts[0];
}

export function countLines(buffer) {
    if (buffer.length === 0) {
        return 0;
    }

    let lines = 0;
    for (const byte of buffer) {
        if (byte === 10) {
            lines += 1;
        }
    }

    return buffer.at(-1) === 10 ? lines : lines + 1;
}

export function scanWorkspace(root, minKb = DEFAULT_MIN_KB) {
    const absoluteRoot = resolve(root);
    const minBytes = Math.trunc(minKb * 1024);
    const records = [];
    const { paths, discovery } = discoverCandidatePaths(absoluteRoot);

    for (const candidate of paths) {
        const containedFile = resolveContainedFile(absoluteRoot, candidate);
        if (!containedFile) {
            continue;
        }

        const relPath = containedFile.relativePath;

        if (isNoisePath(relPath) || !isScriptFile(relPath)) {
            continue;
        }

        const size = containedFile.stat.size;
        if (size <= minBytes) {
            continue;
        }

        const data = readFileSync(containedFile.absolutePath);
        const lines = countLines(data);
        const tokens = size / TOKEN_BYTES;

        records.push({
            path: relPath,
            scope: inferScope(relPath),
            category: categorize(relPath),
            bytes: size,
            kb: size / 1024,
            lines,
            tokens,
            tokenDensity: tokens / Math.max(lines, 1)
        });
    }

    return {
        records: records.sort((left, right) => (
            left.scope.localeCompare(right.scope)
            || (CATEGORY_ORDER.get(left.category) ?? 99) - (CATEGORY_ORDER.get(right.category) ?? 99)
            || right.bytes - left.bytes
            || left.path.localeCompare(right.path)
        )),
        discovery
    };
}

export function aggregate(records) {
    return {
        files: records.length,
        kb: records.reduce((sum, item) => sum + item.kb, 0),
        lines: records.reduce((sum, item) => sum + item.lines, 0),
        tokens: records.reduce((sum, item) => sum + item.tokens, 0)
    };
}

export function groupTotals(records, keyName) {
    const groups = new Map();

    for (const record of records) {
        if (!groups.has(record[keyName])) {
            groups.set(record[keyName], []);
        }
        groups.get(record[keyName]).push(record);
    }

    return [...groups.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, items]) => [key, aggregate(items)]);
}

export function splitFileCost(record, chunkSize, touchedChunks) {
    if (record.lines <= chunkSize) {
        return record.tokens;
    }

    const chunkCount = Math.ceil(record.lines / chunkSize);
    const actualTouched = Math.min(touchedChunks, chunkCount);
    const contentTokens = Math.min(record.lines, chunkSize) * record.tokenDensity * actualTouched;
    const overheadTokens = OVERHEAD_TOKENS * actualTouched;

    return Math.min(record.tokens, contentTokens) + overheadTokens;
}

export function simulatedTotal(records, chunkSize, mode) {
    return records.reduce((sum, record) => {
        if (mode === "lower") {
            return sum + splitFileCost(record, chunkSize, 1);
        }

        if (mode === "weighted") {
            return sum
                + 0.55 * splitFileCost(record, chunkSize, 1)
                + 0.30 * splitFileCost(record, chunkSize, 2)
                + 0.15 * splitFileCost(record, chunkSize, 3);
        }

        throw new Error(`Unknown simulation mode: ${mode}`);
    }, 0);
}

export function reductionPercent(currentTokens, simulatedTokens) {
    if (currentTokens <= 0) {
        return 0;
    }

    return ((currentTokens - simulatedTokens) / currentTokens) * 100;
}

export function formatInt(value) {
    return Math.round(Number(value)).toLocaleString("en-US");
}

export function formatKb(value) {
    return Number(value).toLocaleString("en-US", {
        maximumFractionDigits: 1,
        minimumFractionDigits: 1
    });
}

export function formatPct(value) {
    return `${Number(value).toLocaleString("en-US", {
        maximumFractionDigits: 1,
        minimumFractionDigits: 1
    })}%`;
}

export function markdownEscape(value) {
    return [...String(value)].map((character) => {
        if (character === "|") {
            return "&#124;";
        }
        if (character === "`") {
            return "&#96;";
        }
        if (character === "\r") {
            return "\\r";
        }
        if (character === "\n") {
            return "\\n";
        }

        const codePoint = character.codePointAt(0);
        if (codePoint < 32 || codePoint === 127) {
            return `\\u${codePoint.toString(16).padStart(4, "0")}`;
        }
        return character;
    }).join("");
}

export function recommendation(record) {
    if (record.category === "debug") {
        return "Ignore or archive if stale";
    }

    if (record.category === "test") {
        return record.lines >= 1500 || record.kb >= 80
            ? "Split by fixture or behavior"
            : "Defer unless edited often";
    }

    if (record.lines >= 1500 || record.kb >= 80) {
        return "Split along stable module boundaries";
    }

    if (record.lines >= 900 || record.kb >= 45) {
        return "Defer; split when touched";
    }

    return "Ignore";
}

export function topOffenders(records, category, limit = 5) {
    return records
        .filter((record) => record.category === category)
        .sort((left, right) => right.tokens - left.tokens || left.path.localeCompare(right.path))
        .slice(0, limit);
}

export function buildReport(records, root, chunkSizes, minKb = DEFAULT_MIN_KB, discovery = {}) {
    const sizes = parseChunkSizes(chunkSizes);
    const allTotals = aggregate(records);
    const categoryTotals = new Map(groupTotals(records, "category"));
    const packageTotals = groupTotals(records, "scope");
    const productionRecords = records.filter((record) => record.category === "production");
    const testRecords = records.filter((record) => record.category === "test");
    const productionTotals = aggregate(productionRecords);
    const testTotals = aggregate(testRecords);
    const largestRecord = [...records].sort((left, right) => right.tokens - left.tokens)[0];
    const lines = [
        "# Source File Token Estimation",
        "",
        "## 1. Scope And Assumptions",
        "",
        "- Root: `.` (requested repository root).",
        `- Qualifying files: script/source-like files above \`${minKb}KB\`.`,
        discoverySummary(discovery),
        exclusionSummary(discovery),
        "- Token proxy: `bytes / 4` per file; estimates are not tokenizer-accurate.",
        `- Split overhead: \`${OVERHEAD_TOKENS}\` tokens per touched split chunk/module.`,
        "- Scope: potential source-context footprint, not actual Codex usage, billing, build speed, or runtime speed.",
        "",
        "## 2. Overall Totals",
        "",
        "| Files | KB | Lines | Estimated full-file tokens | Largest file estimate |",
        "|---:|---:|---:|---:|---:|",
        `| ${allTotals.files.toLocaleString("en-US")} | ${formatKb(allTotals.kb)} | ${allTotals.lines.toLocaleString("en-US")} | ${formatInt(allTotals.tokens)} | ${largestRecord ? formatInt(largestRecord.tokens) : "0"} |`,
        ""
    ];

    lines.push(...buildCategorySection(categoryTotals));
    lines.push(...buildPackageSection(packageTotals));
    lines.push(...buildSimulationSection(records, productionRecords, testRecords, allTotals, productionTotals, testTotals, sizes));
    lines.push(...buildOffenderSection(records));
    lines.push(...buildFileTable(records));
    lines.push(...buildJudgmentSection(productionRecords, testRecords, allTotals, productionTotals));

    return `${lines.join("\n").trimEnd()}\n`;
}

function discoverySummary(discovery) {
    if (discovery.mode === "git") {
        return "- Discovery: Git tracked and untracked file inventory.";
    }

    if (discovery.mode === "filesystem") {
        let reason = "Git inventory unavailable";
        if (discovery.fallbackReason === "git-unavailable") {
            reason = "Git unavailable";
        } else if (discovery.fallbackReason === "not-a-git-repository") {
            reason = "not a Git repository";
        }
        return `- Discovery: filesystem fallback (${reason}).`;
    }

    return "- Discovery: metadata unavailable.";
}

function exclusionSummary(discovery) {
    if (discovery.gitIgnoreApplied === true) {
        return "- Exclusions: Git ignore rules plus built-in repo-noise and generated folders.";
    }

    if (discovery.gitIgnoreApplied === false) {
        return "- Exclusions: built-in repo-noise and generated folders; Git ignore rules were not applied.";
    }

    return "- Exclusions: built-in repo-noise and generated folders; Git ignore status unavailable.";
}

function buildCategorySection(categoryTotals) {
    const lines = [
        "## 3. Category Totals",
        "",
        "| Category | Files | KB | Lines | Estimated full-file tokens |",
        "|---|---:|---:|---:|---:|"
    ];

    for (const category of ["production", "test", "debug"]) {
        const totals = categoryTotals.get(category) ?? { files: 0, kb: 0, lines: 0, tokens: 0 };
        const label = category === "production" ? "production / real" : category;
        lines.push(`| ${label} | ${totals.files.toLocaleString("en-US")} | ${formatKb(totals.kb)} | ${totals.lines.toLocaleString("en-US")} | ${formatInt(totals.tokens)} |`);
    }

    lines.push("");
    return lines;
}

function buildPackageSection(packageTotals) {
    const lines = [
        "## 4. Package-Level Totals",
        "",
        "| Package/module scope | Files | KB | Lines | Estimated full-file tokens |",
        "|---|---:|---:|---:|---:|"
    ];

    for (const [scope, totals] of packageTotals.sort((left, right) => right[1].tokens - left[1].tokens || left[0].localeCompare(right[0]))) {
        lines.push(`| \`${markdownEscape(scope)}\` | ${totals.files.toLocaleString("en-US")} | ${formatKb(totals.kb)} | ${totals.lines.toLocaleString("en-US")} | ${formatInt(totals.tokens)} |`);
    }

    lines.push("");
    return lines;
}

function buildSimulationSection(records, productionRecords, testRecords, allTotals, productionTotals, testTotals, chunkSizes) {
    const lines = [
        "## 5. Refactor Impact Simulation",
        "",
        "| Chunk lines | All lower | All weighted | Test lower | Test weighted | Production lower | Production weighted |",
        "|---:|---:|---:|---:|---:|---:|---:|"
    ];

    for (const chunkSize of chunkSizes) {
        const allLower = simulatedTotal(records, chunkSize, "lower");
        const allWeighted = simulatedTotal(records, chunkSize, "weighted");
        const testLower = simulatedTotal(testRecords, chunkSize, "lower");
        const testWeighted = simulatedTotal(testRecords, chunkSize, "weighted");
        const productionLower = simulatedTotal(productionRecords, chunkSize, "lower");
        const productionWeighted = simulatedTotal(productionRecords, chunkSize, "weighted");

        lines.push(`| ${chunkSize.toLocaleString("en-US")} | ${formatInt(allLower)} (${formatPct(reductionPercent(allTotals.tokens, allLower))}) | ${formatInt(allWeighted)} (${formatPct(reductionPercent(allTotals.tokens, allWeighted))}) | ${formatInt(testLower)} (${formatPct(reductionPercent(testTotals.tokens, testLower))}) | ${formatInt(testWeighted)} (${formatPct(reductionPercent(testTotals.tokens, testWeighted))}) | ${formatInt(productionLower)} (${formatPct(reductionPercent(productionTotals.tokens, productionLower))}) | ${formatInt(productionWeighted)} (${formatPct(reductionPercent(productionTotals.tokens, productionWeighted))}) |`);
    }

    lines.push("", "Percentages compare hypothetical touched-chunk estimates with the estimated full-file token footprint for that group; they do not represent measured Codex savings.", "");
    return lines;
}

function buildOffenderSection(records) {
    return [
        "## 6. Top Offenders",
        "",
        "### Production / Real",
        "",
        ...buildOffenderTable(topOffenders(records, "production")),
        "",
        "### Test",
        "",
        ...buildOffenderTable(topOffenders(records, "test")),
        "",
        "### Debug",
        "",
        ...buildOffenderTable(topOffenders(records, "debug")),
        ""
    ];
}

function buildOffenderTable(records) {
    if (records.length === 0) {
        return ["No qualifying files."];
    }

    return [
        "| Path | KB | Lines | Estimated tokens | Recommendation |",
        "|---|---:|---:|---:|---|",
        ...records.map((record) => `| \`${markdownEscape(record.path)}\` | ${formatKb(record.kb)} | ${record.lines.toLocaleString("en-US")} | ${formatInt(record.tokens)} | ${recommendation(record)} |`)
    ];
}

function buildFileTable(records) {
    const lines = [
        "## 7. Per-File Table",
        "",
        "| Package/module | Category | KB | Lines | Estimated tokens | Path | Recommendation |",
        "|---|---|---:|---:|---:|---|---|"
    ];

    if (records.length === 0) {
        lines.push("| - | - | 0.0 | 0 | 0 | - | No qualifying files |", "");
        return lines;
    }

    for (const record of records) {
        lines.push(`| \`${markdownEscape(record.scope)}\` | ${record.category} | ${formatKb(record.kb)} | ${record.lines.toLocaleString("en-US")} | ${formatInt(record.tokens)} | \`${markdownEscape(record.path)}\` | ${recommendation(record)} |`);
    }

    lines.push("");
    return lines;
}

function buildJudgmentSection(productionRecords, testRecords, allTotals, productionTotals) {
    const largeProductionCount = productionRecords.filter((record) => record.kb >= 80 || record.lines >= 1500).length;
    const largeTestCount = testRecords.filter((record) => record.kb >= 80 || record.lines >= 1500).length;
    const teamText = productionTotals.tokens >= 50000 || largeProductionCount >= 3
        ? "A team should consider a planned split of the largest production offenders."
        : "A team should split only files that are active collaboration hotspots.";
    const soloText = allTotals.tokens >= 75000 || largeProductionCount >= 2
        ? "A single developer should avoid a full repo-wide refactor and split top active offenders opportunistically."
        : "A single developer should usually defer broad splitting and fix files when they are next touched.";
    const testText = largeTestCount === 0
        ? "No large test hotspot stands out; tests can usually be ignored for source-context refactoring."
        : "Test splits are worthwhile when they reduce repeated fixture/context load; otherwise defer.";

    return [
        "## 8. Practical Judgment",
        "",
        `- Single developer: ${soloText}`,
        `- Development team: ${teamText}`,
        `- Tests: ${testText}`,
        "- Debug files: ignore for refactor payoff unless they are routinely loaded; archive stale debug files outside normal context if appropriate.",
        ""
    ];
}

export function writeExplicitOutput(outputPath, content) {
    const absoluteOutput = guardManagedOutput(outputPath);
    mkdirSync(dirname(absoluteOutput), { recursive: true });
    guardManagedOutput(absoluteOutput);
    writeFileSync(absoluteOutput, content, "utf8");
}
