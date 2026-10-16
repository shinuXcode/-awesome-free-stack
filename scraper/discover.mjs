#!/usr/bin/env node
import { CheerioCrawler } from "crawlee";
import { promises as fs } from "node:fs";
import path from "node:path";
import dns from "node:dns/promises";
import net from "node:net";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { formatStars, normalizeName, normalizeRepositoryUrl, scoreRepository, slugify } from "./scoring.mjs";
import { githubJson } from "./github-api.mjs";
import { clearCheckpoint, readCheckpoint, writeCheckpoint } from "./checkpoint.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const DATA_FILE = path.join(ROOT, "data", "tools.json");
const SOURCES_FILE = path.join(HERE, "sources.json");
const CHECKPOINT_FILE = path.join(HERE, ".checkpoint.json");
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const TODAY = new Date().toISOString().slice(0, 10);
const MAX_NEW_TOOLS = boundedInteger(process.env.SCRAPER_MAX_NEW_TOOLS, 40, 1, 100);
const MAX_PER_CATEGORY = boundedInteger(process.env.SCRAPER_MAX_PER_CATEGORY, 2, 1, 5);
const MAX_API_LOOKUPS = boundedInteger(process.env.SCRAPER_MAX_API_LOOKUPS, 300, 10, 500);
const MAX_OFFICIAL_SITE_CHECKS = boundedInteger(process.env.SCRAPER_MAX_OFFICIAL_SITE_CHECKS, 35, 0, 60);
const MIN_CANDIDATES_PER_SOURCE = 8;
const RESERVED_GITHUB_PATHS = new Set([
  "about", "account", "apps", "collections", "codespaces", "contact", "enterprise", "events",
  "explore", "features", "issues", "login", "marketplace", "new", "notifications", "orgs",
  "organizations", "pricing", "search", "security", "settings", "sponsors", "site", "team",
  "topics", "trending", "users",
]);

function boundedInteger(raw, fallback, min, max) {
  const n = Number.parseInt(String(raw ?? ""), 10);
  return Number.isInteger(n) && n >= min && n <= max ? n : fallback;
}

function slugFromRepositoryName(name) {
  return slugify(String(name).replace(/\.git$/i, ""));
}

function safeGithubRepositoryFromPath(rawHref, baseUrl) {
  try {
    const url = new URL(rawHref, baseUrl);
    if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com") return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length !== 2) return null;
    const [owner, name] = parts;
    if (!owner || !name || RESERVED_GITHUB_PATHS.has(owner.toLowerCase())) return null;
    if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(name)) return null;
    if (name.endsWith(".git")) return { owner, name: name.slice(0, -4), fullName: owner + "/" + name.slice(0, -4) };
    return { owner, name, fullName: owner + "/" + name };
  } catch {
    return null;
  }
}

function parseWeeklyStars(text) {
  const match = String(text ?? "").match(/([\d,]+)\s+stars?\s+(?:this week|today)/i);
  return match ? Number(match[1].replace(/,/g, "")) : 0;
}

function safeHttpsUrl(raw) {
  if (!raw || typeof raw !== "string") return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password) return "";
    const host = url.hostname.toLowerCase().replace(/\.$/, "");
    if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return "";
    if (net.isIP(host)) return "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

function isPrivateAddress(address) {
  const family = net.isIP(address);
  if (family === 4) {
    const a = address.split(".").map(Number);
    return a[0] === 0 || a[0] === 10 || a[0] === 127 || a[0] >= 224 ||
      (a[0] === 169 && a[1] === 254) ||
      (a[0] === 172 && a[1] >= 16 && a[1] <= 31) ||
      (a[0] === 192 && a[1] === 168) ||
      (a[0] === 100 && a[1] >= 64 && a[1] <= 127) ||
      (a[0] === 192 && a[1] === 0 && a[2] === 0) ||
      (a[0] === 198 && (a[1] === 18 || a[1] === 19)) ||
      (a[0] === 198 && a[1] === 51 && a[2] === 100) ||
      (a[0] === 203 && a[1] === 0 && a[2] === 113);
  }
  if (family === 6) {
    const v = address.toLowerCase();
    if (v.startsWith("::ffff:")) return isPrivateAddress(v.slice(7));
    return v === "::" || v === "::1" || v.startsWith("fc") || v.startsWith("fd") ||
      v.startsWith("fe8") || v.startsWith("fe9") || v.startsWith("fea") ||
      v.startsWith("feb") || v.startsWith("ff") || v.startsWith("2001:db8:");
  }
  return true;
}

async function verifiedPublicHomepage(raw) {
  const urlText = safeHttpsUrl(raw);
  if (!urlText) return "";
  const url = new URL(urlText);
  try {
    const records = await dns.lookup(url.hostname, { all: true, verbatim: true });
    if (!records.length || records.some((record) => isPrivateAddress(record.address))) return "";
  } catch {
    return "";
  }
  return urlText;
}

function safeRepoUrl(repository) {
  return normalizeRepositoryUrl(repository?.html_url || "");
}

function extractSourceRows($, source, pageUrl) {
  const rows = $("article.Box-row, .Box-row").toArray();
  const extracted = [];

  if (rows.length) {
    rows.forEach((element, index) => {
      const row = $(element);
      const anchors = row.find("h2 a[href], h3 a[href]");
      const href = anchors.first().attr("href");
      const repository = href ? safeGithubRepositoryFromPath(href, pageUrl) : null;
      if (!repository) return;
      const rowText = row.text().replace(/\s+/g, " ").trim();
      extracted.push({
        ...repository,
        category: source.category,
        sourceId: source.id,
        sourceType: source.type,
        sourceUrl: source.url,
        rank: index + 1,
        trendingStars: parseWeeklyStars(rowText),
      });
    });
  }

  if (!extracted.length) {
    const selector = "h2 a[href], h3 a[href]";
    $(selector).each((index, element) => {
      const href = $(element).attr("href");
      const repository = href ? safeGithubRepositoryFromPath(href, pageUrl) : null;
      if (!repository) return;
      extracted.push({
        ...repository,
        category: source.category,
        sourceId: source.id,
        sourceType: source.type,
        sourceUrl: source.url,
        rank: index + 1,
        trendingStars: 0,
      });
    });
  }

  return extracted.slice(0, Math.max(MIN_CANDIDATES_PER_SOURCE, 15));
}

async function crawlDiscoverySources(sources) {
  const candidates = new Map();
  let pagesProcessed = 0;
  const crawler = new CheerioCrawler({
    maxRequestsPerCrawl: sources.length,
    maxConcurrency: 1,
    maxRequestRetries: 2,
    requestHandlerTimeoutSecs: 45,
    sameDomainDelaySecs: 1.5,
    respectRobotsTxtFile: true,
    requestHandler: async ({ $, request, log }) => {
      pagesProcessed += 1;
      const source = request.userData.source;
      const found = extractSourceRows($, source, request.url);
      for (const candidate of found) {
        const key = candidate.fullName.toLowerCase();
        const previous = candidates.get(key);
        if (!previous || (previous.category === "Dev Tools" && candidate.category !== "Dev Tools")) {
          candidates.set(key, candidate);
        }
      }
      log.info("Scanned allowlisted source", {
        source: source.id,
        category: source.category,
        repositoryCandidates: found.length,
      });
    },
    failedRequestHandler: async ({ request, error, log }) => {
      log.warning("A discovery page was skipped; other sources will continue.", {
        url: request.url,
        error: String(error?.message || "request failed").slice(0, 200),
      });
    },
  });

  await crawler.run(sources.map((source) => ({
    url: source.url,
    uniqueKey: "source-page-" + source.id,
    userData: { source },
  })));

  return { candidates: [...candidates.values()], pagesProcessed };
}

async function fetchRepository(candidate) {
  const url = "https://api.github.com/repos/" +
    encodeURIComponent(candidate.owner) + "/" + encodeURIComponent(candidate.name);
  const result = await githubJson(url, { token: TOKEN });
  if (result.rateLimited) return result;
  if (result.skipped || result.error) return result;
  const repository = result.data;
  if (String(repository.full_name || "").toLowerCase() !== candidate.fullName.toLowerCase()) return { skipped: true };
  return { repository };
}

async function crawlOfficialWebsites(repositoryCandidates) {
  const siteRequests = new Map();
  for (const item of repositoryCandidates) {
    const website = await verifiedPublicHomepage(item.repository.homepage);
    if (!website) continue;
    const key = website.toLowerCase();
    if (!siteRequests.has(key)) siteRequests.set(key, { url: website, repositoryKeys: [] });
    siteRequests.get(key).repositoryKeys.push(item.repository.full_name.toLowerCase());
  }

  const sites = [...siteRequests.values()].slice(0, MAX_OFFICIAL_SITE_CHECKS);
  const metadata = new Map();
  for (const site of sites) {
    let currentUrl = site.url;
    let response = null;
    let safe = true;
    for (let hop = 0; hop <= 3; hop += 1) {
      const checked = await verifiedPublicHomepage(currentUrl);
      if (!checked) { safe = false; break; }
      try {
        response = await fetch(checked, {
          redirect: "manual",
          signal: AbortSignal.timeout(8_000),
          headers: { "User-Agent": "awesome-free-stack-catalog-discovery/1.0", Accept: "text/html" },
        });
      } catch {
        safe = false;
        break;
      }
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location || hop === 3) { safe = false; break; }
        try {
          const next = new URL(location, checked);
          if (next.protocol !== "https:" || next.username || next.password) { safe = false; break; }
          currentUrl = next.toString();
          continue;
        } catch {
          safe = false;
          break;
        }
      }
      break;
    }
    if (!safe || !response || !response.ok ||
        !String(response.headers.get("content-type") || "").toLowerCase().includes("text/html")) continue;

    let html = "";
    try {
      const reader = response.body?.getReader();
      if (!reader) continue;
      const chunks = [];
      let size = 0;
      while (size < 1_000_000) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        size += value.byteLength;
      }
      await reader.cancel().catch(() => {});
      html = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString("utf8");
    } catch {
      continue;
    }

    const pageHost = new URL(currentUrl).hostname.toLowerCase();
    const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "")
      .replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim().slice(0, 160);
    let docsUrl = "";
    let pricingUrl = "";
    let canonicalUrl = "";
    const linkPattern = /<a\b([^>]*?)href\s*=\s*["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi;
    for (const match of html.matchAll(linkPattern)) {
      const attrs = match[1] + " " + match[3];
      const href = match[2];
      const label = (match[4].replace(/<[^>]+>/g, " ") + " " + attrs + " " + href).toLowerCase();
      try {
        const target = new URL(href, currentUrl);
        if (target.protocol !== "https:" || target.hostname.toLowerCase() !== pageHost) continue;
        if (!docsUrl && /\b(docs|documentation|developer guide|api reference)\b/.test(label)) docsUrl = target.toString();
        if (!pricingUrl && /\b(pricing|plans|price list|free plan)\b/.test(label)) pricingUrl = target.toString();
      } catch {}
    }
    const canonicalMatch = html.match(/<link\b([^>]*rel\s*=\s*["']canonical["'][^>]*)>/i);
    const canonicalHref = canonicalMatch?.[1]?.match(/href\s*=\s*["']([^"']+)["']/i)?.[1];
    if (canonicalHref) {
      try {
        const target = new URL(canonicalHref, currentUrl);
        if (target.protocol === "https:" && target.hostname.toLowerCase() === pageHost) canonicalUrl = target.toString();
      } catch {}
    }
    const pageInfo = { homepageUrl: currentUrl, title, docsUrl, pricingUrl, canonicalUrl, fetchedAt: TODAY };
    for (const repositoryKey of site.repositoryKeys) metadata.set(repositoryKey, pageInfo);
    console.log("Official homepage checked: " + pageHost + "; pricing link found: " + Boolean(pricingUrl) + ".");
  }
  return metadata;
}

function existingIndexes(catalog) {
  return {
    ids: new Set(catalog.map((tool) => String(tool.id || "").toLowerCase())),
    names: new Set(catalog.map((tool) => normalizeName(tool.name))),
    repositories: new Set(catalog.map((tool) => normalizeRepositoryUrl(tool.githubRepoUrl || ""))),
  };
}

function makeTool(repository, source, score, websiteMetadata) {
  const fullName = String(repository.full_name || source.fullName);
  const repoUrl = safeRepoUrl(repository);
  const officialUrl = websiteMetadata?.homepageUrl || repoUrl;
  const host = new URL(officialUrl).hostname;
  const licenseId = repository.license.spdx_id;
  const description = String(repository.description).trim().slice(0, 1_000);
  const homepageFacts = websiteMetadata || {};
  const docsUrl = homepageFacts.docsUrl || officialUrl;
  const licenseUrl = "https://api.github.com/repos/" + fullName + "/license";
  const discoveryMetadata = {
    sourceType: source.sourceType,
    sourceUrl: source.sourceUrl,
    firstDiscoveredAt: TODAY,
    lastSeenAt: TODAY,
    qualityScore: score.qualityScore,
    trendScore: score.trendScore,
    starCount: score.stars,
    forkCount: score.forks,
    lastPushedAt: repository.pushed_at,
  };

  return {
    id: slugFromRepositoryName(repository.name),
    name: repository.name,
    logoUrl: "https://www.google.com/s2/favicons?domain=" + encodeURIComponent(host) + "&sz=128",
    category: source.category,
    tagline: description.length > 145 ? description.slice(0, 142).trimEnd() + "..." : description,
    description: description + " This listing was discovered from public repository metadata. Check official sources for current releases, license scope, hosted-service terms and support status.",
    howItWorks: description + " Review the linked repository README and official documentation for requirements, supported platforms, installation steps and data-handling details.",
    howToUseGuide: [
      "Open the linked repository or official website and review its current README and requirements.",
      "Check releases, supported platforms, recent maintenance and issue activity.",
      "Confirm the license and any hosted-service, model, dataset or asset terms before use.",
      "Test with a small project and non-sensitive data before adopting it for important work.",
    ],
    pricingType: "Needs Verification",
    freeTierLimit: "Repository license: " + licenseId + ". Hosted-service pricing, usage limits and payment requirements have not been verified; consult the official pricing source before relying on free access.",
    noCreditCardRequired: false,
    creditCardRequiredAtSignup: false,
    userRating: 0,
    totalReviewsCount: 0,
    safetyRank: "B+",
    securityDetails: {
      isOpaqueOrOpenSource: "Open Source",
      certifications: [],
      dataPrivacyScore: "Not independently security-audited by this directory. Review permissions, release provenance, data handling and any hosted-service privacy policy; this is not a security endorsement.",
    },
    targetAudience: "Intermediate",
    officialWebsiteUrl: officialUrl,
    docsUrl,
    githubRepoUrl: repository.html_url,
    githubStars: formatStars(repository.stargazers_count),
    sourceVerification: {
      verifiedAt: TODAY,
      method: "github-api",
      licenseUrl,
      ...(homepageFacts.pricingUrl ? { pricingUrl: homepageFacts.pricingUrl } : {}),
    },
    discoveryMetadata,
  };
}

function refreshExistingMetrics(tool, repository, source, score) {
  if (!tool.sourceVerification || tool.sourceVerification.method !== "github-api") return false;
  const nextStars = formatStars(repository.stargazers_count);
  const nextMetadata = {
    ...(tool.discoveryMetadata || {}),
    sourceType: source.sourceType,
    sourceUrl: source.sourceUrl,
    firstDiscoveredAt: tool.discoveryMetadata?.firstDiscoveredAt || TODAY,
    lastSeenAt: TODAY,
    qualityScore: score.qualityScore,
    trendScore: score.trendScore,
    starCount: score.stars,
    forkCount: score.forks,
    lastPushedAt: repository.pushed_at,
  };
  let changed = false;
  if (tool.githubStars !== nextStars) {
    tool.githubStars = nextStars;
    changed = true;
  }
  if (JSON.stringify(tool.discoveryMetadata || null) !== JSON.stringify(nextMetadata)) {
    tool.discoveryMetadata = nextMetadata;
    changed = true;
  }
  if (tool.sourceVerification.verifiedAt !== TODAY) {
    tool.sourceVerification.verifiedAt = TODAY;
    changed = true;
  }
  if (tool.sourceVerification.licenseUrl !== "https://api.github.com/repos/" + repository.full_name + "/license") {
    tool.sourceVerification.licenseUrl = "https://api.github.com/repos/" + repository.full_name + "/license";
    changed = true;
  }
  return changed;
}

async function main() {
  const sources = JSON.parse(await fs.readFile(SOURCES_FILE, "utf8"));
  if (!Array.isArray(sources) || !sources.length) throw new Error("scraper/sources.json must contain at least one source.");
  for (const source of sources) {
    if (!source.id || !source.url || !source.category || !["trending", "topic"].includes(source.type)) {
      throw new Error("Every source needs id, URL, valid type, and category.");
    }
    const parsed = new URL(source.url);
    if (parsed.protocol !== "https:" || parsed.hostname.toLowerCase() !== "github.com") {
      throw new Error("Only reviewed HTTPS GitHub source pages are allowed in scraper/sources.json.");
    }
  }

  const catalog = JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
  if (!Array.isArray(catalog)) throw new Error("data/tools.json must contain an array.");
  const dryRun = process.argv.includes("--dry-run") || process.env.SCRAPER_DRY_RUN === "1";
  const { candidates: found, pagesProcessed } = await crawlDiscoverySources(sources);
  const candidates = found.slice(0, MAX_API_LOOKUPS);
  const fingerprint = createHash("sha256").update(JSON.stringify(candidates.map((c) => [c.fullName, c.sourceId, c.category]))).digest("hex");
  const checkpoint = await readCheckpoint(CHECKPOINT_FILE, fingerprint);
  const completed = new Map(checkpoint.completed.map((item) => [item.candidate.fullName.toLowerCase(), item]));
  console.log("Discovery: " + pagesProcessed + " pages, " + found.length + " unique repositories; verifying up to " + candidates.length + ".");
  console.log("Resume checkpoint: " + completed.size + " of " + candidates.length + " candidates already processed.");

  let rateLimited = false;
  let apiErrors = 0;
  for (const candidate of candidates) {
    const key = candidate.fullName.toLowerCase();
    if (completed.has(key)) continue;
    const result = await fetchRepository(candidate);
    if (result.rateLimited) {
      await writeCheckpoint(CHECKPOINT_FILE, fingerprint, [...completed.values()]);
      const waitMinutes = Math.max(1, Math.ceil(Number(result.waitMs || 60_000) / 60_000));
      console.warn("GitHub API quota is exhausted. Saved progress; stopping safely. Retry this run in about " + waitMinutes + " minute(s).");
      rateLimited = true;
      break;
    }
    if (result.error) apiErrors += 1;
    let accepted = null;
    if (result.repository) {
      const score = scoreRepository(result.repository, {
        category: candidate.category,
        type: candidate.sourceType,
        rank: candidate.rank,
        trendingStars: candidate.trendingStars,
      });
      if (score.eligible) accepted = { candidate, repository: result.repository, score };
    }
    completed.set(key, { candidate, accepted });
    await writeCheckpoint(CHECKPOINT_FILE, fingerprint, [...completed.values()]);
  }

  if (rateLimited) {
    console.log("No catalog writes were made. The next run can resume from the saved checkpoint.");
    return;
  }

  const verified = [...completed.values()].map((item) => item.accepted).filter(Boolean);
  const websiteMetadata = await crawlOfficialWebsites(
    verified.slice().sort((a, b) => b.score.qualityScore - a.score.qualityScore).slice(0, MAX_OFFICIAL_SITE_CHECKS)
  );
  const indexes = existingIndexes(catalog);
  const perCategory = new Map();
  let added = 0;
  let refreshed = 0;
  let rejectedDuplicate = 0;
  const ranked = verified.sort((a, b) =>
    (b.score.trendScore - a.score.trendScore) ||
    (b.score.qualityScore - a.score.qualityScore) ||
    (b.score.stars - a.score.stars)
  );

  for (const item of ranked) {
    const { candidate, repository, score } = item;
    const repoUrl = normalizeRepositoryUrl(repository.html_url);
    const existing = catalog.find((tool) => normalizeRepositoryUrl(tool.githubRepoUrl || "") === repoUrl);
    const pageInfo = websiteMetadata.get(String(repository.full_name).toLowerCase());
    if (existing) {
      if (refreshExistingMetrics(existing, repository, candidate, score)) refreshed += 1;
      continue;
    }

    const id = slugFromRepositoryName(repository.name).toLowerCase();
    const nameKey = normalizeName(repository.name);
    if (!id || indexes.ids.has(id) || !nameKey || indexes.names.has(nameKey) || indexes.repositories.has(repoUrl)) {
      rejectedDuplicate += 1;
      continue;
    }
    const categoryCount = perCategory.get(candidate.category) || 0;
    if (categoryCount >= MAX_PER_CATEGORY || added >= MAX_NEW_TOOLS) continue;
    const tool = makeTool(repository, candidate, score, pageInfo);
    catalog.push(tool);
    indexes.ids.add(id);
    indexes.names.add(nameKey);
    indexes.repositories.add(repoUrl);
    perCategory.set(candidate.category, categoryCount + 1);
    added += 1;
  }

  console.log("Candidate quality checks: " + verified.length + " passed; " + apiErrors + " API requests failed.");
  console.log("Catalog changes: " + added + " new tools; " + refreshed + " existing verified records refreshed; " + rejectedDuplicate + " duplicates rejected.");
  if (!added && !refreshed) {
    await clearCheckpoint(CHECKPOINT_FILE);
    console.log("No changes to publish. Catalog remains at " + catalog.length + " tools.");
    return;
  }
  if (dryRun) {
    console.log("Dry run: no files were written.");
    return;
  }

  const tempFile = DATA_FILE + ".tmp";
  await fs.writeFile(tempFile, JSON.stringify(catalog), "utf8");
  await fs.rename(tempFile, DATA_FILE);
  await clearCheckpoint(CHECKPOINT_FILE);
  console.log("Wrote catalog atomically: " + catalog.length + " tools. Publishing remains gated by validation, source checks, tests and a production build.");
}

main().catch((error) => {
  console.error("Automated discovery failed: " + String(error?.message || error));
  process.exitCode = 1;
});
