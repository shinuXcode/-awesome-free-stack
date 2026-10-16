import test from "node:test";
import assert from "node:assert/strict";
import { githubJson } from "./github-api.mjs";

function response(status, headers = {}, body = {}) {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: new Headers(headers),
    json: async () => body,
  };
}

test("returns parsed data for successful GitHub API requests", async () => {
  const result = await githubJson("https://api.github.com/repos/a/b", {
    fetchImpl: async () => response(200, { "x-ratelimit-remaining": "59" }, { full_name: "a/b" }),
  });
  assert.deepEqual(result.data, { full_name: "a/b" });
});

test("honors Retry-After and retries a rate-limited request", async () => {
  let calls = 0;
  const result = await githubJson("https://api.github.com/repos/a/b", {
    maxRetries: 1,
    fetchImpl: async () => {
      calls += 1;
      return calls === 1
        ? response(429, { "retry-after": "0" })
        : response(200, {}, { full_name: "a/b" });
    },
  });
  assert.equal(calls, 2);
  assert.deepEqual(result.data, { full_name: "a/b" });
});

test("returns a resumable rate-limit state after retries are exhausted", async () => {
  const result = await githubJson("https://api.github.com/repos/a/b", {
    maxRetries: 0,
    fetchImpl: async () => response(403, { "x-ratelimit-remaining": "0", "x-ratelimit-reset": String(Math.floor(Date.now() / 1000) + 90) }),
  });
  assert.equal(result.rateLimited, true);
  assert.ok(result.waitMs >= 0);
});

test("retries temporary server errors with bounded backoff", async () => {
  let calls = 0;
  const result = await githubJson("https://api.github.com/repos/a/b", {
    maxRetries: 1,
    fetchImpl: async () => {
      calls += 1;
      return calls === 1 ? response(503) : response(200, {}, { ok: true });
    },
  });
  assert.equal(calls, 2);
  assert.equal(result.data.ok, true);
});

test("does not retry ordinary not-found responses", async () => {
  let calls = 0;
  const result = await githubJson("https://api.github.com/repos/a/b", {
    fetchImpl: async () => { calls += 1; return response(404); },
  });
  assert.equal(calls, 1);
  assert.equal(result.skipped, true);
});
