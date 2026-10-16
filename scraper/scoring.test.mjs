import test from "node:test";
import assert from "node:assert/strict";
import { formatStars, normalizeName, normalizeRepositoryUrl, scoreRepository, slugify } from "./scoring.mjs";

const now = new Date("2026-10-16T00:00:00.000Z");
const repository = {
  name: "quality-tool",
  full_name: "owner/quality-tool",
  html_url: "https://github.com/owner/quality-tool",
  description: "A maintained open-source developer utility with a clear purpose.",
  stargazers_count: 1250,
  forks_count: 180,
  created_at: "2025-01-01T00:00:00Z",
  pushed_at: "2026-10-10T00:00:00Z",
  license: { spdx_id: "MIT" },
  homepage: "https://example.org",
  archived: false,
  disabled: false,
  fork: false,
};

test("normalizes slugs and names deterministically", () => {
  assert.equal(slugify("Café & Tools"), "cafe-tools");
  assert.equal(normalizeName("App Flowy"), "appflowy");
});

test("canonicalizes GitHub repository URLs and ignores invalid hosts", () => {
  assert.equal(normalizeRepositoryUrl("https://github.com/Owner/Repo.git"), "https://github.com/owner/repo");
  assert.equal(normalizeRepositoryUrl("https://example.com/owner/repo"), "");
});

test("formats star counts without inventing ratings", () => {
  assert.equal(formatStars(1200), "1.2k");
  assert.equal(formatStars(0), "0");
  assert.equal(formatStars(-1), "");
});

test("accepts a recent, licensed and sufficiently documented tool", () => {
  const result = scoreRepository(repository, { category: "Dev Tools", type: "trending", rank: 3, trendingStars: 40 }, now);
  assert.equal(result.eligible, true);
  assert.ok(result.qualityScore >= 45);
  assert.ok(result.trendScore > 0);
});

test("rejects missing license and archived repos", () => {
  assert.equal(scoreRepository({ ...repository, license: null }, { category: "Dev Tools" }, now).eligible, false);
  assert.equal(scoreRepository({ ...repository, archived: true }, { category: "Dev Tools" }, now).eligible, false);
});

test("enforces stricter thresholds for AI projects", () => {
  const small = { ...repository, stargazers_count: 18 };
  assert.equal(scoreRepository(small, { category: "AI & Machine Learning", type: "topic", rank: 2 }, now).eligible, false);
});
