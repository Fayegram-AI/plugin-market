/** Public hosting identifiers contain no credentials or plugin execution policy. */
export function validateHostingPolicy(value, { target, websiteUrl }) {
    if (value == null) return; // Earlier distribution records have no hosting policy.
    const fields = ["provider", "projectId", "siteId"];
    if (typeof value !== "object" || Array.isArray(value)
        || Object.keys(value).some(key => !fields.includes(key))
        || fields.some(key => typeof value[key] !== "string")) throw new Error("Invalid hosting policy fields");
    if (target !== "release" || value.provider !== "firebase") throw new Error("Firebase Hosting is supported only for the public release target");
    if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/u.test(value.projectId)
        || !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/u.test(value.siteId)) throw new Error("Invalid Firebase project/site identity");
    const website = new URL(websiteUrl);
    if (website.protocol !== "https:" || website.username || website.password
        || website.pathname !== "/" || website.search || website.hash
        || ["localhost", "127.0.0.1", "[::1]"].includes(website.hostname)) throw new Error("Public hosting requires a configured HTTPS website origin");
}
