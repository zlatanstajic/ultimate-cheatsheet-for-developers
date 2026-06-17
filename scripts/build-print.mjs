// Builds self-contained print-optimized HTML pages from the repository
// Markdown content (knowledgebase/**, shell/**, and the root README.md) via a
// hand-rolled minimal mdast-to-HTML serializer — no remark-rehype/rehype-*
// dependency. Each `##` section becomes a <section class="card"> so a browser
// "Print to PDF" yields clean per-card page breaks; the Table of Contents card
// and "back to ..." nav-link paragraphs are hidden under @media print by the
// inlined assets/print.css.
//
// Output: dist/print/** (repo-relative paths with .md -> .html; the root
// README.md maps to dist/print/index.html).
// Run with: npm run build:print  (Node >=20).

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { dirname, join, relative, posix } from "node:path";
import { fileURLToPath } from "node:url";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import { toString as mdastToString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const sourceDirs = ["knowledgebase", "shell"];
const sourceFiles = ["README.md"];

const parser = unified().use(remarkParse).use(remarkFrontmatter).use(remarkGfm);

const printCss = readFileSync(join(root, "assets", "print.css"), "utf8").trim();

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

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Replicates GitHub-style heading slugging: lowercase, drop characters that
// are not word chars / spaces / hyphens, replace each space with a hyphen, so
// fragment links (e.g. #table-of-contents) resolve in the print output.
// Adapted from scripts/build-search-index.mjs, with one deliberate difference:
// each whitespace char maps to its own hyphen (GitHub behavior) instead of
// collapsing runs, so "Methods & Data" yields "methods--data" matching the
// double-hyphen anchors authored in the source TOCs.
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s/g, "-");
}

// Mirrors kramdown's intra-document duplicate-anchor handling: the first
// occurrence keeps the bare slug, later identical headings get "-1", "-2", …
function dedupeSlug(slug, seen) {
  const count = seen.get(slug) ?? 0;
  seen.set(slug, count + 1);
  return count === 0 ? slug : `${slug}-${count}`;
}

// Base URL of the published GitHub Pages site (url + baseurl in _config.yml),
// used as the rewrite target for relative links with no dist/print/ counterpart.
const siteBase = "https://zlatanstajic.github.io/ultimate-cheatsheet-for-developers/";

// Rewrites relative links ending in .md (with optional #fragment) to .html so
// the dist/print/ tree is internally navigable; absolute http(s) (and any
// other scheme) links are left unchanged. Only links resolving into the
// exported set (knowledgebase/, shell/, or the root README.md) are rewritten —
// links resolving to the repo-root README.md point at index.html, mirroring
// the output layout. Anything else relative (website chrome like search.html,
// or CONTRIBUTING.md / LICENSE.md) has no counterpart in dist/print/, so it is
// rebased onto the published site rather than left dangling — resolving to the
// same URL the equivalent link reaches on the live site.
function rewriteLink(url, ctx) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith("#") || url.startsWith("//")) {
    return url;
  }
  const match = url.match(/^([^#?]*)\.md(#.*)?$/);
  if (match) {
    const fragment = match[2] ?? "";
    const target = posix.normalize(posix.join(ctx.dirRel, match[1] + ".md"));
    if (target === "README.md") {
      return match[1].replace(/README$/, "index") + ".html" + fragment;
    }
    if (target.startsWith("knowledgebase/") || target.startsWith("shell/")) {
      return match[1] + ".html" + fragment;
    }
  }
  const parts = url.match(/^([^#?]*)([#?].*)?$/);
  return siteBase + posix.normalize(posix.join(ctx.dirRel, parts[1])) + (parts[2] ?? "");
}

// A paragraph whose only child is a link with "back to top/list/main table"
// text is website navigation chrome; it gets class "nav-link" (hidden in print).
function isNavLinkParagraph(node) {
  return (
    node.children.length === 1 &&
    node.children[0].type === "link" &&
    /back to (top|list|main table)/i.test(mdastToString(node.children[0]))
  );
}

function serializeChildren(nodes, ctx) {
  return nodes.map((node) => serializeNode(node, ctx)).join("");
}

function serializeNode(node, ctx) {
  switch (node.type) {
    case "yaml":
      return ""; // frontmatter
    case "heading": {
      const id = dedupeSlug(slugify(mdastToString(node)), ctx.seenSlugs);
      return `<h${node.depth} id="${escapeHtml(id)}">${serializeChildren(node.children, ctx)}</h${node.depth}>\n`;
    }
    case "paragraph": {
      const cls = isNavLinkParagraph(node) ? ' class="nav-link"' : "";
      return `<p${cls}>${serializeChildren(node.children, ctx)}</p>\n`;
    }
    case "blockquote":
      return `<blockquote>\n${serializeChildren(node.children, ctx)}</blockquote>\n`;
    case "list": {
      const tag = node.ordered ? "ol" : "ul";
      return `<${tag}>\n${serializeChildren(node.children, ctx)}</${tag}>\n`;
    }
    case "listItem":
      return `<li>\n${serializeChildren(node.children, ctx)}</li>\n`;
    case "code": {
      const lang = node.lang ? ` class="language-${escapeHtml(node.lang)}"` : "";
      return `<pre><code${lang}>${escapeHtml(node.value)}</code></pre>\n`;
    }
    case "inlineCode":
      return `<code>${escapeHtml(node.value)}</code>`;
    case "link":
      return `<a href="${escapeHtml(rewriteLink(node.url, ctx))}">${serializeChildren(node.children, ctx)}</a>`;
    case "image":
      return `<img src="${escapeHtml(node.url)}" alt="${escapeHtml(node.alt ?? "")}">`;
    case "strong":
      return `<strong>${serializeChildren(node.children, ctx)}</strong>`;
    case "emphasis":
      return `<em>${serializeChildren(node.children, ctx)}</em>`;
    case "text":
      return escapeHtml(node.value); // soft breaks stay as newlines
    case "break":
      return "<br>\n";
    case "thematicBreak":
      return "<hr>\n";
    case "html":
      if (/^(?:<!--[\s\S]*?-->\s*)*$/.test(node.value.trim())) return ""; // comment markers only
      console.warn(`Warning: dropping non-comment html node in ${ctx.file}: ${node.value.slice(0, 60)}`);
      return "";
    case "table": {
      const [headRow, ...bodyRows] = node.children;
      let html = "<table>\n" + serializeTableRow(headRow, "th", ctx);
      for (const row of bodyRows) {
        html += serializeTableRow(row, "td", ctx);
      }
      return html + "</table>\n";
    }
    default:
      console.warn(`Warning: unknown node type "${node.type}" in ${ctx.file}; serializing as plain content`);
      if (node.children) return serializeChildren(node.children, ctx);
      return typeof node.value === "string" ? escapeHtml(node.value) : escapeHtml(mdastToString(node));
  }
}

function serializeTableRow(row, cellTag, ctx) {
  const cells = row.children
    .map((cell) => `<${cellTag}>${serializeChildren(cell.children, ctx)}</${cellTag}>`)
    .join("");
  return `<tr>${cells}</tr>\n`;
}

function renderPage(absPath) {
  const relPath = relative(root, absPath).split("\\").join("/");
  const ctx = { file: relPath, dirRel: posix.dirname(relPath), seenSlugs: new Map() };
  const tree = parser.parse(readFileSync(absPath, "utf8"));

  let title = relPath;
  visit(tree, "heading", (node) => {
    if (node.depth === 1 && title === relPath) {
      title = mdastToString(node);
    }
  });

  // Content before the first ## heading forms the sheet header; each ## opens
  // a card running until the next ## (### subsections stay inside the parent).
  const headerNodes = [];
  const cards = [];
  let current = null;
  for (const node of tree.children) {
    if (node.type === "heading" && node.depth === 2) {
      current = { heading: node, nodes: [] };
      cards.push(current);
    } else if (current) {
      current.nodes.push(node);
    } else {
      headerNodes.push(node);
    }
  }

  let body = `<header class="sheet-header">\n${serializeChildren(headerNodes, ctx)}</header>\n`;
  for (const card of cards) {
    const isToc = mdastToString(card.heading) === "Table of Contents";
    body += `<section class="${isToc ? "card toc" : "card"}">\n`;
    body += serializeNode(card.heading, ctx);
    body += serializeChildren(card.nodes, ctx);
    body += "</section>\n";
  }

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} - Ultimate Cheatsheet</title>
<style>
${printCss}
</style>
</head>
<body>
<main class="sheet">
${body}</main>
</body>
</html>
`;
}

const sources = sourceFiles.map((file) => join(root, file));
for (const dir of sourceDirs) {
  sources.push(...listMarkdown(join(root, dir)));
}

const outRoot = join(root, "dist", "print");
let count = 0;
for (const absPath of sources) {
  const relPath = relative(root, absPath).split("\\").join("/");
  const outRel = relPath === "README.md" ? "index.html" : relPath.replace(/\.md$/, ".html");
  const outPath = join(outRoot, outRel);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, renderPage(absPath));
  count++;
}

console.log(`Wrote ${count} files to ${relative(root, outRoot)}.`);
