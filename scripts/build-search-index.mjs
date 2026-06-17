// Builds a prebuilt lunr search index from the repository Markdown content.
// Reads knowledgebase/**, shell/**, and the root README.md, emits one index
// document per heading section (plus one page-level document per file), then
// serializes a lunr index alongside the doc metadata needed to render results.
//
// Output: assets/search-index.json  ({ index, docs }).
// Run with: npm run build:index  (Node >=20).

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import { toString as mdastToString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";
import lunr from "lunr";

import { slugify, dedupeSlug, listMarkdown } from "./lib/markdown-helpers.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Source globs (resolved manually to avoid a glob dependency).
const sourceDirs = ["knowledgebase", "shell"];
const sourceFiles = ["README.md"];

// remark-frontmatter makes the parser emit a leading YAML frontmatter block as
// a `yaml` node instead of a thematic break + paragraph. That node is neither a
// heading nor part of a section body, so title detection and the section walk
// below skip it automatically — frontmatter keys never reach the search index.
const parser = unified().use(remarkParse).use(remarkFrontmatter);

const docs = [];
let id = 0;

function collectFile(absPath) {
  // Jekyll renders each .md source to a .html page (no custom permalink set in
  // _config.yml), so the search index must link to the published .html URL, not
  // the .md source — otherwise results point at the raw Markdown file. The root
  // README.md is served as the site index, so it maps to "" (the baseurl root).
  const relPath = relative(root, absPath).split("\\").join("/");
  const url =
    relPath === "README.md" ? "" : relPath.replace(/\.md$/, ".html");
  const markdown = readFileSync(absPath, "utf8");
  const tree = parser.parse(markdown);

  // First H1 becomes the page title; fall back to the filename.
  let title = url;
  visit(tree, "heading", (node) => {
    if (node.depth === 1 && title === url) {
      title = mdastToString(node);
    }
  });

  // Walk top-level children, splitting content into sections at each heading.
  // The first heading at any depth opens a section; content until the next
  // heading is that section's body.
  const sections = [];
  const seenSlugs = new Map();
  let current = null;
  for (const node of tree.children) {
    if (node.type === "heading") {
      const heading = mdastToString(node);
      const anchor = "#" + dedupeSlug(slugify(heading), seenSlugs);
      current = { section: heading, anchor, parts: [] };
      sections.push(current);
    } else if (current) {
      current.parts.push(mdastToString(node));
    }
  }

  // Page-level document (whole-page match, no anchor).
  docs.push({
    id: String(id++),
    title,
    url,
    section: "",
    anchor: "",
    body: sections.map((s) => `${s.section} ${s.parts.join(" ")}`).join(" "),
  });

  // One document per section, linking to its anchor.
  for (const s of sections) {
    docs.push({
      id: String(id++),
      title,
      url,
      section: s.section,
      anchor: s.anchor,
      body: s.parts.join(" "),
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

const index = lunr(function () {
  this.ref("id");
  this.field("title", { boost: 10 });
  this.field("section", { boost: 5 });
  this.field("body");
  for (const doc of docs) {
    this.add(doc);
  }
});

const outDir = join(root, "assets");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "search-index.json");
writeFileSync(
  outPath,
  JSON.stringify({
    index,
    docs: docs.map(({ id, title, url, section, anchor }) => ({
      id,
      title,
      url,
      section,
      anchor,
    })),
  }),
);

console.log(`Wrote ${relative(root, outPath)} (${docs.length} documents).`);
