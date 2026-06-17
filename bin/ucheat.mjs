#!/usr/bin/env node
// ucheat — Ultimate Cheatsheet for Developers, rendered in your terminal.
//
//   ucheat                      usage + available tools
//   ucheat <tool>               list the sections of a tool's cheatsheet
//   ucheat <tool> <section...>  render the matching section (fuzzy-matched)
//
// Reads the prebuilt assets/cli-index.json (generated at publish time by
// scripts/build-cli-index.mjs); section bodies are raw Markdown rendered with
// marked + marked-terminal — no remark/lunr at runtime.

import { readFileSync } from "node:fs";

import { Marked } from "marked";
import { markedTerminal } from "marked-terminal";
import Fuse from "fuse.js";

const indexUrl = new URL("../assets/cli-index.json", import.meta.url);
const docs = JSON.parse(readFileSync(indexUrl, "utf8"));
const sectionDocs = docs.filter((d) => d.section !== "");
const tools = [...new Set(docs.map((d) => d.tool).filter(Boolean))].sort();

// When the top fuzzy score and the runner-up are this close, the query is
// ambiguous — print candidates instead of guessing.
const AMBIGUITY_GAP = 0.1;
const MAX_CANDIDATES = 5;

function printUsage() {
  console.log(`ucheat — Ultimate Cheatsheet for Developers, in your terminal

Usage:
  npx ucheat <tool>            list the sections of a tool's cheatsheet
  npx ucheat <tool> <section>  render a section (fuzzy-matched, e.g. "git stsh")
  npx ucheat --help            show this help

Available tools:
  ${tools.join(", ")}`);
}

function printCandidates(query, items) {
  console.log(`Ambiguous query "${query}" — closest matches:\n`);
  for (const item of items.slice(0, MAX_CANDIDATES)) {
    console.log(`  npx ucheat ${item.tool || item.file} ${item.section}`);
  }
  if (items.length > MAX_CANDIDATES) {
    console.log(`  …and ${items.length - MAX_CANDIDATES} more`);
  }
}

function render(doc) {
  const marked = new Marked();
  marked.use(markedTerminal());
  const label = doc.tool ? `${doc.tool} > ${doc.section}` : doc.section;
  console.log(`${label} (source: ${doc.file})\n`);
  console.log(marked.parse(doc.body).trimEnd());
}

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  printUsage();
  process.exit(0);
}

const tool = args[0].toLowerCase();
const knownTool = tools.includes(tool);

// `ucheat <tool>` — list the tool's sections.
if (knownTool && args.length === 1) {
  const sections = sectionDocs.filter((d) => d.tool === tool);
  if (sections.length === 0) {
    console.error(`${tool} has no sections in the index.`);
    process.exit(1);
  }
  console.log(`${tool} — sections (source: ${sections[0].file}):\n`);
  for (const d of sections) {
    console.log(`  ${d.section}`);
  }
  console.log(`\nRender one with: npx ucheat ${tool} <section>`);
  process.exit(0);
}

// `ucheat <tool> <section...>` — fuzzy-resolve a section. Pre-filter to the
// requested tool when recognized; otherwise search the whole index with the
// full query (the "tool" may itself be misspelled or part of the section).
const candidates = knownTool
  ? sectionDocs.filter((d) => d.tool === tool)
  : sectionDocs;
const query = (knownTool ? args.slice(1) : args).join(" ");

// Exact section-title match short-circuits the fuzzy search — but only when
// unambiguous. Duplicate titles (across tools when the tool is unrecognized,
// or repeated within one page) go through the candidates listing instead of
// silently picking whichever was indexed first.
const exactMatches = candidates.filter(
  (d) => d.section.toLowerCase() === query.toLowerCase(),
);
if (exactMatches.length === 1) {
  render(exactMatches[0]);
  process.exit(0);
}
if (exactMatches.length > 1) {
  printCandidates(query, exactMatches);
  process.exit(2);
}

const fuse = new Fuse(candidates, {
  includeScore: true,
  ignoreLocation: true,
  threshold: 0.4,
  keys: [
    { name: "tool", weight: 0.3 },
    { name: "section", weight: 0.6 },
    { name: "body", weight: 0.1 },
  ],
});
const results = fuse.search(query);

if (results.length === 0) {
  console.error(`No cheatsheet section matches "${args.join(" ")}".`);
  console.error(
    knownTool
      ? `Run "npx ucheat ${tool}" to list the sections of ${tool}.`
      : `Run "npx ucheat --help" to list the available tools.`,
  );
  process.exit(1);
}

const [top, second] = results;
if (second && second.score - top.score < AMBIGUITY_GAP) {
  printCandidates(
    query,
    results.slice(0, MAX_CANDIDATES).map((r) => r.item),
  );
  // Exit 2: nothing was rendered, but the query wasn't a miss either — lets
  // scripts distinguish "rendered" (0) / "ambiguous" (2) / "no match" (1).
  process.exit(2);
}

render(top.item);
