# Ultimate Cheatsheet for Developers Project Rules

Guidance for any coding agent working in this repository, and the single source of truth for these rules. [`CLAUDE.md`](CLAUDE.md) holds no rules of its own — it imports this file so Claude Code loads it automatically. Make every change here.

## Overview

This is a content repository, not an application. The deliverable is Markdown: command cheatsheets under `shell/` and curated resource lists under `knowledgebase/`. Everything else exists to publish, validate, or repackage that Markdown — a Jekyll site on GitHub Pages, a browser search index, the `ucheat` terminal CLI, and two offline export builders. There is no application code, no database, no server, and no `.env`.

The consequence that matters: several checked-in artifacts are **derived from the Markdown**, and one of them is gated. Editing a content page is rarely a one-file change.

## Commands

**Node 22.22.1 or newer to work on this repository**; no Docker, no Sail, nothing to boot.

That is not the same number as `package.json` `engines`, and the difference is deliberate. There are two Node floors here:

- **Development: 22.22.1.** Forced by the validation tooling — `cspell` 10 requires `>=22.18.0` and `lint-staged` 17 requires `>=22.22.1`. Below that, `npm test` and the pre-commit hook cannot run at all.
- **Runtime: 20**, declared in `engines`, describing the published `ucheat` CLI. Its only runtime dependencies are `fuse.js`, `marked`, and `marked-terminal` (Node `>=18` between them), and `files` ships no devDependencies, so a consumer is never subject to the development floor.

Do not "fix" a Node 20 tooling failure by raising `engines`: that would narrow who can install the CLI to satisfy a linter the CLI never loads. `ci.yml` checks both floors in separate jobs — `test` runs the gate on 22.22.1 and `lts/*`, `cli` installs with `--omit=dev` on Node 20 and runs the binary.

```bash
npm install                  # installs tooling and the Husky hook via `prepare`
npm test                     # gate: lint:md → check:links → spell → check:snippets → check:cli-index → check:index
npm run lint:md              # remark-cli, --frail (warnings are errors)
npm run check:links          # markdown-link-check, relative links and anchors only — no network
npm run check:links:external # markdown-link-check, external URLs; scheduled, deliberately NOT in the gate
npm run spell                # cspell over every tracked .md
npm run check:snippets       # snippet-builder self-test; part of the gate
npm run build:cli-index      # regenerate assets/cli-index.json (required after content edits)
npm run build:index          # regenerate assets/search-index.json (the hook also does this)
npm run build:export         # dist/print/** and dist/snippets/cheatsheets.code-snippets
npm run check:freshness      # report-only; writes assets/freshness-badge.json
npm run check:drift          # report-only; pages edited after their attested review date
```

`lint:md`, `check:links`, and `spell` enumerate **tracked** files with `git ls-files -z "*.md"` rather than walking the filesystem. `find` ignored `.gitignore`, so a git-ignored directory of Markdown sitting in the working tree — a symlinked notes folder, a scratch directory — was linted as if it were repository content and could fail the gate on files that are not part of the repository. The trade-off is real and worth knowing: a brand-new page is invisible to these three scripts until it has been `git add`ed at least once.

There is still no single-file runner. Check one file by calling the tool directly:

```bash
npx remark --quiet --frail shell/git.md
npx cspell shell/git.md
npx markdown-link-check --config .mlc-config.json shell/git.md
npx markdown-link-check --config .mlc-config.external.json shell/git.md  # external URLs too
```

## `assets/cli-index.json` is gated: a content edit is a two-file change

- `npm test` ends with `check:cli-index`, which runs `node scripts/build-cli-index.mjs` and then `git diff HEAD --exit-code -- assets/cli-index.json`. It compares against **HEAD**, not the working tree, so regenerating the index without committing it still fails the gate.
- The index is built from `README.md`, `knowledgebase/**`, and `shell/**`. Any edit to any of those — including a one-word typo fix, and including this README's own prose — changes the artifact. Run `npm run build:cli-index` and commit the result together with the content change.
- The index stores each section's **raw Markdown slice**, taken from mdast start offsets, so the CLI can render fenced blocks verbatim with `marked-terminal` and never needs remark at runtime. Do not "clean up" the builder into an AST-to-text pass; that would strip the code fences the CLI exists to print.
- `scripts/lib/markdown-helpers.mjs` sorts directory entries specifically so the emitted JSON is byte-stable across filesystems. An unsorted `readdirSync` would make the gate fail at random.
- `collectFile()` throws when two files map to one tool name (`shell/git.md` → `git`, `shell/README.md` → `shell`, root `README.md` → `readme`). Adding `knowledgebase/git.md` would collide with `shell/git.md`. That error is a feature, not a bug to catch and swallow.

## `README.md` is a build input to both index builders

- The same file is walked by both index builders, so a README edit also requires `npm run build:cli-index` (see above).
- The README table of contents is link-checked. Adding or renaming a page under `shell/` or `knowledgebase/` means updating the root README table **and** the matching folder index (`shell/README.md`, `knowledgebase/README.md`).

## remark is the linter; markdownlint is not installed

- `.markdownlint.json` exists for editor extensions only. `markdownlint-cli` is not a dependency and no script invokes it. Do not add rules there expecting the gate to honour them, and do not install markdownlint to "fix" a lint failure.
- The real config is `.remarkrc.js`: `remark-frontmatter`, `remark-gfm`, and `remark-preset-lint-recommended`, run with `--frail` so warnings fail. Line length and first-line-heading rules are **not** in effect — long lines and YAML frontmatter ahead of the `# ` heading are correct here.
- `remark-gfm` is loaded so the linter parses the same Markdown dialect as the things that render it: `scripts/build-print.mjs` loads `remark-gfm`, and the site is rendered by kramdown. Without it the linter read every GFM table in the README, the knowledgebase pages, and this file as plain paragraphs, so a malformed table linted clean and then rendered wrong in the print export and on the site. It also means bare URLs are parsed as autolinks and caught by `remark-lint-no-literal-urls`; write links as `[text](url)` or `<url>`.
- `remark-frontmatter` is what keeps the leading `---` block from being parsed as a thematic break. It is loaded in `.remarkrc.js` and in the four scripts that parse Markdown through remark: `build-cli-index.mjs`, `build-search-index.mjs`, `build-snippets.mjs`, and `build-print.mjs`. Removing it from any of them silently corrupts that script's section walk. Two further scripts read the same files without remark — `check-freshness.mjs` and `check-review-drift.mjs` slice the frontmatter block with a regex and parse it with `js-yaml` — so six scripts read Markdown in total and the fix differs depending on which group you are in.

## The link check is split: relative links gate, external URLs are scheduled

- `.mlc-config.json` ignores `^(https?|mailto):`, so `npm run check:links` validates **only** relative links and in-page anchors. It makes no network calls, which is exactly why it is safe to run in `npm test`, in CI, and in the pre-commit hook. This is the half that catches what a contributor actually breaks: a renamed page, a missing table-of-contents entry, a dead anchor.
- `.mlc-config.external.json` is the other half. It checks external URLs, keeps the `#L\d+$` ignore for GitHub line-number anchors, sets `retryOn429`/`retryCount`/`timeout`, and treats `403` and `999` as alive because some hosts refuse automated agents rather than being dead. It runs only from `npm run check:links:external`, only in `check-links.yml`, on a weekly schedule.
- The split exists because external link rot is time-based, not commit-based: a URL that resolved when it was merged can die months later with no change to this repository. Blocking a push on dozens of third-party hosts fails for reasons no contributor caused — measured here, one page reported 12 dead links on one run and 10 on the next from the same commit. Do not move the external config back into the gate.
- `ignorePatterns` entries must be **objects**: `[{ "pattern": "..." }]`. `markdown-link-check` reads `ignorePattern.pattern`; a bare string leaves that `undefined`, and `new RegExp(undefined)` is `/(?:)/`, which matches every URL. A config written as `["..."]` therefore marks every link "ignored" and exits 0 — the check reports success while validating nothing, in the gate, in CI, and in the hook at once. This repository shipped that bug; if you touch either config, verify with a deliberately dead relative link that the check still fails.
- The freshness badge's nested `?url=...` target is **not** validated by either config. After a change publishes, a maintainer confirms the badge renders manually.

## The spell-check allowlist is the fix, not the workaround

- `cspell` runs over every `*.md`. Cheatsheets are made of exactly the vocabulary a dictionary does not have: `FLUSHALL`, `mysqldump`, `journalctl`, author handles, package names.
- Add the term to the `words` array in `.cspell.json`. Do not reword the content, do not add inline `cspell:disable` comments, and do not add paths to `ignorePaths` to dodge a single word.

## Freshness metadata is a manual attestation, and the checks never gate

- `last_reviewed` in each content page's frontmatter means "a human verified this page on this date". Nothing computes it, nothing bumps it, and no check requires it. `tested_on` is optional and may be a string or a YAML list.
- `scripts/check-freshness.mjs` and `scripts/check-review-drift.mjs` both **always `process.exit(0)`**, deliberately, even on parse errors. They are absent from `npm test` and from the pre-commit hook. Do not wire them into the gate or make them exit non-zero on stale pages; a stale attestation is a reporting signal, not a build failure.
- `check-freshness.mjs` uses a fixed `STALE_DAYS = 183` epoch subtraction rather than `setMonth(-6)`, because calendar-month arithmetic rolls over unpredictably when run on the 29th–31st. It also excludes `shell/README.md` and `knowledgebase/README.md` from the count (navigation, not cheatsheets) and prints a distinct `WARN:` line for typo'd keys so they are not folded into "missing". All three are intentional.
- `last_reviewed` dates across pages are intentionally staggered to each page's real last-edit date, not normalized to one date, so pages cross the staleness line gradually. Do not bulk-update them.

## The snippet builder self-test asserts against real cheatsheet content

- `node scripts/build-snippets.mjs --check` runs fixture assertions against actual lines in `shell/git.md`, `shell/docker.md`, `shell/jq.md`, and `shell/linux.md`. It is wired into `npm test` as `check:snippets`, so CI catches a broken fixture on the commit that breaks it; `release-export.yml` runs it again before building a release.
- **Editing those pages can break the self-test.** When it fails because a fixture references a line you changed, update the assertion in `scripts/build-snippets.mjs` to match the new content. Do not delete the assertion.
- The builder pairs a leading `# comment` with the command lines under it inside `bash`/`sh` fences, turns `[placeholder]` into `${N:placeholder}` tabstops, and deliberately leaves purely numeric tokens (`sys.argv[1]`) literal. Writing a cheatsheet command with unbracketed placeholders means it silently produces a snippet with no tabstops.

## The search index: the hook keeps it current, the gate catches a stale one

- `.husky/pre-commit` runs `npx lint-staged`, then `npm run build:index --silent`, then `git add`s `assets/search-index.json` only if it changed. That hook is what keeps the browser search current without anyone having to think about it.
- `npm test` now ends with `check:index`, which rebuilds the index and runs `git diff HEAD --exit-code -- assets/search-index.json`. A commit made with `--no-verify`, or a change landed without the hook, therefore no longer ships a stale index silently: the gate fails until the rebuilt index is committed. Run `npm run build:index` by hand in that case.
- Like `check:cli-index`, it compares against **HEAD** rather than the working tree, so regenerating the index without committing it still fails the gate.
- Section anchors in the index come from `slugify()`/`dedupeSlug()` in `scripts/lib/markdown-helpers.mjs`, which replicate kramdown's GitHub-style slugging (including `-1`, `-2` suffixes for repeated headings) so the generated links match what Jekyll actually renders. Swapping in a generic slug library breaks every deep link.

## One workflow commits to master; a second must not fight it

- `ci.yml` declares `permissions: contents: read` and cancels superseded **pull request** runs through its own `ci-*` concurrency group. Cancellation is safe there only because the workflow writes nothing; master pushes are deliberately not cancelled, so every landed commit keeps its own gate result.
- `ci.yml` runs `npm test` on a Node matrix of `"20"` and `lts/*`, with `fail-fast: false` so a failure on one version still reports the other. `"20"` is the floor declared in `package.json` `engines`; testing only `lts/*` let a script use a newer built-in and still pass, breaking the documented minimum for somebody else. The gate it runs makes no network calls — that is what keeps this workflow deterministic, and why the external link check lives elsewhere.
- `release-export.yml` pins `softprops/action-gh-release` to a commit SHA with a trailing version comment (currently `efb35369e0ad2afab669f228072c1b0d510eae64 # v3.0.3`), because it is a third-party action inside a `contents: write` job. Keep the pin and the comment together — `.github/dependabot.yml` updates both.

- `check-freshness.yml` (badge JSON) pushes to `master` as `github-actions[bot]`. It commits with `[skip ci]` so its own push does not retrigger CI in a loop, guards with `git diff --quiet` so it only commits real changes, and holds the `auto-commit-master` concurrency group with `cancel-in-progress: false` so concurrent runs queue on the `git pull --rebase` / `git push` instead of racing.
- Another workflow that pushes to `master` must join that same group and carry `[skip ci]`. `release-export.yml` does not push to master, which is why it stays out of the group.
- `check-links.yml` (weekly, Mondays 07:00 UTC, plus `workflow_dispatch`) runs `npm run check:links:external`. It declares `permissions: contents: read` and writes nothing, so it also stays out of `auto-commit-master`, and it cancels superseded runs safely. It is scheduled an hour after `check-freshness.yml` so the two maintenance runs do not report at the same moment. A red run here means link rot to triage, not a broken build: nothing gates on it.
- If branch protection is ever enabled on `master`, it must allow `github-actions[bot]` to push, or the workflow fails on its push step.

## Conventions

- Markdown indent is 2 spaces (`.editorconfig`). Trailing whitespace is **not** trimmed in `.md` — it encodes hard line breaks. Do not run a bulk whitespace strip over content.
- New pages: kebab-case filename, YAML frontmatter with `last_reviewed`, an `# H1`, a one-line blockquote summary, then `## ` sections of fenced code blocks. Cite sources where relevant. End the page with a link back to the folder index.
- `_config.yml` sets a `defaults` block applying the theme's `default` layout to every page. Content pages carry frontmatter but no `layout:` key, so removing that block strips the site chrome from every page. Its `exclude` list covers `node_modules`, `package.json`, `package-lock.json`, `.remarkrc.js`, `.cspell.json`, `.mlc-config.json`, `.mlc-config.external.json`, `CONTRIBUTING.md`, `LICENSE.md`, `assets/cli-index.json`, `bin`, and `scripts`. Add a new root-level config file to that list or it publishes as a site page.
- Note that `AGENTS.md`, `CLAUDE.md`, and `SECURITY.md` are **not** excluded, so they are published as GitHub Pages alongside the cheatsheets. That may well be intended for `SECURITY.md`; it is more doubtful for the two agent-instruction files. Left as-is deliberately — changing it changes what the published site contains, which is a maintainer's call, not a cleanup.
- The npm package name is `ucheat`; `files` ships only `bin`, `assets/cli-index.json`, and `README.md`, and `prepublishOnly` regenerates the index. Runtime deps are `fuse.js`, `marked`, `marked-terminal`; everything else is a devDependency.
- Branches: `issues/` is the only accepted prefix and the only branch a contributor pushes; names are kebab-case only, matching `^issues/[a-z0-9]+(-[a-z0-9]+)*$`. Conventional-style commit subjects (`fix:`, `feat:`, `chore:`).
- Duplicate author identities are collapsed via `.mailmap`.
- Never read or write `.env`, and never put credentials in a cheatsheet example.
- Do not run `git add` or `git commit` on your own initiative.

## Generated assets

| Artifact | Built by | Committed | Kept in sync by |
|---|---|---|---|
| `assets/cli-index.json` | `npm run build:cli-index` | Yes | `npm test` (`check:cli-index`) |
| `assets/search-index.json` | `npm run build:index` | Yes | `.husky/pre-commit` (keeps it current), `npm test` (`check:index`) catches a stale one |
| `assets/freshness-badge.json` | `npm run check:freshness` | Yes | `check-freshness.yml` |
| `assets/img/og-image.png` | `python3 scripts/gen-og-image.py` | Yes | Manual |
| `dist/**` | `npm run build:export` | No (git-ignored) | `release-export.yml` |

`assets/img/og-image.png` is produced by [`scripts/gen-og-image.py`](scripts/gen-og-image.py) (Pillow, deterministic — no randomness, no timestamps, hard error when no TrueType font is found). Edit the script and rerun it; never hand-edit the PNG.
