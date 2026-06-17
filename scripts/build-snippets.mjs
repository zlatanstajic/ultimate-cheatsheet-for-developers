// Builds a VS Code snippet bundle from the `# comment` + command pairs inside
// the fenced bash/sh blocks of shell/*.md (shell/README.md is an index page
// and is skipped explicitly). Each pair becomes one snippet: comment text as
// description, an auto-derived globally unique prefix, and a (possibly
// multi-line) body with [placeholder] tokens rewritten to ${N:placeholder}
// tabstops and literal `\` / `$` escaped per VS Code snippet syntax.
//
// Output: dist/snippets/cheatsheets.code-snippets
// Run with: npm run build:snippets  (Node >=20).
// Self-test: node scripts/build-snippets.mjs --check  (fixture assertions
// against real shell/git.md, shell/docker.md, shell/jq.md, shell/linux.md
// content; exits non-zero on failure, writes nothing).

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import { visit } from "unist-util-visit";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const parser = unified().use(remarkParse).use(remarkFrontmatter);

const COMMENT_RE = /^#\s*(.+)$/;
const PLACEHOLDER_RE = /\[([^\[\]\n]+)\]/g;

// Escapes VS Code snippet metacharacters in literal (non-placeholder) text.
// Order matters: backslashes first, then dollars — otherwise the backslash
// inserted by the `$` escape would itself get doubled.
function escapeSnippetText(text) {
  return text.replace(/\\/g, "\\\\").replace(/\$/g, "\\$");
}

// Escapes the characters that would terminate or alter a ${N:default} tabstop
// when they appear inside the default text: backslashes first (same ordering
// rationale as above), then `$` and the closing `}`.
function escapePlaceholderDefault(text) {
  return text.replace(/\\/g, "\\\\").replace(/\$/g, "\\$").replace(/}/g, "\\}");
}

// Rewrites [placeholder] tokens in one body line to ${N:placeholder} tabstops.
// `tabstops` is a per-snippet Map(token -> number): the first occurrence of a
// token assigns the next number, repeated tokens reuse it (mirrored editing).
// Purely numeric tokens (e.g. Python `sys.argv[1]` in shell/linux.md) are real
// syntax, not placeholders — they pass through as escaped literal text.
// Literal segments between placeholders are snippet-escaped; tabstop default
// text escapes `\`, `$`, `}` so a token cannot break the ${N:...} syntax.
function convertBodyLine(line, tabstops) {
  let out = "";
  let last = 0;
  PLACEHOLDER_RE.lastIndex = 0;
  for (const match of line.matchAll(PLACEHOLDER_RE)) {
    out += escapeSnippetText(line.slice(last, match.index));
    const token = match[1];
    if (/^\d+$/.test(token)) {
      out += escapeSnippetText(match[0]);
    } else {
      if (!tabstops.has(token)) {
        tabstops.set(token, tabstops.size + 1);
      }
      out += "${" + tabstops.get(token) + ":" + escapePlaceholderDefault(token) + "}";
    }
    last = match.index + match[0].length;
  }
  out += escapeSnippetText(line.slice(last));
  return out;
}

// Derives a prefix from the first body line (before placeholder rewrite):
// strip [...] groups, strip a leading `!` (git alias examples), split on
// whitespace, drop flag tokens (leading `-`), reduce each token to its
// lowercase [a-z0-9] characters, join the first 3 non-empty tokens with `-`.
function derivePrefix(firstLine, fileStem) {
  const tokens = firstLine
    .replace(PLACEHOLDER_RE, "")
    .replace(/^!/, "")
    .split(/\s+/)
    .filter((token) => token !== "" && !token.startsWith("-"))
    .map((token) => token.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter((token) => token !== "");
  return tokens.slice(0, 3).join("-") || fileStem;
}

// Pairs `# comment` lines with the command lines that follow inside one code
// block. A comment line opens a pair (consecutive comment lines concatenate
// into one description); non-blank non-comment lines accumulate into the body;
// a pair closes on blank line, next comment line, or end of block. Orphan
// command lines (no open comment) and trailing comments (no body) are skipped.
function extractPairs(codeValue) {
  const pairs = [];
  let description = null;
  let body = [];
  const flush = () => {
    if (description !== null && body.length > 0) {
      pairs.push({ description, body });
    }
    description = null;
    body = [];
  };
  for (const line of codeValue.split("\n")) {
    const comment = line.match(COMMENT_RE);
    if (comment) {
      if (body.length > 0) flush();
      description =
        description === null ? comment[1] : `${description} ${comment[1]}`;
    } else if (line.trim() === "") {
      flush();
    } else if (description !== null) {
      body.push(line);
    }
    // else: command line with no open comment — skipped.
  }
  flush();
  return pairs;
}

function buildSnippets() {
  const shellDir = join(root, "shell");
  const files = readdirSync(shellDir)
    .filter((entry) => entry.endsWith(".md") && entry !== "README.md")
    .sort();

  const snippets = {};
  const usedPrefixes = new Set();
  let count = 0;

  for (const file of files) {
    const stem = file.replace(/\.md$/, "");
    const tree = parser.parse(readFileSync(join(shellDir, file), "utf8"));
    visit(tree, "code", (node) => {
      if (node.lang !== "bash" && node.lang !== "sh") return;
      for (const { description, body } of extractPairs(node.value)) {
        const tabstops = new Map();
        const snippetBody = body.map((line) => convertBodyLine(line, tabstops));

        let key = `${stem}: ${description}`;
        for (let n = 2; key in snippets; n++) {
          key = `${stem}: ${description} (${n})`;
        }

        const base = derivePrefix(body[0], stem);
        let prefix = base;
        for (let n = 2; usedPrefixes.has(prefix); n++) {
          prefix = `${base}-${n}`;
        }
        usedPrefixes.add(prefix);

        snippets[key] = {
          prefix,
          body: snippetBody,
          description,
          scope: "shellscript",
        };
        count++;
      }
    });
  }

  return { snippets, count, fileCount: files.length };
}

// Fixture assertions drawn from real source content (see plan Test Plan).
function runChecks(snippets) {
  const failures = [];
  const assert = (label, condition) => {
    if (!condition) failures.push(label);
  };
  const bodyOf = (key) => snippets[key]?.body;
  const allBodyLines = Object.values(snippets).flatMap((s) => s.body);
  const sameBody = (a, b) =>
    Array.isArray(a) && a.length === b.length && a.every((l, i) => l === b[i]);

  assert(
    "git stash push: placeholder rewritten to tabstop",
    sameBody(bodyOf("git: Save working changes to stash"), [
      'git stash push -m "${1:message-content}"',
    ]),
  );
  assert(
    "git reset+push: two-line body",
    sameBody(
      bodyOf("git: Delete last n commits and force push to remote origin"),
      ["git reset --hard HEAD~${1:n}", "git push -f"],
    ),
  );
  assert(
    "git awk: literal $ escaped, stray ] not a placeholder",
    sameBody(bodyOf("git: List all branches in local which are gone on remote"), [
      "git branch -vv | awk '/: gone]/{print \\$1}'",
    ]),
  );
  assert(
    "git new repository: repeated token reuses tabstop, distinct tokens get new ones",
    sameBody(bodyOf("git: Create a new repository"), [
      "git init",
      "git add .",
      'git commit -m "${1:message-content}"',
      "git branch -M ${2:master|main}",
      "git remote add origin git@github.com:${3:vendor-name}/${4:repository-name}.git",
      "git push -u origin ${2:master|main}",
    ]),
  );
  assert(
    "docker BuildKit: three lines kept, trailing \\ escaped",
    sameBody(
      bodyOf(
        "docker: Build using a secret (BuildKit) — avoids baking credentials into image history",
      ),
      [
        "DOCKER_BUILDKIT=1 docker build \\\\",
        "  --secret id=composer_auth,src=./auth.json \\\\",
        "  -t ${1:image-name}:${2:tag} .",
      ],
    ),
  );
  assert(
    "docker Notes: orphan command line skipped",
    !allBodyLines.some((line) => line.includes("sudo usermod -aG docker")),
  );
  assert(
    "docker Notes: trailing comment without command skipped",
    !Object.keys(snippets).some((key) =>
      key.startsWith("docker: Log out and back in"),
    ),
  );
  assert(
    "jq pipe: [key]/[file.json] rewritten, empty [] untouched",
    sameBody(
      bodyOf("jq: Pipe one filter into the next (extract a field from each element)"),
      ["jq '.[] | .${1:key}' ${2:file.json}"],
    ),
  );
  assert(
    "linux URL encode: numeric [1] in sys.argv[1] kept literal, no tabstop",
    sameBody(bodyOf("linux: URL encode"), [
      'python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1]))" "string to encode"',
    ]),
  );
  assert(
    "no numeric tabstop created anywhere",
    !allBodyLines.some((line) => /(?<!\\)\$\{\d+:\d+\}/.test(line)),
  );
  assert(
    "jq --arg: literal $name escaped",
    sameBody(bodyOf("jq: Inject a shell string as a jq variable (--arg)"), [
      "jq --arg name '${1:value}' '.users[] | select(.name == \\$name)' ${2:file.json}",
    ]),
  );
  assert(
    "git Setting Alias: text fence contributes nothing",
    !allBodyLines.some((line) => line.includes("prune-list =")),
  );
  // Synthetic fixture (no real source token contains these characters yet):
  // `\`, `$`, `}` inside a [placeholder] must be escaped in the tabstop
  // default text so the emitted ${N:...} stays valid snippet syntax.
  assert(
    "synthetic: \\ $ } escaped inside tabstop default text",
    convertBodyLine("echo [foo$bar}baz\\qux]", new Map()) ===
      "echo ${1:foo\\$bar\\}baz\\\\qux}",
  );
  assert(
    "prefix derivation: git-stash-push",
    snippets["git: Save working changes to stash"]?.prefix === "git-stash-push",
  );
  assert(
    "prefix derivation: git-log (flags and placeholders stripped)",
    snippets["git: Get last n commits"]?.prefix === "git-log",
  );
  assert(
    "every entry has prefix/body/description/scope",
    Object.values(snippets).every(
      (s) =>
        typeof s.prefix === "string" &&
        s.prefix.length > 0 &&
        Array.isArray(s.body) &&
        s.body.length > 0 &&
        typeof s.description === "string" &&
        s.scope === "shellscript",
    ),
  );
  assert(
    "all prefixes unique",
    new Set(Object.values(snippets).map((s) => s.prefix)).size ===
      Object.keys(snippets).length,
  );

  return failures;
}

const { snippets, count, fileCount } = buildSnippets();

if (process.argv.includes("--check")) {
  const failures = runChecks(snippets);
  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`FAIL: ${failure}`);
    }
    process.exit(1);
  }
  console.log(`All fixture checks passed (${count} snippets from ${fileCount} files).`);
} else {
  const outDir = join(root, "dist", "snippets");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "cheatsheets.code-snippets");
  writeFileSync(outPath, JSON.stringify(snippets, null, 2) + "\n");
  console.log(
    `Wrote ${relative(root, outPath)} (${count} snippets from ${fileCount} files).`,
  );
}
