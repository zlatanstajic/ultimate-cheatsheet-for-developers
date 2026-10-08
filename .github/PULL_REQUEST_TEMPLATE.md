# Pull request

Closes #

## What changed

<!-- One or two sentences. Which pages or scripts, and why. -->

## Before you request review

Confirm each of these, and say so below if one does not apply.

1. Branch is named `issues/<number>-<kebab-case>` and targets `master`.
2. `npm test` passes locally — lint, links, spell, snippet self-test, CLI index, search index.
3. Ran `npm run build:cli-index` and committed `assets/cli-index.json`. Required for any edit under `shell/`, `knowledgebase/`, or `README.md`, because the gate diffs that artifact against `HEAD`.
4. Let the pre-commit hook run, so `assets/search-index.json` was rebuilt and staged. If you committed with `--no-verify`, run `npm run build:index` by hand.
5. New commands, flags, and proper nouns were added to the `words` array in [`.cspell.json`](../.cspell.json) rather than reworded away.
6. Bumped `last_reviewed` in the frontmatter of every content page you touched, and recorded the tool version in `tested_on` where you verified it.
7. A new or renamed page is linked from both the root [`README.md`](../README.md) table and the matching folder index.
8. If you edited `shell/git.md`, `shell/docker.md`, `shell/jq.md`, or `shell/linux.md` and the snippet self-test failed, updated the assertion in `scripts/build-snippets.mjs` to match rather than deleting it.
9. No credentials, tokens, or private hostnames appear in any example.

## Notes for the reviewer

<!-- Anything non-obvious: a deliberate deviation, a command you could not verify, an open question. -->
