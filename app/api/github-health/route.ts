import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600;

function repoPath(input: string): string | null {
  try {
    const url = new URL(input);
    if (url.hostname !== "github.com" || url.protocol !== "https:") return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/i, "");
    if (!/^[A-Za-z0-9-]{1,39}$/.test(owner) || !/^[A-Za-z0-9_.-]{1,100}$/.test(repo)) return null;
    return owner + "/" + repo;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("repo") || "";
  const path = repoPath(raw);
  if (!path) return NextResponse.json({ error: "Provide a valid https://github.com/owner/repository URL." }, { status: 400 });
  try {
    const response = await fetch("https://api.github.com/repos/" + path, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "zero-cost-dev-stack-directory",
      },
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      return NextResponse.json({ error: "GitHub returned " + response.status }, {
        status: response.status === 404 ? 404 : 502,
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800" },
      });
    }
    const data = await response.json() as {
      stargazers_count?: number;
      open_issues_count?: number;
      pushed_at?: string | null;
      updated_at?: string | null;
      archived?: boolean;
      disabled?: boolean;
      license?: { spdx_id?: string | null } | null;
    };
    return NextResponse.json({
      stars: data.stargazers_count ?? 0,
      openIssues: data.open_issues_count ?? 0,
      pushedAt: data.pushed_at ?? null,
      updatedAt: data.updated_at ?? null,
      archived: Boolean(data.archived),
      disabled: Boolean(data.disabled),
      license: data.license?.spdx_id && data.license.spdx_id !== "NOASSERTION" ? data.license.spdx_id : null,
    }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch {
    return NextResponse.json({ error: "GitHub API unavailable" }, { status: 502 });
  }
}
