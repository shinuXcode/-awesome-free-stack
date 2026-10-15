import { NextRequest, NextResponse } from "next/server";
import { getFilteredTools } from "../../../lib/catalog";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const filtered = getFilteredTools({
    query: params.get("q") || "",
    category: params.get("category") || "",
    pricingType: params.get("pricing") || "",
    noCard: params.get("noCard") === "1",
    beginner: params.get("beginner") === "1",
    safetyOnly: params.get("safetyOnly") === "1",
    sort: params.get("sort") || "Recently Added",
  });
  const parsedOffset = Number.parseInt(params.get("offset") || "0", 10);
  const parsedLimit = Number.parseInt(params.get("limit") || "48", 10);
  const offset = Number.isFinite(parsedOffset) ? Math.max(0, Math.min(parsedOffset, filtered.length)) : 0;
  const limit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(parsedLimit, 60)) : 48;
  return NextResponse.json(
    { tools: filtered.slice(offset, offset + limit), total: filtered.length, offset, limit },
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" } },
  );
}
