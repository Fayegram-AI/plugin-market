import { validateRepositoryArtifacts } from "./lib/distribution-safety.mjs";
import { access, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readMarketInfo, validateMarketInfo } from "./lib/market-info.mjs";
import { validateCompatibilityMetadata } from "./lib/compatibility-metadata.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDir, "..");
const marketInfo = await readMarketInfo(repositoryRoot);
const expectedMarketplaceName = marketInfo.marketplace.name;
const expectedDisplayName = marketInfo.marketplace.displayName;
const expectedRepositoryUrl = marketInfo.addresses.repositoryUrl;
const requiredRootDocs = [
    "AGENTS.md",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "LICENSING.md",
    "README.md",
    "SECURITY.md"
];
const allowedRootEntries = new Set([
    ".gitattributes",
    ".agents",
    ".git",
    ".github",
    ".grok-plugin",
    ".gitignore",
    "AGENTS.md",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "LICENSING.md",
    "README.md",
    "SECURITY.md",
    "agents",
    "package.json",
    "plugins",
    "scripts",
    "skills",
    "market-info"
]);
const forbiddenRootLicenseNames = [
    "COPYING",
    "COPYING.md",
    "LICENSE",
    "LICENSE.md",
    "LICENSE.txt"
];
const forbiddenPublicDocumentation = [
    ["placeholder repository owner", /<owner>/iu],
    ["placeholder repository name", /<repo>/iu],
    ["development workspace path", /\bdev[\\/]/iu],
    ["production workspace path", /\bprod[\\/]/iu],
    ["parent-workspace guidance", /parent (?:development )?workspace/iu],
    ["private Windows user path", /[a-z]:[\\/]users[\\/]/iu]
];
const errors = [];

await validate();

if (errors.length > 0) {
    for (const error of errors) {
        console.error(`ERROR: ${error}`);
    }
    process.exit(1);
}

console.log(`Validated ${relative(repositoryRoot)}.`);

async function validate() {
    await validateRequiredFiles();
    await validateApprovedRootShape();
    errors.push(...await validateRepositoryArtifacts(repositoryRoot));
    await validateRepositoryShape();
    const pluginRecords = await validateMarketplaceSource();
    errors.push(...await validateCompatibilityMetadata(repositoryRoot));
    errors.push(...await validateMarketInfo(repositoryRoot, marketInfo, await readJson(path.join(repositoryRoot, ".agents/plugins/marketplace.json"), "registry")));
    await validatePublicDocumentation(pluginRecords);
    await validatePackageJson();
}

async function validateRequiredFiles() {
    for (const docPath of requiredRootDocs) {
        await assertFile(path.join(repositoryRoot, docPath));
    }
    await assertFile(path.join(repositoryRoot, ".agents", "plugins", "README.md"));
    await assertFile(path.join(repositoryRoot, ".agents", "plugins", "marketplace.json"));
    await assertFile(path.join(repositoryRoot, ".github", "workflows", "validate.yml"));
    await assertFile(path.join(repositoryRoot, "plugins", "README.md"));
    await assertFile(path.join(repositoryRoot, "scripts", "validate-marketplace.mjs"));

    for (const licenseName of forbiddenRootLicenseNames) {
        await assertAbsent(path.join(repositoryRoot, licenseName));
    }
}

async function validateApprovedRootShape() {
    for (const entry of await readdir(repositoryRoot, { withFileTypes: true })) {
        if (!allowedRootEntries.has(entry.name)) {
            errors.push(`${relative(path.join(repositoryRoot, entry.name))} is not an approved repository-root entry.`);
        }
    }
}

async function validateRepositoryShape() {
    for (const directory of [
        ".agents/plugins",
        ".github/workflows",
        "agents",
        "plugins",
        "scripts",
        "skills"
    ]) {
        await assertDirectory(path.join(repositoryRoot, directory));
    }
}

async function validateMarketplaceSource() {
    const registryPath = path.join(repositoryRoot, ".agents", "plugins", "marketplace.json");
    const marketplace = await readJson(registryPath, "marketplace registry");

    if (!marketplace) {
        return [];
    }
    if (marketplace.name !== expectedMarketplaceName) {
        errors.push(`${relative(registryPath)} must use marketplace name ${expectedMarketplaceName}.`);
    }
    if (marketplace.interface?.displayName !== expectedDisplayName) {
        errors.push(`${relative(registryPath)} must use display name ${expectedDisplayName}.`);
    }
    if (!Array.isArray(marketplace.plugins)) {
        errors.push(`${relative(registryPath)} must contain a plugins array.`);
        return [];
    }

    const pluginRoot = path.join(repositoryRoot, "plugins");
    const pluginDirs = await packageDirectoryNames(pluginRoot);
    const registryNames = new Set();
    const pluginRecords = [];

    for (const entry of marketplace.plugins) {
        validateRegistryEntry(registryPath, pluginDirs, registryNames, entry);
    }

    for (const pluginName of [...pluginDirs].sort()) {
        const pluginPath = path.join(pluginRoot, pluginName);
        const record = await validatePluginPackage(pluginPath, pluginName, registryNames);
        if (record) {
            pluginRecords.push(record);
        }
    }

    for (const pluginName of registryNames) {
        if (!pluginDirs.has(pluginName)) {
            errors.push(`Registry plugin ${pluginName} has no matching plugin package.`);
        }
    }

    await validateStandaloneSkills(path.join(repositoryRoot, "skills"));
    await validateAgentTomls(path.join(repositoryRoot, "agents"));
    return pluginRecords;
}

function validateRegistryEntry(registryPath, pluginDirs, registryNames, entry) {
    if (!entry?.name) {
        errors.push(`${relative(registryPath)} contains a plugin entry without a name.`);
        return;
    }
    if (registryNames.has(entry.name)) {
        errors.push(`${relative(registryPath)} contains duplicate plugin ${entry.name}.`);
    }
    registryNames.add(entry.name);

    const expectedPath = `./plugins/${entry.name}`;
    if (entry.source?.source !== "local" || entry.source?.path !== expectedPath) {
        errors.push(`Registry entry ${entry.name} must use local source ${expectedPath}.`);
    }
    if (!pluginDirs.has(entry.name)) {
        errors.push(`Registry entry ${entry.name} has no matching package directory.`);
    }
    if (!new Set(["AVAILABLE", "INSTALLED_BY_DEFAULT", "NOT_AVAILABLE"]).has(entry.policy?.installation)) {
        errors.push(`Registry entry ${entry.name} has invalid installation policy.`);
    }
    if (!new Set(["ON_INSTALL", "ON_USE"]).has(entry.policy?.authentication)) {
        errors.push(`Registry entry ${entry.name} has invalid authentication policy.`);
    }
    if (!entry.category) {
        errors.push(`Registry entry ${entry.name} must define category.`);
    }

    const resolvedSource = path.resolve(repositoryRoot, entry.source?.path ?? "");
    if (!isInside(repositoryRoot, resolvedSource)) {
        errors.push(`Registry entry ${entry.name} resolves outside the repository.`);
    }
}

async function validatePluginPackage(pluginPath, pluginName, registryNames) {
    const manifestPath = path.join(pluginPath, ".codex-plugin", "plugin.json");
    const manifest = await readJson(manifestPath, `${pluginName} manifest`);
    if (!manifest) {
        return null;
    }

    if (manifest.name !== pluginName) {
        errors.push(`${relative(manifestPath)} name must match ${pluginName}.`);
    }
    if (!registryNames.has(pluginName)) {
        errors.push(`${pluginName} is not registered in marketplace.json.`);
    }
    if (!manifest.version) {
        errors.push(`${relative(manifestPath)} must define version.`);
    }
    if (typeof manifest.repository !== "string" || !/^https:\/\//u.test(manifest.repository)) {
        errors.push(`${relative(manifestPath)} must identify its package source repository.`);
    }
    if (manifest.license !== "MIT") {
        errors.push(`${relative(manifestPath)} must declare MIT.`);
    }
    if (manifest.skills !== "./skills/") {
        errors.push(`${relative(manifestPath)} must use skills ./skills/.`);
    }

    const prompts = manifest.interface?.defaultPrompt ?? [];
    if (!Array.isArray(prompts) || prompts.length > 3) {
        errors.push(`${relative(manifestPath)} defaultPrompt must be an array with at most three entries.`);
    }

    await validateReferencedAsset(pluginPath, manifestPath, manifest.interface?.composerIcon, "composerIcon");
    await validateReferencedAsset(pluginPath, manifestPath, manifest.interface?.logo, "logo");
    await assertFile(path.join(pluginPath, "LICENSE"));
    await assertFile(path.join(pluginPath, "FAYEGRAM_ASSETS.md"));

    const skillsRoot = path.join(pluginPath, "skills");
    const skillNames = [...await directoryNames(skillsRoot)].sort();
    const agentNames = [...await tomlFileNames(path.join(pluginPath, "agents"))].sort();
    if (skillNames.length === 0) {
        errors.push(`${relative(pluginPath)} must contain at least one skill.`);
    }
    for (const skillName of skillNames) {
        await validateSkillFolder(path.join(skillsRoot, skillName), skillName);
    }
    await validateAgentTomls(path.join(pluginPath, "agents"));

    const readmePath = path.join(pluginPath, "README.md");
    const readme = await readText(readmePath, `${pluginName} README`);
    if (readme !== null) {
        requireText(readmePath, readme, manifest.version, `version ${manifest.version}`);
        requireText(readmePath, readme, "npm run validate", "portable validation command");
        for (const skillName of skillNames) {
            requireText(readmePath, readme, skillName, `skill ${skillName}`);
        }
        for (const agentName of agentNames) {
            requireText(readmePath, readme, agentName, `agent ${agentName}`);
        }
        validatePortableDocumentation(readmePath, readme);
        if (/\bpromot(?:e|ed|es|ing|ion)\b/iu.test(readme)) {
            errors.push(`${relative(readmePath)} must not contain promotion instructions.`);
        }
        if (/validate-all-targets\.mjs/iu.test(readme)) {
            errors.push(`${relative(readmePath)} must not contain development-only validation commands.`);
        }
    }

    return {
        agentNames,
        name: pluginName,
        skillNames,
        version: manifest.version
    };
}

async function validateReferencedAsset(pluginPath, manifestPath, assetPath, fieldName) {
    if (!assetPath) {
        return;
    }
    const resolvedAsset = path.resolve(pluginPath, assetPath);
    if (!isInside(pluginPath, resolvedAsset)) {
        errors.push(`${relative(manifestPath)} ${fieldName} resolves outside its plugin package.`);
        return;
    }
    if (!(await exists(resolvedAsset))) {
        errors.push(`${relative(manifestPath)} ${fieldName} target is missing: ${assetPath}.`);
    }
}

async function validateStandaloneSkills(skillsRoot) {
    for (const skillName of await directoryNames(skillsRoot)) {
        await validateSkillFolder(path.join(skillsRoot, skillName), skillName);
    }
}

async function validateSkillFolder(skillPath, skillName) {
    const skillFile = path.join(skillPath, "SKILL.md");
    const content = await readText(skillFile, `${skillName} skill`);
    if (content === null) {
        return;
    }
    if (!content.startsWith("---")) {
        errors.push(`${relative(skillFile)} must start with YAML frontmatter.`);
    }
    if (!new RegExp(`^name:\\s*${escapeRegExp(skillName)}\\s*$`, "m").test(content)) {
        errors.push(`${relative(skillFile)} frontmatter name must match ${skillName}.`);
    }
    if (!/^description:\s*.+/mu.test(content)) {
        errors.push(`${relative(skillFile)} must define a description.`);
    }
    await assertFile(path.join(skillPath, "agents", "openai.yaml"));
}

async function validateAgentTomls(agentsRoot) {
    for (const agentName of await tomlFileNames(agentsRoot)) {
        const agentPath = path.join(agentsRoot, agentName);
        const content = await readText(agentPath, agentName);
        if (content === null) {
            continue;
        }
        if (!/^name\s*=\s*".+"/mu.test(content)) {
            errors.push(`${relative(agentPath)} must define name.`);
        }
        if (!/^description\s*=\s*".+"/mu.test(content)) {
            errors.push(`${relative(agentPath)} must define description.`);
        }
    }
}

async function validatePublicDocumentation(pluginRecords) {
    const rootReadmePath = path.join(repositoryRoot, "README.md");
    const pluginIndexPath = path.join(repositoryRoot, "plugins", "README.md");
    const registryReadmePath = path.join(repositoryRoot, ".agents", "plugins", "README.md");
    const changelogPath = path.join(repositoryRoot, "CHANGELOG.md");
    const licensingPath = path.join(repositoryRoot, "LICENSING.md");
    const contributingPath = path.join(repositoryRoot, "CONTRIBUTING.md");
    const securityPath = path.join(repositoryRoot, "SECURITY.md");
    const publicDocs = new Map();

    for (const docPath of [
        rootReadmePath,
        pluginIndexPath,
        registryReadmePath,
        changelogPath,
        licensingPath,
        contributingPath,
        securityPath
    ]) {
        const content = await readText(docPath, path.basename(docPath));
        if (content !== null) {
            publicDocs.set(docPath, content);
            validatePortableDocumentation(docPath, content);
        }
    }

    const rootReadme = publicDocs.get(rootReadmePath) ?? "";
    const pluginIndex = publicDocs.get(pluginIndexPath) ?? "";
    const registryReadme = publicDocs.get(registryReadmePath) ?? "";
    const changelog = publicDocs.get(changelogPath) ?? "";

    if (expectedRepositoryUrl) requireText(rootReadmePath, rootReadme, expectedRepositoryUrl, "repository URL");
    requireText(rootReadmePath, rootReadme, "LICENSING.md", "licensing notice link");
    for (const record of pluginRecords) {
        for (const [docPath, content] of [
            [rootReadmePath, rootReadme],
            [pluginIndexPath, pluginIndex],
            [registryReadmePath, registryReadme]
        ]) {
            requireText(docPath, content, record.name, `plugin ${record.name}`);
            requireText(docPath, content, record.version, `version ${record.version}`);
            for (const skillName of record.skillNames) {
                requireText(docPath, content, skillName, `skill ${skillName}`);
            }
        }
        requireText(changelogPath, changelog, record.version, `release version ${record.version}`);
    }

    const licensing = publicDocs.get(licensingPath) ?? "";
    requirePattern(licensingPath, licensing, /does not provide a repository-wide open-source license/iu, "no root open-source license boundary");
    requirePattern(licensingPath, licensing, /plugins\/<plugin-name>\/.*LICENSE/su, "plugin-scoped license boundary");
    requireText(licensingPath, licensing, "FAYEGRAM_ASSETS.md", "identity-asset policy");
    requireText(licensingPath, licensing, "Semicolon, LLC", "copyright owner");
    requirePattern(licensingPath, licensing, /website is a separate work/iu, "separate website boundary");

    const contributing = publicDocs.get(contributingPath) ?? "";
    requirePattern(contributingPath, contributing, /authorized Fayegram maintainers/iu, "authorized-maintainer policy");
    requirePattern(contributingPath, contributing, /Unsolicited.*contributions are not accepted/isu, "unsolicited-contribution policy");
    requireText(contributingPath, contributing, "GitHub Security Advisories", "security-reporting route");
}

function validatePortableDocumentation(docPath, content) {
    for (const [label, pattern] of forbiddenPublicDocumentation) {
        if (pattern.test(content)) {
            errors.push(`${relative(docPath)} contains ${label}.`);
        }
    }
}

async function validatePackageJson() {
    const packagePath = path.join(repositoryRoot, "package.json");
    const packageJson = await readJson(packagePath, "package metadata");
    if (!packageJson) {
        return;
    }
    if (packageJson.name !== expectedMarketplaceName) {
        errors.push(`${relative(packagePath)} name must be ${expectedMarketplaceName}.`);
    }
    if (packageJson.version !== "0.1.0") {
        errors.push(`${relative(packagePath)} tooling version must remain 0.1.0.`);
    }
    if (packageJson.private !== true) {
        errors.push(`${relative(packagePath)} must set private true.`);
    }
    if (packageJson.scripts?.validate !== "node scripts/validate-marketplace.mjs") {
        errors.push(`${relative(packagePath)} must define the standalone validation command.`);
    }
}

function requireText(filePath, content, expected, label) {
    if (!content.includes(expected)) {
        errors.push(`${relative(filePath)} must include ${label}.`);
    }
}

function requirePattern(filePath, content, pattern, label) {
    if (!pattern.test(content)) {
        errors.push(`${relative(filePath)} must include ${label}.`);
    }
}

async function packageDirectoryNames(root) {
    const names = await directoryNames(root);
    const packages = new Set();
    for (const name of names) {
        if (await exists(path.join(root, name, ".codex-plugin", "plugin.json"))) {
            packages.add(name);
        }
    }
    return packages;
}

async function directoryNames(root) {
    if (!(await exists(root))) {
        return new Set();
    }
    const entries = await readdir(root, { withFileTypes: true });
    return new Set(entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name));
}

async function tomlFileNames(root) {
    if (!(await exists(root))) {
        return new Set();
    }
    const entries = await readdir(root, { withFileTypes: true });
    return new Set(entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".toml"))
        .map((entry) => entry.name));
}

async function assertDirectory(target) {
    const targetStat = await stat(target).catch(() => null);
    if (!targetStat?.isDirectory()) {
        errors.push(`${relative(target)} must be a directory.`);
    }
}

async function assertFile(target) {
    const targetStat = await stat(target).catch(() => null);
    if (!targetStat?.isFile()) {
        errors.push(`${relative(target)} must be a file.`);
    }
}

async function assertAbsent(target) {
    if (await exists(target)) {
        errors.push(`${relative(target)} must not exist at repository root.`);
    }
}

async function readJson(filePath, label) {
    const content = await readText(filePath, label);
    if (content === null) {
        return null;
    }
    try {
        return JSON.parse(content);
    } catch (error) {
        errors.push(`${relative(filePath)} is invalid JSON: ${error.message}`);
        return null;
    }
}

async function readText(filePath, label) {
    try {
        return await readFile(filePath, "utf8");
    } catch (error) {
        errors.push(`${relative(filePath)} is missing or unreadable for ${label}: ${error.message}`);
        return null;
    }
}

async function exists(target) {
    try {
        await access(target);
        return true;
    } catch {
        return false;
    }
}

function isInside(root, target) {
    const relativePath = path.relative(path.resolve(root), path.resolve(target));
    return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

function relative(target) {
    return path.relative(repositoryRoot, target).replaceAll(path.sep, "/") || ".";
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
