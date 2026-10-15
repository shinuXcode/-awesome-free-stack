import toolsData from "../../data/tools.json";
import type { DetailedDevTool } from "../../lib/types";

export const revalidate = 3600;

export function GET() {
  const tools = toolsData as DetailedDevTool[];
  const lines = [
    "# Zero-Cost Dev Stack — Full Catalog",
    "",
    "Use these records as a discovery index. Pricing, license, availability, safety, and privacy claims must be verified at the linked primary source.",
    "",
    "Catalog count: " + tools.length,
    "",
  ];
  for (const tool of tools) {
    lines.push(
      "## " + tool.name,
      "- Category: " + tool.category,
      "- Summary: " + tool.tagline,
      "- Details: " + tool.description,
      "- Directory profile: https://awesome-free-stack.vercel.app/tools/" + encodeURIComponent(tool.id),
      "- Official website: " + tool.officialWebsiteUrl,
      "- Documentation: " + tool.docsUrl,
      "- Listing price label: " + tool.pricingType,
      "- Pricing caveat: " + tool.freeTierLimit,
      "- Source model label: " + tool.securityDetails.isOpaqueOrOpenSource,
      tool.githubRepoUrl ? "- Repository: " + tool.githubRepoUrl : "",
      "",
    );
  }
  return new Response(lines.filter((line) => line !== undefined).join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
