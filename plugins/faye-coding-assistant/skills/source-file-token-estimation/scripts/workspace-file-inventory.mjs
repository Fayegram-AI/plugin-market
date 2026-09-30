#!/usr/bin/env node
// Print a JSON inventory of qualifying large script/source files.

import { scanWorkspace } from "./common-workspace-analysis.mjs";
import { parseAnalysisArgs } from "./lib/analysis-options.mjs";

function printHelp() {
    console.log("Usage: node workspace-file-inventory.mjs [--root <repo-root>] [--min-kb <kb>] [--json]");
}

function main() {
    const args = parseAnalysisArgs(process.argv.slice(2), "inventory");

    if (args.help) {
        printHelp();
        return;
    }

    const { records } = scanWorkspace(args.root, args.minKb);
    console.log(JSON.stringify(records, null, 2));
}

try {
    main();
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
}
