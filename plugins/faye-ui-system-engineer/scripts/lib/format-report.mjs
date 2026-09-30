/**
 * Render a compact, deterministic human-readable audit report.
 */

export function formatTextReport(report) {
    const lines = [
        "Faye UI System Audit",
        `Root: ${report.root}`,
        `Scopes: ${report.scopes.join(", ")}`,
        `Maximum file size: ${report.sourcePolicy.maxFileBytes} bytes`,
        `Excluded directories: ${formatList(report.sourcePolicy.excludedDirectories)}`,
        `Frameworks: ${report.stackSignals.frameworks.join(", ")}`,
        `Styling: ${formatList(report.stackSignals.styling)}`,
        `UI dependency signals: ${formatList(report.stackSignals.uiLibraries)}`,
        `Files: ${report.summary.filesScanned} (${report.summary.linesScanned} lines)`,
        `Findings: ${report.summary.findings} (${report.summary.bySeverity.warning} warning, ${report.summary.bySeverity.info} info)`,
        `Diagnostics: ${report.summary.diagnostics} (${report.summary.diagnosticsBySeverity.warning} warning, ${report.summary.diagnosticsBySeverity.info} info)`,
        `Tokens: ${report.summary.tokenDefinitions} definitions, ${report.summary.tokenReferences} references`,
        `Responsive: ${report.summary.mediaQueries} media queries, ${report.summary.containerQueries} container queries`,
        `Skipped files: ${report.summary.skippedFiles}`,
        ""
    ];

    if (report.diagnostics.length > 0) {
        lines.push("Diagnostics");

        for (const diagnostic of report.diagnostics) {
            lines.push(
                `[${diagnostic.severity}] ${diagnostic.path} ${diagnostic.diagnosticId}`,
                `  ${diagnostic.message}`,
                `  Evidence: ${diagnostic.evidence}`
            );
        }

        lines.push("");
    }

    if (report.findings.length === 0) {
        lines.push("No heuristic findings.");
        return lines.join("\n");
    }

    lines.push("Findings");

    for (const finding of report.findings) {
        lines.push(
            `[${finding.severity}] ${finding.path}:${finding.line} ${finding.ruleId}`,
            `  ${finding.message}`,
            `  Evidence: ${finding.evidence}`
        );
    }

    return lines.join("\n");
}

function formatList(values) {
    return values.length > 0 ? values.join(", ") : "none detected";
}
