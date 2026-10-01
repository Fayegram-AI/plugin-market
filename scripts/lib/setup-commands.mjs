/** Explicit shell rendering for known setup operations; never evaluates command text. */
export function quoteArgument(value, shell) {
    if (typeof value !== "string" || !value || /[\u0000-\u001f]/u.test(value)) throw new Error("Unsafe setup command argument");
    if (/^[a-zA-Z0-9_@./:=+-]+$/u.test(value)) return value;
    return shell === "powershell" ? `'${value.replaceAll("'", "''")}'` : `'${value.replaceAll("'", `'"'"'`)}'`;
}

export function command(id, label, args, agentArgs = args) {
    const render = values => Object.fromEntries(["powershell", "bash"].map(shell => [shell, values.map(value => quoteArgument(value, shell)).join(" ")]));
    return { id, label, kind: "terminal", variants: render(args), agentVariants: render(agentArgs) };
}

export function interactive(id, label, text) {
    return { id, label, kind: "interactive", variants: { powershell: text, bash: text } };
}

export const step = (id, title, paragraphs, expected, commands = []) => ({ id, title, paragraphs, expected, commands });

export function validateRepositoryUrl(value) {
    if (value === null || value === undefined) return null;
    if (typeof value !== "string" || /[\u0000-\u0020]/u.test(value)) throw new Error("Unsafe setup repository URL");
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error("Unsafe setup repository URL");
    return value;
}
