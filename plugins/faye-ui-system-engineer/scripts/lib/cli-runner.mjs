/**
 * CLI orchestration for the read-only UI-system audit.
 *
 * A completed normalized report is always successful, including reports with
 * findings or coverage diagnostics. Status 2 is reserved for an invocation
 * that cannot produce a report.
 */

import { auditUiSystem } from "./audit-engine.mjs";
import { formatTextReport } from "./format-report.mjs";
import {
    BINARY_CONTROL_THRESHOLD,
    DEFAULT_EXCLUDED_DIRECTORIES,
    DEFAULT_MAX_FILE_BYTES,
    createSourcePolicy,
    SUPPORTED_EXTENSIONS
} from "./source-policy.mjs";

const HELP = `Usage:
  node audit-ui-system.mjs --root <path> [options]

Options:
  --root <path>            Project root to inspect.
  --scope <path>           File or directory inside the root. May be repeated.
  --format <value>         text (default) or json.
  --max-file-size <size>   Positive integer bytes, or an integer with a KiB or MiB suffix.
  --exclude-dir <name>     Add one exact directory name to traversal exclusions. May be repeated.
  --include-dir <name>     Remove one exact directory name from default exclusions. May be repeated.
  -h, --help               Show this help.

Exit status:
  0  A normalized report was produced. Findings and diagnostics do not fail the audit.
  2  No report was produced because arguments, the root, or an explicit scope
     were invalid or inaccessible, or because the audit failed unexpectedly.

Coverage:
  Extensions: ${[...SUPPORTED_EXTENSIONS].join(", ")}
  Default maximum file size: ${DEFAULT_MAX_FILE_BYTES} bytes (1 MiB)
  Default excluded directories: ${[...DEFAULT_EXCLUDED_DIRECTORIES].join(", ")}
  Encoding: strict UTF-8; NUL or more than ${BINARY_CONTROL_THRESHOLD * 100}% disallowed controls is binary-like.
  Links: explicit scopes must resolve inside the root; traversal links are skipped.
  Directory flags accept one name without path separators or glob syntax.
  An explicit scope may name an excluded directory; its nested exclusions still apply.
  Ignore files: not interpreted.`;

export async function runAuditCli(options) {
    const audit = options.audit ?? auditUiSystem;
    const stdout = options.stdout ?? process.stdout;
    const stderr = options.stderr ?? process.stderr;

    try {
        const auditOptions = parseArgs(options.args);

        if (auditOptions.help) {
            stdout.write(`${HELP}\n`);
            return 0;
        }

        const report = await audit(auditOptions);
        const output = auditOptions.format === "json"
            ? JSON.stringify(report, null, 2)
            : formatTextReport(report);

        stdout.write(`${output}\n`);
        return 0;
    } catch (error) {
        stderr.write(`UI system audit failed: ${getErrorMessage(error)}\n`);
        return 2;
    }
}

function parseArgs(args) {
    const options = {
        root: null,
        scopes: [],
        format: "text",
        help: false,
        sourcePolicy: {
            maxFileBytes: null,
            excludeDirectories: [],
            includeDirectories: []
        }
    };

    for (let index = 0; index < args.length; index += 1) {
        const argument = args[index];

        if (argument === "-h" || argument === "--help") {
            options.help = true;
            continue;
        }

        if (argument === "--root") {
            options.root = readValue(args, ++index, "--root");
            continue;
        }

        if (argument === "--scope") {
            options.scopes.push(readValue(args, ++index, "--scope"));
            continue;
        }

        if (argument === "--format") {
            options.format = readValue(args, ++index, "--format");
            continue;
        }

        if (argument === "--max-file-size") {
            if (options.sourcePolicy.maxFileBytes !== null) {
                throw new Error("--max-file-size may be specified only once.");
            }

            options.sourcePolicy.maxFileBytes = parseFileSize(
                readValue(args, ++index, "--max-file-size")
            );
            continue;
        }

        if (argument === "--exclude-dir") {
            options.sourcePolicy.excludeDirectories.push(
                readValue(args, ++index, "--exclude-dir")
            );
            continue;
        }

        if (argument === "--include-dir") {
            options.sourcePolicy.includeDirectories.push(
                readValue(args, ++index, "--include-dir")
            );
            continue;
        }

        throw new Error(`Unknown argument: ${argument}`);
    }

    if (options.help) {
        return options;
    }

    if (!options.root) {
        throw new Error("--root is required.");
    }

    if (!new Set(["text", "json"]).has(options.format)) {
        throw new Error(`Unsupported format: ${options.format}. Use text or json.`);
    }

    if (options.sourcePolicy.maxFileBytes === null) {
        delete options.sourcePolicy.maxFileBytes;
    }
    createSourcePolicy(options.sourcePolicy);

    return options;
}

function parseFileSize(value) {
    const match = value.match(/^([1-9]\d*)(KiB|MiB)?$/u);

    if (!match) {
        throw new Error(
            `Invalid maximum file size: ${value}. Use positive integer bytes, KiB, or MiB.`
        );
    }

    const multiplier = {
        undefined: 1n,
        KiB: 1024n,
        MiB: 1024n * 1024n
    }[match[2]];
    const bytes = BigInt(match[1]) * multiplier;

    if (bytes > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new Error(
            `Invalid maximum file size: ${value}. The byte value is too large.`
        );
    }

    return Number(bytes);
}

function readValue(args, index, flag) {
    const value = args[index];

    if (!value || value.startsWith("--")) {
        throw new Error(`${flag} requires a value.`);
    }

    return value;
}

function getErrorMessage(error) {
    return error instanceof Error ? error.message : String(error);
}
