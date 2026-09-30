#!/usr/bin/env node
// Generate a Markdown source-file token-estimation report.

import {
    buildReport,
    scanWorkspace,
    writeExplicitOutput
} from "./common-workspace-analysis.mjs";
import { parseAnalysisArgs } from "./lib/analysis-options.mjs";

function printHelp() {
    console.log("Usage: node source-file-token-estimate.mjs [--root <repo-root>] [--min-kb <kb>] [--chunk-sizes 200,300,400,500,700] [--output <report.md>]");
}

function main() {
    const args = parseAnalysisArgs(process.argv.slice(2), "report");

    if (args.help) {
        printHelp();
        return;
    }

    const { records, discovery } = scanWorkspace(args.root, args.minKb);
    const report = buildReport(records, args.root, args.chunkSizes, args.minKb, discovery);

    if (args.output) {
        writeExplicitOutput(args.output, report);
    } else {
        process.stdout.write(report);
    }
}

try {
    main();
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
}
