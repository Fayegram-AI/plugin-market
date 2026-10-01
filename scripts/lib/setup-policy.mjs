/** Setup authoring schema: product capabilities and evidence are deliberately explicit. */
import { validateSetupPolicy as validateV1 } from "./setup-v1.mjs";

export const identity = value => typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(value);
const surfaces = { codex: ["app", "terminal"], grok: ["terminal"], antigravity: ["app", "ide", "terminal"] };
const implemented = new Set(["codex/terminal/git", "codex/terminal/local", "grok/terminal/git", "grok/terminal/local", "antigravity/terminal/local"]);

function object(value, keys, label) {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Invalid ${label}`);
    for (const key of Object.keys(value)) if (!keys.includes(key)) throw new Error(`Unknown ${label}.${key}`);
}
function text(value, label) {
    if (typeof value !== "string" || !value.trim() || /[\u0000-\u001f]/u.test(value)) throw new Error(`Invalid ${label}`);
}
function texts(value, label) {
    if (!Array.isArray(value) || !value.length) throw new Error(`Missing ${label}`);
    value.forEach(item => text(item, label));
}
function url(value) {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) throw new Error("Unsafe setup documentation URL");
}
function unique(values, label) {
    if (!Array.isArray(values) || !values.length) throw new Error(`Missing ${label}`);
    const ids = new Set();
    for (const item of values) {
        if (!identity(item.id) || ids.has(item.id)) throw new Error(`Invalid or duplicate ${label} identity`);
        ids.add(item.id);
    }
}

export function validateSetupPolicy(value) {
    if (value === undefined || value?.schemaVersion === 1) return validateV1(value);
    object(value, ["schemaVersion", "title", "summary", "products", "agentRules", "troubleshooting"], "setup");
    if (value.schemaVersion !== 2) throw new Error("Unsupported setup schema");
    text(value.title, "setup title"); text(value.summary, "setup summary");
    texts(value.agentRules, "agent rules");
    unique(value.products, "products");
    for (const product of value.products) {
        object(product, ["id", "label", "summary", "documentationUrl", "requirements", "interfaces"], "product");
        if (!Object.hasOwn(surfaces, product.id)) throw new Error("Unsupported setup product");
        text(product.label, "product label"); text(product.summary, "product summary"); url(product.documentationUrl);
        texts(product.requirements, "product requirements"); unique(product.interfaces, "interfaces");
        for (const surface of product.interfaces) {
            object(surface, ["id", "label", "summary", "methods"], "interface");
            if (!surfaces[product.id].includes(surface.id)) throw new Error("Unsupported product interface");
            text(surface.label, "interface label"); text(surface.summary, "interface summary"); unique(surface.methods, "methods");
            for (const method of surface.methods) {
                object(method, ["id", "status", "summary", "verification", "captures"], "method");
                if (!["git", "local"].includes(method.id) || !["ready", "needs-input"].includes(method.status)) throw new Error("Invalid setup method/status");
                if (method.status === "ready" && !implemented.has(`${product.id}/${surface.id}/${method.id}`)) throw new Error("Setup method has no confirmed implementation");
                text(method.summary, "method summary");
                const evidence = method.verification;
                object(evidence, ["status", "date", "version", "scope", "evidenceUrl"], "verification");
                if (!["documented", "tested", "pending"].includes(evidence.status)) throw new Error("Invalid verification status");
                if (method.status === "needs-input" && evidence.status !== "pending") throw new Error("Unconfirmed setup cannot claim verification");
                if (typeof evidence.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/u.test(evidence.date) || !Number.isFinite(Date.parse(evidence.date)) || new Date(evidence.date).toISOString().slice(0, 10) !== evidence.date) throw new Error("Invalid verification date");
                text(evidence.scope, "verification scope"); url(evidence.evidenceUrl);
                if (evidence.version !== undefined) text(evidence.version, "verification version");
                if (!Array.isArray(method.captures)) throw new Error("Missing capture requests");
                if (method.captures.length) unique(method.captures, "captures");
                for (const capture of method.captures) {
                    object(capture, ["id", "title", "instructions", "kind", "status"], "capture");
                    text(capture.title, "capture title"); texts(capture.instructions, "capture instructions");
                    if (!["screenshot", "procedure"].includes(capture.kind) || capture.status !== "missing") throw new Error("Invalid capture request");
                }
                if (method.status === "needs-input" && !method.captures.some(capture => capture.kind === "procedure")) throw new Error("Missing procedure request for unconfirmed flow");
            }
        }
    }
    unique(value.troubleshooting, "troubleshooting");
    for (const item of value.troubleshooting) {
        object(item, ["id", "title", "product", "reason", "steps", "expected"], "help");
        for (const field of ["title", "reason", "expected"]) text(item[field], `help ${field}`);
        texts(item.steps, "help steps");
        if (item.product !== undefined && !value.products.some(product => product.id === item.product)) throw new Error("Unknown help product");
    }
}
