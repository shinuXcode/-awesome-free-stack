import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makeTool } from "./discover.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("generated record is schema-valid and never invents free-tier or card claims", async () => {
  const repository = {
    name: "safe-fixture-tool",
    full_name: "example-owner/safe-fixture-tool",
    html_url: "https://github.com/example-owner/safe-fixture-tool",
    description: "A maintained open-source utility used to validate generated catalog records.",
    stargazers_count: 1200,
    forks_count: 100,
    pushed_at: "2026-10-15T12:00:00Z",
    license: { spdx_id: "MIT" },
    homepage: "https://example.org",
  };
  const source = {
    category: "Dev Tools",
    sourceType: "topic",
    sourceUrl: "https://github.com/topics/developer-tools",
  };
  const score = {
    qualityScore: 70,
    trendScore: 80,
    stars: 1200,
    forks: 100,
  };
  const website = {
    homepageUrl: "https://example.org/",
    docsUrl: "https://example.org/docs",
    pricingUrl: "https://example.org/pricing",
    canonicalUrl: "https://example.org/",
  };
  const record = makeTool(repository, source, score, website);
  assert.equal(record.pricingType, "Needs Verification");
  assert.equal(record.noCreditCardRequired, false);
  assert.equal(record.creditCardRequiredAtSignup, false);
  assert.equal(record.sourceVerification.method, "github-api+homepage");
  assert.equal(record.sourceVerification.pricingUrl, "https://example.org/pricing");

  const dir = await mkdtemp(path.join(os.tmpdir(), "afs-generated-record-"));
  const file = path.join(dir, "tools.json");
  try {
    await writeFile(file, JSON.stringify([record]), "utf8");
    execFileSync(process.execPath, [path.join(ROOT, "scripts/validate-json.js"), file], { cwd: ROOT, stdio: "pipe" });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
