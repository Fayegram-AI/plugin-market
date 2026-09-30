/**
 * Dependency-free, deterministic UI-system source scanner.
 *
 * Structural analysis recognizes the source forms required by the public rule
 * catalog. Findings remain review leads and never claim runtime truth.
 */

import path from "node:path";
import {
    countBySeverity,
    createDiagnostic,
    sortDiagnostics
} from "./report-model.mjs";
import {
    evaluateFileRules,
    styleClusterOccurrences
} from "./rule-evaluators.mjs";
import { getRuleDefinition } from "./rule-catalog.mjs";
import { analyzeSourceStructure } from "./source-analysis.mjs";
import {
    collectSourceFiles,
    createSourcePolicy,
    readSourceText,
    resolveAuditTargets
} from "./source-policy.mjs";
import { readStackSignals } from "./stack-signals.mjs";

const SCHEMA_VERSION = 1;

export async function auditUiSystem(options, adapters = {}) {
    const sourceReader = adapters.readSourceText ?? readSourceText;
    const sourcePolicy = createSourcePolicy(options.sourcePolicy);
    const { root, scopes } = await resolveAuditTargets(
        options.root,
        options.scopes ?? []
    );
    const filePaths = await collectSourceFiles(scopes, sourcePolicy);
    const diagnostics = [];
    const findings = [];
    const styleClusters = new Map();
    const domFactoryOccurrences = [];
    const metrics = createMetrics();

    for (const filePath of filePaths) {
        const relativePath = toRelativePath(root, filePath);
        const sourceResult = await sourceReader(
            filePath,
            relativePath,
            sourcePolicy
        );

        if (sourceResult.diagnostic) {
            metrics.skippedFiles += 1;
            diagnostics.push(sourceResult.diagnostic);
            continue;
        }

        const extension = path.extname(filePath).toLowerCase();
        const analysis = analyzeSourceStructure({
            extension,
            relativePath,
            source: sourceResult.source
        });
        metrics.filesScanned += 1;
        metrics.linesScanned += analysis.lines;
        metrics.sourceExtensions[extension] = (
            metrics.sourceExtensions[extension] ?? 0
        ) + 1;
        addAnalysisMetrics(metrics, analysis.metrics);

        for (const issue of analysis.issues) {
            diagnostics.push(createDiagnostic({
                diagnosticId: "source-analysis-incomplete",
                severity: "warning",
                path: relativePath,
                message: "Source structure could not be analyzed completely.",
                evidence: issue
            }));
        }

        for (const match of evaluateFileRules(analysis)) {
            findings.push(createFinding(match.ruleId, {
                filePath: relativePath,
                line: match.line,
                evidence: match.evidence
            }));
        }

        collectStyleClusters(
            relativePath,
            styleClusterOccurrences(analysis),
            styleClusters
        );
        domFactoryOccurrences.push(...analysis.domFactories.map((item) => ({
            ...item,
            path: relativePath
        })));
    }

    appendClusterFindings(findings, styleClusters);
    appendDomFactoryFinding(findings, domFactoryOccurrences);
    appendResponsiveFinding(findings, metrics);
    sortFindings(findings);

    const stackResult = await readStackSignals(
        root,
        scopes,
        filePaths,
        metrics.sourceExtensions
    );
    diagnostics.push(...stackResult.diagnostics);
    sortDiagnostics(diagnostics);
    const normalizedScopes = scopes
        .map((scope) => toRelativePath(root, scope))
        .sort((left, right) => left.localeCompare(right));

    return {
        schemaVersion: SCHEMA_VERSION,
        root: normalizePath(root),
        scopes: normalizedScopes,
        sourcePolicy,
        stackSignals: stackResult.stackSignals,
        summary: {
            filesScanned: metrics.filesScanned,
            linesScanned: metrics.linesScanned,
            findings: findings.length,
            diagnostics: diagnostics.length,
            bySeverity: countBySeverity(findings),
            diagnosticsBySeverity: countBySeverity(diagnostics),
            tokenDefinitions: metrics.tokenDefinitions,
            tokenReferences: metrics.tokenReferences,
            mediaQueries: metrics.mediaQueries,
            containerQueries: metrics.containerQueries,
            skippedFiles: metrics.skippedFiles
        },
        findings,
        diagnostics
    };
}

function createMetrics() {
    return {
        filesScanned: 0,
        linesScanned: 0,
        tokenDefinitions: 0,
        tokenReferences: 0,
        mediaQueries: 0,
        containerQueries: 0,
        skippedFiles: 0,
        sourceExtensions: {}
    };
}

function addAnalysisMetrics(metrics, analysisMetrics) {
    for (const name of [
        "tokenDefinitions",
        "tokenReferences",
        "mediaQueries",
        "containerQueries"
    ]) {
        metrics[name] += analysisMetrics[name];
    }
}

function collectStyleClusters(relativePath, occurrences, clusters) {
    for (const occurrence of occurrences) {
        const existing = clusters.get(occurrence.signature) ?? [];
        existing.push({
            path: relativePath,
            line: occurrence.line,
            selector: occurrence.selector
        });
        clusters.set(occurrence.signature, existing);
    }
}

function appendClusterFindings(findings, styleClusters) {
    const clusters = [...styleClusters.values()]
        .filter((occurrences) => occurrences.length >= 2)
        .sort(compareOccurrences);

    for (const occurrences of clusters) {
        const uniqueSelectors = new Set(occurrences.map((item) => (
            `${item.path}:${item.selector}`
        )));

        if (uniqueSelectors.size < 2) {
            continue;
        }

        const first = occurrences[0];
        findings.push(createFinding("repeated-style-cluster", {
            filePath: first.path,
            line: first.line,
            message: `Repeated declaration cluster appears under ${uniqueSelectors.size} selectors; review primitive ownership.`,
            evidence: first.selector
        }));
    }
}

function appendDomFactoryFinding(findings, occurrences) {
    if (occurrences.length < 3) {
        return;
    }

    occurrences.sort(compareOccurrence);
    const first = occurrences[0];
    const fileCount = new Set(occurrences.map((item) => item.path)).size;

    findings.push(createFinding("repeated-control-factory", {
        filePath: first.path,
        line: first.line,
        message: `${occurrences.length} native control factories across ${fileCount} files; review shared primitive ownership.`,
        evidence: first.evidence
    }));
}

function appendResponsiveFinding(findings, metrics) {
    if (metrics.mediaQueries === 0 || metrics.containerQueries > 0) {
        return;
    }

    findings.push(createFinding("viewport-only-responsive", {
        filePath: ".",
        line: 1,
        evidence: `${metrics.mediaQueries} media queries, 0 container queries`
    }));
}

function createFinding(ruleId, options) {
    const rule = getRuleDefinition(ruleId);

    return {
        ruleId,
        severity: rule.severity,
        path: options.filePath,
        line: options.line,
        message: options.message ?? rule.message,
        evidence: options.evidence
    };
}

function sortFindings(findings) {
    findings.sort((left, right) => (
        left.path.localeCompare(right.path)
        || left.line - right.line
        || left.ruleId.localeCompare(right.ruleId)
        || left.evidence.localeCompare(right.evidence)
    ));
}

function compareOccurrences(left, right) {
    return compareOccurrence(left[0], right[0]);
}

function compareOccurrence(left, right) {
    return left.path.localeCompare(right.path)
        || left.line - right.line
        || (left.selector ?? left.evidence).localeCompare(
            right.selector ?? right.evidence
        );
}

function toRelativePath(root, target) {
    const relativePath = path.relative(root, target);
    return relativePath === "" ? "." : normalizePath(relativePath);
}

function normalizePath(target) {
    return target.replaceAll(path.sep, "/");
}
