/**
 * Build one immutable newline index for repeated source-offset lookups.
 *
 * Offsets use JavaScript UTF-16 code units, matching String indexes and the
 * structural scanners. A newline character belongs to the line it terminates;
 * the following code unit begins the next line.
 */
export function createLineLocator(source) {
    const lineStarts = [0];

    for (let index = 0; index < source.length; index += 1) {
        if (source.charCodeAt(index) === 10) {
            lineStarts.push(index + 1);
        }
    }

    return function lineAt(index) {
        const target = Math.max(0, Math.min(index, source.length));
        let lower = 0;
        let upper = lineStarts.length;

        while (lower < upper) {
            const middle = lower + Math.floor((upper - lower) / 2);

            if (lineStarts[middle] <= target) {
                lower = middle + 1;
            } else {
                upper = middle;
            }
        }

        return lower;
    };
}
