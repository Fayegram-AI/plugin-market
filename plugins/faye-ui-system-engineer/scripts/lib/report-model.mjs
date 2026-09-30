/**
 * Normalize report diagnostics and deterministic aggregate helpers.
 */

export function createDiagnostic(options) {
    return {
        diagnosticId: options.diagnosticId,
        severity: options.severity,
        path: options.path,
        message: options.message,
        evidence: options.evidence
    };
}

export function sortDiagnostics(diagnostics) {
    diagnostics.sort((left, right) => (
        left.path.localeCompare(right.path)
        || left.diagnosticId.localeCompare(right.diagnosticId)
        || left.evidence.localeCompare(right.evidence)
    ));
}

export function countBySeverity(items) {
    const counts = {
        warning: 0,
        info: 0
    };

    for (const item of items) {
        counts[item.severity] = (counts[item.severity] ?? 0) + 1;
    }

    return counts;
}
