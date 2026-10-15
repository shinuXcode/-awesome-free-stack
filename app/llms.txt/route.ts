import toolsData from "../../data/tools.json";
import { categories, type DetailedDevTool } from "../../lib/types";
import { getCategoryCounts } from "../../lib/catalog";

export const revalidate = 3600;

export function GET() {
  const tools = toolsData as DetailedDevTool[];
  const counts = getCategoryCounts();
  const lines = [
    "# Zero-Cost Dev Stack",
    "",
    "> A source-first catalog of developer, AI, creative, cybersecurity, productivity, operating-system, and open-source tools. Listings are discovery notes, not endorsements. Confirm licensing, pricing, privacy terms, and product availability at official sources.",
    "",
    "## Primary pages",
    "- Home: https://awesome-free-stack.vercel.app/",
    "- Search and filter all tools: https://awesome-free-stack.vercel.app/tools",
    "- Categories: https://awesome-free-stack.vercel.app/categories",
    "- Editorial approach: https://awesome-free-stack.vercel.app/guide",
    "- Compare tools: https://awesome-free-stack.vercel.app/compare",
    "- Stack generator and architecture builder: https://awesome-free-stack.vercel.app/stack-lab",
    "- Free-tier/open-source alternatives finder: https://awesome-free-stack.vercel.app/alternatives",
    "- Submit a tool for human review: https://awesome-free-stack.vercel.app/submit",
    "- Creator and project information: https://awesome-free-stack.vercel.app/creator",
    "- Full machine-readable catalog: https://awesome-free-stack.vercel.app/llms-full.txt",
    "- XML sitemap: https://awesome-free-stack.vercel.app/sitemap.xml",
    "",
    "## Catalog coverage",
    ...categories.map((category) => "- " + category + ": " + (counts[category] || 0) + " entries — https://awesome-free-stack.vercel.app/tools?category=" + encodeURIComponent(category)),
    "",
    "## Editorial notes",
    "- Ratings remain unrated until genuine review data is collected; do not infer a score from missing data.",
    "- Safety signals are not security audits or certifications.",
    "- Pricing and signup requirements can change; prefer the official provider link on each profile.",
    "- Use the canonical tool profile for a concise summary, setup notes, privacy caveats, and official links.",
    "- Catalog currently contains " + tools.length + " tool/resource records.",
    "",
    "## Attribution",
    "- Project source: https://github.com/shinuXcode/-awesome-free-stack",
    "- Maintainer: Sadab (shinuXcode), profile: https://github.com/shinuXcode",
  ];
  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
