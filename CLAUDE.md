# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. [AGENTS.md](AGENTS.md) carries the same rules in full, tool-agnostic form with the reasoning behind each one. When the two disagree, AGENTS.md is correct — fix it there first, then mirror the change here.

## Overview

This is a content repository, not an application. The deliverable is Markdown: command cheatsheets under `shell/` and curated resource lists under `knowledgebase/`. Everything else exists to publish, validate, or repackage that Markdown — a Jekyll site on GitHub Pages, a browser search index, the `ucheat` terminal CLI, and two offline export builders. There is no application code, no database, no server, and no `.env`.

The consequence that matters: several checked-in artifacts are **derived from the Markdown**, and one of them is gated. Editing a content page is rarely a one-file change.

## Commands

Node 20 or newer; no Docker, no Sail, nothing to boot.

```bash
npm install             # installs tooling and the Husky hook via `prepare`
npm test                # gate: lint:md → check:links → spell → check:cli-index
npm run lint:md         # remark-cli, --frail (warnings are errors)
npm run check:links     # markdown-link-check over every .md
npm run spell           # cspell over every .md
npm run build:cli-index # regenerate assets/cli-index.json (required after content edits)
npm run build:index     # regenerate assets/search-index.json (the hook also does this)
npm run build:export    # dist/print/** and dist/snippets/cheatsheets.code-snippets
npm run check:freshness # report-only; writes assets/freshness-badge.json
npm run check:drift     # report-only; pages edited after their attested review date
npm run leaderboard     # rewrite the README contributor block from `git shortlog`
```

Every validation script globs all `*.md`, so there is no single-file runner. Check one file by calling the tool directly:

```bash
npx remark --quiet --frail shell/git.md
npx cspell shell/git.md
npx markdown-link-check --config .mlc-config.json shell/git.md
```

## Project rules

Each of these is a real invariant with a non-obvious failure mode. AGENTS.md explains why and what not to "fix".

- **`assets/cli-index.json` is gated; a content edit is a two-file change.** `npm test` ends with `check:cli-index`, which rebuilds the index and runs `git diff HEAD --exit-code` against it. It compares to **HEAD**, so regenerating without committing still fails. The index is built from `README.md`, `knowledgebase/**`, and `shell/**` — any edit there, down to a typo fix, changes the artifact. Run `npm run build:cli-index` and commit `assets/cli-index.json` with the change. The index stores each section's raw Markdown slice so the CLI renders fenced blocks verbatim; do not convert the builder to an AST-to-text pass. Directory entries are sorted for byte-stable output, and `collectFile()` deliberately throws on two files mapping to one tool name.
- **`README.md` is a build input and a build output at once.** The contributor block between `<!-- CONTRIBUTORS:START -->` and `<!-- CONTRIBUTORS:END -->` is rewritten by `scripts/build-leaderboard.mjs`, which exits 1 if either marker is missing. Never drop the markers and never hand-edit the list — rerun `npm run leaderboard`. Generated names are cspell-scanned. Adding or renaming a page means updating the root README table **and** the matching folder index.
- **remark is the linter; markdownlint is not installed.** `.markdownlint.json` is for editor extensions only — `markdownlint-cli` is not a dependency and no script calls it. The real config is `.remarkrc.js` (`remark-frontmatter` + `remark-preset-lint-recommended`, `--frail`). Line-length and first-line-heading rules are not in effect, so long lines and leading YAML frontmatter are correct here. `remark-frontmatter` is loaded in `.remarkrc.js` and in all four Markdown-reading scripts; removing it anywhere silently corrupts that script's section walk.
- **The spell-check allowlist is the fix, not the workaround.** Cheatsheets are made of vocabulary no dictionary has. Add the term to the `words` array in `.cspell.json`. Do not reword content, add inline `cspell:disable` comments, or extend `ignorePaths` to dodge one word.
- **Freshness metadata is a manual attestation, and its checks never gate.** `last_reviewed` means "a human verified this page on this date" — nothing computes or bumps it. `scripts/check-freshness.mjs` and `scripts/check-review-drift.mjs` both always `process.exit(0)`, deliberately, and are absent from `npm test` and the hook; do not wire them into the gate. The fixed `STALE_DAYS = 183`, the excluded folder index pages, the distinct `WARN:` line for typo'd keys, and the staggered per-page dates are all intentional — do not normalize them.
- **The snippet builder self-test asserts against real cheatsheet content.** `node scripts/build-snippets.mjs --check` has fixtures bound to actual lines in `shell/git.md`, `shell/docker.md`, `shell/jq.md`, and `shell/linux.md`, and `release-export.yml` runs it before a release. Editing those pages can break it; update the assertion in `scripts/build-snippets.mjs`, do not delete it. Commands need `[bracketed]` placeholders to become tabstops; purely numeric tokens stay literal on purpose.
- **The search index is built by the commit hook, not by CI.** `.husky/pre-commit` runs `lint-staged`, then `npm run build:index --silent`, then stages `assets/search-index.json` if it changed. Nothing else keeps browser search current — `npm test` does not check it and no workflow rebuilds it, so a `--no-verify` commit ships it stale. Anchors come from the kramdown-replica `slugify()`/`dedupeSlug()` in `scripts/lib/markdown-helpers.mjs`; a generic slug library breaks every deep link.
- **Two workflows commit to master and are wired to not fight.** `check-freshness.yml` and `build-leaderboard.yml` push as `github-actions[bot]` with `[skip ci]`, guard on `git diff --quiet`, and share the serialized `auto-commit-master` concurrency group. A third pusher must join it. `build-leaderboard.mjs` filters `[bot]` authors and calls `git shortlog -sn` without `-e` so no email reaches the README.

## Conventions

- Markdown indent is 2 spaces. Trailing whitespace is **not** trimmed in `.md` — it encodes hard line breaks. Never bulk-strip it.
- New pages: kebab-case filename, YAML frontmatter with `last_reviewed`, an `# H1`, a one-line blockquote summary, then `## ` sections of fenced code blocks, ending with a link back to the folder index.
- `_config.yml`'s `defaults` block supplies the theme layout to pages that carry frontmatter but no `layout:` key; removing it strips the site chrome from every page.
- `.mlc-config.json` sets `retryOn429` and ignores `#L\d+` anchors. The freshness badge's nested `?url=...` target is not validated by the link check.
- Branches: `issues/` is the only accepted prefix and the only branch a contributor pushes; names are kebab-case only, matching `^issues/[a-z0-9]+(-[a-z0-9]+)*$`. Conventional-style commit subjects (`fix:`, `feat:`, `chore:`).
- Never read or write `.env`, and never put credentials in a cheatsheet example.
- Do not stage or commit; the user handles git.

## Generated assets

| Artifact | Built by | Committed | Kept in sync by |
|---|---|---|---|
| `assets/cli-index.json` | `npm run build:cli-index` | Yes | `npm test` (`check:cli-index`) |
| `assets/search-index.json` | `npm run build:index` | Yes | `.husky/pre-commit` |
| `assets/freshness-badge.json` | `npm run check:freshness` | Yes | `check-freshness.yml` |
| `README.md` contributor block | `npm run leaderboard` | Yes | `build-leaderboard.yml` |
| `assets/img/og-image.png` | `python3 scripts/gen-og-image.py` | Yes | Manual |
| `dist/**` | `npm run build:export` | No (git-ignored) | `release-export.yml` |

`assets/img/og-image.png` is produced by [`scripts/gen-og-image.py`](scripts/gen-og-image.py) (Pillow, deterministic — no randomness, no timestamps, hard error when no TrueType font is found). Edit the script and rerun it; never hand-edit the PNG.
