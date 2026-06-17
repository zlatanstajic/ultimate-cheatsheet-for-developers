// Shared Markdown helpers for the index builders (build-search-index.mjs and
// build-cli-index.mjs). Extracted verbatim from build-search-index.mjs so both
// builders slug headings and walk the content directories identically.

import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// Replicates kramdown's GitHub-style heading slugging: lowercase, drop
// characters that are not word chars / spaces / hyphens, collapse spaces to
// single hyphens. Validated against existing TOCs (e.g. shell/git.md exposes
// "#stash" and "#example-alias-commands").
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Mirrors kramdown's intra-document duplicate-anchor handling: the first
// occurrence keeps the bare slug, later identical headings get "-1", "-2", …
export function dedupeSlug(slug, seen) {
  const count = seen.get(slug) ?? 0;
  seen.set(slug, count + 1);
  return count === 0 ? slug : `${slug}-${count}`;
}

export function listMarkdown(dir) {
  const out = [];
  // Sorted so the emitted index order is stable across filesystems —
  // check:cli-index diffs the artifact byte-for-byte.
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...listMarkdown(full));
    } else if (entry.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}
