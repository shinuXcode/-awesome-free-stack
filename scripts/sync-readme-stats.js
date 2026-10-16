#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const readmePath = path.resolve("README.md");
const toolsPath = path.resolve("data/tools.json");
const start = "<!-- CATALOG_STATS_START -->";
const end = "<!-- CATALOG_STATS_END -->";
const tools = JSON.parse(fs.readFileSync(toolsPath, "utf8"));
if (!Array.isArray(tools)) throw new Error("data/tools.json must be an array.");
const categories = new Set(tools.map((tool) => tool && tool.category).filter(Boolean));
const block = [
  start,
  "**Current catalog:** " + tools.length.toLocaleString("en-US") + " tool listings across " + categories.size.toLocaleString("en-US") + " categories. Counts are generated from the checked-in catalog; individual pricing and license details should still be verified at the source.",
  end,
].join("\n");
let readme = fs.readFileSync(readmePath, "utf8");
const pattern = /<!-- CATALOG_STATS_START -->[\s\S]*?<!-- CATALOG_STATS_END -->/g;
const matches = readme.match(pattern) || [];
if (matches.length !== 1) throw new Error("README.md must contain exactly one CATALOG_STATS marker block.");
readme = readme.replace(pattern, block);
fs.writeFileSync(readmePath, readme);
console.log("Synchronized README stats: " + tools.length + " listings across " + categories.size + " categories.");
