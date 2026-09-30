#!/usr/bin/env node

/**
 * Read-only UI-system audit CLI entry point.
 *
 * The runner owns argument handling and output so its complete exit-status
 * contract can be tested without executing or writing to a consumer project.
 */

import { runAuditCli } from "./lib/cli-runner.mjs";

process.exitCode = await runAuditCli({
    args: process.argv.slice(2)
});
