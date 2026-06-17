// Generates the contributor leaderboard in README.md.
//
// Runs `git shortlog -sn` over the full history (offline — no GitHub token, no
// API, no network) and writes a ranked `count — name` list into README.md
// between the stable markers <!-- CONTRIBUTORS:START --> and
// <!-- CONTRIBUTORS:END -->.
//
// `-sn` (summary + numbered, no `-e`) keeps email addresses out of the output,
// so the rendered section contains names only and no external links — it cannot
// break markdown-link-check.
//
// Run with: npm run leaderboard  (Node >=20). Maintainer-triggered, typically
// before a release.

import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const readmePath = join(root, "README.md");

const START = "<!-- CONTRIBUTORS:START -->";
const END = "<!-- CONTRIBUTORS:END -->";

// `git shortlog` reads stdin by default; pass an explicit ref so it works in a
// non-interactive (non-tty) context such as `npm run`.
const raw = execFileSync(
  "git",
  ["shortlog", "-sn", "HEAD"],
  { cwd: root, encoding: "utf8" },
);

const rows = raw
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    const match = line.match(/^(\d+)\s+(.+)$/);
    return match ? { count: Number(match[1]), name: match[2] } : null;
  })
  .filter(Boolean)
  // Drop bot identities (e.g. github-actions[bot]) so the auto-commit
  // workflows that push to master never climb the leaderboard (H-11).
  .filter((r) => !/\[bot\]$/.test(r.name));

const list = rows.length
  ? rows
      .map(
        (r, i) =>
          `${i + 1}. **${r.name}** — ${r.count} ${r.count === 1 ? "commit" : "commits"}`,
      )
      .join("\n")
  : "_No contributors found._";

const block = `${START}\n${list}\n${END}`;

const readme = readFileSync(readmePath, "utf8");
const pattern = new RegExp(
  `${escapeRegExp(START)}[\\s\\S]*?${escapeRegExp(END)}`,
);
if (!pattern.test(readme)) {
  console.error(
    `Markers not found in README.md. Expected ${START} ... ${END}.`,
  );
  process.exit(1);
}

const updated = readme.replace(pattern, block);
writeFileSync(readmePath, updated);
console.log(`Updated contributor leaderboard (${rows.length} contributors).`);

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
