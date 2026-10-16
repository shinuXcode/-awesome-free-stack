import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600;

const LICENSES = new Set(["mit", "apache-2.0", "bsd-2-clause", "bsd-3-clause", "isc", "mpl-2.0", "gpl-3.0", "agpl-3.0", "unlicense"]);
const SORTS = new Set(["stars", "updated"]);
const PER_PAGE = 100;

type GitHubItem = {
  id: number; name: string; full_name: string; html_url: string; description: string | null;
  stargazers_count: number; forks_count: number; language: string | null;
  license: { spdx_id?: string | null; name?: string | null } | null;
  pushed_at: string | null; homepage: string | null; topics?: string[];
  archived?: boolean; fork?: boolean;
};
type GitHubResponse = { total_count?: number; incomplete_results?: boolean; items?: GitHubItem[] };

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const rawQuery = (params.get("q") || "").trim().slice(0, 100);
  const license = (params.get("license") || "mit").toLowerCase();
  const sort = (params.get("sort") || "stars").toLowerCase();
  const page = Number.parseInt(params.get("page") || "1", 10);
  if (!LICENSES.has(license)) return NextResponse.json({ error: "Unsupported license filter." }, { status: 400 });
  if (!SORTS.has(sort)) return NextResponse.json({ error: "Unsupported sort." }, { status: 400 });
  if (!Number.isFinite(page) || page < 1 || page > 10) {
    return NextResponse.json({ error: "GitHub Search API exposes at most 1,000 results per query; page must be between 1 and 10." }, { status: 400 });
  }

  const safeQuery = rawQuery.replace(/[^\p{L}\p{N}\s._-]/gu, " ").replace(/\s+/g, " ").trim();
  const q = [safeQuery, "license:" + license, "stars:>10", "fork:false", "archived:false"].filter(Boolean).join(" ");
  const url = new URL("https://api.github.com/search/repositories");
  url.searchParams.set("q", q);
  url.searchParams.set("sort", sort);
  url.searchParams.set("order", "desc");
  url.searchParams.set("per_page", String(PER_PAGE));
  url.searchParams.set("page", String(page));

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "zero-cost-dev-stack-directory" },
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: response.status === 403 || response.status === 429 ? "GitHub search rate limit reached. Wait a little and retry." : "GitHub search is temporarily unavailable." },
        { status: response.status === 403 || response.status === 429 ? 429 : 502, headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800" } },
      );
    }
    const data = await response.json() as GitHubResponse;
    const items = (data.items || [])
      .filter((item) => !item.archived && !item.fork && Boolean(item.license?.spdx_id) && item.license?.spdx_id !== "NOASSERTION")
      .map((item) => ({
        id: item.id, name: item.name, fullName: item.full_name, url: item.html_url,
        description: item.description || "No repository description provided.",
        stars: item.stargazers_count, forks: item.forks_count, language: item.language,
        license: item.license?.spdx_id || item.license?.name || "License listed",
        pushedAt: item.pushed_at,
        website: item.homepage && /^https:\/\/[^ ]+$/i.test(item.homepage) ? item.homepage : null,
        topics: (item.topics || []).slice(0, 8),
      }));
    return NextResponse.json({
      items, total: Math.min(data.total_count || 0, 1000), reportedTotal: data.total_count || 0,
      page, perPage: PER_PAGE, maxPage: 10, sort, license, query: safeQuery,
      incomplete: Boolean(data.incomplete_results), source: "GitHub Search API",
      note: "Results are ordered by stars or last update, not GitHub's editorial Trending ranking. GitHub caps each search query at 1,000 accessible results.",
    }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch {
    return NextResponse.json({ error: "GitHub search could not be reached." }, { status: 502 });
  }
}
