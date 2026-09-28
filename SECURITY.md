# Security Policy

This repository ships documentation, not a service. There is no application, no server, no database, and no `.env` — the deliverable is Markdown, plus the Node scripts that validate it and the `ucheat` CLI that renders it. That shapes what a security issue looks like here.

## Supported versions

| Version | Supported |
|---|---|
| `master` | Yes |
| Latest published `ucheat` release | Yes |
| Older `ucheat` releases | No — upgrade to the latest |

Fixes land on `master` and, when the CLI is affected, in a new `ucheat` release. Nothing is backported.

## What to report privately

- **Credentials in the repository or its history.** An API key, token, password, private hostname, or internal URL committed in a cheatsheet example, a script, or any past commit. Cheatsheets are full of command examples, so this is the most likely issue here.
- **A destructive command a page fails to flag.** Cheatsheets exist to be copy-pasted. A documented command that silently deletes data, overwrites files, or exposes a secret in shell history, without the page saying so, is a safety bug, not a style nit.
- **A hijacked or malicious link.** A URL in `knowledgebase/` or `shell/` whose destination has been taken over, typosquatted, or now serves malware.
- **A vulnerability in the `ucheat` CLI or the build scripts.** For example, code execution or path traversal triggered by a crafted `assets/cli-index.json`, a malicious content page, or a hostile repository checkout.

## What to report as a normal issue instead

- Dead links, redirects, and stale documentation — open a regular issue or pull request.
- Vulnerabilities in the tools the cheatsheets merely *document* (git, Docker, Redis, and the rest). Report those upstream to the tool's own maintainers.
- Advisories affecting only devDependencies used for linting and spell-checking, with no path to a published artifact.

## How to report

Email **<contact@zlatanstajic.com>** with `SECURITY` in the subject line. Include the affected file or command, what an attacker gains, and the steps to reproduce it.

Please do not open a public issue, pull request, or discussion for anything in the private list above — a public report on an exposed credential widens the exposure before it can be rotated.

You can expect an acknowledgement within 7 days. Once a fix is published, credit is given in the commit or release notes unless you ask to stay anonymous.

## If a credential is exposed

Removing the line in a new commit is not a fix — the value stays in the Git history and in every clone and fork. Any credential that reached this repository is treated as compromised: it must be **rotated at its source first**, and only then purged from the history.

[Git Crypt](shell/git-crypt.md) is documented here as a general tool. It is not used to store secrets in this repository, and no secret should ever be committed, encrypted or not.
