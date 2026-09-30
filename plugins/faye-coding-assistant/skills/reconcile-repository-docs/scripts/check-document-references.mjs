#!/usr/bin/env node

// Audit supported local Markdown references without editing the repository.

import {
    lstatSync,
    readFileSync,
    realpathSync,
    statSync
} from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
    comparePaths,
    fromDisplayPath
} from "../../../scripts/lib/repository-paths.mjs";
import { discoverDocumentPaths } from "./lib/document-discovery.mjs";
import { extractMarkdownReferences } from "./lib/markdown-references.mjs";
import {
    isContainedPath,
    normalizeTargetArgument,
    validateReference
} from "./lib/reference-validation.mjs";

const DEFAULT_MAX_RESULTS = 200;
const USAGE = `Usage: node check-document-references.mjs --root <repository> [options]

Options:
  --target <path>       Report inbound references to a repository-relative path; repeatable.
  --json                Emit structured JSON instead of text.
  --strict              Exit 1 when definite integrity issues are found.
  --max-results <count> Limit detailed findings and inbound entries (default: 200).
  --help                Show this help.

Coverage: .md and .mdx inline links, images, and reference-definition destinations.
The checker does not validate external URLs, heading anchors, HTML links, MDX imports,
reference-label usage, or complete Markdown conformance.`;

export function parseArgs(args) {
    const options = {
        root: null,
        targets: [],
        json: false,
        strict: false,
        maxResults: DEFAULT_MAX_RESULTS,
        help: false
    };

    for (let index = 0; index < args.length; index += 1) {
        const argument = args[index];
        if (argument === "--help" || argument === "-h") {
            options.help = true;
        } else if (argument === "--json") {
            options.json = true;
        } else if (argument === "--strict") {
            options.strict = true;
        } else if (argument === "--root") {
            options.root = readOptionValue(args, ++index, "--root");
        } else if (argument === "--target") {
            options.targets.push(readOptionValue(args, ++index, "--target"));
        } else if (argument === "--max-results") {
            const value = readOptionValue(args, ++index, "--max-results");
            const parsedValue = Number(value);
            if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(parsedValue)) {
                throw new Error("--max-results must be a positive integer");
            }
            options.maxResults = parsedValue;
        } else {
            throw new Error(`Unknown option: ${argument}`);
        }
    }

    if (!options.help && !options.root) {
        throw new Error("--root is required");
    }
    return options;
}

export function scanDocumentReferences(options, dependencies = {}) {
    const absoluteRoot = realpathSync(resolve(options.root));
    if (!statSync(absoluteRoot).isDirectory()) {
        throw new Error("--root must identify a directory");
    }

    const discover = dependencies.discoverDocumentPaths ?? discoverDocumentPaths;
    const extraction = dependencies.extractMarkdownReferences ?? extractMarkdownReferences;
    const validation = dependencies.validateReference ?? validateReference;
    const discovered = discover(absoluteRoot, dependencies.discoveryOptions);
    const targetQueries = [...new Set(
        options.targets.map((target) => normalizeTargetArgument(absoluteRoot, target))
    )].sort(comparePaths);
    const findings = [];
    const inboundReferences = [];
    const skippedByCategory = new Map();
    let documentsScanned = 0;
    let referencesFound = 0;
    let validLocalReferences = 0;

    for (const documentPath of discovered.paths) {
        const absoluteDocumentPath = resolve(absoluteRoot, fromDisplayPath(documentPath));
        const sourceStat = lstatSync(absoluteDocumentPath);
        if (sourceStat.isSymbolicLink()) {
            const realSource = realpathSync(absoluteDocumentPath);
            if (!isContainedPath(absoluteRoot, realSource)) {
                findings.push({
                    category: "source-symlink-escape",
                    source: documentPath,
                    line: 1,
                    destination: documentPath,
                    resolvedTarget: null,
                    message: "The document source resolves outside the repository root."
                });
                continue;
            }
        }

        const markdown = readFileSync(absoluteDocumentPath, "utf8");
        documentsScanned += 1;
        for (const reference of extraction(markdown)) {
            referencesFound += 1;
            const result = validation(absoluteRoot, documentPath, reference.destination);
            const record = {
                category: result.category,
                source: documentPath,
                line: reference.line,
                kind: reference.kind,
                destination: reference.destination,
                resolvedTarget: result.resolvedTarget,
                message: result.message
            };

            if (result.status === "issue") {
                findings.push(record);
            } else if (result.status === "valid") {
                validLocalReferences += 1;
            } else {
                skippedByCategory.set(
                    result.category,
                    (skippedByCategory.get(result.category) ?? 0) + 1
                );
            }

            if (targetQueries.length > 0 && targetQueries.some((target) => (
                target === result.attemptedTarget || target === result.resolvedTarget
            ))) {
                inboundReferences.push({
                    target: targetQueries.find((target) => (
                        target === result.attemptedTarget || target === result.resolvedTarget
                    )),
                    source: documentPath,
                    line: reference.line,
                    kind: reference.kind,
                    destination: reference.destination
                });
            }
        }
    }

    findings.sort(compareRecords);
    inboundReferences.sort(compareRecords);
    const limitedFindings = findings.slice(0, options.maxResults);
    const limitedInboundReferences = inboundReferences.slice(0, options.maxResults);

    return {
        root: ".",
        coverage: {
            extensions: [".md", ".mdx"],
            syntax: ["inline-link", "image", "reference-definition"],
            limitations: [
                "external URLs",
                "heading anchors",
                "HTML links",
                "MDX imports",
                "reference-label usage",
                "complete Markdown conformance"
            ]
        },
        discovery: discovered.discovery,
        summary: {
            documentsDiscovered: discovered.paths.length,
            documentsScanned,
            referencesFound,
            validLocalReferences,
            issueCount: findings.length,
            skippedByCategory: Object.fromEntries(
                [...skippedByCategory.entries()].sort(([left], [right]) => comparePaths(left, right))
            ),
            findingsReturned: limitedFindings.length,
            findingsOmitted: findings.length - limitedFindings.length,
            inboundReferencesFound: inboundReferences.length,
            inboundReferencesReturned: limitedInboundReferences.length,
            inboundReferencesOmitted: inboundReferences.length - limitedInboundReferences.length
        },
        targetQueries,
        findings: limitedFindings,
        inboundReferences: limitedInboundReferences
    };
}

export function formatTextReport(report) {
    const lines = [
        "Markdown reference check",
        "",
        `Root: ${report.root}`,
        `Discovery: ${formatDiscovery(report.discovery)}`,
        `Documents scanned: ${report.summary.documentsScanned}`,
        `Supported references found: ${report.summary.referencesFound}`,
        `Valid local references: ${report.summary.validLocalReferences}`,
        `Definite issues: ${report.summary.issueCount}`
    ];

    const skipped = Object.entries(report.summary.skippedByCategory);
    if (skipped.length > 0) {
        lines.push(`Skipped: ${skipped.map(([category, count]) => `${category}=${count}`).join(", ")}`);
    }

    lines.push("", "Findings:");
    if (report.findings.length === 0) {
        lines.push("- No broken local references found within supported syntax.");
    } else {
        for (const finding of report.findings) {
            lines.push(
                `- [${finding.category}] ${singleLine(finding.source)}:${finding.line} -> ${singleLine(finding.destination)} - ${singleLine(finding.message)}`
            );
        }
        if (report.summary.findingsOmitted > 0) {
            lines.push(`- ${report.summary.findingsOmitted} additional finding(s) omitted by --max-results.`);
        }
    }

    if (report.targetQueries.length > 0) {
        lines.push("", "Inbound references:");
        if (report.inboundReferences.length === 0) {
            lines.push("- None found within supported syntax.");
        } else {
            for (const reference of report.inboundReferences) {
                lines.push(
                    `- ${singleLine(reference.target)} <- ${singleLine(reference.source)}:${reference.line} (${reference.kind})`
                );
            }
            if (report.summary.inboundReferencesOmitted > 0) {
                lines.push(
                    `- ${report.summary.inboundReferencesOmitted} additional inbound reference(s) omitted by --max-results.`
                );
            }
        }
    }

    lines.push(
        "",
        "Coverage: .md/.mdx inline links, images, and reference definitions only; external URLs, heading anchors, HTML links, MDX imports, reference-label usage, and complete Markdown conformance are not checked."
    );
    return `${lines.join("\n")}\n`;
}

export function runCli(args = process.argv.slice(2), streams = process) {
    let options;
    try {
        options = parseArgs(args);
        if (options.help) {
            streams.stdout.write(`${USAGE}\n`);
            return 0;
        }

        const report = scanDocumentReferences(options);
        streams.stdout.write(options.json
            ? `${JSON.stringify(report, null, 2)}\n`
            : formatTextReport(report));
        return options.strict && report.summary.issueCount > 0 ? 1 : 0;
    } catch (error) {
        streams.stderr.write(`Error: ${error?.message ?? error}\n`);
        return 2;
    }
}

function readOptionValue(args, index, option) {
    const value = args[index];
    if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${option}`);
    }
    return value;
}

function formatDiscovery(discovery) {
    if (discovery.mode === "git") {
        return "Git tracked and non-ignored files";
    }
    return `filesystem fallback (${discovery.fallbackReason}; Git ignore rules not applied)`;
}

function compareRecords(left, right) {
    return comparePaths(left.source, right.source)
        || left.line - right.line
        || comparePaths(left.category ?? left.target, right.category ?? right.target)
        || comparePaths(left.destination, right.destination);
}

function singleLine(value) {
    return String(value).replace(/[\r\n]+/g, " ");
}

const scriptPath = fileURLToPath(import.meta.url);
const invokedPath = process.argv[1] ? resolve(process.argv[1]) : null;
if (invokedPath && invokedPath.toLowerCase() === resolve(scriptPath).toLowerCase()) {
    process.exitCode = runCli();
}
