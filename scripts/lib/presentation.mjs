/** Public documentation policy, independent of native plugin activation behavior. */
export function validatePresentation(value) {
    if (value === undefined) return; // Older repositories have no platform presentation policy.
    const object = item => item !== null && typeof item === "object" && !Array.isArray(item);
    const keys = (item, allowed) => {
        if (!object(item) || Object.keys(item).some(key => !allowed.includes(key))) throw new Error("Invalid presentation fields");
    };
    keys(value, ["defaultPlatform", "platformOrder", "platforms"]);
    if (!object(value.platforms)) throw new Error("presentation.platforms must be an object");
    for (const [id, profile] of Object.entries(value.platforms)) {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(id)) throw new Error(`Invalid presentation platform ${id}`);
        keys(profile, ["label", "status", "invocation", "evidence"]);
        if (typeof profile.label !== "string" || !profile.label.trim()) throw new Error(`Missing platform label: ${id}`);
        if (!["documented", "not-documented"].includes(profile.status)) throw new Error(`Invalid documentation status: ${id}`);
        if (profile.status === "not-documented" && (profile.invocation != null || profile.evidence != null)) throw new Error(`Undocumented platform cannot supply invocation evidence: ${id}`);
        if (profile.status === "documented") {
            if (typeof profile.evidence !== "string" || !profile.evidence.trim()) throw new Error(`Missing invocation evidence: ${id}`);
            if (profile.invocation != null && (typeof profile.invocation !== "string"
                || profile.invocation.split("{skill}").length !== 2 || /[\r\n<>]/u.test(profile.invocation))) throw new Error(`Invalid invocation template: ${id}`);
        }
    }
    const order = value.platformOrder;
    if (!Array.isArray(order) || !order.length || new Set(order).size !== order.length
        || order.some(id => !Object.hasOwn(value.platforms, id))
        || Object.keys(value.platforms).some(id => !order.includes(id))
        || !order.includes(value.defaultPlatform)) throw new Error("Invalid presentation platform order/default");
}
