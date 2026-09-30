/** Optional priority lists use stable skill IDs, never labels, paths, or routes. */
export function validateSkillOrder(order, available, label = "skillOrder") {
    if (order === undefined) return;
    if (!Array.isArray(order) || new Set(order).size !== order.length
        || order.some(id => typeof id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(id))) {
        throw new Error(`Invalid/duplicate ${label}`);
    }
    if (available) for (const id of order) {
        if (!available.includes(id)) throw new Error(`Unknown skill ${id} in ${label}`);
    }
}

/** Prioritize named entries; preserve the caller's fallback sequence for the rest. */
export function prioritize(items, order = [], key = item => item) {
    const rank = new Map(order.map((id, index) => [id, index]));
    return [...items].sort((a, b) => (rank.get(key(a)) ?? Infinity) - (rank.get(key(b)) ?? Infinity));
}
