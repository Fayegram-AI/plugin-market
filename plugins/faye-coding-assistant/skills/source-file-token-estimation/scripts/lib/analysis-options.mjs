// Shared, strict command-line options for source-file token-estimation scripts.

export const DEFAULT_MIN_KB = 20;
export const DEFAULT_CHUNK_SIZES = [200, 300, 400, 500, 700];

export function parseChunkSizes(value) {
    if (value === undefined || value === null) {
        return [...DEFAULT_CHUNK_SIZES];
    }

    const rawValues = Array.isArray(value) ? value : String(value).split(",");
    if (rawValues.length === 0 || rawValues.some((item) => String(item).trim() === "")) {
        throw new Error("Chunk sizes must be a comma-separated list of positive integers.");
    }

    const sizes = rawValues.map((item) => Number(String(item).trim()));
    if (sizes.some((item) => !Number.isSafeInteger(item) || item <= 0)) {
        throw new Error("Chunk sizes must be a comma-separated list of positive integers.");
    }

    return [...new Set(sizes)].sort((left, right) => left - right);
}

export function parseAnalysisArgs(argv, command) {
    if (command !== "report" && command !== "inventory") {
        throw new Error(`Unknown analysis command: ${command}`);
    }

    const args = {
        root: ".",
        minKb: DEFAULT_MIN_KB
    };

    if (command === "report") {
        args.chunkSizes = [...DEFAULT_CHUNK_SIZES];
    }

    for (let index = 0; index < argv.length; index += 1) {
        const option = argv[index];

        if (option === "--help" || option === "-h") {
            args.help = true;
        } else if (option === "--root") {
            args.root = requireOptionValue(argv, ++index, option);
        } else if (option === "--min-kb") {
            args.minKb = parseMinKb(requireOptionValue(argv, ++index, option));
        } else if (option === "--chunk-sizes" && command === "report") {
            args.chunkSizes = parseChunkSizes(requireOptionValue(argv, ++index, option));
        } else if (option === "--output" && command === "report") {
            args.output = requireOptionValue(argv, ++index, option);
        } else if (option === "--json" && command === "inventory") {
            args.json = true;
        } else {
            throw new Error(`Unknown option: ${option}`);
        }
    }

    return args;
}

function requireOptionValue(argv, index, option) {
    const value = argv[index];
    if (value === undefined || value === "" || value === "-h" || value.startsWith("--")) {
        throw new Error(`Missing value for ${option}.`);
    }
    return value;
}

function parseMinKb(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0) {
        throw new Error("--min-kb must be a non-negative number.");
    }
    return number;
}
