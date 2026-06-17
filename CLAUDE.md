# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A content repository, not an application. It is a curated collection of developer cheatsheets written in plain Markdown. The site is published to GitHub Pages via Jekyll (`_config.yml`, `jekyll-theme-minimal`) at `https://zlatanstajic.github.io/ultimate-cheatsheet-for-developers`.

The repo also doubles as the npm package **`ucheat`** — a CLI (`npx ucheat git stash`) that renders cheatsheet sections in the terminal. See "The `ucheat` CLI" below.

Content lives in two top-level folders:

- `knowledgebase/` — curated resource lists (GitHub repos, learning sources, tools, books, Linux apps).
- `shell/` — command cheatsheets per tool (git, docker, mysql, postgresql, node, npm, python, php, redis, curl, composer, git-crypt, linux).

`README.md` holds the master table of contents linking every page. **When adding or renaming a page, update the README table of contents** — links there are checked by `markdown-link-check`.

## Commands

```bash
npm install          # install validation tooling (Node >=20)
npm test             # full validation: lint:md && check:links && spell && check:cli-index

npm run lint:md         # remark lint (remark-preset-lint-recommended), --frail = fail on warnings
npm run check:links     # markdown-link-check on every .md (validates external + relative links)
npm run spell           # cspell against every .md
npm run build:cli-index # regenerate assets/cli-index.json for the ucheat CLI
npm run check:cli-index # rebuild the index and fail on uncommitted drift
```

There is no single-test runner — each script globs all `*.md` (excluding `node_modules`). To validate one file, run the underlying tool directly, e.g. `npx remark --frail shell/git.md` or `npx cspell shell/git.md`.

## Export toolchain

Optional offline-export build (output goes to the git-ignored `dist/` folder):

```bash
npm run build:print     # print-optimized HTML in dist/print/ (scripts/build-print.mjs)
npm run build:snippets  # VS Code snippet bundle in dist/snippets/cheatsheets.code-snippets (scripts/build-snippets.mjs)
npm run build:export    # both

node scripts/build-snippets.mjs --check   # self-test: fixture assertions against real shell/*.md content; writes nothing
```

- `build-print.mjs` renders `knowledgebase/**`, `shell/**`, and the root `README.md` (→ `index.html`) via a hand-rolled mdast-to-HTML serializer (no rehype). Each `##` section becomes a `<section class="card">` for clean print page breaks; `assets/print.css` is inlined and hides the TOC card and "back to ..." nav links under `@media print`. Relative `.md` links are rewritten to `.html`; links with no counterpart in the export (e.g. `CONTRIBUTING.md`, `search.html`) are rebased onto the published GitHub Pages site.
- `build-snippets.mjs` extracts `# comment` + command pairs from `bash`/`sh` fenced blocks in `shell/*.md` (skipping `shell/README.md`); the comment becomes the snippet description, `[placeholder]` tokens become `${N:placeholder}` tabstops (purely numeric tokens like `sys.argv[1]` stay literal), and prefixes are auto-derived and globally unique. **Content edits in `shell/*.md` can break the `--check` fixtures** — if a fixture references a line you changed, update the assertion in `scripts/build-snippets.mjs`.
- `.github/workflows/release-export.yml` (manual `workflow_dispatch`, takes a `tag` input) runs the snippet self-test, builds both exports, and attaches them to a GitHub Release.

## Validation pipeline (the de-facto CI)

Three independent tools gate every Markdown change. A `husky` pre-commit hook runs `lint-staged`, applying all three to staged `*.md` files — so commits fail locally if any tool fails.

| Tool | Config | Purpose |
|---|---|---|
| `remark-cli` | `.remarkrc.js` | lint (recommended preset; `--frail` treats warnings as errors) |
| `markdown-link-check` | `.mlc-config.json` | link validity; ignores `#L\d+` anchors, retries on HTTP 429 |
| `cspell` | `.cspell.json` | spell check; unknown words must be added to the `words` allowlist |

**New jargon / proper nouns trip cspell.** When a cheatsheet introduces a term cspell doesn't know (command flags, tool names, acronyms like `FLUSHALL`, author handles), add it to the `words` array in `.cspell.json` — that is the intended fix, not rewording the content.

Note: `markdownlint-cli` is **not** a dependency. `.markdownlint.json` exists for editor extensions only; `remark` is the actual linter. Relevant remark rules in effect: `MD013` (line length) and `MD041` (first-line heading) are disabled — long lines and non-heading first lines are allowed.

## The `ucheat` CLI

`package.json` is published to npm as `ucheat` (`bin/ucheat.mjs` is the entry point). The CLI reads a prebuilt index, `assets/cli-index.json` — it never parses Markdown at build/runtime beyond rendering with `marked` + `marked-terminal`; section lookup is fuzzy-matched with `fuse.js`.

- `npx ucheat` — usage + available tools; `npx ucheat <tool>` — list a tool's sections; `npx ucheat <tool> <section>` — render a section (fuzzy, e.g. `git stsh`). Exit codes: 0 rendered, 1 no match, 2 ambiguous.
- `scripts/build-cli-index.mjs` generates the index from `README.md`, `knowledgebase/**`, and `shell/**` (same section walk as `scripts/build-search-index.mjs`; shared helpers in `scripts/lib/markdown-helpers.mjs`). Tool names derive from filenames (`git` from `shell/git.md`).
- **Editing any content under `shell/`, `knowledgebase/`, or `README.md` changes the index.** Run `npm run build:cli-index` and commit the regenerated `assets/cli-index.json` with the content change — `npm test` includes `check:cli-index`, which fails on drift.
- `prepublishOnly` regenerates the index before `npm publish`; the published tarball contains only `bin`, `assets/cli-index.json`, and `README.md`. Runtime deps: `fuse.js`, `marked`, `marked-terminal`.
- `_config.yml` excludes `bin/`, `scripts/`, and the index from the Jekyll site. Release checklist for maintainers is in `CONTRIBUTING.md`.

## Conventions

- Markdown indent is 2 spaces (`.editorconfig`); trailing whitespace is **not** trimmed in `.md` (preserves hard breaks).
- New pages: kebab-case filenames, short header + summary at top, fenced code blocks for commands, cite sources where relevant (per `CONTRIBUTING.md`).
- Branch prefixes `feature/` / `fix/`; Conventional-style commits (`fix:`, `feat:`).
