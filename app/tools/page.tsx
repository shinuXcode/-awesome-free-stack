import type { Metadata } from "next";
import ToolsClient from "../../components/ToolsClient";
import { catalog, getFilteredTools, normalizeFilters } from "../../lib/catalog";
import { categories } from "../../lib/types";

const SITE_URL = "https://awesome-free-stack.vercel.app";
export const metadata: Metadata = {
  title: `Explore ${catalog.length.toLocaleString("en-US")} Developer & Open-Source Tools`,
  description: `Search ${catalog.length.toLocaleString("en-US")} developer, AI, data science, security, creative software, operating-system and open-source app listings. Check official sources, pricing and license caveats.`,
  keywords: ["developer tool directory", "free software", "open source tools", "AI tools", "web development", "cybersecurity", "video editing", "Linux apps"],
  alternates: { canonical: "/tools" },
  openGraph: {
    title: `Explore ${catalog.length.toLocaleString("en-US")} Developer & Open-Source Tools`,
    url: SITE_URL + "/tools",
    description: `Search ${catalog.length.toLocaleString("en-US")} developer, AI, security, creative and productivity tools with source-first profiles.`,
    type: "website",
  },
};

type SearchParams = Record<string, string | string[] | undefined>;
function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ToolsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const filters = normalizeFilters({
    query: first(params.q) || "",
    category: first(params.category) || "",
    pricingType: first(params.pricing) || "",
    noCard: ["1", "true"].includes(first(params.noCard) || ""),
    beginner: ["1", "true"].includes(first(params.beginner) || ""),
    safetyOnly: ["1", "true"].includes(first(params.safetyOnly) || ""),
    sort: first(params.sort) || "Recently Added",
  });
  const filtered = getFilteredTools(filters);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Developer and Open-Source Tools",
            description: "Search and compare tools by category, pricing label, skill level and official sources.",
            url: SITE_URL + "/tools",
            numberOfItems: filtered.length,
            isPartOf: { "@type": "WebSite", name: "Zero-Cost Dev Stack", url: SITE_URL },
          }).replace(/</g, "\\u003c"),
        }}
      />
      <ToolsClient
        initialTools={filtered.slice(0, 48)}
        initialTotal={filtered.length}
        initialQuery={filters.query}
        initialCategory={filters.category}
        initialPricingType={filters.pricingType}
        initialNoCard={filters.noCard}
        initialBeginner={filters.beginner}
        initialSafetyOnly={filters.safetyOnly}
        initialSort={filters.sort}
      />
    </>
  );
}
