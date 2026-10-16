const MAX_RETRIES = 5;
const BASE_DELAY_MS = 750;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function headerNumber(response, name) {
  const value = Number(response.headers.get(name));
  return Number.isFinite(value) ? value : null;
}

function retryDelay(response, attempt, now = Date.now()) {
  const retryAfter = response.headers.get("retry-after");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, 15 * 60 * 1000);
    const date = Date.parse(retryAfter);
    if (Number.isFinite(date)) return Math.min(Math.max(0, date - now), 15 * 60 * 1000);
  }
  const reset = headerNumber(response, "x-ratelimit-reset");
  const remaining = response.headers.get("x-ratelimit-remaining");
  if (remaining === "0" && reset !== null) {
    return Math.min(Math.max(0, reset * 1000 - now) + 1000, 60 * 60 * 1000);
  }
  return Math.min(BASE_DELAY_MS * (2 ** attempt) + Math.floor(Math.random() * 250), 30_000);
}

export async function githubJson(url, { token, fetchImpl = fetch, maxRetries = MAX_RETRIES } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    let response;
    try {
      const headers = {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "awesome-free-stack-catalog-discovery",
      };
      if (token) headers.Authorization = "Bearer " + token;
      response = await fetchImpl(url, { headers, signal: AbortSignal.timeout(12_000) });
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) break;
      await sleep(Math.min(BASE_DELAY_MS * (2 ** attempt), 30_000));
      continue;
    }

    if (response.status === 404 || response.status === 451) return { skipped: true };
    if (response.status === 403 || response.status === 429) {
      const remaining = response.headers.get("x-ratelimit-remaining");
      const rateLimited = response.status === 429 ||
        remaining === "0" ||
        response.headers.get("retry-after") !== null ||
        /rate limit/i.test(response.headers.get("x-ratelimit-resource") || "");
      if (!rateLimited) return { skipped: true, reason: "forbidden" };
      const waitMs = retryDelay(response, attempt);
      const resetAt = response.headers.get("x-ratelimit-reset") || null;
      // Do not burn an Actions runner waiting for a long quota reset. Save a checkpoint and resume later.
      if (attempt === maxRetries || waitMs > 60_000) {
        return { rateLimited: true, waitMs, resetAt };
      }
      console.warn("GitHub API throttled; waiting " + Math.ceil(waitMs / 1000) + "s before retry " + (attempt + 1) + ".");
      await sleep(waitMs);
      continue;
    }

    if (response.status >= 500 && attempt < maxRetries) {
      const waitMs = Math.min(BASE_DELAY_MS * (2 ** attempt) + Math.floor(Math.random() * 250), 30_000);
      console.warn("GitHub API returned HTTP " + response.status + "; retrying after " + Math.ceil(waitMs / 1000) + "s.");
      await sleep(waitMs);
      continue;
    }
    if (!response.ok) return { error: "http", detail: "GitHub API returned HTTP " + response.status };
    try {
      return { data: await response.json() };
    } catch (error) {
      return { error: "json", detail: String(error?.message || "invalid JSON response") };
    }
  }
  return { error: "network", detail: String(lastError?.message || "network error") };
}
