// Report-only freshness check.
//
// Reads the `last_reviewed` frontmatter date from every Markdown page under the
// content directories, counts how many need review (older than 6 months, OR
// missing/invalid/typo'd metadata), prints a per-file report, and writes a
// shields.io endpoint JSON badge (assets/freshness-badge.json) consumed by the
// README freshness badge.
//
// This script is informational. It NEVER gates CI or `npm test`: it always
// exits zero, even on parse errors or stale pages.
//
// Run with: npm run check:freshness  (Node >=20).

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { load } from "js-yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const contentDirs = ["knowledgebase", "shell"];

// Index/TOC pages are navigation, not reviewable cheatsheets (H-12). Keep their
// frontmatter (harmless) but exclude them from the freshness count.
const excludedRel = new Set(["knowledgebase/README.md", "shell/README.md"]);

// Fixed-days threshold instead of setMonth(-6): subtracting calendar months
// rolls over unpredictably when run on the 29th–31st (H-14). A fixed 183-day
// (≈6-month) epoch subtraction keeps the stale boundary stable regardless of
// the run date.
const STALE_DAYS = 183;

// Keys that look like last_reviewed but are not — typos/variants. Used to emit a
// distinct WARN line instead of silently folding the page into "missing" (H-13).
const SUSPECT_KEYS = ["last_reveiwed", "lastreviewed", "last-reviewed", "lastReviewed", "reviewed", "last_review"];

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
// Returns the parsed object, or null when no frontmatter is present.
function readFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return null;
  const data = load(match[1]);
  return data && typeof data === "object" ? data : null;
}

// Threshold date: STALE_DAYS before now, via epoch-millis subtraction.
const now = new Date();
const threshold = new Date(now.getTime() - STALE_DAYS * 24 * 60 * 60 * 1000);

const files = [];
for (const dir of contentDirs) {
  try {
    files.push(...listMarkdown(join(root, dir)));
  } catch (err) {
    // A missing/renamed content dir must not break the always-exit-zero
    // invariant: log it and keep going.
    console.log(`  ?  ${dir} — could not list directory: ${err.message}`);
  }
}
files.sort();

let stale = 0;
let missing = 0;
let counted = 0;

for (const abs of files) {
  const rel = relative(root, abs).split("\\").join("/");
  if (excludedRel.has(rel)) {
    console.log(`  -  ${rel} — index/TOC page, excluded from count`);
    continue;
  }
  counted++;

  let fm = null;
  try {
    fm = readFrontmatter(readFileSync(abs, "utf8"));
  } catch (err) {
    console.log(`  ?  ${rel} — frontmatter parse error: ${err.message}`);
    missing++;
    continue;
  }

  const reviewed = fm?.last_reviewed;
  if (reviewed === undefined || reviewed === null || reviewed === "") {
    // Distinguish a typo'd/misspelled key from a genuinely absent one (H-13).
    const suspect = fm
      ? SUSPECT_KEYS.find((k) => k in fm)
      : null;
    if (suspect) {
      console.log(`  ⚠  WARN: ${rel} has malformed/typo'd last_reviewed (found key "${suspect}")`);
    } else {
      console.log(`  ?  ${rel} — no last_reviewed`);
    }
    missing++;
    continue;
  }

  // js-yaml resolves an unquoted ISO date (YAML 1.1 timestamp) to a Date; a
  // quoted value stays a string. Normalize both to a UTC Date.
  const date =
    reviewed instanceof Date ? reviewed : new Date(`${reviewed}T00:00:00Z`);
  const reviewedStr =
    reviewed instanceof Date ? reviewed.toISOString().slice(0, 10) : reviewed;
  if (Number.isNaN(date.getTime())) {
    console.log(`  ⚠  WARN: ${rel} has malformed/typo'd last_reviewed (unparseable value: ${reviewedStr})`);
    missing++;
    continue;
  }

  if (date < threshold) {
    stale++;
    console.log(`  ✗  ${rel} — last_reviewed ${reviewedStr} (stale, > ${STALE_DAYS} days)`);
  } else {
    console.log(`  ✓  ${rel} — last_reviewed ${reviewedStr}`);
  }
}

// Pages with missing/invalid/typo'd dates count toward the badge total so the
// signal surfaces them rather than hiding them. The single honest "to review"
// label covers stale + missing + invalid (H-3).
const flagged = stale + missing;

// Color is a FRACTION of the counted pages (H-4): green at 0; yellow when
// flagged is 1–10% (inclusive) of counted pages; red above 10%.
const fraction = counted === 0 ? 0 : flagged / counted;
const color = flagged === 0 ? "green" : fraction <= 0.1 ? "yellow" : "red";

console.log(
  `\n${counted} pages counted (${files.length} scanned) — ${stale} stale, ${missing} missing/invalid last_reviewed; ${flagged} to review (${(fraction * 100).toFixed(1)}%).`,
);

const badge = {
  schemaVersion: 1,
  label: "freshness",
  message: `${flagged} to review`,
  color,
};

const outDir = join(root, "assets");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "freshness-badge.json");
writeFileSync(outPath, `${JSON.stringify(badge, null, 2)}\n`);
console.log(`Wrote ${relative(root, outPath)} (${badge.message}, ${color}).`);

// Report-only: always succeed.
process.exit(0);
