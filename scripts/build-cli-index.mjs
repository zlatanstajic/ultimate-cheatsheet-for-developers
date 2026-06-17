// Builds the prebuilt CLI index consumed by bin/ucheat.mjs (`npx ucheat ...`).
//
// Walks README.md, knowledgebase/**, and shell/**, splits every page into
// heading sections (same walk as build-search-index.mjs), and stores each
// section's RAW Markdown body — sliced from the original source string via
// mdast position offsets — so the CLI renders fenced code blocks verbatim with
// marked-terminal and never needs remark at runtime.
//
// Output: assets/cli-index.json  (array of { tool, file, section, anchor, body }).
// Run with: npm run build:cli-index  (Node >=20). `prepublishOnly` regenerates
// it so a published tarball can never ship a stale index.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import { toString as mdastToString } from "mdast-util-to-string";

import { slugify, dedupeSlug, listMarkdown } from "./lib/markdown-helpers.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Same sources as build-search-index.mjs.
const sourceDirs = ["knowledgebase", "shell"];
const sourceFiles = ["README.md"];

// remark-frontmatter keeps the leading YAML block out of the section walk: the
// first heading opens the first section, so frontmatter (which precedes it)
// never lands in a section body.
const parser = unified().use(remarkParse).use(remarkFrontmatter);

const docs = [];
const toolFiles = new Map();

function collectFile(absPath) {
  const relPath = relative(root, absPath).split("\\").join("/");
  // Tool name derives from the filename ("git" from shell/git.md). README/TOC
  // pages are navigation, not tools, so they map to "" and stay out of the
  // CLI's tool list.
  // Lowercased so the CLI's case-insensitive lookup always finds it, whatever
  // the filename casing. READMEs take a navigational tool name — the directory
  // for shell/README.md and knowledgebase/README.md, "readme" for the root —
  // so every section is addressable as `ucheat <tool> <section>`.
  const stem = basename(relPath, ".md").toLowerCase();
  const parent = dirname(relPath);
  const tool = stem === "readme" && parent !== "." ? parent.toLowerCase() : stem;
  const priorFile = toolFiles.get(tool);
  if (priorFile && priorFile !== relPath) {
    // Two files mapping to one tool would silently merge their sections and
    // misattribute the source in the CLI's section listing.
    throw new Error(`Tool name "${tool}" collides: ${priorFile} vs ${relPath}`);
  }
  toolFiles.set(tool, relPath);
  const markdown = readFileSync(absPath, "utf8");
  const tree = parser.parse(markdown);

  // Every heading (any depth) opens a section — matching build-search-index —
  // so a ## section's body ends at its first ### subsection, which is indexed
  // as its own independently renderable section. Each body is the raw source
  // slice from its heading's start offset to the next heading's start offset
  // (or EOF).
  const headings = tree.children.filter((node) => node.type === "heading");

  // Page-level document (lets the CLI enumerate tools/pages).
  docs.push({ tool, file: relPath, section: "", anchor: "", body: "" });

  const seenSlugs = new Map();
  for (let i = 0; i < headings.length; i++) {
    const section = mdastToString(headings[i]);
    const anchor = "#" + dedupeSlug(slugify(section), seenSlugs);
    const start = headings[i].position?.start?.offset;
    const end = headings[i + 1]?.position?.start?.offset ?? markdown.length;
    if (start === undefined) {
      // remark-parse always emits positions; if that ever changes, fail loudly
      // rather than emit an index with empty bodies.
      throw new Error(`No position offset for heading "${section}" in ${relPath}`);
    }
    docs.push({
      tool,
      file: relPath,
      section,
      anchor,
      body: markdown.slice(start, end).trimEnd(),
    });
  }
}

for (const file of sourceFiles) {
  collectFile(join(root, file));
}
for (const dir of sourceDirs) {
  for (const file of listMarkdown(join(root, dir))) {
    collectFile(file);
  }
}

const outDir = join(root, "assets");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "cli-index.json");
writeFileSync(outPath, JSON.stringify(docs));
console.log(`Wrote ${relative(root, outPath)} (${docs.length} documents).`);
