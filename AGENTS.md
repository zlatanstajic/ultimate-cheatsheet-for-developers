# Ultimate Cheatsheet for Developers Project Rules

Guidance for any coding agent working in this repository, and the canonical version of these rules. [`CLAUDE.md`](CLAUDE.md) mirrors them in condensed form for Claude Code; change this file first, then mirror the change there.

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

## `assets/cli-index.json` is gated: a content edit is a two-file change

- `npm test` ends with `check:cli-index`, which runs `node scripts/build-cli-index.mjs` and then `git diff HEAD --exit-code -- assets/cli-index.json`. It compares against **HEAD**, not the working tree, so regenerating the index without committing it still fails the gate.
- The index is built from `README.md`, `knowledgebase/**`, and `shell/**`. Any edit to any of those — including a one-word typo fix, and including this README's own prose — changes the artifact. Run `npm run build:cli-index` and commit the result together with the content change.
- The index stores each section's **raw Markdown slice**, taken from mdast start offsets, so the CLI can render fenced blocks verbatim with `marked-terminal` and never needs remark at runtime. Do not "clean up" the builder into an AST-to-text pass; that would strip the code fences the CLI exists to print.
- `scripts/lib/markdown-helpers.mjs` sorts directory entries specifically so the emitted JSON is byte-stable across filesystems. An unsorted `readdirSync` would make the gate fail at random.
- `collectFile()` throws when two files map to one tool name (`shell/git.md` → `git`, `shell/README.md` → `shell`, root `README.md` → `readme`). Adding `knowledgebase/git.md` would collide with `shell/git.md`. That error is a feature, not a bug to catch and swallow.

## `README.md` is a build input and a build output at once

- The contributor block between `<!-- CONTRIBUTORS:START -->` and `<!-- CONTRIBUTORS:END -->` is rewritten by `scripts/build-leaderboard.mjs`, which **exits 1 if either marker is missing**. Never drop the markers while restructuring the README, and never hand-edit the list — rerun `npm run leaderboard`.
- The same file is walked by both index builders, so a README edit also requires `npm run build:cli-index` (see above).
- Generated contributor names land in `README.md`, which cspell scans. A new contributor with an unusual name fails `npm test` until the name is added to `words` in `.cspell.json`. That is the intended fix.
- The README table of contents is link-checked. Adding or renaming a page under `shell/` or `knowledgebase/` means updating the root README table **and** the matching folder index (`shell/README.md`, `knowledgebase/README.md`).

## remark is the linter; markdownlint is not installed

- `.markdownlint.json` exists for editor extensions only. `markdownlint-cli` is not a dependency and no script invokes it. Do not add rules there expecting the gate to honour them, and do not install markdownlint to "fix" a lint failure.
- The real config is `.remarkrc.js`: `remark-frontmatter` plus `remark-preset-lint-recommended`, run with `--frail` so warnings fail. Line length and first-line-heading rules are **not** in effect — long lines and YAML frontmatter ahead of the `# ` heading are correct here.
- `remark-frontmatter` is what keeps the leading `---` block from being parsed as a thematic break. It is loaded in `.remarkrc.js` and in all four Markdown-reading scripts. Removing it anywhere silently corrupts that script's section walk.

## The spell-check allowlist is the fix, not the workaround

- `cspell` runs over every `*.md`. Cheatsheets are made of exactly the vocabulary a dictionary does not have: `FLUSHALL`, `mysqldump`, `journalctl`, author handles, package names.
- Add the term to the `words` array in `.cspell.json`. Do not reword the content, do not add inline `cspell:disable` comments, and do not add paths to `ignorePaths` to dodge a single word.

## Freshness metadata is a manual attestation, and the checks never gate

- `last_reviewed` in each content page's frontmatter means "a human verified this page on this date". Nothing computes it, nothing bumps it, and no check requires it. `tested_on` is optional and may be a string or a YAML list.
- `scripts/check-freshness.mjs` and `scripts/check-review-drift.mjs` both **always `process.exit(0)`**, deliberately, even on parse errors. They are absent from `npm test` and from the pre-commit hook. Do not wire them into the gate or make them exit non-zero on stale pages; a stale attestation is a reporting signal, not a build failure.
- `check-freshness.mjs` uses a fixed `STALE_DAYS = 183` epoch subtraction rather than `setMonth(-6)`, because calendar-month arithmetic rolls over unpredictably when run on the 29th–31st. It also excludes `shell/README.md` and `knowledgebase/README.md` from the count (navigation, not cheatsheets) and prints a distinct `WARN:` line for typo'd keys so they are not folded into "missing". All three are intentional.
- `last_reviewed` dates across pages are intentionally staggered to each page's real last-edit date, not normalized to one date, so pages cross the staleness line gradually. Do not bulk-update them.

## The snippet builder self-test asserts against real cheatsheet content

- `node scripts/build-snippets.mjs --check` runs fixture assertions against actual lines in `shell/git.md`, `shell/docker.md`, `shell/jq.md`, and `shell/linux.md`. `release-export.yml` runs it before building a release.
- **Editing those pages can break the self-test.** When it fails because a fixture references a line you changed, update the assertion in `scripts/build-snippets.mjs` to match the new content. Do not delete the assertion.
- The builder pairs a leading `# comment` with the command lines under it inside `bash`/`sh` fences, turns `[placeholder]` into `${N:placeholder}` tabstops, and deliberately leaves purely numeric tokens (`sys.argv[1]`) literal. Writing a cheatsheet command with unbracketed placeholders means it silently produces a snippet with no tabstops.

## The search index is built by the commit hook, not by CI

- `.husky/pre-commit` runs `npx lint-staged`, then `npm run build:index --silent`, then `git add`s `assets/search-index.json` only if it changed. This is the **only** thing that keeps the browser search current — `npm test` does not check it and no workflow rebuilds it.
- So a commit made with `--no-verify`, or a change landed without running the hook, ships a stale search index. Run `npm run build:index` by hand in that case.
- Section anchors in the index come from `slugify()`/`dedupeSlug()` in `scripts/lib/markdown-helpers.mjs`, which replicate kramdown's GitHub-style slugging (including `-1`, `-2` suffixes for repeated headings) so the generated links match what Jekyll actually renders. Swapping in a generic slug library breaks every deep link.

## Two workflows commit to master; they are wired to not fight

- `check-freshness.yml` (badge JSON) and `build-leaderboard.yml` (README block) both push to `master` as `github-actions[bot]`. Each commits with `[skip ci]` so its own push does not retrigger CI in a loop, guards with `git diff --quiet` so it only commits real changes, and joins the shared `auto-commit-master` concurrency group with `cancel-in-progress: false` so the two `git pull --rebase` / `git push` sequences queue instead of racing.
- A third workflow that pushes to `master` must join that same group and carry `[skip ci]`. `release-export.yml` does not push to master, which is why it stays out of the group.
- If branch protection is ever enabled on `master`, it must allow `github-actions[bot]` to push, or both workflows fail on their push step.
- `build-leaderboard.mjs` filters authors whose name ends in `[bot]`, which is what keeps these workflows off their own leaderboard and absorbs the ±1 drift their commits introduce. `git shortlog -sn` is called without `-e`, so no email addresses reach the README and the generated block cannot break `check:links`.

## Conventions

- Markdown indent is 2 spaces (`.editorconfig`). Trailing whitespace is **not** trimmed in `.md` — it encodes hard line breaks. Do not run a bulk whitespace strip over content.
- New pages: kebab-case filename, YAML frontmatter with `last_reviewed`, an `# H1`, a one-line blockquote summary, then `## ` sections of fenced code blocks. Cite sources where relevant. End the page with a link back to the folder index.
- `.mlc-config.json` sets `retryOn429` and ignores `#L\d+` anchors (GitHub line links). The freshness badge's nested `?url=...` target is **not** validated by the link check — after a change publishes, a maintainer confirms the badge renders manually.
- `_config.yml` sets a `defaults` block applying the theme's `default` layout to every page. Content pages carry frontmatter but no `layout:` key, so removing that block strips the site chrome from every page. It also excludes `bin/`, `scripts/`, and `assets/cli-index.json` from the site.
- The npm package name is `ucheat`; `files` ships only `bin`, `assets/cli-index.json`, and `README.md`, and `prepublishOnly` regenerates the index. Runtime deps are `fuse.js`, `marked`, `marked-terminal`; everything else is a devDependency.
- Branches: `issues/` is the only accepted prefix and the only branch a contributor pushes; names are kebab-case only, matching `^issues/[a-z0-9]+(-[a-z0-9]+)*$`. Conventional-style commit subjects (`fix:`, `feat:`, `chore:`).
- Duplicate author identities are collapsed via `.mailmap`.
- Never read or write `.env`, and never put credentials in a cheatsheet example.
- Do not run `git add` or `git commit` on your own initiative.

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
