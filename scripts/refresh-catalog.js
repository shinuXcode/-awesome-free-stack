#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const DATA_FILE = path.resolve(__dirname, "../data/tools.json");
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const MAX_NEW_TOOLS = 36;
const MAX_PER_CATEGORY = 2;
const WAIT_MS = 180;
const USER_AGENT = "zero-cost-dev-stack-catalog-refresh";

const sources = [
  { category: "Video Editing & Motion", query: "(topic:video-editor OR topic:video-editing OR topic:motion-graphics)" },
  { category: "3D & VFX", query: "(topic:3d-modeling OR topic:3d-rendering OR topic:vfx)" },
  { category: "Audio & Music", query: "(topic:audio-editor OR topic:digital-audio-workstation OR topic:music-production)" },
  { category: "Creator & Social Media", query: "(topic:fediverse OR topic:social-network OR topic:creator-tools)" },
  { category: "Operating Systems", query: "(topic:linux-distribution OR topic:operating-system OR topic:bsd)" },
  { category: "Office & Productivity", query: "(topic:office-suite OR topic:productivity OR topic:document-editor)" },
  { category: "Open Source Apps", query: "(topic:open-source-app OR topic:desktop-application OR topic:android-app)" },
  { category: "Cybersecurity & Ethical Hacking", query: "(topic:cybersecurity OR topic:penetration-testing OR topic:security-tools)" },
  { category: "Reverse Engineering", query: "(topic:reverse-engineering OR topic:binary-analysis OR topic:disassembler)" },
  { category: "Game Development", query: "(topic:game-engine OR topic:game-development OR topic:gamedev)" },
  { category: "AI & Machine Learning", query: "(topic:machine-learning OR topic:llm OR topic:ai-tools)" },
  { category: "Data Science & Analytics", query: "(topic:data-science OR topic:data-visualization OR topic:analytics)" },
  { category: "Accessibility", query: "(topic:accessibility OR topic:a11y)" },
  { category: "Documentation & Knowledge", query: "(topic:documentation OR topic:knowledge-base OR topic:wiki)" },
  { category: "Communities & Forums", query: "(topic:community-platform OR topic:forum OR topic:fediverse)" },
  { category: "Dev Tools", query: "(topic:cli OR topic:developer-tools OR topic:terminal)" },
  { category: "DevOps & Cloud", query: "(topic:devops OR topic:cloud-native OR topic:infrastructure-as-code)" },
  { category: "Testing & QA", query: "(topic:test-automation OR topic:testing OR topic:quality-assurance)" },
  { category: "Automation & No-Code", query: "(topic:workflow-automation OR topic:no-code OR topic:low-code)" },
  { category: "Hardware & IoT", query: "(topic:iot OR topic:home-automation OR topic:embedded)" },
  { category: "Frontend & Web Dev", query: "(topic:frontend OR topic:javascript-framework OR topic:web-framework)" },
  { category: "Backend & APIs", query: "(topic:backend OR topic:api-framework OR topic:api)" },
  { category: "Programming Languages", query: "(topic:programming-language OR topic:compiler OR topic:language-server)" },
  { category: "Mobile & Desktop Apps", query: "(topic:mobile-app OR topic:desktop-application OR topic:cross-platform)" },
  { category: "Design & UI/UX", query: "(topic:design-system OR topic:ui-design OR topic:wireframing)" },
  { category: "Blockchain & Web3", query: "(topic:blockchain OR topic:web3 OR topic:smart-contracts)" },
  { category: "Databases & BaaS", query: "(topic:database OR topic:sql OR topic:database-engine)" },
];

function slugify(value) {
  return String(value).toLowerCase().normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/-+/g, "-");
}

function validHttpsUrl(value) {
  if (!value || typeof value !== "string") return "";
  try {
    const url = new URL(value);
    if (url.protocol === "http:") url.protocol = "https:";
    if (url.protocol !== "https:" || !url.hostname) return "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

function starsLabel(value) {
  if (!Number.isFinite(value)) return "";
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
  if (value >= 1_000) return (value / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(value);
}

function makeTool(repository, category) {
  const officialUrl = validHttpsUrl(repository.homepage) || repository.html_url;
  const host = new URL(officialUrl).hostname;
  const licenseSpdx = repository.license && repository.license.spdx_id;
  const hasKnownLicense = Boolean(licenseSpdx && licenseSpdx !== "NOASSERTION");
  const description = String(repository.description || "").trim().slice(0, 1000);
  return {
    id: slugify(repository.name),
    name: repository.name,
    logoUrl: "https://www.google.com/s2/favicons?domain=" + encodeURIComponent(host) + "&sz=128",
    category,
    tagline: description.length > 145 ? description.slice(0, 142).trimEnd() + "..." : description,
    description: description + " This listing was discovered through public GitHub repository metadata; check the linked source for the current README, releases, license and support status.",
    howItWorks: description + " Review the repository README and linked documentation to understand its intended workflow, dependencies, supported platforms and maintenance status before adopting it.",
    howToUseGuide: [
      "Open the repository or project website linked in this profile and read its current README and requirements.",
      "Review releases, supported platforms, issue activity, maintainers and installation instructions.",
      "Confirm the license and any hosted-service, model, dataset or asset terms before commercial or sensitive use.",
      "Test with a small project and non-sensitive data; pin a release or version before relying on it in production.",
    ],
    pricingType: hasKnownLicense ? "Open Source" : "Needs Verification",
    freeTierLimit: hasKnownLicense
      ? "The repository declares " + licenseSpdx + "; hosted services, external assets, dependencies and support may have separate terms."
      : "Pricing and license are not verified by the directory. Review the project's license file and any hosted-service terms.",
    noCreditCardRequired: true,
    creditCardRequiredAtSignup: false,
    userRating: 0,
    totalReviewsCount: 0,
    safetyRank: "B+",
    securityDetails: {
      isOpaqueOrOpenSource: hasKnownLicense ? "Open Source" : "License Unverified",
      certifications: [],
      dataPrivacyScore: "Not independently audited by this directory. Review the repository, release provenance, permissions, data handling and any hosted-service privacy policy; this is not a security endorsement.",
    },
    targetAudience: "Intermediate",
    officialWebsiteUrl: officialUrl,
    docsUrl: officialUrl,
    githubRepoUrl: repository.html_url,
    githubStars: starsLabel(repository.stargazers_count),
    sourceVerification: {
      verifiedAt: new Date().toISOString().slice(0, 10),
      method: "github-api",
      licenseUrl: "https://api.github.com/repos/" + repository.full_name + "/license",
    },
  };
}

async function searchRepositories(source) {
  const since = new Date();
  since.setUTCFullYear(since.getUTCFullYear() - 3);
  const query = source.query + " stars:>=15 fork:false archived:false pushed:>=" + since.toISOString().slice(0, 10);
  const url = "https://api.github.com/search/repositories?q=" + encodeURIComponent(query) + "&sort=updated&order=desc&per_page=30";
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + TOKEN,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": USER_AGENT,
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error("GitHub Search API failed (" + response.status + ") for " + source.category + ": " + detail.slice(0, 300));
  }
  const data = await response.json();
  return Array.isArray(data.items) ? data.items : [];
}

async function main() {
  if (!TOKEN) throw new Error("GITHUB_TOKEN is required. Run this from the scheduled GitHub Actions workflow.");
  const catalog = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  if (!Array.isArray(catalog)) throw new Error("data/tools.json must contain a JSON array.");

  const ids = new Set(catalog.map((tool) => tool.id));
  const names = new Set(catalog.map((tool) => String(tool.name).trim().toLowerCase()));
  const repoUrls = new Set(catalog.map((tool) => String(tool.githubRepoUrl || "").toLowerCase()).filter(Boolean));
  const categoryCounts = new Map();
  for (const tool of catalog) categoryCounts.set(tool.category, (categoryCounts.get(tool.category) || 0) + 1);

  let requests = 0;
  let added = 0;
  for (const source of sources) {
    if (added >= MAX_NEW_TOOLS) break;
    await new Promise((resolve) => setTimeout(resolve, WAIT_MS));
    requests++;
    const repositories = await searchRepositories(source);
    let acceptedForCategory = 0;
    for (const repository of repositories) {
      if (added >= MAX_NEW_TOOLS || acceptedForCategory >= MAX_PER_CATEGORY) break;
      if (repository.archived || repository.disabled || repository.fork) continue;
      if (!repository.name || !repository.html_url || !repository.description) continue;
      if (repository.stargazers_count < 15) continue;
      if (!repository.license || !repository.license.spdx_id || repository.license.spdx_id === "NOASSERTION") continue;

      const name = String(repository.name).trim();
      const id = slugify(name);
      const repoUrl = validHttpsUrl(repository.html_url);
      if (!id || ids.has(id) || names.has(name.toLowerCase()) || repoUrls.has(repoUrl.toLowerCase())) continue;

      let tool = makeTool(repository, source.category);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tool.id)) continue;
      if (catalog.some((item) => item.category === source.category && item.name.toLowerCase() === tool.name.toLowerCase())) continue;

      catalog.push(tool);
      ids.add(tool.id);
      names.add(name.toLowerCase());
      repoUrls.add(repoUrl.toLowerCase());
      categoryCounts.set(source.category, (categoryCounts.get(source.category) || 0) + 1);
      added++;
      acceptedForCategory++;
    }
  }

  if (added > 0) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(catalog));
    console.log("Added " + added + " new repositories from " + requests + " curated GitHub topic searches.");
    console.log("Catalog now contains " + catalog.length + " records.");
  } else {
    console.log("No qualifying new repositories found across " + requests + " curated searches. Catalog unchanged at " + catalog.length + " records.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
