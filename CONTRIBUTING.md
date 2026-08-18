# Contributing to Ultimate Cheatsheet for Developers

Thanks for considering a contribution! This file explains the recommended way to propose changes so maintainers can review and merge them quickly.

## Quick start

- Fork the repository and create a branch for your change (use `feature/` or `fix/` prefixes).
- Make focused, small changes and update or add files under the appropriate folder (for example `knowledgebase/` or `shell/`).
- Open a Pull Request (PR) describing the change and link any related issue.

## Issues

- Open an issue to start a discussion for larger changes or new sections.
- For bug reports include steps to reproduce and any relevant environment details.

## Pull Requests

- Keep PRs small and scoped to a single purpose.
- Use clear titles and a detailed description. Reference the issue number when applicable (e.g. "Fixes #123").
- Include examples, command output, or screenshots when helpful.

## Adding new cheatsheets or pages

- Add new Markdown files in the appropriate top-level folder (`knowledgebase/`, `shell/`, etc.).
- Use descriptive filenames (kebab-case) and include a short header and summary at the top of the file.
- Cite sources or references where appropriate.

## Freshness metadata (frontmatter)

Every content page under `shell/` and `knowledgebase/` carries a YAML frontmatter block at the very top:

```yaml
---
last_reviewed: 2026-06-09
tested_on: git 2.43
---
```

- `last_reviewed` (**required**): the ISO date (`YYYY-MM-DD`) you last verified the page's content. **Update it whenever you edit a page.** This field is a manual **attestation** ("I checked this page on this date"), **not** a value derived from git — nothing computes it for you, and nothing forces you to bump it, so keeping it honest is on the contributor.
- `tested_on` (**optional**): the tool/version the commands were verified against. It may be a **string** (`tested_on: git 2.43`) or a YAML **list** when multiple versions were checked:

  ```yaml
  tested_on:
    - git 2.43
    - git 2.44
  ```

  Both forms lint and spell clean (see `shell/git.md` for a list example). Use `tested_on` on version-sensitive sheets (git, docker, node, npm); omit it on resource lists in `knowledgebase/`. **No check ever fails when `tested_on` is missing.**

### Freshness badge (`npm run check:freshness`)

A report-only freshness check writes the badge data in `assets/freshness-badge.json` (rendered in the README) and **always exits zero** — it never gates CI or `npm test`. Run it manually with:

```bash
npm run check:freshness
```

Badge semantics:

- The badge message reads **`<N> to review`**, where `N` counts pages that are stale (`last_reviewed` older than ~6 months / 183 days), **plus** pages with a missing, invalid, or typo'd `last_reviewed`. A typo'd key (e.g. `last_reveiwed`) prints a distinct `WARN:` line in the report so it is not silently folded into "missing".
- Badge **color is a fraction of the counted pages**: **green** when `N == 0`; **yellow** when `N` is 1–10% (inclusive) of counted pages; **red** when `N` is above 10%.
- The two index/TOC pages (`shell/README.md`, `knowledgebase/README.md`) keep their frontmatter but are **excluded from the count** — they are navigation, not reviewable cheatsheets.
- `last_reviewed` dates are intentionally **staggered** to each page's real last-edited date (not a single uniform date) so pages cross the staleness line gradually rather than all at once.

> **Badge link-check caveat:** `npm run check:links` only validates that the outer `img.shields.io` host is reachable — it does **not** validate the nested `?url=...github.io/.../freshness-badge.json` GitHub Pages target. After a change publishes to master, a maintainer must manually open the README and confirm the badge renders a count (not "inaccessible"); shields.io caches endpoint responses for ~300s, so allow a few minutes.

### Review-drift report (`npm run check:drift`)

Because `last_reviewed` is an attestation, it can drift behind the page's actual last edit. A second report-only script flags pages whose git last-modified date is newer than their `last_reviewed`:

```bash
npm run check:drift
```

Like the freshness check it **always exits zero** and is **not** part of `npm test` or the pre-commit hook — it is purely informational. Use it to spot pages that were edited without bumping `last_reviewed`.

### Inline version notes

For commands whose behavior or flags depend on a tool version, add a leading blockquote note just under the page intro:

```markdown
> Tested on: git 2.43
```

## Contributor leaderboard

The Contributors section in `README.md` (between the `<!-- CONTRIBUTORS:START -->` and `<!-- CONTRIBUTORS:END -->` markers) is generated offline from `git shortlog -sn HEAD` — no GitHub token or network access.

The leaderboard is **auto-maintained** by the `Build leaderboard` GitHub Action (`.github/workflows/build-leaderboard.yml`), which runs weekly (Monday 06:30 UTC) plus on-demand via `workflow_dispatch` and commits any change to master as `github-actions[bot]` with `[skip ci]`. You normally do not need to touch it. To regenerate locally/offline (e.g. before a release, or while working offline):

```bash
npm run leaderboard
```

Notes:

- **Bot identities are filtered out.** Any author whose name ends in `[bot]` (e.g. `github-actions[bot]`) is dropped, so the auto-commit workflows never appear on the leaderboard. This also absorbs the ±1 self-counting drift the bot's own commit would otherwise introduce.
- **Generated names are spell-checked.** The names land in `README.md`, which **is** scanned by `cspell`. If a new contributor's name or handle is an unusual word, `npm test` will fail until you add it to the `words` array in `.cspell.json` (this is the intended fix — see the spell-check note in `CLAUDE.md`).
- Duplicate author identities for one human are collapsed via `.mailmap`.

## Auto-commit workflows

Two GitHub Actions push generated artifacts to master as `github-actions[bot]` (`assets/search-index.json` is built by the pre-commit hook instead):

| Workflow | Artifact | Trigger |
|---|---|---|
| `check-freshness.yml` | `assets/freshness-badge.json` | push to content + weekly Mon 06:00 UTC |
| `build-leaderboard.yml` | `README.md` leaderboard block | weekly Mon 06:30 UTC + dispatch |

Both:

- commit with `[skip ci]` so their own push does not retrigger CI in a loop;
- use a `git diff --quiet` guard so they only commit when the artifact actually changed;
- share the **same concurrency group** (`auto-commit-master`, `cancel-in-progress: false`) so their `git pull --rebase` / `git push` steps **serialize** (queue) instead of racing each other on master.

If branch protection is ever enabled on master, it must allow `github-actions[bot]` to push for these workflows to succeed.

## Releasing the `ucheat` CLI (maintainers)

The repository doubles as the npm package `ucheat` (`npx ucheat git stash` renders cheatsheet sections in the terminal). Editing content under `shell/`, `knowledgebase/`, or `README.md` changes the CLI index too:

```bash
npm run build:cli-index
git add assets/cli-index.json
```

`npm test` includes `check:cli-index`, which rebuilds the index and fails on any uncommitted drift — so commit the regenerated `assets/cli-index.json` together with your content change.

Manual publish checklist:

1. Confirm the version bump in `package.json` and that `npm view ucheat` shows the name/versions as expected.
2. `npm login` (maintainer account).
3. `npm publish` — `prepublishOnly` regenerates `assets/cli-index.json` automatically before packing.
4. Smoke-test from a clean directory outside the repo: `npx ucheat@latest git stash`.

## Style and formatting

- Use plain Markdown. Keep lines reasonably short and use fenced code blocks for commands.
- Prefer clear, actionable examples and commands that have been manually verified where possible.

## Commit messages

- Use concise messages describing the change. Example formats:
  - `fix: correct typo in mysql cheatsheet`
  - `feat: add npm script examples`

## License and conduct

- By contributing you agree your contributions will be licensed under the repository's MIT License (see `LICENSE`).
- Be respectful in issues and PRs. If you think a code of conduct should be added, please open an issue.

## Contact

If you need to reach the maintainer directly, use <contact@zlatanstajic.com>.

Thanks — we appreciate your help improving this collection!
