# Security Policy

This repository contains plugin packages, skills, agent definitions, and
validation scripts. It must not contain credentials, local machine paths,
private workspace artifacts, logs, generated user outputs, or website
deployment artifacts.

## Reporting

Report security-sensitive issues privately through GitHub Security Advisories.
If Security Advisories are unavailable, contact the repository owner privately
through GitHub. Do not post credentials, exploit details, or private user data
in a public issue or pull request.

## Scope

Security-sensitive issues include:

- accidentally published secrets or credentials
- instructions that encourage unsafe credential handling
- scripts that write outside documented output paths
- deletion, overwrite, or mutation without explicit user authorization
- private machine or workspace information in packaged files
- unsafe path traversal or uncontained file operations

## Maintainer Checklist

- Keep fallback output paths project-local and plugin-scoped.
- Require explicit user authorization before destructive cleanup or overwrite.
- Do not store user-owned notes or generated outputs inside plugin packages.
- Validate path containment before recursive deletion or movement.
- Keep development-only packages, tests, fixtures, and caches out of releases.
