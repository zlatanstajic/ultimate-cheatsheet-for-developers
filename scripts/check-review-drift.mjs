// Report-only review-drift check.
//
// `last_reviewed` is a manual ATTESTATION ("I verified this page on date X"),
// not a value derived from git. Nothing forces a contributor to bump it when
// they edit a page, so the attestation can silently drift behind the real last
// edit and the freshness badge becomes a lie (H-9).
//
// This script compares, for every content page, the file's git last-modified
// date against its `last_reviewed` frontmatter and lists pages whose CONTENT
// was modified AFTER the attested review date. It is purely informational.
//
// Like check-freshness.mjs, it ALWAYS exits zero — it never gates CI, `npm
// test`, or the pre-commit hook. Run it manually with: npm run check:drift
// (Node >=20).

import { readFileSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import yaml from "js-yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const contentDirs = ["knowledgebase", "shell"];

function listMarkdown(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...listMarkdown(full));
    } else if (entry.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

// Extract and parse a leading `---`-delimited YAML frontmatter block.
function readFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return null;
  const data = yaml.load(match[1]);
  return data && typeof data === "object" ? data : null;
}

// Git's last-modified date for a path (YYYY-MM-DD), or null if untracked.
function gitLastModified(rel) {
  try {
    const out = execFileSync(
      "git",
      ["log", "-1", "--format=%ad", "--date=short", "--", rel],
      { cwd: root, encoding: "utf8" },
    ).trim();
    return out || null;
  } catch {
    return null;
  }
}

const files = [];
for (const dir of contentDirs) {
  try {
    files.push(...listMarkdown(join(root, dir)));
  } catch (err) {
    console.log(`  ?  ${dir} — could not list directory: ${err.message}`);
  }
}
files.sort();

let drifted = 0;
let unknown = 0;

for (const abs of files) {
  const rel = relative(root, abs).split("\\").join("/");

  let fm = null;
  try {
    fm = readFrontmatter(readFileSync(abs, "utf8"));
  } catch (err) {
    console.log(`  ?  ${rel} — frontmatter parse error: ${err.message}`);
    unknown++;
    continue;
  }

  const reviewed = fm?.last_reviewed;
  const reviewedStr =
    reviewed instanceof Date ? reviewed.toISOString().slice(0, 10) : reviewed;
  if (!reviewedStr) {
    console.log(`  ?  ${rel} — no last_reviewed to compare`);
    unknown++;
    continue;
  }

  const modified = gitLastModified(rel);
  if (!modified) {
    console.log(`  ?  ${rel} — no git history (untracked?)`);
    unknown++;
    continue;
  }

  // Both are YYYY-MM-DD ISO strings, so a lexicographic compare is a date
  // compare. Content edited strictly after the attested review date = drift.
  if (modified > reviewedStr) {
    drifted++;
    console.log(`  ✗  ${rel} — modified ${modified} > last_reviewed ${reviewedStr} (attestation stale)`);
  } else {
    console.log(`  ✓  ${rel} — last_reviewed ${reviewedStr} >= modified ${modified}`);
  }
}

console.log(
  `\n${files.length} pages checked — ${drifted} drifted (edited after last_reviewed), ${unknown} indeterminate.`,
);

// Report-only: always succeed.
process.exit(0);
